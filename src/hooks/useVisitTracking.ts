import { useEffect } from "react";

const STORAGE_KEY = "learnfast-visit";

export type VisitRecord = {
  firstVisit: string; // ISO datetime of the very first visit
  lastVisit: string; // ISO datetime of the most recent visit
  totalSeconds: number; // total time spent on the site
  visitedDays: string[]; // distinct visit dates (YYYY-MM-DD)
};

function localDateString(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function emptyRecord(): VisitRecord {
  return { firstVisit: "", lastVisit: "", totalSeconds: 0, visitedDays: [] };
}

function loadRecord(): VisitRecord {
  if (typeof window === "undefined") return emptyRecord();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyRecord();
    const parsed = JSON.parse(raw) as Partial<VisitRecord>;
    return {
      firstVisit: typeof parsed.firstVisit === "string" ? parsed.firstVisit : "",
      lastVisit: typeof parsed.lastVisit === "string" ? parsed.lastVisit : "",
      totalSeconds: typeof parsed.totalSeconds === "number" ? parsed.totalSeconds : 0,
      visitedDays: Array.isArray(parsed.visitedDays) ? parsed.visitedDays : [],
    };
  } catch {
    return emptyRecord();
  }
}

function saveRecord(record: VisitRecord) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
  } catch {
    /* ignore */
  }
}

export function getVisitRecord(): VisitRecord {
  return loadRecord();
}

/**
 * Saves the user's visit date(s) and keeps updating the total time the user
 * has spent on the site. Mount once at the app root.
 */
export function useVisitTracking() {
  useEffect(() => {
    const record = loadRecord();
    const now = new Date();
    const today = localDateString(now);

    // Lưu ngày truy cập và cập nhật thời điểm truy cập gần nhất
    record.lastVisit = now.toISOString();
    if (!record.firstVisit) record.firstVisit = now.toISOString();
    if (!record.visitedDays.includes(today)) record.visitedDays.push(today);
    saveRecord(record);

    let lastTick = Date.now();

    const flush = () => {
      const r = loadRecord();
      const nowMs = Date.now();
      const delta = Math.floor((nowMs - lastTick) / 1000);
      if (delta > 0) {
        r.totalSeconds += delta;
        lastTick = nowMs;
        saveRecord(r);
      }
    };

    const interval = window.setInterval(flush, 15000);

    const onUnload = () => flush();
    window.addEventListener("beforeunload", onUnload);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener("beforeunload", onUnload);
      flush();
    };
  }, []);
}
