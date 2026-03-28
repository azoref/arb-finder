'use strict'

function americanToDecimal(american) {
  if (american > 0) return american / 100 + 1
  return 100 / Math.abs(american) + 1
}

function impliedProb(american) {
  const dec = americanToDecimal(american)
  return 1 / dec
}

const DEFAULT_BANKROLL = 1000

/**
 * Stakes for a two-outcome arb.
 * stakeA + stakeB = bankroll, payouts are equal regardless of outcome.
 */
function calcStakes(impliedA, impliedB, bankroll) {
  const total = impliedA + impliedB
  return {
    stakeA: parseFloat(((impliedA / total) * bankroll).toFixed(2)),
    stakeB: parseFloat(((impliedB / total) * bankroll).toFixed(2)),
  }
}

/**
 * True profit margin: how much you make as % of total staked.
 * Correct formula: (1/arbPct - 1) * 100
 */
function profitMarginPct(arbPct) {
  return parseFloat(((1 / arbPct - 1) * 100).toFixed(4))
}

function makeArb({ eventName, commenceTime, sport, market, outcomeA, outcomeB, oddsA, oddsB, bookA, bookB, bankroll }) {
  const iA = impliedProb(oddsA)
  const iB = impliedProb(oddsB)
  const arbPct = iA + iB
  if (arbPct >= 1.0) return null

  const profit = profitMarginPct(arbPct)
  const { stakeA, stakeB } = calcStakes(iA, iB, bankroll)

  return {
    event_name: eventName,
    commence_time: commenceTime,
    sport,
    market,
    outcome_a: outcomeA,
    outcome_b: outcomeB,
    book_a: bookA,
    book_b: bookB,
    odds_a: oddsA,
    odds_b: oddsB,
    arb_percentage: parseFloat(arbPct.toFixed(6)),
    profit_margin: profit,
    stake_a: stakeA,
    stake_b: stakeB,
  }
}

/**
 * H2H arbs: find best price for each team across all books,
 * then check if the combined implied prob < 1.
 */
function detectH2HArbs(event, eventName, sport, bankroll) {
  const best = {} // outcomeName -> { price, book }

  for (const bookmaker of event.bookmakers) {
    const mkt = bookmaker.markets.find(m => m.key === 'h2h')
    if (!mkt) continue
    for (const outcome of mkt.outcomes) {
      if (!best[outcome.name] || outcome.price > best[outcome.name].price) {
        best[outcome.name] = { price: outcome.price, book: bookmaker.title }
      }
    }
  }

  const names = Object.keys(best)
  const arbs = []

  for (let i = 0; i < names.length - 1; i++) {
    for (let j = i + 1; j < names.length; j++) {
      const a = best[names[i]]
      const b = best[names[j]]
      const arb = makeArb({
        eventName, commenceTime: event.commence_time, sport,
        market: 'h2h',
        outcomeA: names[i], outcomeB: names[j],
        oddsA: a.price, oddsB: b.price,
        bookA: a.book, bookB: b.book,
        bankroll,
      })
      if (arb) arbs.push(arb)
    }
  }

  return arbs
}

/**
 * Totals arbs: for each specific total line (e.g. 224.5),
 * find best Over price and best Under price across all books.
 * Only valid if both sides share the SAME point value.
 */
function detectTotalsArbs(event, eventName, sport, bankroll) {
  // pointValue -> { Over: {price, book}, Under: {price, book} }
  const byPoint = {}

  for (const bookmaker of event.bookmakers) {
    const mkt = bookmaker.markets.find(m => m.key === 'totals')
    if (!mkt) continue
    for (const outcome of mkt.outcomes) {
      if (outcome.point === undefined || outcome.point === null) continue
      const pt = outcome.point
      if (!byPoint[pt]) byPoint[pt] = {}
      const side = outcome.name // 'Over' or 'Under'
      if (!byPoint[pt][side] || outcome.price > byPoint[pt][side].price) {
        byPoint[pt][side] = { price: outcome.price, book: bookmaker.title }
      }
    }
  }

  const arbs = []
  for (const [pt, sides] of Object.entries(byPoint)) {
    const over = sides['Over']
    const under = sides['Under']
    if (!over || !under) continue

    const arb = makeArb({
      eventName, commenceTime: event.commence_time, sport,
      market: 'totals',
      outcomeA: `Over ${pt}`, outcomeB: `Under ${pt}`,
      oddsA: over.price, oddsB: under.price,
      bookA: over.book, bookB: under.book,
      bankroll,
    })
    if (arb) arbs.push(arb)
  }

  return arbs
}

/**
 * Spreads arbs: for each specific spread line (e.g. -3.5 / +3.5),
 * find best price for each side across all books.
 * Only valid when Team A's point and Team B's point are exact opposites.
 */
function detectSpreadsArbs(event, eventName, sport, bankroll) {
  // `${teamName}::${point}` -> { price, book }
  const best = {}

  for (const bookmaker of event.bookmakers) {
    const mkt = bookmaker.markets.find(m => m.key === 'spreads')
    if (!mkt) continue
    for (const outcome of mkt.outcomes) {
      if (outcome.point === undefined || outcome.point === null) continue
      const key = `${outcome.name}::${outcome.point}`
      if (!best[key] || outcome.price > best[key].price) {
        best[key] = { price: outcome.price, book: bookmaker.title, name: outcome.name, point: outcome.point }
      }
    }
  }

  const arbs = []
  const entries = Object.values(best)

  // Pair Team A at -X with Team B at +X (exact opposites)
  for (let i = 0; i < entries.length; i++) {
    for (let j = i + 1; j < entries.length; j++) {
      const a = entries[i]
      const b = entries[j]

      // Must be different teams and exact opposite points
      if (a.name === b.name) continue
      if (a.point + b.point !== 0) continue

      const arb = makeArb({
        eventName, commenceTime: event.commence_time, sport,
        market: 'spreads',
        outcomeA: `${a.name} ${a.point > 0 ? '+' : ''}${a.point}`,
        outcomeB: `${b.name} ${b.point > 0 ? '+' : ''}${b.point}`,
        oddsA: a.price, oddsB: b.price,
        bookA: a.book, bookB: b.book,
        bankroll,
      })
      if (arb) arbs.push(arb)
    }
  }

  return arbs
}

function detectArbs(events, sport, bankroll = DEFAULT_BANKROLL) {
  const arbs = []

  for (const event of events) {
    const eventName = `${event.away_team} vs ${event.home_team}`
    arbs.push(...detectH2HArbs(event, eventName, sport, bankroll))
    arbs.push(...detectTotalsArbs(event, eventName, sport, bankroll))
    arbs.push(...detectSpreadsArbs(event, eventName, sport, bankroll))
  }

  return arbs
}

module.exports = { detectArbs }
