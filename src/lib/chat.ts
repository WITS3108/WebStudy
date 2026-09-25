import { supabase } from "@/intergrations/supabase/client";
import type { Json } from "@/intergrations/supabase/types";

// ---------------------------------------------------------------------------
// Chat persistence helpers (Supabase-backed).
// These are only used when a user is signed in. Anonymous users keep their
// chat in memory and nothing is saved.
// ---------------------------------------------------------------------------

export type MessageRole = "user" | "ai";
export type TimeGroup = "HÔM NAY" | "TUẦN TRƯỚC";

export interface ChatMessage {
  id: string;
  role: MessageRole;
  text: string;
  image?: string; // base64 data URL (preview)
}

export interface ChatThread {
  id: string;
  title: string;
  timeGroup: TimeGroup;
  messages: ChatMessage[];
}

export const AI_GREETING =
  "Xin chào! Mình là **Studia AI Tutor**. Bạn cần giúp đỡ bài tập hay nội dung học tập nào hôm nay?";

export const NEW_CHAT_TITLE = "Cuộc hội thoại mới";

type ThreadRow = {
  id: string;
  title: string | null;
  updated_at: string;
};

type MessageRow = {
  id: string;
  client_message_id: string | null;
  thread_id: string;
  role: string;
  parts: Json;
  created_at: string;
};

function computeTimeGroup(updatedAt: string): TimeGroup {
  const ageMs = Date.now() - new Date(updatedAt).getTime();
  const DAY = 24 * 60 * 60 * 1000;
  return ageMs < DAY ? "HÔM NAY" : "TUẦN TRƯỚC";
}

function partsToMessage(row: MessageRow): ChatMessage {
  const parts = Array.isArray(row.parts)
    ? (row.parts as Array<Record<string, unknown>>)
    : [];

  let text = "";
  let image: string | undefined;

  for (const part of parts) {
    if (part.type === "text" && typeof part.text === "string") {
      text += part.text;
    } else if (part.type === "image" && typeof part.image === "string") {
      image = part.image;
    }
  }

  return {
    id: row.client_message_id ?? row.id,
    role: row.role === "user" ? "user" : "ai",
    text,
    image,
  };
}

function messageToParts(message: ChatMessage): Json {
  const parts: Array<Record<string, unknown>> = [];
  if (message.image) parts.push({ type: "image", image: message.image });
  if (message.text) parts.push({ type: "text", text: message.text });
  return parts as Json;
}

export async function loadThreads(userId: string): Promise<ChatThread[]> {
  const { data, error } = await supabase
    .from("chat_threads")
    .select("id, title, updated_at")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("[chat] loadThreads failed:", error);
    return [];
  }

  return ((data as ThreadRow[] | null) ?? []).map((row) => ({
    id: row.id,
    title: row.title || NEW_CHAT_TITLE,
    timeGroup: computeTimeGroup(row.updated_at),
    messages: [],
  }));
}

export async function loadMessages(userId: string, threadId: string): Promise<ChatMessage[]> {
  const { data, error } = await supabase
    .from("chat_messages")
    .select("*")
    .eq("user_id", userId)
    .eq("thread_id", threadId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("[chat] loadMessages failed:", error);
    return [];
  }

  return ((data as MessageRow[] | null) ?? []).map(partsToMessage);
}

export async function createThread(userId: string, title: string): Promise<string | null> {
  const { data, error } = await supabase
    .from("chat_threads")
    .insert({ user_id: userId, title })
    .select("id")
    .single();

  if (error) {
    console.error("[chat] createThread failed:", error);
    return null;
  }

  return (data as { id: string } | null)?.id ?? null;
}

export async function renameThread(threadId: string, title: string): Promise<void> {
  const { error } = await supabase
    .from("chat_threads")
    .update({ title })
    .eq("id", threadId);

  if (error) console.error("[chat] renameThread failed:", error);
}

export async function persistMessage(
  userId: string,
  threadId: string,
  message: ChatMessage,
): Promise<void> {
  const { error } = await supabase.from("chat_messages").insert({
    user_id: userId,
    thread_id: threadId,
    role: message.role,
    parts: messageToParts(message),
    client_message_id: message.id,
  });

  if (error) console.error("[chat] persistMessage failed:", error);
}

export async function deleteThread(threadId: string): Promise<void> {
  const { error: msgError } = await supabase
    .from("chat_messages")
    .delete()
    .eq("thread_id", threadId);

  if (msgError) console.error("[chat] deleteThread messages failed:", msgError);

  const { error } = await supabase.from("chat_threads").delete().eq("id", threadId);
  if (error) console.error("[chat] deleteThread failed:", error);
}

export async function deleteAllThreads(userId: string): Promise<void> {
  const { error: msgError } = await supabase
    .from("chat_messages")
    .delete()
    .eq("user_id", userId);

  if (msgError) console.error("[chat] deleteAllThreads messages failed:", msgError);

  const { error } = await supabase.from("chat_threads").delete().eq("user_id", userId);
  if (error) console.error("[chat] deleteAllThreads failed:", error);
}

// ---------------------------------------------------------------------------
// Anonymous (not signed in) persistence using localStorage.
// Signed-in users use Supabase; anonymous users keep their chat on this device.
// ---------------------------------------------------------------------------

const ANON_STORAGE_KEY = "studia_chat_anonymous";

export function loadAnonymousSessions(): ChatThread[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(ANON_STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as ChatThread[]) : [];
  } catch (error) {
    console.error("[chat] loadAnonymousSessions failed:", error);
    return [];
  }
}

export function saveAnonymousSessions(sessions: ChatThread[]): void {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(ANON_STORAGE_KEY, JSON.stringify(sessions));
  } catch (error) {
    console.error("[chat] saveAnonymousSessions failed:", error);
  }
}
