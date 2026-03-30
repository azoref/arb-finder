'use strict'

// Polymarket whale signal harvester.
// Called every ~60s by the main worker loop.
// Fetches the most recent 1000 trades from Polymarket's global trades feed,
// filters for sports markets with $10K+ USD size, and upserts into Supabase.
// Deduplication is handled by the unique `tx_hash` constraint.

const DATA_API = 'https://data-api.polymarket.com'
const WHALE_THRESHOLD_USD = 10000

const SPORTS_INCLUDE = [
  'nba', 'nfl', 'nhl', 'mlb', 'mls', 'ufc', 'pga', 'ncaa', 'wnba',
  'basketball', 'football', 'soccer', 'baseball', 'hockey', 'tennis',
  'golf', 'boxing', 'mma', 'wrestling', 'cricket', 'rugby',
  'super bowl', 'world series', 'stanley cup', 'champions league',
  'premier league', 'la liga', 'bundesliga', 'serie a', 'ligue 1',
  'fifa', 'world cup', 'olympics', 'playoffs', 'finals',
  'title fight', 'bout', 'match winner', 'game winner',
  'nba finals', 'nfl playoffs', 'march madness',
]

const NON_SPORTS_EXCLUDE = [
  'election', 'president', 'senate', 'congress', 'governor', 'primari',
  'bitcoin', 'ethereum', ' btc ', ' eth ', 'crypto', 'blockchain',
  'interest rate', 'recession', 'inflation', 'tariff', 'stock market',
  'trump', 'biden', 'harris', 'musk', 'elon', 'nobel prize',
  'up or down',  // 5-min crypto price markets
]

function isSportsTrade(title) {
  const t = (title || '').toLowerCase()
  if (NON_SPORTS_EXCLUDE.some(kw => t.includes(kw))) return false
  return SPORTS_INCLUDE.some(kw => t.includes(kw))
}

async function pollSignals(supabase) {
  try {
    const res = await fetch(`${DATA_API}/trades?limit=1000`, {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(15000),
    })

    if (!res.ok) {
      console.warn(`[signals] Polymarket returned ${res.status}`)
      return
    }

    const trades = await res.json()

    if (!Array.isArray(trades)) {
      console.warn('[signals] Unexpected response shape')
      return
    }

    // Filter for sports whale trades
    const whales = trades.filter(t => {
      const usd = (t.size || 0) * (t.price || 0)
      return usd >= WHALE_THRESHOLD_USD && isSportsTrade(t.title)
    })

    if (whales.length === 0) {
      console.log('[signals] No sports whale trades in current window')
      return
    }

    // Map to DB schema
    const records = whales.map(t => ({
      tx_hash:    t.transactionHash,
      wallet:     t.proxyWallet || '',
      pseudonym:  t.pseudonym || t.name || `${(t.proxyWallet || '').slice(0,6)}...${(t.proxyWallet || '').slice(-4)}`,
      side:       (t.side || 'BUY').toUpperCase() === 'SELL' ? 'SELL' : 'BUY',
      outcome:    t.outcome || '',
      price:      t.price || 0,
      usd_size:   Math.round((t.size || 0) * (t.price || 0)),
      title:      t.title || '',
      slug:       t.slug || '',
      event_slug: t.eventSlug || t.slug || '',
      traded_at:  new Date((t.timestamp || Date.now() / 1000) * 1000).toISOString(),
    })).filter(r => r.tx_hash) // skip records without a tx hash

    if (records.length === 0) return

    const { error } = await supabase
      .from('whale_signals')
      .upsert(records, { onConflict: 'tx_hash', ignoreDuplicates: true })

    if (error) {
      console.error('[signals] Supabase upsert error:', error.message)
    } else {
      console.log(`[signals] Stored ${records.length} whale signal(s): ${records.map(r => `$${r.usd_size.toLocaleString()} ${r.side} "${r.title?.slice(0, 40)}"`).join(' | ')}`)
    }

    // Prune signals older than 48 hours to keep the table lean
    const cutoff = new Date(Date.now() - 48 * 3600 * 1000).toISOString()
    await supabase.from('whale_signals').delete().lt('traded_at', cutoff)

  } catch (err) {
    console.error('[signals] Poll error:', err.message)
  }
}

module.exports = { pollSignals }
