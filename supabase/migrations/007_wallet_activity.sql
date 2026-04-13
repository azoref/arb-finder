-- Tracks all-time trade counts per wallet, independent of the 7-day signal window
CREATE TABLE IF NOT EXISTS wallet_activity (
  wallet      text PRIMARY KEY,
  trade_count integer NOT NULL DEFAULT 0,
  updated_at  timestamptz DEFAULT now()
);

-- Initialize from existing whale_signals data
INSERT INTO wallet_activity (wallet, trade_count)
SELECT wallet, COUNT(*) FROM whale_signals GROUP BY wallet
ON CONFLICT (wallet) DO UPDATE SET trade_count = EXCLUDED.trade_count;

-- Function for bulk-incrementing counts from the worker
CREATE OR REPLACE FUNCTION increment_wallet_trades(p_wallets text[])
RETURNS void AS $$
  INSERT INTO wallet_activity (wallet, trade_count)
  SELECT w, 1 FROM unnest(p_wallets) AS w
  ON CONFLICT (wallet)
  DO UPDATE SET
    trade_count = wallet_activity.trade_count + 1,
    updated_at  = now();
$$ LANGUAGE sql SECURITY DEFINER;
