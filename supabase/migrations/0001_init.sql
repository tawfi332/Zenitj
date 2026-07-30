-- Zenitj initial schema
-- Run this in your Supabase project: SQL Editor -> paste -> Run.
-- Every table is protected by Row Level Security so a user can only ever
-- read/write their own rows (user_id = auth.uid()).

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles are self-readable"
  on public.profiles for select using (auth.uid() = id);
create policy "profiles are self-insertable"
  on public.profiles for insert with check (auth.uid() = id);
create policy "profiles are self-updatable"
  on public.profiles for update using (auth.uid() = id);

-- Auto-create a profile row when a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, split_part(new.email, '@', 1))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- habits
-- ---------------------------------------------------------------------------
create table if not exists public.habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  icon text,
  color text,
  target_per_day int not null default 1,
  archived boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.habits enable row level security;
create policy "own habits" on public.habits
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index if not exists habits_user_idx on public.habits (user_id);

-- ---------------------------------------------------------------------------
-- habit_logs  (one row per habit per day)
-- ---------------------------------------------------------------------------
create table if not exists public.habit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  habit_id uuid not null references public.habits (id) on delete cascade,
  date date not null,
  count int not null default 0,
  completed boolean not null default false,
  unique (habit_id, date)
);

alter table public.habit_logs enable row level security;
create policy "own habit_logs" on public.habit_logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index if not exists habit_logs_user_date_idx
  on public.habit_logs (user_id, date);

-- ---------------------------------------------------------------------------
-- time_entries  (where the day's time went)
-- ---------------------------------------------------------------------------
create table if not exists public.time_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  category text not null,
  description text,
  date date not null,
  duration_minutes int not null default 0,
  started_at timestamptz,
  ended_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.time_entries enable row level security;
create policy "own time_entries" on public.time_entries
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index if not exists time_entries_user_date_idx
  on public.time_entries (user_id, date);

-- ---------------------------------------------------------------------------
-- goals
-- ---------------------------------------------------------------------------
create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  description text,
  target_date date,
  progress int not null default 0,
  status text not null default 'active',
  created_at timestamptz not null default now()
);

alter table public.goals enable row level security;
create policy "own goals" on public.goals
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index if not exists goals_user_idx on public.goals (user_id);

-- ---------------------------------------------------------------------------
-- future_cards  (vision board)
-- ---------------------------------------------------------------------------
create table if not exists public.future_cards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  note text,
  image_url text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.future_cards enable row level security;
create policy "own future_cards" on public.future_cards
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index if not exists future_cards_user_idx on public.future_cards (user_id);
