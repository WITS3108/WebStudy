import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Brain, Flame, GraduationCap, Home, Layers, ListTodo, LogOut, Search, Settings, User } from "lucide-react";

import { ThemeToggle } from "./ThemeToggle";
import { getVisitStreak } from "@/hooks/useVisitTracking";
import { useAuth } from "@/hooks/useAuth";

const navItems = [
  { to: "/", label: "Trang chủ", icon: Home },
  { to: "/todo", label: "To-do list", icon: ListTodo },
  { to: "/flashcards", label: "Flashcard", icon: Layers },
  { to: "/ai", label: "Trợ lý AI", icon: Brain },
  { to: "/settings", label: "Cài đặt", icon: Settings },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-card/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[1500px] items-center gap-4 px-4 sm:px-6">
          <Link to="/" className="btn-press flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
              <GraduationCap className="h-5 w-5" />
            </span>
            <span className="text-xl font-black tracking-tight text-foreground">
              Learn<span className="text-primary">Fast</span>
            </span>
          </Link>

          <div className="relative ml-2 hidden flex-1 max-w-md lg:block">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              placeholder="Tìm nhiệm vụ, bộ thẻ, ghi chú..."
              className="h-10 w-full rounded-full border border-border bg-background pl-10 pr-4 text-sm outline-none transition-shadow placeholder:text-muted-foreground focus:border-primary focus:ring-4 focus:ring-primary/15"
            />
          </div>

          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            {user ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/settings"
                  title="Tài khoản của bạn"
                  className="btn-press flex items-center gap-2 rounded-full bg-primary/10 py-1.5 pl-1.5 pr-4 text-sm font-bold text-primary hover:bg-primary/15"
                >
                  {user.avatarPath ? (
                    <img
                      src={user.avatarPath}
                      alt={user.username}
                      className="h-7 w-7 rounded-full border border-primary/20 object-cover"
                    />
                  ) : (
                    <span className="grid h-7 w-7 place-items-center rounded-full bg-primary/15 text-primary">
                      <User className="h-4 w-4" />
                    </span>
                  )}
                  <span className="max-w-[140px] truncate">{user.username}</span>
                </Link>
                <button
                  type="button"
                  title="Đăng xuất"
                  aria-label="Đăng xuất"
                  onClick={async () => {
                    await logout();
                    navigate({ to: "/login" });
                  }}
                  className="btn-press grid h-9 w-9 place-items-center rounded-full border border-border text-muted-foreground hover:bg-accent hover:text-foreground"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <>
                <Link
                  to="/register"
                  className="btn-press hidden rounded-full border border-primary/40 px-4 py-2 text-sm font-bold text-primary hover:bg-primary/10 sm:block"
                >
                  Đăng ký
                </Link>
                <Link
                  to="/login"
                  className="btn-press rounded-full bg-primary px-5 py-2 text-sm font-bold text-primary-foreground shadow-sm hover:bg-primary-deep"
                >
                  Đăng nhập
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1500px] gap-6 px-4 pb-24 pt-6 sm:px-6 lg:pb-8">
        {/* Sidebar */}
        <aside className="sticky top-24 hidden h-fit w-[76px] shrink-0 flex-col gap-2 rounded-3xl border border-sidebar-border bg-sidebar p-3 md:flex xl:w-[230px]">
          {navItems.map(({ to, label, icon: Icon }) => {
            const active = pathname === to;
            return (
              <Link
                key={to}
                to={to}
                title={label}
                className={`btn-press group relative flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-bold ${
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
                }`}
              >
                <span
                  className={`absolute left-0 top-1/2 h-7 w-1 -translate-y-1/2 rounded-r-full bg-primary transition-transform duration-300 ${
                    active ? "scale-y-100" : "scale-y-0"
                  }`}
                />
                <Icon className="h-5 w-5 shrink-0" />
                <span className="hidden xl:inline">{label}</span>
              </Link>
            );
          })}

          <div className="mt-2 rounded-2xl bg-primary/10 p-3">
            <div className="flex items-center gap-2 text-primary">
              <Flame className="h-4 w-4 animate-pulse" />
              <span className="text-sm font-black">{getVisitStreak()}</span>
              <span className="hidden text-xs font-bold xl:inline">ngày liên tục</span>
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1">{children}</main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 flex justify-around border-t border-border bg-card/95 px-2 py-2 backdrop-blur-md md:hidden">
        {navItems.map(({ to, label, icon: Icon }) => {
          const active = pathname === to;
          return (
            <Link
              key={to}
              to={to}
              aria-label={label}
              className={`btn-press grid h-11 w-11 place-items-center rounded-2xl ${
                active ? "bg-primary text-primary-foreground" : "text-muted-foreground"
              }`}
            >
              <Icon className="h-5 w-5" />
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
