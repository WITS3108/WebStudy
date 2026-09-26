import { useEffect, useState } from "react";

export interface TermRow {
  id: string;
  term: string;
  answers: string[];
  remembered?: boolean;
}

export interface FlashcardItem {
  id: string;
  title: string;
  description?: string;
  category: string;
  count: number;
  mastered: number;
  lastStudiedAt?: number;
  terms: TermRow[];
}

const FLASHCARDS_STORAGE_KEY = "learnfast-flashcards";

const DEFAULT_FLASHCARDS: FlashcardItem[] = [
  {
    id: "1",
    title: "English",
    description: "Tổng hợp từ vựng tiếng Anh cơ bản hàng ngày giúp bạn giao tiếp tự tin hơn trong các tình huống thực tế.",
    category: "TIẾNG ANH",
    count: 3,
    mastered: 0,
    terms: [
      { id: "t1", term: "Apple", answers: ["Quả táo"] },
      { id: "t2", term: "Banana", answers: ["Quả chuối"] },
      { id: "t3", term: "Computer", answers: ["Máy tính"] },
    ],
  },
  {
    id: "2",
    title: "IELTS Academic Word List",
    description: "Danh sách từ vựng học thuật chuyên sâu xuất hiện thường xuyên trong bài thi IELTS Reading và Writing.",
    category: "TIẾNG ANH",
    count: 2,
    mastered: 0,
    terms: [
      { id: "i1", term: "Analyze", answers: ["Phân tích"] },
      { id: "i2", term: "Significant", answers: ["Đáng kể, quan trọng"] },
    ],
  },
  {
    id: "3",
    title: "Công thức Đạo hàm & Tích phân",
    description: "Hệ thống các công thức toán học giải tích phổ biến cho học sinh THPT và sinh viên đại học.",
    category: "TOÁN HỌC",
    count: 2,
    mastered: 0,
    terms: [
      { id: "m1", term: "(x^n)' = n.x^(n-1)", answers: ["Đạo hàm hàm lũy thừa"] },
      { id: "m2", term: "∫ x^n dx = (x^(n+1))/(n+1) + C", answers: ["Tích phân cơ bản"] },
    ],
  },
  {
    id: "4",
    title: "Thuật ngữ Cơ sở dữ liệu",
    description: "Các khái niệm nền tảng về SQL, bảng, khóa chính, khóa ngoại và tối ưu hóa truy vấn.",
    category: "CSDL",
    count: 2,
    mastered: 0,
    terms: [
      { id: "d1", term: "Primary Key", answers: ["Khóa chính (duy nhất và không null)"] },
      { id: "d2", term: "Foreign Key", answers: ["Khóa ngoại liên kết bảng"] },
    ],
  },
];

function migrateFlashcards(cards: FlashcardItem[]): FlashcardItem[] {
  return cards.map((card) => ({
    ...card,
    terms: (card.terms || []).map((term) => {
      const t = term as TermRow & { definition?: string };
      return {
        id: t.id,
        term: t.term,
        answers:
          Array.isArray(t.answers) && t.answers.length > 0
            ? t.answers
            : t.definition
              ? [t.definition]
              : [""],
        remembered: t.remembered,
      } as TermRow;
    }),
  }));
}

export function loadFlashcards(): FlashcardItem[] {
  if (typeof window === "undefined") return DEFAULT_FLASHCARDS;
  try {
    const raw = window.localStorage.getItem(FLASHCARDS_STORAGE_KEY);
    if (!raw) return DEFAULT_FLASHCARDS;
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed)
      ? migrateFlashcards(parsed as FlashcardItem[])
      : DEFAULT_FLASHCARDS;
  } catch (error) {
    console.error("[flashcards] load failed:", error);
    return DEFAULT_FLASHCARDS;
  }
}

export function saveFlashcards(cards: FlashcardItem[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(FLASHCARDS_STORAGE_KEY, JSON.stringify(cards));
  } catch (error) {
    console.error("[flashcards] save failed:", error);
  }
}

/**
 * Shared flashcard store (localStorage-backed). Used by both the home page
 * (dashboard section) and the flashcards page so they always stay in sync.
 */
export function useFlashcards() {
  const [flashcards, setFlashcards] = useState<FlashcardItem[]>(loadFlashcards);

  useEffect(() => {
    saveFlashcards(flashcards);
  }, [flashcards]);

  return { flashcards, setFlashcards };
}
