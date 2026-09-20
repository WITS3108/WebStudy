import { Check, ListTodo, Plus } from "lucide-react";

import type { Todo } from "@/data/mock";

const priorityStyle: Record<Todo["priority"], string> = {
  cao: "bg-destructive/12 text-destructive",
  vừa: "bg-warning/15 text-warning",
  thấp: "bg-success/15 text-success",
};

export function TodayTodos({
  todos,
  onToggle,
}: {
  todos: Todo[];
  onToggle: (id: string) => void;
}) {
  return (
    <section className="card-soft animate-fade-up p-5" style={{ animationDelay: "380ms" }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ListTodo className="h-4 w-4 text-primary" />
          <h2 className="text-base font-black text-foreground">To-do hôm nay</h2>
        </div>
        <button className="btn-press flex items-center gap-1 rounded-full border border-primary/40 px-3 py-1.5 text-xs font-bold text-primary hover:bg-primary/10">
          <Plus className="h-3.5 w-3.5" />
          Tạo mới
        </button>
      </div>

      <ul className="mt-4 space-y-2.5">
        {todos.map((todo, i) => (
          <li
            key={todo.id}
            className="animate-fade-up flex items-center gap-3 rounded-2xl border border-border bg-background p-3 transition-all duration-300 hover:border-primary/50"
            style={{ animationDelay: `${420 + i * 60}ms` }}
          >
            <button
              type="button"
              onClick={() => onToggle(todo.id)}
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
          </li>
        ))}
      </ul>
    </section>
  );
}
