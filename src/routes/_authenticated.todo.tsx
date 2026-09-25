import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Check, ListTodo, Trash2 } from "lucide-react";

import { AppShell } from "@/components/AppShell";
import { TodoComposer } from "@/components/TodoComposer";
import { useTodos } from "@/hooks/useTodos";
import type { Todo } from "@/data/mock";

export const Route = createFileRoute("/_authenticated/todo")({
  head: () => ({
    meta: [
      { title: "To-do list — LearnFast" },
      {
        name: "description",
        content: "Quản lý nhiệm vụ học tập theo ngày, mức ưu tiên và tiến độ trên LearnFast.",
      },
      { property: "og:title", content: "To-do list — LearnFast" },
      {
        property: "og:description",
        content: "Quản lý nhiệm vụ học tập theo ngày và mức ưu tiên.",
      },
    ],
  }),
  component: TodoPage,
});

const priorityStyle: Record<Todo["priority"], string> = {
  cao: "bg-destructive/12 text-destructive",
  vừa: "bg-warning/15 text-warning",
  thấp: "bg-success/15 text-success",
};

const filters = [
  { key: "all", label: "Tất cả" },
  { key: "active", label: "Chưa xong" },
  { key: "done", label: "Đã xong" },
] as const;

function TodoPage() {
  const { todos, toggle, add, remove, clearDone, error } = useTodos();
  const [filter, setFilter] = useState<(typeof filters)[number]["key"]>("all");

  const done = todos.filter((t) => t.done).length;
  const percent = todos.length ? Math.round((done / todos.length) * 100) : 0;
  const visible = todos
    .filter((t) => (filter === "all" ? true : filter === "done" ? t.done : !t.done))
    .sort((a, b) => a.time.localeCompare(b.time));

  return (
    <AppShell>
      <div className="space-y-5">
        <header className="animate-fade-up">
          <h1 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl">
            To-do list
          </h1>
          <p className="mt-2 text-sm font-medium text-muted-foreground">
            Đã hoàn thành {done}/{todos.length} nhiệm vụ ({percent}%)
          </p>
          <div className="mt-3 h-2.5 max-w-sm overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-700"
              style={{ width: `${percent}%` }}
            />
          </div>
        </header>

        <TodoComposer onAdd={add} />

        {error && (
          <div className="rounded-2xl border border-destructive/40 bg-destructive/10 p-4 text-sm font-bold text-destructive animate-fade-up">
            Không thể lưu nhiệm vụ: {error}
          </div>
        )}

        <section className="card-soft animate-fade-up p-5" style={{ animationDelay: "120ms" }}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <ListTodo className="h-4 w-4 text-primary" />
              <h2 className="text-base font-black text-foreground">Danh sách nhiệm vụ</h2>
            </div>
            <div className="flex items-center gap-2">
              {filters.map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={`btn-press rounded-full px-3 py-1.5 text-xs font-bold ${
                    filter === f.key
                      ? "bg-primary text-primary-foreground"
                      : "border border-border text-muted-foreground hover:border-primary/50"
                  }`}
                >
                  {f.label}
                </button>
              ))}
              {done > 0 && (
                <button
                  onClick={clearDone}
                  className="btn-press rounded-full border border-border px-3 py-1.5 text-xs font-bold text-muted-foreground hover:border-destructive/50 hover:text-destructive"
                >
                  Xoá việc đã xong
                </button>
              )}
            </div>
          </div>

          {visible.length === 0 ? (
            <p className="mt-6 text-center text-sm font-medium text-muted-foreground">
              Chưa có nhiệm vụ nào ở đây.
            </p>
          ) : (
            <ul className="mt-4 space-y-2.5">
              {visible.map((todo, i) => (
                <li
                  key={todo.id}
                  className="animate-fade-up group flex items-center gap-3 rounded-2xl border border-border bg-background p-3 transition-all duration-300 hover:border-primary/50"
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <button
                    type="button"
                    onClick={() => toggle(todo.id)}
                    aria-label={todo.done ? "Bỏ hoàn thành" : "Đánh dấu hoàn thành"}
                    className={`btn-press grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 ${
                      todo.done
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border text-transparent hover:border-primary"
                    }`}
                  >
                    <Check className="h-3.5 w-3.5" strokeWidth={3} />
                  </button>

                  <div className="min-w-0 flex-1">
                    <p
                      className={`truncate text-sm font-bold ${
                        todo.done ? "text-muted-foreground line-through" : "text-foreground"
                      }`}
                    >
                      {todo.title}
                    </p>
                    <p className="mt-0.5 text-xs font-medium text-muted-foreground">
                      {todo.time} · {todo.tag}
                    </p>
                  </div>

                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-black uppercase ${priorityStyle[todo.priority]}`}
                  >
                    {todo.priority}
                  </span>

                  <button
                    type="button"
                    onClick={() => remove(todo.id)}
                    aria-label="Xoá nhiệm vụ"
                    className="btn-press grid h-8 w-8 place-items-center rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </AppShell>
  );
}
