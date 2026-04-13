-- Add win/loss resolution tracking to whale_signals
ALTER TABLE whale_signals
  ADD COLUMN IF NOT EXISTS market_resolved boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS winning_outcome text,
  ADD COLUMN IF NOT EXISTS is_win boolean;

-- Index for the resolution worker (find unresolved signals efficiently)
CREATE INDEX IF NOT EXISTS idx_whale_signals_unresolved
  ON whale_signals(slug, traded_at)
  WHERE market_resolved = false;

-- Index for win rate queries per wallet
CREATE INDEX IF NOT EXISTS idx_whale_signals_is_win
  ON whale_signals(wallet, is_win)
  WHERE is_win IS NOT NULL;
