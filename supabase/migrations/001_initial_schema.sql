-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- USERS (extends Supabase auth.users)
-- ============================================================
create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  created_at timestamptz not null default now(),
  is_premium boolean not null default false,
  stripe_customer_id text,
  stripe_subscription_id text,
  telegram_chat_id text
);

alter table public.users enable row level security;

create policy "Users can read their own record"
  on public.users for select
  using (auth.uid() = id);

create policy "Users can update their own record"
  on public.users for update
  using (auth.uid() = id);

-- Service role can do anything (used by worker + webhooks)
create policy "Service role full access to users"
  on public.users for all
  using (auth.role() = 'service_role');

-- ============================================================
-- ARBS
-- ============================================================
create table public.arbs (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamptz not null default now(),
  sport text not null,
  event_name text not null,
  commence_time timestamptz not null,
  market text not null check (market in ('h2h', 'spreads', 'totals')),
  outcome_a text not null,
  outcome_b text not null,
  book_a text not null,
  book_b text not null,
  odds_a numeric not null,
  odds_b numeric not null,
  arb_percentage numeric not null,
  profit_margin numeric not null,
  stake_a numeric not null,
  stake_b numeric not null,
  status text not null default 'active' check (status in ('active', 'expired')),
  expired_at timestamptz,
  alert_sent boolean not null default false
);

alter table public.arbs enable row level security;

-- All authenticated users can read arbs (gating happens in app layer)
create policy "Authenticated users can read arbs"
  on public.arbs for select
  using (auth.role() = 'authenticated');

-- Anon users can also read arbs (for the live counter on landing page)
create policy "Anon users can read arbs"
  on public.arbs for select
  using (auth.role() = 'anon');

create policy "Service role full access to arbs"
  on public.arbs for all
  using (auth.role() = 'service_role');

-- Index for common queries
create index arbs_status_created_at on public.arbs(status, created_at desc);
create index arbs_created_at on public.arbs(created_at desc);

-- ============================================================
-- ALERT PREFERENCES
-- ============================================================
create table public.alert_preferences (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  min_profit_margin numeric not null default 0.5,
  markets text[] not null default array['h2h', 'spreads', 'totals'],
  enabled boolean not null default true,
  unique(user_id)
);

alter table public.alert_preferences enable row level security;

create policy "Users can manage their own alert preferences"
  on public.alert_preferences for all
  using (auth.uid() = user_id);

create policy "Service role full access to alert_preferences"
  on public.alert_preferences for all
  using (auth.role() = 'service_role');

-- ============================================================
-- TELEGRAM LINK CODES (one-time codes for /link command)
-- ============================================================
create table public.telegram_link_codes (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  code text not null unique,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '15 minutes'),
  used boolean not null default false
);

alter table public.telegram_link_codes enable row level security;

create policy "Users can manage their own link codes"
  on public.telegram_link_codes for all
  using (auth.uid() = user_id);

create policy "Service role full access to telegram_link_codes"
  on public.telegram_link_codes for all
  using (auth.role() = 'service_role');

-- ============================================================
-- FUNCTION: auto-create user record on signup
-- ============================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users (id, email)
  values (new.id, new.email);

  insert into public.alert_preferences (user_id)
  values (new.id);

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
