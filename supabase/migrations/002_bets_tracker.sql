-- ============================================================
-- BETS TRACKER
-- ============================================================
create table public.bets (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),

  -- Event info
  sport text not null,
  event text not null,
  market text not null,
  selection text not null,
  book text not null,

  -- Financials
  odds integer not null,        -- American odds e.g. -110, +165
  stake numeric not null,       -- $ wagered

  -- Result
  result text not null default 'pending' check (result in ('pending', 'win', 'loss', 'push')),
  profit numeric,               -- actual profit/loss (calculated on result update)

  -- Optional
  notes text,
  is_arb boolean not null default false
);

alter table public.bets enable row level security;

create policy "Users can read their own bets"
  on public.bets for select
  using (auth.uid() = user_id);

create policy "Users can insert their own bets"
  on public.bets for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own bets"
  on public.bets for update
  using (auth.uid() = user_id);

create policy "Users can delete their own bets"
  on public.bets for delete
  using (auth.uid() = user_id);
