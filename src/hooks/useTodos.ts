import { useCallback, useEffect, useState } from "react";

import type { Todo } from "@/data/mock";

const API_BASE = (import.meta.env.VITE_TODO_API_URL || "").replace(/\/$/, "");
const TODOS_URL = `${API_BASE}/api/todos`;

async function readTodos(): Promise<Todo[]> {
  const response = await fetch(TODOS_URL);
  if (!response.ok) throw new Error(`Could not load todos (${response.status})`);
  return response.json() as Promise<Todo[]>;
}

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([]);

  const refresh = useCallback(async () => {
    try {
      setTodos(await readTodos());
    } catch (error) {
      console.error("Không kết nối được Todo API. Hãy kiểm tra server Python.", error);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const toggle = useCallback(async (id: string) => {
    const todo = todos.find((item) => item.id === id);
    if (!todo) return;
    try {
      const response = await fetch(`${TODOS_URL}/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ done: !todo.done }),
      });
      if (!response.ok) throw new Error(`Could not update todo (${response.status})`);
      await refresh();
    } catch (error) {
      console.error("Không cập nhật được nhiệm vụ.", error);
    }
  }, [todos, refresh]);

  const add = useCallback(async (todo: Omit<Todo, "id" | "done">) => {
    try {
      const response = await fetch(TODOS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(todo),
      });
      if (!response.ok) throw new Error(`Could not create todo (${response.status})`);
      await refresh();
    } catch (error) {
      console.error("Không thêm được nhiệm vụ.", error);
    }
  }, [refresh]);

  const remove = useCallback(async (id: string) => {
    try {
      const response = await fetch(`${TODOS_URL}/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error(`Could not delete todo (${response.status})`);
      await refresh();
    } catch (error) {
      console.error("Không xóa được nhiệm vụ.", error);
    }
  }, [refresh]);

  const clearDone = useCallback(async () => {
    try {
      const response = await fetch(`${TODOS_URL}/completed`, { method: "DELETE" });
      if (!response.ok) throw new Error(`Could not clear completed todos (${response.status})`);
      await refresh();
    } catch (error) {
      console.error("Không xóa được các nhiệm vụ đã hoàn thành.", error);
    }
  }, [refresh]);

  return { todos, toggle, add, remove, clearDone };
}
