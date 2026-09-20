import { TrendingUp } from "lucide-react";

import { weekStats } from "@/data/mock";

export function WeeklyProgress() {
  const max = Math.max(...weekStats.map((d) => d.hours), 6);
  const total = weekStats.reduce((s, d) => s + d.hours, 0);

  return (
    <section className="card-soft animate-fade-up p-5" style={{ animationDelay: "80ms" }}>
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-base font-black text-foreground">Tiến độ tuần này</h2>
          <p className="mt-0.5 text-xs font-medium text-muted-foreground">
            Tổng cộng {total.toFixed(1)} giờ học
          </p>
        </div>
        <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">
          <TrendingUp className="h-3.5 w-3.5" />
          +12%
        </span>
      </div>

      <div className="mt-5 flex h-36 items-end gap-2">
        {weekStats.map((d, i) => {
          const height = d.hours === 0 ? 4 : Math.round((d.hours / max) * 100);
          return (
            <div key={d.label} className="flex h-full flex-1 flex-col items-center gap-2">
              <span className="text-[10px] font-bold text-muted-foreground">
                {d.hours > 0 ? `${d.hours}h` : "--"}
              </span>
              <div className="relative w-full flex-1">
                <div
                  className="animate-grow-bar absolute bottom-0 left-0 w-full origin-bottom rounded-t-xl transition-colors"
                  style={{
                    height: `${height}%`,
                    animationDelay: `${i * 70}ms`,
                    backgroundColor: d.today
                      ? "var(--color-primary-deep)"
                      : d.hours > 0
                        ? "var(--color-primary)"
                        : "var(--color-muted)",
                    opacity: d.hours > 0 ? 1 : 0.6,
                  }}
                />
              </div>
              <span
                className={`text-[11px] font-bold ${d.today ? "text-primary-deep" : "text-muted-foreground"}`}
              >
                {d.label}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
