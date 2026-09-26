import { CheckCircle2, Clock, Flame } from "lucide-react";
import { formatStudyTime, type StudyStats } from "@/hooks/useStudyStats";
import { getVisitStreak } from "@/hooks/useVisitTracking";

export function StatsRow({
  done,
  total,
  studyStats,
}: {
  done: number;
  total: number;
  studyStats: StudyStats;
}) {
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);
  const studyGoalPercent = Math.min(
    100,
    Math.round((studyStats.today_seconds / studyStats.streak_goal_seconds) * 100),
  );
  const week = studyStats.week.length
    ? studyStats.week
    : ["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map((label) => ({
        label,
        studied: false,
        is_today: false,
      }));

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
          <span className="text-3xl font-black text-foreground">{getVisitStreak()}</span>
          <span className="pb-1 text-xs font-bold text-muted-foreground">ngày liên tục</span>
        </div>
        <div className="mt-4 flex gap-1.5">
          {week.map((day) => (
            <div key={day.label} className="flex flex-1 flex-col items-center gap-1">
              <span
                title={day.studied ? "Đã đạt mốc học trong ngày" : "Chưa đạt mốc học trong ngày"}
                className={`h-7 w-full rounded-lg transition-colors ${
                  day.studied ? "bg-primary" : "bg-muted"
                }`}
              />
              <span className={`text-[10px] font-bold ${day.is_today ? "text-primary" : "text-muted-foreground"}`}>
                {day.label}
              </span>
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
          <span className="text-3xl font-black text-foreground">
            {formatStudyTime(studyStats.today_seconds)}
          </span>
        </div>
        <p className="mt-4 text-xs font-medium text-muted-foreground">
          {studyStats.today_seconds >= studyStats.streak_goal_seconds
            ? "Đã đạt mốc 15 phút để giữ chuỗi hôm nay."
            : `Còn ${formatStudyTime(studyStats.streak_goal_seconds - studyStats.today_seconds)} để giữ chuỗi hôm nay.`}
        </p>
        <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary-deep transition-all duration-500"
            style={{ width: `${studyGoalPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
}
