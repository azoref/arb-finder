import { OddsEvent, Arb } from '@/types'

// Convert American odds to decimal
export function americanToDecimal(american: number): number {
  if (american > 0) return american / 100 + 1
  return 100 / Math.abs(american) + 1
}

// Convert decimal odds to implied probability
export function decimalToImplied(decimal: number): number {
  return 1 / decimal
}

// Convert American odds to implied probability
export function americanToImplied(american: number): number {
  return decimalToImplied(americanToDecimal(american))
}

export interface DetectedArb {
  event_name: string
  commence_time: string
  sport: string
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
}

const BANKROLL_DEFAULT = 1000

function calcStakes(impliedA: number, impliedB: number, bankroll: number) {
  const total = impliedA + impliedB
  return {
    stakeA: parseFloat(((impliedA / total) * bankroll).toFixed(2)),
    stakeB: parseFloat(((impliedB / total) * bankroll).toFixed(2)),
  }
}

export function detectArbs(
  events: OddsEvent[],
  sport: string,
  bankroll = BANKROLL_DEFAULT
): DetectedArb[] {
  const arbs: DetectedArb[] = []

  for (const event of events) {
    const eventName = `${event.away_team} vs ${event.home_team}`

    // Collect best odds per outcome per market across all bookmakers
    const bestOdds: Record<string, { price: number; book: string }> = {}

    for (const bookmaker of event.bookmakers) {
      for (const market of bookmaker.markets) {
        const marketKey = market.key as 'h2h' | 'spreads' | 'totals'

        for (const outcome of market.outcomes) {
          const key = `${marketKey}::${outcome.name}`
          if (!bestOdds[key] || outcome.price > bestOdds[key].price) {
            bestOdds[key] = { price: outcome.price, book: bookmaker.title }
          }
        }
      }
    }

    // Check two-outcome markets (h2h, spreads, totals)
    const markets: Array<'h2h' | 'spreads' | 'totals'> = ['h2h', 'spreads', 'totals']

    for (const market of markets) {
      // Get all unique outcome names for this market
      const outcomeNames = new Set<string>()
      for (const bookmaker of event.bookmakers) {
        const mkt = bookmaker.markets.find(m => m.key === market)
        if (mkt) mkt.outcomes.forEach(o => outcomeNames.add(o.name))
      }

      const names = Array.from(outcomeNames)
      if (names.length < 2) continue

      // For two-outcome markets
      for (let i = 0; i < names.length - 1; i++) {
        for (let j = i + 1; j < names.length; j++) {
          const keyA = `${market}::${names[i]}`
          const keyB = `${market}::${names[j]}`

          if (!bestOdds[keyA] || !bestOdds[keyB]) continue

          const decA = americanToDecimal(bestOdds[keyA].price)
          const decB = americanToDecimal(bestOdds[keyB].price)
          const impliedA = decimalToImplied(decA)
          const impliedB = decimalToImplied(decB)
          const arbPct = impliedA + impliedB

          if (arbPct < 1.0) {
            const profitMargin = parseFloat(((1 - arbPct) * 100).toFixed(4))
            const { stakeA, stakeB } = calcStakes(impliedA, impliedB, bankroll)

            arbs.push({
              event_name: eventName,
              commence_time: event.commence_time,
              sport,
              market,
              outcome_a: names[i],
              outcome_b: names[j],
              book_a: bestOdds[keyA].book,
              book_b: bestOdds[keyB].book,
              odds_a: bestOdds[keyA].price,
              odds_b: bestOdds[keyB].price,
              arb_percentage: parseFloat(arbPct.toFixed(6)),
              profit_margin: profitMargin,
              stake_a: stakeA,
              stake_b: stakeB,
            })
          }
        }
      }
    }
  }

  return arbs
}

// Calculator function (used by both API and frontend)
export function calculateArb(
  oddsA: number,
  oddsB: number,
  bankroll: number,
  format: 'american' | 'decimal' = 'american'
) {
  const decA = format === 'american' ? americanToDecimal(oddsA) : oddsA
  const decB = format === 'american' ? americanToDecimal(oddsB) : oddsB
  const impliedA = decimalToImplied(decA)
  const impliedB = decimalToImplied(decB)
  const arbPct = impliedA + impliedB
  const isArb = arbPct < 1.0
  const profitMargin = isArb ? parseFloat(((1 - arbPct) * 100).toFixed(4)) : 0
  const { stakeA, stakeB } = isArb ? calcStakes(impliedA, impliedB, bankroll) : { stakeA: 0, stakeB: 0 }
  const guaranteedProfit = isArb ? parseFloat((bankroll * (1 - arbPct)).toFixed(2)) : 0

  return {
    isArb,
    arbPercentage: parseFloat(arbPct.toFixed(6)),
    profitMargin,
    stakeA,
    stakeB,
    guaranteedProfit,
  }
}
