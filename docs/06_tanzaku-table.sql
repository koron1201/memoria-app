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

alter table public.tanzaku_wishes
  add column if not exists user_id uuid references auth.users(id) on delete cascade;

-- 既存行の所有者は推測で補完しない。対応付けを確認できた行だけuser_idを更新する。

create index if not exists tanzaku_wishes_user_id_created_at_idx
  on public.tanzaku_wishes (user_id, created_at desc);

alter table public.tanzaku_wishes enable row level security;

drop policy if exists "Users can manage their own tanzaku wishes" on public.tanzaku_wishes;
create policy "Users can manage their own tanzaku wishes"
  on public.tanzaku_wishes for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists tanzaku_wishes_created_at_idx
  on public.tanzaku_wishes (created_at desc);

create index if not exists tanzaku_wishes_status_idx
  on public.tanzaku_wishes (status);
