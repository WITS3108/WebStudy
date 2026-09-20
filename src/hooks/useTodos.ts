import { useCallback, useEffect, useState } from "react";

import { todayTodos, type Todo } from "@/data/mock";

const STORAGE_KEY = "learnfast-todos";

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>(todayTodos);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setTodos(JSON.parse(raw) as Todo[]);
    } catch {
      /* ignore */
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
    } catch {
      /* ignore */
    }
  }, [todos, loaded]);

  const toggle = useCallback((id: string) => {
    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  }, []);

  const add = useCallback((todo: Omit<Todo, "id" | "done">) => {
    setTodos((prev) => [
      ...prev,
      { ...todo, id: `t${Date.now()}`, done: false },
    ]);
  }, []);

  const remove = useCallback((id: string) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const clearDone = useCallback(() => {
    setTodos((prev) => prev.filter((t) => !t.done));
  }, []);

  return { todos, toggle, add, remove, clearDone };
}
