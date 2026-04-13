-- Enable Row-Level Security on all public tables
-- Server-side routes use service_role key which bypasses RLS — no code changes needed.

-- ── whale_signals ─────────────────────────────────────────────────────────────
ALTER TABLE whale_signals ENABLE ROW LEVEL SECURITY;

-- Anyone can read signals (public data)
CREATE POLICY "whale_signals_public_read"
  ON whale_signals FOR SELECT
  USING (true);

-- Only service role can write (all inserts come from the worker, not the client)
-- No INSERT/UPDATE/DELETE policy = only service_role can mutate


-- ── wallet_activity ───────────────────────────────────────────────────────────
ALTER TABLE wallet_activity ENABLE ROW LEVEL SECURITY;

CREATE POLICY "wallet_activity_public_read"
  ON wallet_activity FOR SELECT
  USING (true);


-- ── odds_snapshot ─────────────────────────────────────────────────────────────
ALTER TABLE odds_snapshot ENABLE ROW LEVEL SECURITY;

CREATE POLICY "odds_snapshot_public_read"
  ON odds_snapshot FOR SELECT
  USING (true);


-- ── users ─────────────────────────────────────────────────────────────────────
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users can only read/update their own row
CREATE POLICY "users_own_read"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "users_own_update"
  ON users FOR UPDATE
  USING (auth.uid() = id);


-- ── bets ──────────────────────────────────────────────────────────────────────
ALTER TABLE bets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "bets_own_all"
  ON bets FOR ALL
  USING (auth.uid() = user_id);


-- ── followed_wallets ──────────────────────────────────────────────────────────
ALTER TABLE followed_wallets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "followed_wallets_own_all"
  ON followed_wallets FOR ALL
  USING (auth.uid() = user_id);


-- ── alert_preferences (if exists) ─────────────────────────────────────────────
DO $$ BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'alert_preferences') THEN
    EXECUTE 'ALTER TABLE alert_preferences ENABLE ROW LEVEL SECURITY';
    EXECUTE 'CREATE POLICY "alert_prefs_own_all" ON alert_preferences FOR ALL USING (auth.uid() = user_id)';
  END IF;
END $$;


-- ── discord_alerts (if exists) ────────────────────────────────────────────────
DO $$ BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'discord_alerts') THEN
    EXECUTE 'ALTER TABLE discord_alerts ENABLE ROW LEVEL SECURITY';
    EXECUTE 'CREATE POLICY "discord_alerts_own_all" ON discord_alerts FOR ALL USING (auth.uid() = user_id)';
  END IF;
END $$;
