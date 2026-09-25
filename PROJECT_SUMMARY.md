# LearnFast — Project Summary

A Vietnamese study/productivity web app for focused learning, built with **TanStack Start**
(React 19 + TanStack Router, file-based routing) + **Vite**, styled with **Tailwind CSS v4**
and **shadcn/ui** (Radix primitives). The entire UI is in Vietnamese.

---

## Tech stack

| Area | Technology |
| --- | --- |
| Framework | TanStack Start / TanStack Router (file-based routes, SSR-ready) + React Query |
| UI | React 19, Tailwind CSS v4, shadcn/ui (60+ components) |
| Backend / services | Supabase (client + server), Google Gemini (`@google/generative-ai`) |
| Animation | Framer Motion, tw-animate-css |
| Charts | Recharts |
| Forms | react-hook-form + zod |

---

## Pages (routes)

| Route | Purpose |
| --- | --- |
| `/` (`index.tsx`) | Dashboard — greeting, daily quote, stats, weekly progress, flashcards, today's todos, Pomodoro timer |
| `/todo` | To-do list |
| `/flashcards` | Flashcard deck manager (folders, search, streak counter) |
| `/ai` | AI study assistant — chat with Gemini, multiple sessions, image attachment |
| `/login` / `/register` | Auth pages (mock, localStorage-based) |
| `/settings` | Settings |

---

## Key features / components

- **`AppShell`** — sticky header (logo, search, theme toggle, login/register) + sidebar nav
  (Trang chủ, To-do, Flashcard, Trợ lý AI, Cài đặt).
- **`TodayTodos` + `useTodos` hook** — todo CRUD persisted to `localStorage`.
- **`StatsRow`**, **`WeeklyProgress`**, **`PomodoroPanel`** — study stats, weekly hours chart,
  Pomodoro timer with lo-fi sound.
- **`FlashcardDecks`** — deck progress (mastered/due counts).
- **`AuthShell`**, **`useAuth`** — simple client-only auth storing a user profile in `localStorage`.

---

## Data & integrations

- **`src/data/mock.ts`** — mock data (Vietnamese todos, decks, week stats, quotes).
- **`src/intergrations/supabase/`** — Supabase client (browser + server) with custom auth storage
  and middleware (note: folder is misspelled "intergrations").
- **`src/lib/auth.functions.ts`** — mock server-side username→email lookup.
- **`src/lib/lovable-error-reporting.ts`** — error reporting integration (from the Lovable starter).

---

## Notable observations

- Auth is **mock / localStorage-based** despite having Supabase scaffolded — not yet wired to a real backend.
- Routes use `createFileRoute` with per-page `<head>` meta tags for SEO.
- `routeTree.gen.ts` is auto-generated (should not be edited).
- Includes a `404` / error boundary in `__root.tsx`.

---

## Directory structure

```
src/
├── main.tsx / start.ts / server.ts     # app entry + server
├── router.tsx                          # TanStack Router setup
├── routeTree.gen.ts                    # auto-generated route tree
├── routes/                             # file-based routes
│   ├── __root.tsx                      # root shell (Outlet, 404, error boundary)
│   ├── index.tsx  todo.tsx  flashcards.tsx  ai.tsx  settings.tsx
│   ├── login.tsx  register.tsx
│   └── README.md
├── components/
│   ├── AppShell.tsx  AuthShell.tsx  ThemeToggle.tsx
│   ├── StatsRow.tsx  WeeklyProgress.tsx  PomodoroPanel.tsx
│   ├── TodayTodos.tsx  TodoComposer.tsx  FlashcardDecks.tsx  ComingSoon.tsx
│   └── ui/                             # shadcn/ui components (60+)
├── hooks/
│   ├── useAuth.ts  useTodos.ts  use-mobile.tsx
├── lib/
│   ├── utils.ts  auth.functions.ts  error-page.ts  error-capture.ts
│   └── lovable-error-reporting.ts
├── intergrations/supabase/             # Supabase client/server + auth storage
├── data/mock.ts                        # mock data
├── assets/                             # images, svg
├── index.css  styles.css               # global styles
```

---

## In short

A polished, Vietnamese-language study dashboard (todos, flashcards, Pomodoro, AI assistant)
built on a TanStack Start + shadcn/ui starter, with mock data and partially-wired Supabase auth.
