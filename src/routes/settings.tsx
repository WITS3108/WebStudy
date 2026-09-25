import { useEffect, useState, useRef, type ChangeEvent } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/hooks/useAuth";
import { updateProfile, uploadAvatar } from "@/lib/auth";
import {
  Camera,
  Calendar,
  LogOut,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Clock,
  Save,
  HelpCircle,
  KeyRound,
  SlidersHorizontal,
  Loader2,
} from "lucide-react";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const { user, refresh } = useAuth();

  // Quản lý Tab hiện tại
  const [activeTab, setActiveTab] = useState<"profile" | "goals" | "security">("profile");

  // State Hồ sơ cá nhân (loaded from the authenticated user)
  const [avatar, setAvatar] = useState<string>("https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [school, setSchool] = useState("");
  const [className, setClassName] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState<"Nam" | "Nữ" | "Khác">("Nam");
  const [personalGoal, setPersonalGoal] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Populate the form with the logged-in user's profile.
  useEffect(() => {
    if (!user) return;
    setUsername(user.username ?? "");
    setEmail(user.email ?? "");
    setClassName(user.className ?? "");
    setSchool(user.school ?? "");
    setDob(user.birthDate ?? "");
    setGender((user.gender as "Nam" | "Nữ" | "Khác") || "Nam");
    setPersonalGoal(user.goal ?? "");
    if (user.avatarPath) setAvatar(user.avatarPath);
  }, [user]);

  const handleSaveProfile = async () => {
    setSaving(true);
    setSaved(false);
    setSaveError(null);
    try {
      let avatarPath = user?.avatarPath;
      if (avatarFile) {
        avatarPath = await uploadAvatar(avatarFile);
      }

      await updateProfile({
        username,
        email,
        school: school.trim(),
        className: className.trim(),
        birthDate: dob,
        gender,
        goal: personalGoal,
        avatarPath,
      });

      if (avatarPath) setAvatar(avatarPath);
      setAvatarFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";

      await refresh();
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Không thể lưu thông tin.");
    } finally {
      setSaving(false);
    }
  };

  // State Mục tiêu học tập
  const [dailyHours, setDailyHours] = useState<number>(4.0);
  const [quizTarget, setQuizTarget] = useState<number>(20);
  const [streakTargetDays, setStreakTargetDays] = useState<number>(30);

  // State Bảo mật
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isGoogleConnected, setIsGoogleConnected] = useState(true);

  // Modal xác nhận
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Ref Upload Avatar
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dobRef = useRef<HTMLInputElement>(null);

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (avatar.startsWith("blob:")) {
        URL.revokeObjectURL(avatar);
      }
      setAvatar(URL.createObjectURL(file));
      setAvatarFile(file);
    }
  };

  // Cấu hình slider
  const minHours = 1;
  const maxHours = 7;
  const sliderPercentage = ((dailyHours - minHours) / (maxHours - minHours)) * 100;
  const standardHoursPercentage = ((4 - minHours) / (maxHours - minHours)) * 100;

  return (
    <AppShell>
      <div className="w-full p-6 space-y-6 animate-fade-up">
        {/* Header hệ thống */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold tracking-widest uppercase text-primary">
              TÙY CHỈNH HỆ THỐNG
            </span>
            <h1 className="text-3xl font-extrabold text-foreground mt-0.5">
              Cài đặt & Hồ sơ
            </h1>
          </div>
          <div className="flex items-center gap-2 bg-destructive/10 text-destructive px-3.5 py-1.5 rounded-full text-xs font-semibold border border-destructive/20 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-destructive animate-pulse"></span>
            Đồng bộ đám mây
          </div>
        </div>

        {/* Thanh chuyển Tab */}
        <div className="flex gap-8 border-b border-border text-sm font-semibold">
          <button
            onClick={() => setActiveTab("profile")}
            className={`pb-3 relative transition-all btn-press ${
              activeTab === "profile"
                ? "text-primary border-b-2 border-primary font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Hồ sơ cá nhân
          </button>
          <button
            onClick={() => setActiveTab("goals")}
            className={`pb-3 relative transition-all btn-press ${
              activeTab === "goals"
                ? "text-primary border-b-2 border-primary font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Mục tiêu học tập
          </button>
          <button
            onClick={() => setActiveTab("security")}
            className={`pb-3 relative transition-all btn-press ${
              activeTab === "security"
                ? "text-primary border-b-2 border-primary font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Bảo mật
          </button>
        </div>

        {/* ================= TAB 1: HỒ SƠ CÁ NHÂN ================= */}
        {activeTab === "profile" && (
          <div className="card-soft p-7 space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-extrabold text-card-foreground">
                  Thông tin học sinh / sinh viên
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                  Quản lý định danh học thuật và các liên kết thông tin lớp trường của bạn.
                </p>
              </div>
              <button className="text-muted-foreground hover:text-foreground transition-colors">
                <HelpCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Khung Thông tin cá nhân & Ảnh đại diện */}
            <div className="bg-muted/50 p-5 rounded-2xl flex items-center justify-between border border-border">
              <div className="flex items-center gap-5">
                <div className="relative group w-20 h-20 rounded-full overflow-hidden border-2 border-border shadow-md">
                  <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 bg-black/60 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                  >
                    <Camera className="w-5 h-5" />
                  </button>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">{username || "Người dùng"}</h3>
                  <p className="text-xs text-muted-foreground mt-1 font-medium">
                    {school || "Chưa cập nhật Trường"}
                  </p>
                </div>
              </div>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarChange}
                accept="image/*"
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="btn-press flex items-center gap-2 bg-secondary text-secondary-foreground px-4 py-2 rounded-xl text-xs font-bold border border-border shadow-sm"
              >
                <Camera className="w-3.5 h-3.5" />
                Thay đổi ảnh
              </button>
            </div>

            {/* Các trường thông tin */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
              <div>
                <label className="block font-bold text-foreground mb-2">
                  Tên người dùng
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3 text-muted-foreground font-medium">@</span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-muted/30 border border-border rounded-xl pl-8 pr-3.5 py-2.5 text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block font-bold text-foreground">
                    Email
                  </label>
                  <span className="text-[11px] text-destructive font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Đã xác thực
                  </span>
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-muted/30 border border-border rounded-xl px-3.5 py-2.5 text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div>
                <label className="block font-bold text-foreground mb-2">
                  Lớp
                </label>
                <input
                  type="text"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  placeholder="Ví dụ: 12A1"
                  className="w-full bg-muted/30 border border-border rounded-xl px-3.5 py-2.5 text-foreground font-medium placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div>
                <label className="block font-bold text-foreground mb-2">
                  Trường
                </label>
                <input
                  type="text"
                  value={school}
                  onChange={(e) => setSchool(e.target.value)}
                  placeholder="Ví dụ: THPT Chu Văn An"
                  className="w-full bg-muted/30 border border-border rounded-xl px-3.5 py-2.5 text-foreground font-medium placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div>
                <label className="block font-bold text-foreground mb-2">
                  Ngày sinh
                </label>
                <div className="relative">
                  <input
                    ref={dobRef}
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="no-native-date-picker w-full bg-muted/30 border border-border rounded-xl px-3.5 py-2.5 pr-10 text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <button
                    type="button"
                    onClick={() => dobRef.current?.showPicker?.()}
                    aria-label="Mở lịch chọn ngày"
                    className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                  >
                    <Calendar className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-foreground mb-2">
                  Giới tính
                </label>
                <div className="grid grid-cols-3 gap-2 bg-muted/30 p-1 rounded-xl border border-border">
                  {(["Nam", "Nữ", "Khác"] as const).map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGender(g)}
                      className={`py-1.5 rounded-lg font-bold transition-all btn-press ${
                        gender === g
                          ? "bg-card text-foreground shadow-sm border border-border"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Mục tiêu cá nhân */}
            <div>
              <label className="block text-xs font-bold text-foreground mb-2">
                Mục tiêu cá nhân
              </label>
              <textarea
                rows={3}
                value={personalGoal}
                onChange={(e) => setPersonalGoal(e.target.value)}
                placeholder="Nhập định hướng hoặc ghi chú mục tiêu cá nhân..."
                className="w-full bg-muted/30 border border-border rounded-2xl p-3.5 text-xs text-foreground font-medium placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              {saveError && (
                <span className="flex items-center gap-1.5 text-xs font-bold text-destructive">
                  <AlertTriangle className="w-3.5 h-3.5" /> {saveError}
                </span>
              )}
              {saved && (
                <span className="flex items-center gap-1.5 text-xs font-bold text-success">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Đã lưu
                </span>
              )}
              <button
                type="button"
                onClick={handleSaveProfile}
                disabled={saving}
                className="btn-press flex items-center gap-2 bg-primary text-primary-foreground font-bold text-xs px-6 py-2.5 rounded-xl shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
            </div>
          </div>
        )}

        {/* ================= TAB 2: MỤC TIÊU HỌC TẬP ================= */}
        {activeTab === "goals" && (
          <div className="card-soft p-7 space-y-8">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-extrabold text-card-foreground">
                  Mục tiêu học tập hàng ngày
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                  Thiết lập nhịp điệu sinh hoạt và năng suất biểu kiến cho cá nhân.
                </p>
              </div>
              <button className="text-muted-foreground hover:text-foreground transition-colors">
                <SlidersHorizontal className="w-5 h-5" />
              </button>
            </div>

            {/* Slider 1h - 7h */}
            <div className="space-y-4 pt-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" />
                  <span className="text-xs font-bold text-foreground">Thời lượng học mỗi ngày</span>
                </div>
                <div className="text-lg font-black text-foreground">
                  {dailyHours.toFixed(1)} <span className="text-xs font-bold text-muted-foreground">Giờ</span>
                </div>
              </div>

              <div className="relative pt-1 pb-6">
                <input
                  type="range"
                  min={minHours}
                  max={maxHours}
                  step="0.5"
                  value={dailyHours}
                  onChange={(e) => setDailyHours(parseFloat(e.target.value))}
                  style={{
                    background: `linear-gradient(to right, var(--color-primary) 0%, var(--color-primary) ${sliderPercentage}%, var(--color-muted) ${sliderPercentage}%, var(--color-muted) 100%)`,
                  }}
                  className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-primary focus:outline-none"
                />

                <div className="relative w-full text-[11px] font-bold mt-2">
                  <span className="absolute left-0 text-muted-foreground">Tối thiểu (1h)</span>
                  <span
                    className="absolute -translate-x-1/2 text-primary font-extrabold"
                    style={{ left: `${standardHoursPercentage}%` }}
                  >
                    Chuẩn (4h)
                  </span>
                  <span className="absolute right-0 text-muted-foreground">Chuyên sâu (7h)</span>
                </div>
              </div>
            </div>

            {/* Chọn Số câu trắc nghiệm mục tiêu */}
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <div>
                <h3 className="text-xs font-bold text-foreground">
                  Số câu trắc nghiệm mục tiêu
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Số câu luyện tập ôn bài được đề xuất từ kho ngân hàng đề.
                </p>
              </div>

              <div className="flex gap-2">
                {[10, 20, 40].map((count) => (
                  <button
                    key={count}
                    onClick={() => setQuizTarget(count)}
                    className={`btn-press px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      quizTarget === count
                        ? "bg-accent text-accent-foreground border-2 border-primary"
                        : "bg-muted/40 text-muted-foreground border border-border hover:bg-muted"
                    }`}
                  >
                    {count} câu
                  </button>
                ))}
              </div>
            </div>

            {/* Chọn Ngày duy trì Streak */}
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-warning/10 text-warning rounded-2xl border border-warning/20">
                  <Flame className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-foreground">Mục tiêu chuỗi ngày Streak</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Duy trì nhịp độ học liên tục để đạt huy hiệu thành tích.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={streakTargetDays}
                  onChange={(e) => setStreakTargetDays(Number(e.target.value))}
                  className="w-20 bg-muted/30 border border-border rounded-xl px-3 py-1.5 text-center text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <span className="text-xs font-bold text-muted-foreground">ngày</span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button className="btn-press flex items-center gap-2 bg-primary text-primary-foreground font-bold text-xs px-6 py-2.5 rounded-xl shadow-lg">
                <Save className="w-4 h-4" /> Lưu mục tiêu
              </button>
            </div>
          </div>
        )}

        {/* ================= TAB 3: BẢO MẬT ================= */}
        {activeTab === "security" && (
          <div className="space-y-5">
            <div className="card-soft p-7 space-y-6">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-primary/10 text-primary rounded-2xl border border-primary/20">
                    <KeyRound className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-extrabold text-card-foreground">
                      Đổi mật khẩu tài khoản
                    </h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Đảm bảo an toàn thông tin với mật khẩu đủ độ phức tạp.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4 max-w-xl text-xs">
                <div>
                  <label className="block font-bold text-foreground mb-1.5">
                    Mật khẩu hiện tại
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="w-full bg-muted/30 border border-border rounded-xl px-3.5 py-2.5 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-foreground mb-1.5">
                      Mật khẩu mới
                    </label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-muted/30 border border-border rounded-xl px-3.5 py-2.5 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-foreground mb-1.5">
                      Xác nhận mật khẩu mới
                    </label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-muted/30 border border-border rounded-xl px-3.5 py-2.5 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button className="btn-press bg-secondary text-secondary-foreground font-bold text-xs px-5 py-2.5 rounded-xl border border-border shadow-sm">
                    Cập nhật mật khẩu
                  </button>
                </div>
              </div>
            </div>

            <div className="card-soft p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl bg-muted border border-border flex items-center justify-center font-black text-primary">
                  G
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-card-foreground">
                    Liên kết Google Workspace
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Cho phép đăng nhập nhanh qua tài khoản Google của bạn.
                  </p>
                </div>
              </div>

              {isGoogleConnected ? (
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-success bg-success/10 px-3 py-1.5 rounded-full border border-success/20 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Đã kết nối
                  </span>
                  <button
                    onClick={() => setIsGoogleConnected(false)}
                    className="text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Hủy kết nối
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsGoogleConnected(true)}
                  className="btn-press bg-secondary text-secondary-foreground text-xs font-bold px-4 py-2 rounded-xl border border-border"
                >
                  Kết nối tài khoản
                </button>
              )}
            </div>

            <div className="bg-destructive/10 border border-destructive/20 rounded-3xl p-6 shadow-xl flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-destructive flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" /> Quyền truy cập & Dữ liệu
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Đăng xuất tài khoản khỏi thiết bị hoặc yêu cầu xóa toàn bộ dữ liệu cá nhân.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowLogoutModal(true)}
                  className="btn-press flex items-center gap-2 bg-card text-foreground border border-border px-4 py-2 rounded-xl text-xs font-bold shadow-sm"
                >
                  <LogOut className="w-3.5 h-3.5" /> Đăng xuất
                </button>

                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="btn-press flex items-center gap-2 bg-destructive text-destructive-foreground px-4 py-2 rounded-xl text-xs font-bold shadow-sm"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Xóa tài khoản
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODALS */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
              <LogOut className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-card-foreground">
                Xác nhận đăng xuất?
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Bạn có chắc chắn muốn kết thúc phiên đăng nhập này?
              </p>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-muted text-muted-foreground hover:bg-muted/80"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  setShowLogoutModal(false);
                  alert("Đã đăng xuất thành công!");
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-destructive text-destructive-foreground shadow-sm"
              >
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-destructive/40 rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <div className="w-10 h-10 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center border border-destructive/20">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-destructive">
                Xóa vĩnh viễn tài khoản?
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Mọi bộ thẻ Flashcard và tiến độ Streak học tập của bạn sẽ bị hủy bỏ hoàn toàn.
              </p>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-muted text-muted-foreground hover:bg-muted/80"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  alert("Tài khoản đã bị xóa!");
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-destructive text-destructive-foreground shadow-sm"
              >
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}