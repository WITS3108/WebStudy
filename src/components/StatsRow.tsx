import { CheckCircle2, Clock, Flame } from "lucide-react";

import { streakDays } from "@/data/mock";

const dayLabels = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

export function StatsRow({ done, total }: { done: number; total: number }) {
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <div className="card-soft animate-fade-up p-5" style={{ animationDelay: "60ms" }}>
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-muted-foreground">Nhiệm vụ hôm nay</span>
          <CheckCircle2 className="h-4 w-4 text-primary" />
        </div>
        <div className="mt-3 flex items-end gap-2">
          <span className="text-3xl font-black text-foreground">
            {done}/{total}
          </span>
          <span className="pb-1 text-xs font-bold text-muted-foreground">hoàn thành</span>
        </div>
        <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all duration-700 ease-out"
            style={{ width: `${percent}%` }}
          />
        </div>
        <p className="mt-2 text-xs font-medium text-muted-foreground">
          {percent}% — còn {total - done} việc nữa là xong ngày hôm nay.
        </p>
      </div>

      <div className="card-soft animate-fade-up p-5" style={{ animationDelay: "140ms" }}>
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-muted-foreground">Chuỗi học</span>
          <Flame className="h-4 w-4 text-primary" />
        </div>
        <div className="mt-3 flex items-end gap-2">
          <span className="text-3xl font-black text-foreground">12</span>
          <span className="pb-1 text-xs font-bold text-muted-foreground">ngày liên tục</span>
        </div>
        <div className="mt-4 flex gap-1.5">
          {streakDays.map((active, i) => (
            <div key={dayLabels[i]} className="flex flex-1 flex-col items-center gap-1">
              <span
                className={`h-7 w-full rounded-lg transition-colors ${
                  active ? "bg-primary" : "bg-muted"
                }`}
              />
              <span className="text-[10px] font-bold text-muted-foreground">{dayLabels[i]}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card-soft animate-fade-up p-5 sm:col-span-2 xl:col-span-1" style={{ animationDelay: "220ms" }}>
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-muted-foreground">Giờ học hôm nay</span>
          <Clock className="h-4 w-4 text-primary" />
        </div>
        <div className="mt-3 flex items-end gap-2">
          <span className="text-3xl font-black text-foreground">4h 36m</span>
          <span className="pb-1 text-xs font-bold text-primary">+42m</span>
        </div>
        <p className="mt-4 text-xs font-medium text-muted-foreground">
          Mục tiêu 5h — bạn đã đạt 92%. Thêm một phiên Pomodoro là chạm mốc.
        </p>
        <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-muted">
          <div className="h-full w-[92%] rounded-full bg-primary-deep" />
        </div>
      </div>
    </div>
  );
}
