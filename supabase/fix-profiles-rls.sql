-- ============================================================================
-- LearnFast — fix for saving profile changes
-- Run this in: Supabase Dashboard → SQL Editor → Run
--
-- Problem: the `profiles` table has Row Level Security (RLS) enabled but no
-- policies, so the browser (anon/authenticated) can't INSERT or UPDATE rows.
-- This means:
--   • signup can't create a profile row (register-time upsert is blocked)
--   • Settings → "Lưu thay đổi" fails
-- ============================================================================

-- 1) RLS policies: each signed-in user manages their own profile row ---------
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

-- 2) Auto-create the profile row on signup (security definer bypasses RLS) ---
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

-- 3) Backfill profiles for users who already signed up before this fix -------
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
