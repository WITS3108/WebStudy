# LearnFast 🎓

LearnFast is a Vietnamese study app that helps you share, track your learning progress, and grow discipline. It includes a to-do list, flashcards, weekly progress, a Pomodoro timer, and an AI tutor chat powered by **Gemini**.

Data is saved to **Supabase** when you're logged in, and to **localStorage** on your device when you're not.

---

## Tech Stack

- **React + TypeScript + Vite**
- **TanStack Router** (file-based routing) + **TanStack Query**
- **Supabase** (auth + database)
- **Google Gemini** (`@google/generative-ai`, model `gemini-2.0-flash`)
- **Tailwind CSS** + **shadcn/ui**
- **lucide-react** icons

---

## Project Structure

### 1. Entry & Routing
| File | What it does |
|------|-------------|
| `src/main.tsx` | App entry point. Mounts React, wraps the app in React Query + TanStack Router, imports global CSS. |
| `src/router.tsx` | Creates the TanStack Router from the generated route tree, with scroll restoration. |
| `src/routeTree.gen.ts` | Auto-generated route table (`/`, `/todo`, `/flashcards`, `/ai`, `/login`, `/register`, `/settings`). Do not edit manually. |
| `src/routes/__root.tsx` | Root layout + global 404 and error-boundary pages, plus Lovable error reporting. |
| `src/start.ts` / `src/server.ts` | TanStack Start server-side rendering setup (used in production/deploy). |

### 2. Layout / Shell
| File | What it does |
|------|-------------|
| `src/components/AppShell.tsx` | The main app frame: top header (logo, search, theme toggle, login/logout), left sidebar nav, and mobile bottom nav. |
| `src/components/AuthShell.tsx` | Layout wrapper for the login/register pages (centered auth card). |
| `src/components/ThemeToggle.tsx` | Light/dark mode switcher. |

### 3. Pages (`src/routes/`)
| File | What it does |
|------|-------------|
| `index.tsx` | Home dashboard: greeting + quote, stats, weekly progress, flashcard decks, today's todos, and Pomodoro panel. |
| `todo.tsx` | To-do list page: add/toggle/delete/filter tasks, progress bar. |
| `flashcards.tsx` | Flashcard study page. |
| `ai.tsx` | AI chat page — sidebar of conversations, chat window, image upload, Gemini responses, delete-all + per-chat delete with confirmation, saves to Supabase (logged in) or localStorage (anonymous). |
| `login.tsx` | Login form (email/username + password). |
| `register.tsx` | Registration form (username, email, school, class, DOB, gender, password). |
| `settings.tsx` | User profile editing (avatar, school, goal, etc.). |

### 4. Hooks (`src/hooks/`)
| File | What it does |
|------|-------------|
| `useAuth.ts` | Central auth state: gets the Supabase session, loads the user's `profiles` row, exposes `user` / `loading` / `refresh` / `logout`. |
| `useTodos.ts` | To-do state machine: loads/creates/toggles/deletes tasks. Logged-in → Supabase (`todos` table) with one-time migration of device tasks; anonymous → localStorage. |
| `use-mobile.tsx` | Detects small screens (for responsive sidebar). |

### 5. Libraries (`src/lib/`)
| File | What it does |
|------|-------------|
| `auth.ts` | Auth logic: `login`, `register`, `logout`, `updateProfile`, `uploadAvatar` (resizes image to base64), error-message translation to Vietnamese. |
| `chat.ts` | AI chat persistence: thread/message types, Supabase CRUD (`chat_threads`/`chat_messages`), plus localStorage helpers for anonymous users. |
| `utils.ts` | `cn()` class-name merger (for Tailwind). |
| `error-capture.ts` / `error-page.ts` / `lovable-error-reporting.ts` | Error handling and reporting to Lovable. |

### 6. Supabase Integration (`src/intergrations/supabase/`)
| File | What it does |
|------|-------------|
| `client.ts` | Browser Supabase client (uses publishable key, auto-persists session). |
| `client.server.ts` | Server-side Supabase admin client (uses service-role key, bypasses RLS — server only). |
| `auth-middleware.ts` | Server auth middleware (validates the session for protected server routes). |
| `types.ts` | Auto-generated TypeScript types for the DB schema (`profiles`, `todos`, `flashcards`, `chat_threads`, `chat_messages`, etc.). |
| `previewAuthStorage.ts` | Special auth storage for Lovable preview environments (shares login with the editor). |

### 7. UI Components (`src/components/ui/`)
Standard **shadcn/ui** primitives: `button`, `input`, `card`, `dialog`, `alert-dialog`, `dropdown-menu`, `tabs`, `form`, `sidebar`, etc. Used across all pages.

### 8. Feature Components (`src/components/`)
| File | What it does |
|------|-------------|
| `TodoComposer.tsx` | The "add task" form (title, subject, time, priority). |
| `TodayTodos.tsx` | Renders today's tasks with toggle. |
| `StatsRow.tsx` | Dashboard stat cards (tasks done, etc.). |
| `WeeklyProgress.tsx` | Weekly study hours chart. |
| `FlashcardDecks.tsx` | List of flashcard decks. |
| `PomodoroPanel.tsx` | Pomodoro timer panel. |
| `ComingSoon.tsx` | Placeholder for unfinished features. |

### 9. Data & Config
| File | What it does |
|------|-------------|
| `src/data/mock.ts` | Mock/seed data (sample todos, decks, weekly stats, quotes) and shared types (`Todo`, `Deck`). |
| `supabase/*.sql` | SQL scripts: `setup-all-rls.sql` (one-shot RLS policies for profiles/todos/chat), plus per-table RLS fixes. |
| `package.json` | Dependencies & scripts (`dev`, `build`, `lint`, `format`). |
| `vite.config.ts` | Vite build config (React + TanStack plugin). |
| `eslint.config.js` | Linting rules (React hooks, TS, refresh). |
| `vercel.json` | Vercel deployment config. |
| `.env` | Local secrets (Supabase URL/keys, Gemini key) — gitignored. |

---

## Getting Started

```bash
# 1. Install dependencies
npm install        # or: bun install

# 2. Set up environment variables (copy .env.example → .env and fill in)
cp .env.example .env

# 3. Run the dev server
npm run dev        # or: bun dev
```

Open the printed URL (usually http://localhost:5173).

### Environment variables (`.env`)

```env
SUPABASE_URL=...
SUPABASE_PUBLISHABLE_KEY=...
VITE_SUPABASE_URL=...
VITE_SUPABASE_PUBLISHABLE_KEY=...
VITE_GEMINI_API_KEY=...
```

### Supabase setup (required for saving data when logged in)

Run **`supabase/setup-all-rls.sql`** in the Supabase Dashboard → SQL Editor. It creates the Row Level Security policies for `profiles`, `todos`, `chat_threads`, and `chat_messages` (plus auto-creates profile rows on signup).

---

## Scripts

| Command | What it does |
|---------|-------------|
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run ESLint |
| `npm run format` | Format with Prettier |
