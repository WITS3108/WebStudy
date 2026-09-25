import { useState } from "react";
import { Plus } from "lucide-react";

import type { Todo } from "@/data/mock";

const priorities: Todo["priority"][] = ["cao", "vừa", "thấp"];

export function TodoComposer({
  onAdd,
}: {
  onAdd: (todo: Omit<Todo, "id" | "done">) => void;
}) {
  const [title, setTitle] = useState("");
  const [tag, setTag] = useState("Học tập");
  const [time, setTime] = useState("08:00");
  const [priority, setPriority] = useState<Todo["priority"]>("vừa");
  const [error, setError] = useState("");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const value = title.trim();
        if (!value) {
          setError("Nhập tên nhiệm vụ trước khi bấm Thêm.");
          return;
        }
        setError("");
        onAdd({ title: value, tag: tag.trim() || "Học tập", time, priority });
        setTitle("");
      }}
      className="card-soft animate-fade-up p-5"
    >
      <h2 className="text-base font-black text-foreground">Thêm nhiệm vụ mới</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto_auto_auto]">
        <input
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (e.target.value.trim()) setError("");
          }}
          placeholder="Bạn cần làm gì hôm nay?"
          maxLength={250}
          className="h-11 w-full rounded-full border border-border bg-background px-4 text-sm font-medium outline-none transition-shadow placeholder:text-muted-foreground focus:border-primary focus:ring-4 focus:ring-primary/15"
        />
        <input
          value={tag}
          onChange={(e) => setTag(e.target.value)}
          placeholder="Môn học"
          className="h-11 w-full rounded-full border border-border bg-background px-4 text-sm font-medium outline-none focus:border-primary focus:ring-4 focus:ring-primary/15 sm:w-32"
        />
        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="h-11 rounded-full border border-border bg-background px-4 text-sm font-bold outline-none focus:border-primary focus:ring-4 focus:ring-primary/15"
        />
        <button
          type="submit"
          className="btn-press flex h-11 items-center justify-center gap-1.5 rounded-full bg-primary px-5 text-sm font-bold text-primary-foreground hover:bg-primary-deep"
        >
          <Plus className="h-4 w-4" />
          Thêm
        </button>
      </div>

      {error && (
        <p role="alert" className="mt-2 text-sm font-medium text-destructive">
          {error}
        </p>
      )}

      <div className="mt-3 flex items-center gap-2">
        <span className="text-xs font-bold text-muted-foreground">Ưu tiên:</span>
        {priorities.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setPriority(p)}
            className={`btn-press rounded-full px-3 py-1.5 text-xs font-black uppercase ${
              priority === p
                ? "bg-primary text-primary-foreground"
                : "border border-border text-muted-foreground hover:border-primary/50"
            }`}
          >
            {p}
          </button>
        ))}
      </div>
    </form>
  );
}
