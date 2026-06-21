create table if not exists public.tanzaku_wishes (
  id uuid primary key,
  dream text not null,
  deadline date,
  roadmap_steps jsonb not null default '[]'::jsonb,
  status text not null default 'active' check (status in ('active', 'achieved')),
  reflection text,
  created_at timestamptz not null default now(),
  achieved_at timestamptz
);

create index if not exists tanzaku_wishes_created_at_idx
  on public.tanzaku_wishes (created_at desc);

create index if not exists tanzaku_wishes_status_idx
  on public.tanzaku_wishes (status);
