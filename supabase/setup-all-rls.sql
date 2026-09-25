-- ============================================================================
-- LearnFast — one-shot RLS setup for the whole app
-- Run this in: Supabase Dashboard → SQL Editor → Run
--
-- Fixes the "Thêm" (add) button doing nothing: the tables have Row Level
-- Security enabled but no policies, so signed-in users can't INSERT/UPDATE/
-- DELETE their own rows. This script enables user-scoped access for:
--   • profiles         (needed before todos/chat can reference the user)
--   • todos            (to-do list)
--   • chat_threads     (AI chat conversations)
--   • chat_messages    (AI chat messages)
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1) profiles: each user manages their own profile row + auto-create on signup
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, username, school, class_name, birth_date, gender)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'username',
    new.raw_user_meta_data->>'school',
    new.raw_user_meta_data->>'class_name',
    new.raw_user_meta_data->>'birth_date',
    new.raw_user_meta_data->>'gender'
  )
  on conflict (id) do update set
    email = excluded.email,
    username = coalesce(excluded.username, public.profiles.username),
    school = coalesce(excluded.school, public.profiles.school),
    class_name = coalesce(excluded.class_name, public.profiles.class_name),
    birth_date = coalesce(excluded.birth_date, public.profiles.birth_date),
    gender = coalesce(excluded.gender, public.profiles.gender);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Backfill profiles for users who already signed up before this fix.
insert into public.profiles (id, email, username, school, class_name, birth_date, gender)
select
  u.id,
  u.email,
  u.raw_user_meta_data->>'username',
  u.raw_user_meta_data->>'school',
  u.raw_user_meta_data->>'class_name',
  u.raw_user_meta_data->>'birth_date',
  u.raw_user_meta_data->>'gender'
from auth.users u
on conflict (id) do update set
  email = excluded.email,
  username = coalesce(excluded.username, public.profiles.username),
  school = coalesce(excluded.school, public.profiles.school),
  class_name = coalesce(excluded.class_name, public.profiles.class_name),
  birth_date = coalesce(excluded.birth_date, public.profiles.birth_date),
  gender = coalesce(excluded.gender, public.profiles.gender);

-- ---------------------------------------------------------------------------
-- 2) todos: each signed-in user manages their own tasks
-- ---------------------------------------------------------------------------
alter table public.todos enable row level security;

drop policy if exists "todos_select_own" on public.todos;
create policy "todos_select_own"
  on public.todos for select
  using (auth.uid() = user_id);

drop policy if exists "todos_insert_own" on public.todos;
create policy "todos_insert_own"
  on public.todos for insert
  with check (auth.uid() = user_id);

drop policy if exists "todos_update_own" on public.todos;
create policy "todos_update_own"
  on public.todos for update
  using (auth.uid() = user_id);

drop policy if exists "todos_delete_own" on public.todos;
create policy "todos_delete_own"
  on public.todos for delete
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- 3) chat_threads: each signed-in user manages their own conversations
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
-- 4) chat_messages: each signed-in user manages their own messages
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
