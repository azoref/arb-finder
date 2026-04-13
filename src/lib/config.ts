// Sports configuration — add new sports here without touching the worker
export const SPORTS_CONFIG = {
  basketball_nba: {
    label: 'NBA',
    markets: ['h2h', 'spreads', 'totals'] as const,
  },
  // basketball_ncaab: { label: 'NCAAB', markets: ['h2h', 'spreads', 'totals'] },
  // americanfootball_nfl: { label: 'NFL', markets: ['h2h', 'spreads', 'totals'] },
} as const

export type SportKey = keyof typeof SPORTS_CONFIG

export const ACTIVE_SPORTS = Object.keys(SPORTS_CONFIG) as SportKey[]

export const MARKET_LABELS: Record<string, string> = {
  h2h: 'Moneyline',
  spreads: 'Spread',
  totals: 'Total',
}

export const POLL_INTERVAL_MS = parseInt(process.env.POLL_INTERVAL_MS ?? '60000')
export const DEFAULT_BANKROLL = 1000

// Free tier constraints
export const FREE_TIER = {
  maxArbs: 5,
  delayMinutes: 5,
  hideBookNames: true,
}
