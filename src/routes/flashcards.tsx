import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { 
  Search, 
  Flame, 
  FolderPlus, 
  Plus, 
  Folder, 
  MoreVertical, 
  Layers, 
  MoreHorizontal,
  FolderOpen
} from "lucide-react";

export const Route = createFileRoute("/flashcards")({
  component: FlashcardsPage,
});

function FlashcardsPage() {
  return (
    <AppShell>
      <div className="w-full p-6 space-y-6 animate-[fade-up_0.4s_ease-out]">
        
        {/* ================= HEADER STYLE TO-DO LIST ================= */}
        <header className="space-y-2">
          <h1 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl">
            Flashcard
          </h1>
          <p className="text-sm font-medium text-muted-foreground">
            Quản lý thư mục, tạo mới và ôn tập các bộ thẻ ghi nhớ của bạn.
          </p>
        </header>

        {/* ================= THANH TÌM KIẾM & CHUỖI ================= */}
        <div className="flex items-center justify-between gap-4">
          {/* Ô Tìm kiếm rộng */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Tìm kiếm thư mục, bộ thẻ, từ vựng..."
              className="w-full rounded-2xl border border-border bg-card py-2.5 pl-10 pr-4 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Huy hiệu Chuỗi học (Flame) */}
          <div className="flex items-center gap-2 rounded-2xl bg-orange-50 px-4 py-2.5 border border-orange-100 text-orange-600 font-bold text-sm shadow-sm">
            <Flame className="h-5 w-5 fill-orange-500 text-orange-500" />
            <span>12 ngày liên tục</span>
          </div>
        </div>

        {/* ================= KHU VỰC TẠO (CREATE) ================= */}
        <div className="flex items-center justify-between border-b border-border/60 pb-5">
          <h2 className="text-xl font-bold text-foreground">Bộ sưu tập</h2>
          
          <div className="flex items-center gap-3">
            {/* Nút Tạo Thư Mục */}
            <button className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm font-bold text-foreground hover:bg-accent transition shadow-sm">
              <FolderPlus className="h-4 w-4 text-primary" />
              <span>+ Thư mục</span>
            </button>

            {/* Nút Tạo Flashcard */}
            <button className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white shadow-sm hover:opacity-90 transition">
              <Plus className="h-4 w-4" />
              <span>+ Flashcard</span>
            </button>
          </div>
        </div>

        {/* ================= BỘ LỌC (TYPE & FILTER) ================= */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground mr-2">
            Loại thẻ:
          </span>
          <button className="rounded-xl bg-primary px-4 py-1.5 text-xs font-bold text-white shadow-sm">
            All (58)
          </button>
          <button className="rounded-xl border border-border bg-card px-4 py-1.5 text-xs font-bold text-muted-foreground hover:bg-accent transition">
            Folder (12)
          </button>
        </div>

        {/* ================= DANH SÁCH FOLDERS ================= */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-muted-foreground font-bold text-sm">
            <FolderOpen className="h-4 w-4 text-primary" />
            <h3>Thư mục (Folders)</h3>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* Folder 1 */}
            <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-4 shadow-sm hover:shadow-md transition cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-amber-100 p-3 text-amber-600">
                  <Folder className="h-5 w-5 fill-amber-500" />
                </div>
                <div>
                  <h4 className="font-bold text-foreground">READING IELTS</h4>
                  <p className="text-xs text-muted-foreground">4 bộ thẻ bên trong</p>
                </div>
              </div>
              <button className="text-muted-foreground hover:text-foreground">
                <MoreVertical className="h-4 w-4" />
              </button>
            </div>

            {/* Folder 2 */}
            <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-4 shadow-sm hover:shadow-md transition cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-blue-100 p-3 text-blue-600">
                  <Folder className="h-5 w-5 fill-blue-500" />
                </div>
                <div>
                  <h4 className="font-bold text-foreground">SPEAKING TIW</h4>
                  <p className="text-xs text-muted-foreground">2 bộ thẻ bên trong</p>
                </div>
              </div>
              <button className="text-muted-foreground hover:text-foreground">
                <MoreVertical className="h-4 w-4" />
              </button>
            </div>
          </div>
        </section>

        {/* ================= DANH SÁCH FLASHCARDS ================= */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-muted-foreground font-bold text-sm">
            <Layers className="h-4 w-4 text-primary" />
            <h3>Thẻ Flashcards</h3>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {/* Flashcard Card 1 */}
            <div className="flex flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4 hover:shadow-md transition">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="rounded-lg bg-orange-100 px-2.5 py-1 text-xs font-bold text-orange-600">
                    TIẾNG ANH
                  </span>
                  <button className="text-muted-foreground hover:text-foreground">
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </div>
                <h4 className="text-lg font-bold text-foreground">IELTS Academic Word List</h4>
                <p className="text-xs text-muted-foreground">Cập nhật 2 ngày trước • 120 thẻ</p>
              </div>

              <div className="space-y-2 pt-2 border-t border-border/40">
                <div className="flex justify-between text-xs font-medium text-muted-foreground">
                  <span>Đã thuộc</span>
                  <span className="font-bold text-primary">86 / 120</span>
                </div>
                <button className="w-full rounded-xl bg-primary/10 py-2.5 text-xs font-bold text-primary hover:bg-primary hover:text-white transition">
                  Ôn tập ngay
                </button>
              </div>
            </div>

            {/* Flashcard Card 2 */}
            <div className="flex flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4 hover:shadow-md transition">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="rounded-lg bg-blue-100 px-2.5 py-1 text-xs font-bold text-blue-600">
                    TOÁN HỌC
                  </span>
                  <button className="text-muted-foreground hover:text-foreground">
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </div>
                <h4 className="text-lg font-bold text-foreground">Công thức Đạo hàm & Tích phân</h4>
                <p className="text-xs text-muted-foreground">Cập nhật 5 ngày trước • 64 thẻ</p>
              </div>

              <div className="space-y-2 pt-2 border-t border-border/40">
                <div className="flex justify-between text-xs font-medium text-muted-foreground">
                  <span>Đã thuộc</span>
                  <span className="font-bold text-primary">41 / 64</span>
                </div>
                <button className="w-full rounded-xl bg-primary/10 py-2.5 text-xs font-bold text-primary hover:bg-primary hover:text-white transition">
                  Ôn tập ngay
                </button>
              </div>
            </div>

            {/* Flashcard Card 3 (Chưa vào folder) */}
            <div className="flex flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4 hover:shadow-md transition">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="rounded-lg bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-600">
                    CSDL
                  </span>
                  <button className="text-muted-foreground hover:text-foreground">
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </div>
                <h4 className="text-lg font-bold text-foreground">Thuật ngữ Cơ sở dữ liệu</h4>
                <p className="text-xs text-muted-foreground">Cập nhật hôm nay • 48 thẻ</p>
              </div>

              <div className="space-y-2 pt-2 border-t border-border/40">
                <div className="flex justify-between text-xs font-medium text-muted-foreground">
                  <span>Đã thuộc</span>
                  <span className="font-bold text-primary">20 / 48</span>
                </div>
                <button className="w-full rounded-xl bg-primary/10 py-2.5 text-xs font-bold text-primary hover:bg-primary hover:text-white transition">
                  Ôn tập ngay
                </button>
              </div>
            </div>
          </div>
        </section>

      </div>
    </AppShell>
  );
}