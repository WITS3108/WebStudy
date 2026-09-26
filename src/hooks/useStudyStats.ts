import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "learnfast-study-stats";
const STREAK_GOAL_SECONDS = 15 * 60;
const DAY_MS = 24 * 60 * 60 * 1000;

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

type StudyRecord = Record<string, number>; // "YYYY-MM-DD" -> total seconds

function localDateString(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getTodayString() {
  return localDateString(new Date());
}

function loadRecords(): StudyRecord {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? (parsed as StudyRecord) : {};
  } catch (error) {
    console.error("[study] load records failed:", error);
    return {};
  }
}

function saveRecords(records: StudyRecord) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch (error) {
    console.error("[study] save records failed:", error);
  }
}

function computeStats(records: StudyRecord): StudyStats {
  const today = getTodayString();
  const now = new Date();

  const week: StudyDay[] = [];
  let weekSeconds = 0;
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getTime() - i * DAY_MS);
    const dateStr = localDateString(d);
    const seconds = records[dateStr] || 0;
    weekSeconds += seconds;
    week.push({
      date: dateStr,
      label: d.toLocaleDateString("vi-VN", { weekday: "short" }),
      seconds,
      studied: seconds > 0,
      is_today: i === 0,
    });
  }

  const todaySeconds = records[today] || 0;

  // Chuỗi ngày học liên tiếp: nếu hôm nay chưa học thì bắt đầu tính từ hôm qua.
  let streakDays = 0;
  const startOffset = todaySeconds >= STREAK_GOAL_SECONDS ? 0 : 1;
  for (let i = startOffset; i < 365; i++) {
    const d = new Date(now.getTime() - i * DAY_MS);
    const seconds = records[localDateString(d)] || 0;
    if (seconds >= STREAK_GOAL_SECONDS) streakDays++;
    else break;
  }

  return {
    today_seconds: todaySeconds,
    week_seconds: weekSeconds,
    streak_days: streakDays,
    streak_goal_seconds: STREAK_GOAL_SECONDS,
    week,
  };
}

export function useStudyStats() {
  const [stats, setStats] = useState<StudyStats>(() => computeStats(loadRecords()));

  const refresh = useCallback(async () => {
    setStats(computeStats(loadRecords()));
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const recordStudyTime = useCallback(async (seconds: number, studyDate: string) => {
    if (seconds < 1) return;
    const records = loadRecords();
    records[studyDate] = (records[studyDate] || 0) + seconds;
    saveRecords(records);
    setStats(computeStats(records));
  }, []);

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
