import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { 
  Search, 
  Flame, 
  Plus, 
  Layers, 
  MoreHorizontal,
  ArrowLeft,
  Trash2,
  Edit2,
  Copy,
  Check,
  Shuffle,
  ChevronLeft,
  ChevronRight,
  CheckCircle2
} from "lucide-react";
import { useFlashcards, type FlashcardItem, type TermRow } from "@/lib/flashcards";
import { getVisitStreak } from "@/hooks/useVisitTracking";

export const Route = createFileRoute("/_authenticated/flashcards")({
  component: FlashcardsPage,
});

function FlashcardsPage() {
  const [currentView, setCurrentView] = useState<"main" | "create-flashcard" | "edit-flashcard" | "study">("main");
  
  const { flashcards, setFlashcards } = useFlashcards();

  // Kiểm tra và reset sau 24h kể từ lần ôn tập cuối
  useEffect(() => {
    const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
    const now = Date.now();

    setFlashcards(prevCards => 
      prevCards.map(card => {
        if (card.lastStudiedAt && now - card.lastStudiedAt >= TWENTY_FOUR_HOURS) {
          return {
            ...card,
            mastered: 0,
            lastStudiedAt: undefined
          };
        }
        return card;
      })
    );
  }, []);

  const [activeStudyCard, setActiveStudyCard] = useState<FlashcardItem | null>(null);
  const [currentTermIndex, setCurrentTermIndex] = useState(0);
  const [answerInput, setAnswerInput] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [lastCorrect, setLastCorrect] = useState(false);

  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newCategory, setNewCategory] = useState("TIẾNG ANH");
  const [terms, setTerms] = useState<TermRow[]>([
    { id: "1", term: "", answers: [""] },
    { id: "2", term: "", answers: [""] },
  ]);
  const [addQuantity, setAddQuantity] = useState<number>(1);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!(event.target as HTMLElement).closest(".menu-container")) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleStartStudy = (card: FlashcardItem) => {
    setActiveStudyCard(card);
    setCurrentTermIndex(0);
    setAnswerInput("");
    setRevealed(false);
    setLastCorrect(false);
    setCurrentView("study");
  };

  const handleCheckAnswer = () => {
    if (!activeStudyCard || revealed) return;
    const term = activeStudyCard.terms[currentTermIndex];
    if (!term) return;

    const userAnswer = answerInput.trim().toLowerCase();
    const isCorrect = term.answers.some((a) => a.trim().toLowerCase() === userAnswer);

    setLastCorrect(isCorrect);
    setRevealed(true);

    // Lưu trạng thái "Đã thuộc" cho từng thẻ
    setActiveStudyCard((prev) =>
      prev
        ? {
            ...prev,
            terms: prev.terms.map((t) =>
              t.id === term.id ? { ...t, remembered: isCorrect } : t,
            ),
          }
        : prev,
    );
  };

  const handleFinishStudy = () => {
    if (!activeStudyCard) return;
    const now = Date.now();
    const rememberedCount = activeStudyCard.terms.filter((t) => t.remembered).length;

    // Lưu trạng thái "Đã thuộc" của từng thẻ và cập nhật số thẻ đã thuộc
    setFlashcards((prev) =>
      prev.map((c) =>
        c.id === activeStudyCard.id
          ? {
              ...c,
              terms: activeStudyCard.terms,
              mastered: rememberedCount,
              lastStudiedAt: now,
            }
          : c,
      ),
    );

    setCurrentView("main");
    setActiveStudyCard(null);
  };

  const handleAddTermRows = () => {
    const rowsToAdd = Math.max(1, addQuantity || 1);
    const newRows: TermRow[] = Array.from({ length: rowsToAdd }, (_, index) => ({
      id: (Date.now() + index).toString(),
      term: "",
      answers: [""]
    }));
    setTerms([...terms, ...newRows]);
  };

  const handleDeleteTerm = (id: string) => {
    if (terms.length === 1) return;
    setTerms(terms.filter(t => t.id !== id));
  };

  const handleTermChange = (id: string, value: string) => {
    setTerms(terms.map(t => t.id === id ? { ...t, term: value } : t));
  };

  const handleAnswerChange = (id: string, index: number, value: string) => {
    setTerms(terms.map(t => t.id === id ? {
      ...t,
      answers: t.answers.map((a, i) => i === index ? value : a)
    } : t));
  };

  const handleAddAnswer = (id: string) => {
    setTerms(terms.map(t => t.id === id ? { ...t, answers: [...t.answers, ""] } : t));
  };

  const handleRemoveAnswer = (id: string, index: number) => {
    setTerms(terms.map(t => t.id === id ? {
      ...t,
      answers: t.answers.length > 1 ? t.answers.filter((_, i) => i !== index) : t.answers
    } : t));
  };

  const handleOpenCreate = () => {
    setEditingCardId(null);
    setNewTitle("");
    setNewDescription("");
    setNewCategory("TIẾNG ANH");
    setTerms([
      { id: "1", term: "", answers: [""] },
      { id: "2", term: "", answers: [""] },
    ]);
    setSaveError(null);
    setCurrentView("create-flashcard");
  };

  const handleOpenEdit = (card: FlashcardItem) => {
    setEditingCardId(card.id);
    setNewTitle(card.title);
    setNewDescription(card.description || "");
    setNewCategory(card.category);
    setTerms(card.terms && card.terms.length > 0
      ? card.terms.map((t) => ({
          ...t,
          answers: t.answers && t.answers.length > 0 ? t.answers : [""],
        }))
      : [
          { id: "1", term: "", answers: [""] },
          { id: "2", term: "", answers: [""] },
        ]);
    setSaveError(null);
    setCurrentView("edit-flashcard");
    setActiveMenuId(null);
  };

  const handleSaveFlashcard = () => {
    if (!newTitle.trim()) {
      setSaveError("Vui lòng nhập tên bộ Flashcard.");
      return;
    }

    // Mỗi câu hỏi phải có ít nhất một đáp án tương ứng
    const hasIncomplete = terms.some((t) => {
      const hasTerm = t.term.trim() !== "";
      const hasAnswer = t.answers.some((a) => a.trim() !== "");
      return (hasTerm && !hasAnswer) || (!hasTerm && hasAnswer);
    });

    if (hasIncomplete) {
      setSaveError("Mỗi câu hỏi phải có ít nhất một đáp án tương ứng.");
      return;
    }

    const cleaned: TermRow[] = terms
      .map((t) => ({
        ...t,
        term: t.term.trim(),
        answers: t.answers.map((a) => a.trim()).filter(Boolean),
      }))
      .filter((t) => t.term !== "" && t.answers.length > 0);

    if (cleaned.length === 0) {
      setSaveError("Vui lòng thêm ít nhất một câu hỏi và đáp án.");
      return;
    }

    if (editingCardId) {
      setFlashcards(flashcards.map(c => c.id === editingCardId ? {
        ...c,
        title: newTitle,
        description: newDescription,
        category: newCategory.toUpperCase(),
        count: cleaned.length,
        terms: cleaned
      } : c));
    } else {
      const newCard: FlashcardItem = {
        id: Date.now().toString(),
        title: newTitle,
        description: newDescription,
        category: newCategory.toUpperCase(),
        count: cleaned.length,
        mastered: 0,
        terms: cleaned
      };
      setFlashcards([newCard, ...flashcards]);
    }

    setSaveError(null);
    setCurrentView("main");
  };

  const handleCopyCard = (card: FlashcardItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const duplicated: FlashcardItem = {
      ...card,
      id: Date.now().toString(),
      title: `${card.title} (Bản sao)`,
      mastered: 0,
      lastStudiedAt: undefined
    };
    setFlashcards([duplicated, ...flashcards]);
    setActiveMenuId(null);
  };

  const handleDeleteCard = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFlashcards(flashcards.filter(c => c.id !== id));
    setActiveMenuId(null);
  };

  const handleStartRename = (card: FlashcardItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setRenamingId(card.id);
    setRenameValue(card.title);
    setActiveMenuId(null);
  };

  const handleSaveRename = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!renameValue.trim()) return;
    setFlashcards(flashcards.map(c => c.id === id ? { ...c, title: renameValue } : c));
    setRenamingId(null);
  };

  const handleShuffleCards = () => {
    if (!activeStudyCard || !activeStudyCard.terms.length) return;
    const shuffledTerms = [...activeStudyCard.terms].sort(() => Math.random() - 0.5);
    setActiveStudyCard({
      ...activeStudyCard,
      terms: shuffledTerms
    });
    setCurrentTermIndex(0);
    setAnswerInput("");
    setRevealed(false);
    setLastCorrect(false);
  };

  const isLastCard = activeStudyCard && activeStudyCard.terms.length > 0 && currentTermIndex === activeStudyCard.terms.length - 1;

  return (
    <AppShell>
      <div className="w-full max-w-6xl mx-auto p-6 lg:p-8 space-y-6 animate-[fade-up_0.4s_ease-out]">
        
        {/* ================= VIEW 1: MAIN FLASHCARD PAGE ================= */}
        {currentView === "main" && (
          <>
            <header className="space-y-2">
              <h1 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl">
                Flashcard
              </h1>
              <p className="text-sm font-medium text-muted-foreground">
                Quản lý, tạo mới và ôn tập các bộ thẻ ghi nhớ của bạn.
              </p>
            </header>

            <div className="flex items-center justify-between gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Tìm kiếm bộ thẻ, từ vựng..."
                  className="w-full rounded-2xl border border-border bg-card py-3 pl-10 pr-4 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="flex items-center gap-2 rounded-2xl bg-orange-50 px-4 py-3 border border-orange-100 text-orange-600 font-bold text-sm shadow-sm">
                <Flame className="h-5 w-5 fill-orange-500 text-orange-500" />
                <span>{getVisitStreak()} ngày liên tục</span>
              </div>
            </div>

            <div className="flex items-center justify-between border-b border-border/60 pb-5">
              <div className="flex items-center gap-2 text-muted-foreground font-bold text-sm">
                <Layers className="h-4 w-4 text-primary" />
                <h2>Thẻ Flashcards</h2>
              </div>

              <button 
                onClick={handleOpenCreate}
                className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:opacity-90 transition"
              >
                <Plus className="h-4 w-4" />
                <span>Flashcard</span>
              </button>
            </div>

            <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {flashcards.map((card) => {
                const isCompleted = card.mastered > 0 && card.mastered === card.count;
                return (
                  <div key={card.id} className="relative flex flex-col justify-between rounded-2xl border border-border bg-card p-6 shadow-sm space-y-5 hover:shadow-md transition">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="rounded-lg bg-orange-100 px-2.5 py-1 text-xs font-bold text-orange-600">
                          {card.category}
                        </span>
                        
                        <div className="relative menu-container">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenuId(activeMenuId === card.id ? null : card.id);
                            }}
                            className="text-muted-foreground hover:text-foreground p-1.5 rounded-lg hover:bg-accent transition"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </button>

                          {activeMenuId === card.id && (
                            <div className="absolute right-0 top-full mt-1 w-44 rounded-xl border border-border bg-card py-1.5 shadow-lg z-20 space-y-0.5 animate-in fade-in zoom-in-95">
                              <button
                                onClick={(e) => handleStartRename(card, e)}
                                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-foreground hover:bg-accent transition"
                              >
                                <Edit2 className="h-3.5 w-3.5 text-muted-foreground" />
                                <span>Đổi tên</span>
                              </button>
                              <button
                                onClick={() => handleOpenEdit(card)}
                                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-foreground hover:bg-accent transition"
                              >
                                <Layers className="h-3.5 w-3.5 text-muted-foreground" />
                                <span>Chỉnh sửa</span>
                              </button>
                              <button
                                onClick={(e) => handleCopyCard(card, e)}
                                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-foreground hover:bg-accent transition"
                              >
                                <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                                <span>Sao chép</span>
                              </button>
                              <div className="h-px bg-border/60 my-1" />
                              <button
                                onClick={(e) => handleDeleteCard(card.id, e)}
                                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-red-600 hover:bg-red-50 transition"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                <span>Xóa</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {renamingId === card.id ? (
                        <div className="flex items-center gap-2 pt-1" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="text"
                            value={renameValue}
                            onChange={(e) => setRenameValue(e.target.value)}
                            className="w-full text-sm font-bold border border-primary rounded-lg px-2.5 py-1.5 focus:outline-none bg-background"
                            autoFocus
                          />
                          <button onClick={(e) => handleSaveRename(card.id, e)} className="text-primary p-1.5 rounded-lg bg-primary/10">
                            <Check className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-1.5">
                          <h4 className="text-xl font-bold text-foreground line-clamp-1">{card.title}</h4>
                          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{card.description || "Chưa có mô tả"}</p>
                        </div>
                      )}
                    </div>

                    <div className="space-y-3 pt-3 border-t border-border/40">
                      <div className="flex justify-between items-center text-xs font-medium text-muted-foreground">
                        <span>Đã thuộc</span>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-primary">{card.mastered} / {card.count}</span>
                          {isCompleted && (
                            <span className="inline-flex items-center gap-1 text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-md text-[11px]">
                              <CheckCircle2 className="h-3 w-3" /> Đã ôn tập
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleOpenEdit(card)}
                          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-border py-3 text-xs font-bold text-foreground hover:bg-accent transition"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                          Chỉnh
                        </button>
                        <button 
                          onClick={() => handleStartStudy(card)}
                          className="flex-1 rounded-xl bg-primary/10 py-3 text-xs font-bold text-primary hover:bg-primary hover:text-white transition"
                        >
                          {isCompleted ? "Ôn tập lại" : "Ôn tập ngay"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </section>
          </>
        )}

        {/* ================= VIEW 2: STUDY / ÔN TẬP PAGE ================= */}
        {currentView === "study" && activeStudyCard && (
          <div className="space-y-6">
            <div>
              <button 
                onClick={() => setCurrentView("main")}
                className="flex items-center gap-2 rounded-xl border border-border px-3.5 py-2 text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-accent transition"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Quay lại</span>
              </button>
            </div>

            <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="rounded-lg bg-orange-100 px-3 py-1 text-xs font-bold text-orange-600">
                  {activeStudyCard.category}
                </span>
                <span className="text-xs font-bold text-muted-foreground">
                  Thẻ {currentTermIndex + 1} / {activeStudyCard.terms.length || 1}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
                {activeStudyCard.title}
              </h1>
              <p className="text-sm font-medium text-muted-foreground leading-relaxed whitespace-pre-line">
                {activeStudyCard.description || "Chưa có mô tả chi tiết cho bộ thẻ này."}
              </p>
            </div>

            <div className="flex justify-end">
              <button 
                onClick={handleShuffleCards}
                className="p-3 rounded-xl border border-border bg-card text-foreground hover:bg-accent transition shadow-sm"
                title="Tráo thẻ ngẫu nhiên"
              >
                <Shuffle className="h-4 w-4 text-primary" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Thẻ thuật ngữ (mặt trước) */}
              <div className="w-full h-64 sm:h-72 rounded-3xl border-2 border-border bg-card p-8 shadow-md flex flex-col items-center justify-center text-center transition-all duration-300 relative">
                <div className="absolute top-5 left-6 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Thuật ngữ
                </div>
                <div className="my-auto px-4">
                  <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground leading-snug">
                    {activeStudyCard.terms.length > 0
                      ? activeStudyCard.terms[currentTermIndex]?.term
                      : "Bộ thẻ này chưa có thuật ngữ nào."}
                  </h2>
                </div>
              </div>

              {/* Ô nhập câu trả lời */}
              <div className="space-y-3">
                <input
                  type="text"
                  value={answerInput}
                  onChange={(e) => setAnswerInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !revealed && answerInput.trim()) {
                      void handleCheckAnswer();
                    }
                  }}
                  placeholder="Nhập câu trả lời của bạn..."
                  disabled={revealed}
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm font-medium outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
                />

                {revealed && (
                  <div className={`rounded-xl border p-4 text-sm font-bold ${
                    lastCorrect
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-red-200 bg-red-50 text-red-700"
                  }`}>
                    {lastCorrect
                      ? "✅ Đã thuộc!"
                      : `❌ Chưa thuộc — Đáp án đúng: ${(activeStudyCard.terms[currentTermIndex]?.answers || []).join(", ")}`}
                  </div>
                )}
              </div>

              {/* Kiểm tra / điều hướng */}
              {!revealed ? (
                <button
                  onClick={() => void handleCheckAnswer()}
                  disabled={!answerInput.trim()}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Check className="h-4 w-4" />
                  <span>Kiểm tra</span>
                </button>
              ) : (
                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={() => {
                      if (currentTermIndex > 0) {
                        setCurrentTermIndex(currentTermIndex - 1);
                        setAnswerInput("");
                        setRevealed(false);
                        setLastCorrect(false);
                      }
                    }}
                    disabled={currentTermIndex === 0}
                    className="flex items-center gap-2 rounded-xl border border-border bg-card px-6 py-3 text-sm font-bold text-foreground transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span>Trước</span>
                  </button>

                  <span className="text-sm font-bold text-muted-foreground">
                    {currentTermIndex + 1} / {activeStudyCard.terms.length || 1} · Đã thuộc {activeStudyCard.terms.filter((t) => t.remembered).length}
                  </span>

                  {isLastCard ? (
                    <button
                      onClick={handleFinishStudy}
                      className="flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white transition hover:opacity-90"
                    >
                      <span>Hoàn tất</span>
                      <CheckCircle2 className="h-4 w-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        if (activeStudyCard.terms && currentTermIndex < activeStudyCard.terms.length - 1) {
                          setCurrentTermIndex(currentTermIndex + 1);
                          setAnswerInput("");
                          setRevealed(false);
                          setLastCorrect(false);
                        }
                      }}
                      disabled={!activeStudyCard.terms || currentTermIndex >= activeStudyCard.terms.length - 1}
                      className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <span>Tiếp theo</span>
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= VIEW 3 & 4: CREATE / EDIT FLASHCARD PAGE ================= */}
        {(currentView === "create-flashcard" || currentView === "edit-flashcard") && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-border/60 pb-4">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setCurrentView("main")}
                  className="rounded-xl border border-border p-2 text-muted-foreground hover:text-foreground hover:bg-accent transition"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <h1 className="text-2xl font-black tracking-tight text-foreground">
                  {editingCardId ? "Chỉnh sửa bộ Flashcard" : "Tạo bộ Flashcard mới"}
                </h1>
              </div>

              <button 
                onClick={handleSaveFlashcard}
                className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:opacity-90 transition"
              >
                {editingCardId ? "Lưu thay đổi" : "Tạo Flashcard"}
              </button>
            </div>

            {saveError && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-600">
                {saveError}
              </div>
            )}

            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Tên bộ Flashcard</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Từ vựng tiếng Anh bài 1..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Mô tả (Description)</label>
                <textarea
                  placeholder="Thêm mô tả ngắn gọn về bộ thẻ..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  rows={2}
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-bold text-foreground">Danh sách thuật ngữ (Terms)</h3>
              
              {terms.map((item, index) => (
                <div key={item.id} className="relative rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-muted-foreground">#{index + 1}</span>
                    <button 
                      onClick={() => handleDeleteTerm(item.id)}
                      disabled={terms.length === 1}
                      className="p-2 rounded-lg border border-border text-muted-foreground hover:text-red-600 hover:bg-red-50 hover:border-red-200 transition disabled:opacity-40 disabled:cursor-not-allowed"
                      title="Xóa thẻ này"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground">Câu hỏi (Question)</label>
                    <input
                      type="text"
                      placeholder="Nhập câu hỏi..."
                      value={item.term}
                      onChange={(e) => handleTermChange(item.id, e.target.value)}
                      className="w-full rounded-xl border border-border bg-background px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground">Đáp án (Answers)</label>
                    {item.answers.map((answer, ai) => (
                      <div key={ai} className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder={`Đáp án ${ai + 1}`}
                          value={answer}
                          onChange={(e) => handleAnswerChange(item.id, ai, e.target.value)}
                          className="flex-1 rounded-xl border border-border bg-background px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveAnswer(item.id, ai)}
                          disabled={item.answers.length === 1}
                          className="p-2 rounded-lg border border-border text-muted-foreground hover:text-red-600 hover:bg-red-50 transition disabled:opacity-40 disabled:cursor-not-allowed"
                          title="Xóa đáp án này"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => handleAddAnswer(item.id)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-primary/40 px-3 py-1.5 text-xs font-bold text-primary hover:bg-primary/5 transition"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Thêm đáp án
                    </button>
                  </div>
                </div>
              ))}

              <div className="flex items-center justify-end gap-3 pt-2">
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={addQuantity}
                  onChange={(e) => setAddQuantity(Number(e.target.value))}
                  className="w-20 h-11 rounded-xl border border-border bg-card px-3 text-sm font-bold text-center focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <button 
                  onClick={handleAddTermRows}
                  className="flex items-center justify-center gap-2 h-11 rounded-xl border border-border bg-card px-5 text-sm font-bold text-foreground hover:bg-accent transition shadow-sm"
                >
                  <Plus className="h-4 w-4 text-primary" />
                  <span>Thêm dòng thẻ</span>
                </button>
              </div>
            </div>

            <div className="pt-6 border-t border-border flex justify-end">
              <button 
                onClick={handleSaveFlashcard}
                className="flex items-center gap-2 rounded-xl bg-primary px-8 py-3 text-sm font-bold text-white shadow-md hover:opacity-90 transition"
              >
                {editingCardId ? "Lưu Thay Đổi Hoàn Tất" : "Tạo Flashcard Hoàn Tất"}
              </button>
            </div>
          </div>
        )}

      </div>
    </AppShell>
  );
}