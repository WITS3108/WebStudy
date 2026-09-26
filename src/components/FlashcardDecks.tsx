import { Link } from "@tanstack/react-router";
import { Layers, Play, ChevronRight } from "lucide-react";

import { decks } from "@/data/mock";

export function FlashcardDecks() {
  return (
    <section className="card-soft animate-fade-up p-5" style={{ animationDelay: "300ms" }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-primary" />
          <h2 className="text-base font-black text-foreground">Bộ flashcard đang ôn tập</h2>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-muted-foreground">
            {decks.reduce((s, d) => s + d.due, 0)} thẻ đến hạn
          </span>
          <Link
            to="/flashcards"
            className="btn-press flex items-center gap-0.5 rounded-full text-xs font-bold text-primary hover:underline"
          >
            Xem tất cả
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-3">
        {decks.map((deck, i) => {
          const percent = Math.round((deck.mastered / deck.total) * 100);
          return (
            <Link
              key={deck.id}
              to="/flashcards"
              className="animate-fade-up group flex h-full flex-col rounded-2xl border border-border bg-background p-4 transition-all duration-300 hover:-translate-y-1 hover:border-primary/50"
              style={{ animationDelay: `${340 + i * 70}ms` }}
            >
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-primary">
                {deck.subject}
              </span>
              <h3 className="mt-2.5 line-clamp-2 text-sm font-bold leading-snug text-foreground">
                {deck.name}
              </h3>
              <p className="mt-1 text-xs font-medium text-muted-foreground">
                {deck.mastered}/{deck.total} thẻ đã thuộc · {deck.due} đến hạn
              </p>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted lg:mt-auto">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-700"
                  style={{ width: `${percent}%` }}
                />
              </div>
              <span className="btn-press mt-4 flex w-full items-center justify-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground hover:bg-primary-deep">
                <Play className="h-3.5 w-3.5" />
                Ôn ngay
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
