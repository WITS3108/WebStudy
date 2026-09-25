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

export const Route = createFileRoute("/flashcards")({
  component: FlashcardsPage,
});

interface FlashcardItem {
  id: string;
  title: string;
  description?: string;
  category: string;
  count: number;
  mastered: number;
  lastStudiedAt?: number; // Lưu timestamp lần ôn tập cuối cùng để check reset sau 24h
  terms: TermRow[];
}

interface TermRow {
  id: string;
  term: string;
  definition: string;
}

function FlashcardsPage() {
  const [currentView, setCurrentView] = useState<"main" | "create-flashcard" | "edit-flashcard" | "study">("main");
  
  const [flashcards, setFlashcards] = useState<FlashcardItem[]>([
    { 
      id: "1", 
      title: "English", 
      description: "Tổng hợp từ vựng tiếng Anh cơ bản hàng ngày giúp bạn giao tiếp tự tin hơn trong các tình huống thực tế.",
      category: "TIẾNG ANH", 
      count: 3, 
      mastered: 0,
      terms: [
        { id: "t1", term: "Apple", definition: "Quả táo" },
        { id: "t2", term: "Banana", definition: "Quả chuối" },
        { id: "t3", term: "Computer", definition: "Máy tính" }
      ]
    },
    { 
      id: "2", 
      title: "IELTS Academic Word List", 
      description: "Danh sách từ vựng học thuật chuyên sâu xuất hiện thường xuyên trong bài thi IELTS Reading và Writing.",
      category: "TIẾNG ANH", 
      count: 2, 
      mastered: 0,
      terms: [
        { id: "i1", term: "Analyze", definition: "Phân tích" },
        { id: "i2", term: "Significant", definition: "Đáng kể, quan trọng" }
      ]
    },
    { 
      id: "3", 
      title: "Công thức Đạo hàm & Tích phân", 
      description: "Hệ thống các công thức toán học giải tích phổ biến cho học sinh THPT và sinh viên đại học.",
      category: "TOÁN HỌC", 
      count: 2, 
      mastered: 0,
      terms: [
        { id: "m1", term: "(x^n)' = n.x^(n-1)", definition: "Đạo hàm hàm lũy thừa" },
        { id: "m2", term: "∫ x^n dx = (x^(n+1))/(n+1) + C", definition: "Tích phân cơ bản" }
      ]
    },
    { 
      id: "4", 
      title: "Thuật ngữ Cơ sở dữ liệu", 
      description: "Các khái niệm nền tảng về SQL, bảng, khóa chính, khóa ngoại và tối ưu hóa truy vấn.",
      category: "CSDL", 
      count: 2, 
      mastered: 0,
      terms: [
        { id: "d1", term: "Primary Key", definition: "Khóa chính (duy nhất và không null)" },
        { id: "d2", term: "Foreign Key", definition: "Khóa ngoại liên kết bảng" }
      ]
    },
  ]);

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
  const [isFlipped, setIsFlipped] = useState(false);

  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newCategory, setNewCategory] = useState("TIẾNG ANH");
  const [terms, setTerms] = useState<TermRow[]>([
    { id: "1", term: "", definition: "" },
    { id: "2", term: "", definition: "" },
  ]);
  const [addQuantity, setAddQuantity] = useState<number>(1);

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
    setIsFlipped(false);
    setCurrentView("study");
  };

  const handleFinishStudy = () => {
    if (!activeStudyCard) return;
    const now = Date.now();
    const totalCount = activeStudyCard.terms.length;

    // Cập nhật trạng thái đã học xong cho bộ flashcard tương ứng
    setFlashcards(flashcards.map(c => c.id === activeStudyCard.id ? {
      ...c,
      mastered: totalCount,
      lastStudiedAt: now
    } : c));

    setCurrentView("main");
    setActiveStudyCard(null);
  };

  const handleAddTermRows = () => {
    const rowsToAdd = Math.max(1, addQuantity || 1);
    const newRows: TermRow[] = Array.from({ length: rowsToAdd }, (_, index) => ({
      id: (Date.now() + index).toString(),
      term: "",
      definition: ""
    }));
    setTerms([...terms, ...newRows]);
  };

  const handleDeleteTerm = (id: string) => {
    if (terms.length === 1) return;
    setTerms(terms.filter(t => t.id !== id));
  };

  const handleOpenCreate = () => {
    setEditingCardId(null);
    setNewTitle("");
    setNewDescription("");
    setNewCategory("TIẾNG ANH");
    setTerms([
      { id: "1", term: "", definition: "" },
      { id: "2", term: "", definition: "" },
    ]);
    setCurrentView("create-flashcard");
  };

  const handleOpenEdit = (card: FlashcardItem) => {
    setEditingCardId(card.id);
    setNewTitle(card.title);
    setNewDescription(card.description || "");
    setNewCategory(card.category);
    setTerms(card.terms && card.terms.length > 0 ? card.terms : [
      { id: "1", term: "", definition: "" },
      { id: "2", term: "", definition: "" },
    ]);
    setCurrentView("edit-flashcard");
    setActiveMenuId(null);
  };

  const handleSaveFlashcard = () => {
    if (!newTitle.trim()) return;
    
    if (editingCardId) {
      setFlashcards(flashcards.map(c => c.id === editingCardId ? {
        ...c,
        title: newTitle,
        description: newDescription,
        category: newCategory.toUpperCase(),
        count: terms.length,
        terms: terms
      } : c));
    } else {
      const newCard: FlashcardItem = {
        id: Date.now().toString(),
        title: newTitle,
        description: newDescription,
        category: newCategory.toUpperCase(),
        count: terms.length,
        mastered: 0,
        terms: terms
      };
      setFlashcards([newCard, ...flashcards]);
    }

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
    setIsFlipped(false);
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
                <span>12 ngày liên tục</span>
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
                      <button 
                        onClick={() => handleStartStudy(card)}
                        className="w-full rounded-xl bg-primary/10 py-3 text-xs font-bold text-primary hover:bg-primary hover:text-white transition"
                      >
                        {isCompleted ? "Ôn tập lại" : "Ôn tập ngay"}
                      </button>
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
              <div 
                onClick={() => setIsFlipped(!isFlipped)}
                className="w-full h-80 sm:h-96 rounded-3xl border-2 border-border bg-card p-8 shadow-md flex flex-col items-center justify-center text-center cursor-pointer select-none transition-all duration-300 hover:border-primary/50 relative group"
              >
                <div className="absolute top-5 left-6 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {isFlipped ? "Định nghĩa (Mặt sau)" : "Thuật ngữ (Mặt trước)"}
                </div>

                <div className="absolute top-5 right-6 text-xs text-muted-foreground font-medium group-hover:text-primary transition">
                  {isFlipped ? "Nhấn để xem Thuật ngữ" : "Nhấn để lật xem Định nghĩa"}
                </div>

                <div className="my-auto px-4">
                  <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground leading-snug">
                    {activeStudyCard.terms.length > 0 
                      ? (isFlipped ? activeStudyCard.terms[currentTermIndex]?.definition : activeStudyCard.terms[currentTermIndex]?.term)
                      : "Bộ thẻ này chưa có thuật ngữ nào."}
                  </h2>
                </div>

                <div className="absolute bottom-5 text-xs font-semibold text-muted-foreground">
                  Bấm vào thẻ bất kỳ đâu để lật mặt
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button 
                  onClick={() => {
                    if (currentTermIndex > 0) {
                      setCurrentTermIndex(currentTermIndex - 1);
                      setIsFlipped(false);
                    }
                  }}
                  disabled={currentTermIndex === 0}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl border border-border bg-card text-sm font-bold text-foreground disabled:opacity-40 disabled:cursor-not-allowed hover:bg-accent transition shadow-sm"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>Trước</span>
                </button>

                <span className="text-sm font-bold text-muted-foreground">
                  {currentTermIndex + 1} / {activeStudyCard.terms.length || 1}
                </span>

                {isLastCard ? (
                  <button 
                    onClick={handleFinishStudy}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 text-sm font-bold text-white hover:opacity-90 transition shadow-sm"
                  >
                    <span>Hoàn tất</span>
                    <CheckCircle2 className="h-4 w-4" />
                  </button>
                ) : (
                  <button 
                    onClick={() => {
                      if (activeStudyCard.terms && currentTermIndex < activeStudyCard.terms.length - 1) {
                        setCurrentTermIndex(currentTermIndex + 1);
                        setIsFlipped(false);
                      }
                    }}
                    disabled={!activeStudyCard.terms || currentTermIndex >= activeStudyCard.terms.length - 1}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-sm font-bold text-white disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition shadow-sm"
                  >
                    <span>Tiếp theo</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                )}
              </div>
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
                <div key={item.id} className="relative rounded-2xl border border-border bg-card p-5 shadow-sm grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                  <div className="absolute top-3 left-4 text-xs font-bold text-muted-foreground">
                    #{index + 1}
                  </div>

                  <div className="space-y-1.5 pt-3 md:col-span-5">
                    <label className="text-xs font-bold text-muted-foreground">Thuật ngữ (Term)</label>
                    <input
                      type="text"
                      placeholder="Nhập thuật ngữ..."
                      value={item.term}
                      onChange={(e) => {
                        const val = e.target.value;
                        setTerms(terms.map(t => t.id === item.id ? { ...t, term: val } : t));
                      }}
                      className="w-full rounded-xl border border-border bg-background px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  <div className="space-y-1.5 pt-3 md:col-span-6">
                    <label className="text-xs font-bold text-muted-foreground">Định nghĩa (Definition)</label>
                    <input
                      type="text"
                      placeholder="Nhập định nghĩa..."
                      value={item.definition}
                      onChange={(e) => {
                        const val = e.target.value;
                        setTerms(terms.map(t => t.id === item.id ? { ...t, definition: val } : t));
                      }}
                      className="w-full rounded-xl border border-border bg-background px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  <div className="md:col-span-1 flex justify-end md:justify-center pb-0.5">
                    <button 
                      onClick={() => handleDeleteTerm(item.id)}
                      className="p-2.5 rounded-xl border border-border bg-background text-muted-foreground hover:text-red-600 hover:bg-red-50 hover:border-red-200 transition-colors"
                      title="Xóa thuật ngữ này"
                    >
                      <Trash2 className="h-4 w-4" />
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