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
