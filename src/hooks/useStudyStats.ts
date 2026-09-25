import { useCallback, useEffect, useState } from "react";

const API_BASE = (import.meta.env.VITE_TODO_API_URL || "").replace(/\/$/, "");

export type StudyDay = {
  date: string;
  label: string;
  seconds: number;
  studied: boolean;
  is_today: boolean;
};

export type StudyStats = {
  today_seconds: number;
  week_seconds: number;
  streak_days: number;
  streak_goal_seconds: number;
  week: StudyDay[];
};

function localDateString(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getTodayString() {
  return localDateString(new Date());
}

export function useStudyStats() {
  const [stats, setStats] = useState<StudyStats>({
    today_seconds: 0,
    week_seconds: 0,
    streak_days: 0,
    streak_goal_seconds: 15 * 60,
    week: [],
  });

  const refresh = useCallback(async () => {
    try {
      const today = getTodayString();
      const response = await fetch(`${API_BASE}/api/study/stats?today=${today}`);
      if (!response.ok) throw new Error(`Could not load study stats (${response.status})`);
      setStats((await response.json()) as StudyStats);
    } catch (error) {
      console.error("Không tải được thống kê giờ học.", error);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const recordStudyTime = useCallback(async (seconds: number, studyDate: string) => {
    if (seconds < 1) return;
    try {
      const response = await fetch(`${API_BASE}/api/study/record`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ seconds, study_date: studyDate }),
      });
      if (!response.ok) throw new Error(`Could not record study time (${response.status})`);
      await refresh();
    } catch (error) {
      console.error("Không lưu được thời gian học.", error);
    }
  }, [refresh]);

  return { stats, recordStudyTime, refresh };
}

export function formatStudyTime(totalSeconds: number) {
  const totalMinutes = Math.floor(totalSeconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${minutes}m`;
}

export function getLocalDateString(date: Date) {
  return localDateString(date);
}
