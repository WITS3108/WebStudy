import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/intergrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { Todo } from "@/data/mock";

const ANON_TODOS_KEY = "studia_todos_anonymous";

const SYNC_WARNING =
  "Đã lưu trên thiết bị này. Để đồng bộ lên đám mây, hãy chạy supabase/setup-all-rls.sql trong Supabase SQL Editor.";

const PRIORITY_TO_NUMBER: Record<Todo["priority"], number> = {
  cao: 3,
  vừa: 2,
  thấp: 1,
};

const NUMBER_TO_PRIORITY: Record<number, Todo["priority"]> = {
  3: "cao",
  2: "vừa",
  1: "thấp",
};

type TodoRow = {
  id: string;
  title: string;
  category: string | null;
  priority: number | null;
  completed: boolean;
  due_at: string | null;
  user_id: string;
};

function timeToIso(time: string): string {
  const [h = 0, m = 0] = time.split(":").map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d.toISOString();
}

function isoToTime(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

function rowToTodo(row: TodoRow): Todo {
  return {
    id: row.id,
    title: row.title,
    tag: row.category ?? "",
    priority: NUMBER_TO_PRIORITY[row.priority ?? 2] ?? "vừa",
    done: row.completed,
    time: isoToTime(row.due_at),
  };
}

function makeId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  // RFC 4122 v4 fallback (still a valid uuid for Supabase).
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// ---------------------------------------------------------------------------
// Local (device) persistence — used by everyone as the reliable fallback.
// ---------------------------------------------------------------------------
function loadLocalTodos(): Todo[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(ANON_TODOS_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Todo[]) : [];
  } catch (error) {
    console.error("[useTodos] load local failed:", error);
    return [];
  }
}

function saveLocalTodos(todos: Todo[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(ANON_TODOS_KEY, JSON.stringify(todos));
  } catch (error) {
    console.error("[useTodos] save local failed:", error);
  }
}

/**
 * To-do list that always works:
 *   • Local state + localStorage are the source of truth for the UI.
 *   • When signed in, changes are also synced to Supabase (best-effort).
 *   • If Supabase is not configured (e.g. missing RLS policies), everything
 *     still saves locally and the app keeps working.
 */
export function useTodos() {
  const { user } = useAuth();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const applyLocal = useCallback((next: Todo[]) => {
    setTodos(next);
    saveLocalTodos(next);
  }, []);

  const load = useCallback(async () => {
    if (!user) {
      setTodos(loadLocalTodos());
      setError(null);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("todos")
      .select("*")
      .eq("user_id", user.id)
      .order("due_at", { ascending: true, nullsFirst: false });

    if (error) {
      // Cloud unavailable — fall back to what's on this device.
      console.error("[useTodos] load failed:", error);
      setTodos(loadLocalTodos());
      setError("Không kết nối được đám mây. Đang hiển thị dữ liệu trên thiết bị.");
      setLoading(false);
      return;
    }

    const cloud = (data as TodoRow[]).map(rowToTodo);
    const local = loadLocalTodos();
    const cloudIds = new Set(cloud.map((t) => t.id));

    // Migrate device-only tasks to the cloud (covers tasks created before
    // RLS policies were configured).
    const missing = local.filter((t) => !cloudIds.has(t.id));
    for (const t of missing) {
      const { error: insertError } = await supabase.from("todos").insert({
        id: t.id,
        title: t.title,
        category: t.tag,
        priority: PRIORITY_TO_NUMBER[t.priority] ?? 2,
        completed: t.done,
        due_at: timeToIso(t.time),
        user_id: user.id,
      });
      if (insertError) console.error("[useTodos] migrate failed:", insertError);
    }

    const merged = [...cloud, ...missing];
    setTodos(merged);
    saveLocalTodos(merged);
    setError(null);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    void load();
  }, [load]);

  const add = useCallback(
    async (todo: Omit<Todo, "id" | "done">) => {
      const newTodo: Todo = { id: makeId(), done: false, ...todo };
      applyLocal([...todos, newTodo]);

      if (!user) {
        setError(null);
        return;
      }

      const { error } = await supabase.from("todos").insert({
        id: newTodo.id,
        title: todo.title,
        category: todo.tag,
        priority: PRIORITY_TO_NUMBER[todo.priority] ?? 2,
        completed: false,
        due_at: timeToIso(todo.time),
        user_id: user.id,
      });

      setError(error ? SYNC_WARNING : null);
      if (error) console.error("[useTodos] cloud add failed:", error);
    },
    [todos, user, applyLocal],
  );

  const toggle = useCallback(
    async (id: string) => {
      const target = todos.find((t) => t.id === id);
      if (!target) return;
      const nextDone = !target.done;
      applyLocal(todos.map((t) => (t.id === id ? { ...t, done: nextDone } : t)));

      if (!user) {
        setError(null);
        return;
      }

      const { error } = await supabase
        .from("todos")
        .update({ completed: nextDone })
        .eq("id", id);

      setError(error ? SYNC_WARNING : null);
      if (error) console.error("[useTodos] cloud toggle failed:", error);
    },
    [todos, user, applyLocal],
  );

  const remove = useCallback(
    async (id: string) => {
      applyLocal(todos.filter((t) => t.id !== id));

      if (!user) {
        setError(null);
        return;
      }

      const { error } = await supabase.from("todos").delete().eq("id", id);

      setError(error ? SYNC_WARNING : null);
      if (error) console.error("[useTodos] cloud remove failed:", error);
    },
    [todos, user, applyLocal],
  );

  const clearDone = useCallback(async () => {
    const doneIds = todos.filter((t) => t.done).map((t) => t.id);
    if (doneIds.length === 0) return;

    applyLocal(todos.filter((t) => !t.done));

    if (!user) {
      setError(null);
      return;
    }

    const { error } = await supabase.from("todos").delete().in("id", doneIds);

    setError(error ? SYNC_WARNING : null);
    if (error) console.error("[useTodos] cloud clearDone failed:", error);
  }, [todos, user, applyLocal]);

  return { todos, loading, error, add, toggle, remove, clearDone };
}
