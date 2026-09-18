-- Run this before deploying the authenticated upload flow. Existing memories
-- remain valid with a NULL user_id; newly created memories always have one.
alter table public.memories
  add column if not exists user_id uuid references auth.users(id) on delete cascade;

create index if not exists memories_user_id_created_at_idx
  on public.memories (user_id, created_at desc);

create table if not exists public.weekly_reflections (
  user_id uuid not null references auth.users(id) on delete cascade,
  week_start date not null,
  week_end date not null,
  memory_count integer not null check (memory_count > 0),
  top_emotion text,
  comment text not null,
  is_first_week boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, week_start)
);
