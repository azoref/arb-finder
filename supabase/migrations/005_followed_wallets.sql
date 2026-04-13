-- Followed wallets: users can follow specific whale wallets to get Discord alerts
CREATE TABLE IF NOT EXISTS followed_wallets (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  wallet     text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, wallet)
);

ALTER TABLE followed_wallets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own followed wallets"
  ON followed_wallets FOR ALL
  USING (auth.uid() = user_id);
