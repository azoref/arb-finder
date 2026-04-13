export interface Arb {
  id: string
  created_at: string
  sport: string
  event_name: string
  commence_time: string
  market: 'h2h' | 'spreads' | 'totals'
  outcome_a: string
  outcome_b: string
  book_a: string
  book_b: string
  odds_a: number
  odds_b: number
  arb_percentage: number
  profit_margin: number
  stake_a: number
  stake_b: number
  status: 'active' | 'expired'
  expired_at: string | null
}

export interface User {
  id: string
  email: string
  created_at: string
  is_premium: boolean
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  discord_webhook_url: string | null
  polymarket_wallet: string | null
}

export interface AlertPreference {
  id: string
  user_id: string
  min_profit_margin: number
  markets: string[]
  enabled: boolean
}

export interface ArbCalculatorResult {
  isArb: boolean
  arbPercentage: number
  profitMargin: number
  stakeA: number
  stakeB: number
  guaranteedProfit: number
}

export interface OddsOutcome {
  name: string
  price: number // American odds
}

export interface OddsMarket {
  key: string
  outcomes: OddsOutcome[]
}

export interface OddsBookmaker {
  key: string
  title: string
  markets: OddsMarket[]
}

export interface OddsEvent {
  id: string
  sport_key: string
  commence_time: string
  home_team: string
  away_team: string
  bookmakers: OddsBookmaker[]
}
