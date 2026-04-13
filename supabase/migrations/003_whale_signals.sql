-- ============================================================
-- WHALE SIGNALS
-- Stores $10K+ trades from Polymarket, accumulated by the worker.
-- Public read (trades are on-chain anyway), worker writes via service role.
-- ============================================================

create table public.whale_signals (
  id          uuid        primary key default uuid_generate_v4(),
  tx_hash     text        unique not null,          -- deduplication key
  wallet      text        not null,
  pseudonym   text,
  side        text        not null check (side in ('BUY', 'SELL')),
  outcome     text,
  price       numeric     not null,                 -- 0-1 implied probability
  usd_size    numeric     not null,                 -- USD value of trade
  title       text,                                 -- market question
  slug        text,                                 -- market slug
  event_slug  text,                                 -- parent event slug
  traded_at   timestamptz not null,                 -- when the trade happened
  detected_at timestamptz not null default now()    -- when our worker saw it
);

-- Index for fast time-based queries
create index whale_signals_traded_at_idx on public.whale_signals (traded_at desc);
create index whale_signals_usd_size_idx  on public.whale_signals (usd_size  desc);

-- Public read — whale trades are on-chain, no reason to hide them
alter table public.whale_signals enable row level security;

create policy "Public read for whale signals"
  on public.whale_signals for select
  using (true);

-- Worker writes via service role key which bypasses RLS
