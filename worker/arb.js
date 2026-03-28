'use strict'

function americanToDecimal(american) {
  if (american > 0) return american / 100 + 1
  return 100 / Math.abs(american) + 1
}

function decimalToImplied(decimal) {
  return 1 / decimal
}

const DEFAULT_BANKROLL = 1000

function calcStakes(impliedA, impliedB, bankroll) {
  const total = impliedA + impliedB
  return {
    stakeA: parseFloat(((impliedA / total) * bankroll).toFixed(2)),
    stakeB: parseFloat(((impliedB / total) * bankroll).toFixed(2)),
  }
}

/**
 * @param {import('./odds').OddsEvent[]} events
 * @param {string} sport
 * @param {number} bankroll
 */
function detectArbs(events, sport, bankroll = DEFAULT_BANKROLL) {
  const arbs = []

  for (const event of events) {
    const eventName = `${event.away_team} vs ${event.home_team}`

    // Best price per outcome across all books
    const bestOdds = {}

    for (const bookmaker of event.bookmakers) {
      for (const market of bookmaker.markets) {
        for (const outcome of market.outcomes) {
          const key = `${market.key}::${outcome.name}`
          if (!bestOdds[key] || outcome.price > bestOdds[key].price) {
            bestOdds[key] = { price: outcome.price, book: bookmaker.title }
          }
        }
      }
    }

    const markets = ['h2h', 'spreads', 'totals']

    for (const market of markets) {
      const outcomeNames = new Set()
      for (const bookmaker of event.bookmakers) {
        const mkt = bookmaker.markets.find(m => m.key === market)
        if (mkt) mkt.outcomes.forEach(o => outcomeNames.add(o.name))
      }

      const names = Array.from(outcomeNames)
      if (names.length < 2) continue

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

module.exports = { detectArbs }
