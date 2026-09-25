import { useCallback, useEffect, useRef, useState, type ChangeEvent, type KeyboardEvent } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  Plus,
  Search,
  MessageSquare,
  Paperclip,
  Send,
  X,
  Bot,
  User,
  Sparkles,
  Trash2,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import {
  AI_GREETING,
  NEW_CHAT_TITLE,
  createThread,
  deleteAllThreads,
  deleteThread,
  loadAnonymousSessions,
  loadMessages,
  loadThreads,
  persistMessage,
  renameThread,
  saveAnonymousSessions,
  type ChatMessage,
  type ChatThread,
} from "@/lib/chat";

export const Route = createFileRoute("/_authenticated/ai")({
  component: AIPage,
});

// Model Gemini dùng cho khung chat (hỗ trợ cả văn bản lẫn ảnh).
const GEMINI_MODEL = "gemini-2.0-flash";

type SelectedImage = {
  file: File;
  preview: string; // base64 data URL
  mimeType: string;
};

function SessionItem({
  session,
  active,
  onSelect,
  onDelete,
}: {
  session: ChatThread;
  active: boolean;
  onSelect: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      className={`group flex items-center gap-1 rounded-xl transition ${
        active ? "bg-primary/10 text-primary" : "text-foreground/80 hover:bg-accent hover:text-foreground"
      }`}
    >
      <button
        type="button"
        onClick={onSelect}
        className="flex min-w-0 flex-1 items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-xs font-bold"
      >
        <MessageSquare className="h-4 w-4 shrink-0" />
        <span className="truncate">{session.title}</span>
      </button>
      <button
        type="button"
        onClick={onDelete}
        title="Xóa cuộc hội thoại"
        aria-label="Xóa cuộc hội thoại"
        className="mr-1.5 shrink-0 rounded-lg p-1.5 text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export function AIPage() {
  const { user, loading: authLoading } = useAuth();

  const [sessions, setSessions] = useState<ChatThread[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [inputText, setInputText] = useState("");
  const [selectedImage, setSelectedImage] = useState<SelectedImage | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<
    { type: "thread"; id: string } | { type: "all" } | null
  >(null);
  const [hydrated, setHydrated] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeSession = sessions.find((s) => s.id === activeSessionId) ?? sessions[0] ?? null;

  // Tạo một cuộc hội thoại mới (lưu vào DB nếu đã đăng nhập, ngược lại chỉ lưu tạm).
  const createNewChat = useCallback(async (): Promise<ChatThread> => {
    const greeting: ChatMessage = { id: `greet-${Date.now()}`, role: "ai", text: AI_GREETING };

    if (user) {
      const id = await createThread(user.id, NEW_CHAT_TITLE);
      if (id) {
        await persistMessage(user.id, id, greeting);
        return { id, title: NEW_CHAT_TITLE, timeGroup: "HÔM NAY", messages: [greeting] };
      }
    }

    return {
      id: `local-${Date.now()}`,
      title: NEW_CHAT_TITLE,
      timeGroup: "HÔM NAY",
      messages: [greeting],
    };
  }, [user]);

  // Khởi tạo: tải danh sách hội thoại khi đã đăng nhập, hoặc tạo phiên tạm khi chưa đăng nhập.
  useEffect(() => {
    let cancelled = false;

    async function init() {
      if (authLoading) return;

      if (!user) {
        const local = loadAnonymousSessions();
        if (cancelled) return;

        if (local.length > 0) {
          setSessions(local);
          setActiveSessionId(local[0].id);
        } else {
          const s = await createNewChat();
          if (!cancelled) {
            setSessions([s]);
            setActiveSessionId(s.id);
          }
        }
        setHydrated(true);
        return;
      }

      const threads = await loadThreads(user.id);
      if (cancelled) return;

      if (threads.length === 0) {
        const s = await createNewChat();
        if (!cancelled) {
          setSessions([s]);
          setActiveSessionId(s.id);
          setHydrated(true);
        }
        return;
      }

      setSessions(threads);
      const firstId = threads[0].id;
      setActiveSessionId(firstId);
      setHydrated(true);

      const messages = await loadMessages(user.id, firstId);
      if (!cancelled) {
        setSessions((prev) => prev.map((t) => (t.id === firstId ? { ...t, messages } : t)));
      }
    }

    void init();
    return () => {
      cancelled = true;
    };
  }, [user, authLoading, createNewChat]);

  // Lưu chat ẩn danh xuống localStorage sau khi đã khởi tạo xong.
  useEffect(() => {
    if (hydrated && !user) {
      saveAnonymousSessions(sessions);
    }
  }, [sessions, user, hydrated]);

  const handleSelectThread = async (id: string) => {
    setActiveSessionId(id);
    if (user) {
      const messages = await loadMessages(user.id, id);
      setSessions((prev) => prev.map((t) => (t.id === id ? { ...t, messages } : t)));
    }
  };

  const handleCreateNewChat = async () => {
    const s = await createNewChat();
    setSessions((prev) => [s, ...prev]);
    setActiveSessionId(s.id);
  };

  const handleDeleteThread = async (id: string) => {
    if (user) await deleteThread(id);

    const remaining = sessions.filter((t) => t.id !== id);

    if (remaining.length > 0) {
      setSessions(remaining);
      if (activeSessionId === id) {
        setActiveSessionId(remaining[0].id);
        if (user) {
          const messages = await loadMessages(user.id, remaining[0].id);
          setSessions((prev) =>
            prev.map((t) => (t.id === remaining[0].id ? { ...t, messages } : t)),
          );
        }
      }
    } else {
      const s = await createNewChat();
      setSessions([s]);
      setActiveSessionId(s.id);
    }
  };

  const performDeleteAll = async () => {
    if (user) await deleteAllThreads(user.id);

    const s = await createNewChat();
    setSessions([s]);
    setActiveSessionId(s.id);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const target = deleteTarget;
    setDeleteTarget(null);

    if (target.type === "all") {
      await performDeleteAll();
    } else {
      await handleDeleteThread(target.id);
    }
  };

  const fileToGenerativePart = (img: SelectedImage) => {
    const base64 = img.preview.split(",")[1] ?? "";
    return { inlineData: { data: base64, mimeType: img.mimeType } };
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedImage({ file, preview: reader.result as string, mimeType: file.type });
    };
    reader.readAsDataURL(file);
  };

  const handleSendMessage = async () => {
    if ((!inputText.trim() && !selectedImage) || isLoading || !activeSession) return;

    const userText = inputText.trim();
    const currentImg = selectedImage;

    setInputText("");
    setSelectedImage(null);
    setIsLoading(true);

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      text: userText,
      image: currentImg?.preview,
    };

    const shouldRename = activeSession.messages.length <= 1 && userText.length > 0;
    const newTitle = shouldRename
      ? userText.slice(0, 28) + (userText.length > 28 ? "..." : "")
      : activeSession.title;

    setSessions((prev) =>
      prev.map((s) =>
        s.id === activeSession.id
          ? { ...s, title: newTitle, messages: [...s.messages, userMsg] }
          : s,
      ),
    );

    // Chỉ lưu khi người dùng đã đăng nhập.
    if (user) {
      await persistMessage(user.id, activeSession.id, userMsg);
      if (shouldRename) await renameThread(activeSession.id, newTitle);
    }

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "";
      if (!apiKey) {
        throw new Error("Chưa cấu hình VITE_GEMINI_API_KEY trong file .env!");
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

      const promptParts: Array<string | ReturnType<typeof fileToGenerativePart>> = [];
      if (userText) promptParts.push(userText);
      if (currentImg) promptParts.push(fileToGenerativePart(currentImg));

      const result = await model.generateContent(promptParts);
      const responseText = result.response.text();

      const aiMsg: ChatMessage = { id: `a-${Date.now()}`, role: "ai", text: responseText };

      setSessions((prev) =>
        prev.map((s) =>
          s.id === activeSession.id ? { ...s, messages: [...s.messages, aiMsg] } : s,
        ),
      );

      if (user) await persistMessage(user.id, activeSession.id, aiMsg);
    } catch (error: unknown) {
      console.error("[ai] Gemini error:", error);
      const message = error instanceof Error ? error.message : undefined;
      const errorMsg: ChatMessage = {
        id: `e-${Date.now()}`,
        role: "ai",
        text: `⚠️ **Lỗi:** ${
          message || "Không thể kết nối đến Gemini AI. Hãy kiểm tra lại API Key nhé!"
        }`,
      };

      setSessions((prev) =>
        prev.map((s) =>
          s.id === activeSession.id ? { ...s, messages: [...s.messages, errorMsg] } : s,
        ),
      );

      if (user) await persistMessage(user.id, activeSession.id, errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppShell>
      <div className="flex flex-1 w-full h-[calc(100vh-7rem)] gap-6 animate-[fade-up_0.4s_ease-out]">
        {/* ================= CỘT BÊN TRÁI: DANH SÁCH CHAT ================= */}
        <aside className="flex w-72 flex-col justify-between rounded-3xl border border-border bg-card p-4 shadow-sm">
          <div className="space-y-4">
            {/* Nút Tạo cuộc hội thoại mới */}
            <button
              onClick={() => void handleCreateNewChat()}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 font-bold text-white shadow-sm hover:opacity-90 transition"
            >
              <Plus className="h-5 w-5" />
              <span>Cuộc hội thoại mới</span>
            </button>

            {/* Ô tìm kiếm phiên học */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Tìm kiếm phiên học..."
                className="w-full rounded-xl border border-border bg-background py-2 pl-9 pr-3 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Xóa tất cả cuộc hội thoại */}
            {sessions.length > 0 && (
              <button
                type="button"
                onClick={() => setDeleteTarget({ type: "all" })}
                className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-border/60 px-3 py-2 text-xs font-bold text-muted-foreground transition hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Xóa tất cả</span>
              </button>
            )}

            {/* Danh sách các hội thoại */}
            <div className="space-y-4 overflow-y-auto max-h-[calc(100vh-24rem)] pr-1">
              {/* Nhóm HÔM NAY */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-black tracking-wider text-muted-foreground uppercase px-2">
                  Hôm nay
                </span>
                {sessions
                  .filter((s) => s.timeGroup === "HÔM NAY")
                  .map((s) => (
                    <SessionItem
                      key={s.id}
                      session={s}
                      active={s.id === activeSessionId}
                      onSelect={() => void handleSelectThread(s.id)}
                      onDelete={() => setDeleteTarget({ type: "thread", id: s.id })}
                    />
                  ))}
              </div>

              {/* Nhóm TUẦN TRƯỚC */}
              {sessions.some((s) => s.timeGroup === "TUẦN TRƯỚC") && (
                <div className="space-y-1.5">
                  <span className="text-[10px] font-black tracking-wider text-muted-foreground uppercase px-2">
                    Tuần trước
                  </span>
                  {sessions
                    .filter((s) => s.timeGroup === "TUẦN TRƯỚC")
                    .map((s) => (
                      <SessionItem
                        key={s.id}
                        session={s}
                        active={s.id === activeSessionId}
                        onSelect={() => void handleSelectThread(s.id)}
                        onDelete={() => setDeleteTarget({ type: "thread", id: s.id })}
                      />
                    ))}
                </div>
              )}
            </div>
          </div>

          {/* Bộ nhớ / Thông tin mô hình bên dưới */}
          <div className="space-y-2">
            {!user && (
              <div className="rounded-2xl border border-amber-300/70 bg-amber-50 p-3 text-xs text-amber-800">
                <p className="font-bold">Chưa lưu trò chuyện</p>
                <p className="mt-0.5 text-[11px]">
                  Đăng nhập để lưu lại lịch sử trò chuyện của bạn.
                </p>
                <Link
                  to="/login"
                  className="mt-1.5 inline-block rounded-lg bg-primary px-3 py-1.5 text-[11px] font-bold text-white hover:opacity-90"
                >
                  Đăng nhập
                </Link>
              </div>
            )}

            <div className="rounded-2xl border border-border/60 bg-background p-3 text-xs space-y-1">
              <div className="flex items-center justify-between font-bold text-foreground">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-primary" /> Gemini 2.0 Flash
                </span>
                <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
                  Sẵn sàng
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground">Tối ưu hóa học tập & giải đề</p>
            </div>
          </div>
        </aside>

        {/* ================= CỘT BÊN PHẢI: KHUNG CHAT AI ================= */}
        <main className="flex flex-1 flex-col justify-between rounded-3xl border border-border bg-card p-4 sm:p-6 shadow-sm overflow-hidden">
          {/* Header Khung Chat */}
          <header className="flex items-center justify-between border-b border-border/60 pb-3">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-primary/10 p-2.5 text-primary">
                <Bot className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-base font-bold text-foreground">Studia AI Tutor</h2>
                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500"></span> Trực tuyến 24/7
                </p>
              </div>
            </div>
          </header>

          {/* Danh sách tin nhắn */}
          <div className="flex-1 overflow-y-auto my-4 space-y-4 pr-2">
            {activeSession?.messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {/* Avatar AI */}
                {msg.role === "ai" && (
                  <div className="rounded-xl bg-primary p-2 text-white h-fit shrink-0">
                    <Bot className="h-4 w-4" />
                  </div>
                )}

                {/* Nội dung tin nhắn */}
                <div
                  className={`max-w-[80%] rounded-2xl p-4 text-sm leading-relaxed space-y-2 ${
                    msg.role === "user"
                      ? "bg-primary text-white rounded-br-none"
                      : "bg-background border border-border/80 text-foreground rounded-bl-none shadow-sm"
                  }`}
                >
                  {/* Ảnh gửi kèm (nếu có) */}
                  {msg.image && (
                    <img
                      src={msg.image}
                      alt="Uploaded preview"
                      className="max-h-48 rounded-xl object-cover border border-white/20 mb-2"
                    />
                  )}
                  <p className="whitespace-pre-wrap font-medium">{msg.text}</p>
                </div>

                {/* Avatar User */}
                {msg.role === "user" && (
                  <div className="rounded-xl bg-accent p-2 text-foreground h-fit shrink-0 border border-border">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>
            ))}

            {/* Trạng thái Đang suy nghĩ của AI */}
            {isLoading && (
              <div className="flex gap-3 items-center text-muted-foreground text-xs font-bold animate-pulse">
                <div className="rounded-xl bg-primary p-2 text-white">
                  <Bot className="h-4 w-4" />
                </div>
                <span>Studia AI đang suy nghĩ...</span>
              </div>
            )}
          </div>

          {/* Thanh nhập tin nhắn */}
          <div className="space-y-2 pt-2 border-t border-border/60">
            {/* Thẻ xem trước Ảnh đã chọn */}
            {selectedImage && (
              <div className="relative inline-block">
                <img
                  src={selectedImage.preview}
                  alt="Selected"
                  className="h-16 w-16 rounded-xl object-cover border border-border shadow-sm"
                />
                <button
                  onClick={() => setSelectedImage(null)}
                  className="absolute -top-2 -right-2 rounded-full bg-destructive p-1 text-white shadow hover:opacity-90"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}

            <div className="flex items-center gap-2 rounded-2xl border border-border bg-background p-2 focus-within:ring-2 focus-within:ring-primary/20 transition">
              {/* Input đính kèm file/ảnh ẩn */}
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleImageChange}
                className="hidden"
              />

              {/* Nút đính kèm ảnh */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="rounded-xl p-2 text-muted-foreground hover:bg-accent hover:text-foreground transition"
                title="Đính kèm ảnh bài tập"
              >
                <Paperclip className="h-5 w-5" />
              </button>

              {/* Ô nhập chữ */}
              <input
                type="text"
                placeholder="Nhập câu hỏi học tập, dán đề bài hoặc đính kèm ảnh..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e: KeyboardEvent<HTMLInputElement>) =>
                  e.key === "Enter" && void handleSendMessage()
                }
                className="flex-1 bg-transparent text-sm font-medium focus:outline-none placeholder:text-muted-foreground"
              />

              {/* Nút gửi */}
              <button
                onClick={() => void handleSendMessage()}
                disabled={isLoading || (!inputText.trim() && !selectedImage)}
                className="rounded-xl bg-primary p-2.5 text-white shadow hover:opacity-90 transition disabled:opacity-40"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
            <p className="text-[10px] text-center text-muted-foreground">
              Nhấn Enter để gửi tin nhắn. Studia AI hỗ trợ đọc đề qua ảnh và giải bài tập.
            </p>
          </div>
        </main>
      </div>

      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa cuộc trò chuyện?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget?.type === "all"
                ? "Bạn có chắc muốn xóa tất cả cuộc trò chuyện? Hành động này không thể hoàn tác."
                : "Bạn có chắc muốn xóa cuộc trò chuyện này? Hành động này không thể hoàn tác."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={() => void confirmDelete()}
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  );
}
