-- Supabase schema for 社会システム日記 (MVP)
-- NOTE: For local development, you may use the service_role key and bypass RLS.

create extension if not exists pgcrypto;

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text unique,
  username text unique,
  premium_active boolean default false,
  created_at timestamptz default now()
);
-- Ensure username column exists when applying to existing DB
do $$ begin
  alter table users add column if not exists username text unique;
exception when duplicate_column then null; end $$;

create table if not exists characters (
  id text primary key,
  name text not null,
  code text not null,
  is_premium boolean not null default false,
  image_url text,
  created_at timestamptz default now()
);
do $$ begin
  alter table characters add column if not exists image_url text;
exception when duplicate_column then null; end $$;

create table if not exists diary_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  date date not null,
  content text not null,
  created_at timestamptz default now()
);
create index if not exists idx_diary_entries_user_date on diary_entries(user_id, date);

create table if not exists daily_summaries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  date date not null,
  summary_text text not null,
  updated_at timestamptz default now(),
  unique (user_id, date)
);

create table if not exists daily_comments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  date date not null,
  character_id text references characters(id) on delete cascade,
  comment_text text not null,
  model text,
  generated_at timestamptz default now(),
  unique (user_id, date, character_id)
);

create table if not exists purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  sku text not null,
  amount_jpy integer not null,
  status text not null,
  stripe_session_id text unique,
  created_at timestamptz default now()
);

create table if not exists purchased_characters (
  user_id uuid references users(id) on delete cascade,
  character_id text references characters(id) on delete cascade,
  purchased_at timestamptz default now(),
  primary key (user_id, character_id)
);

-- RLS policies
alter table diary_entries enable row level security;
do $$ begin
  create policy diary_entries_select on diary_entries
    for select using (auth.uid() = user_id);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy diary_entries_mod on diary_entries
    for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

alter table daily_summaries enable row level security;
do $$ begin
  create policy daily_summaries_select on daily_summaries
    for select using (auth.uid() = user_id);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy daily_summaries_mod on daily_summaries
    for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

alter table daily_comments enable row level security;
do $$ begin
  create policy daily_comments_select on daily_comments
    for select using (auth.uid() = user_id);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy daily_comments_mod on daily_comments
    for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

alter table purchases enable row level security;
do $$ begin
  create policy purchases_select on purchases
    for select using (auth.uid() = user_id);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy purchases_mod on purchases
    for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

alter table purchased_characters enable row level security;
do $$ begin
  create policy purchased_characters_select on purchased_characters
    for select using (auth.uid() = user_id);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy purchased_characters_mod on purchased_characters
    for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

alter table characters enable row level security;
do $$ begin
  create policy characters_public on characters
    for select using (true);
exception when duplicate_object then null; end $$;
