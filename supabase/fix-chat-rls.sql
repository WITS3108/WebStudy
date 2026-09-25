-- ============================================================================
-- LearnFast — enable user-scoped access to the AI chat tables
-- Run this in: Supabase Dashboard → SQL Editor → Run
--
-- The AI chat is saved to `chat_threads` (one row per conversation) and
-- `chat_messages` (one row per message). These policies let each signed-in
-- user read/write/delete only their own chat data.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- chat_threads
-- ---------------------------------------------------------------------------
alter table public.chat_threads enable row level security;

drop policy if exists "chat_threads_select_own" on public.chat_threads;
create policy "chat_threads_select_own"
  on public.chat_threads for select
  using (auth.uid() = user_id);

drop policy if exists "chat_threads_insert_own" on public.chat_threads;
create policy "chat_threads_insert_own"
  on public.chat_threads for insert
  with check (auth.uid() = user_id);

drop policy if exists "chat_threads_update_own" on public.chat_threads;
create policy "chat_threads_update_own"
  on public.chat_threads for update
  using (auth.uid() = user_id);

drop policy if exists "chat_threads_delete_own" on public.chat_threads;
create policy "chat_threads_delete_own"
  on public.chat_threads for delete
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- chat_messages
-- ---------------------------------------------------------------------------
alter table public.chat_messages enable row level security;

drop policy if exists "chat_messages_select_own" on public.chat_messages;
create policy "chat_messages_select_own"
  on public.chat_messages for select
  using (auth.uid() = user_id);

drop policy if exists "chat_messages_insert_own" on public.chat_messages;
create policy "chat_messages_insert_own"
  on public.chat_messages for insert
  with check (auth.uid() = user_id);

drop policy if exists "chat_messages_update_own" on public.chat_messages;
create policy "chat_messages_update_own"
  on public.chat_messages for update
  using (auth.uid() = user_id);

drop policy if exists "chat_messages_delete_own" on public.chat_messages;
create policy "chat_messages_delete_own"
  on public.chat_messages for delete
  using (auth.uid() = user_id);
