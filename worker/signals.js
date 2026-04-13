'use strict'

const { postToWebhook, whaleEmbed, followedWalletEmbed } = require('./discord')

// Polymarket whale signal harvester.
// Called every ~60s by the main worker loop.
// Fetches the most recent 2000 trades from Polymarket's global trades feed,
// captures all categories with $10,000+ USD size, and upserts into Supabase.
// Deduplication is handled by the unique `tx_hash` constraint.

const DATA_API = 'https://data-api.polymarket.com'
const WHALE_THRESHOLD_USD = 10000

function inferCategory(title) {
  const t = (title || '').toLowerCase()
  if (['election', 'president', 'senate', 'congress', 'governor', 'trump', 'biden', 'harris', 'vote', 'ballot', 'prime minister', 'republican', 'democrat', 'political'].some(kw => t.includes(kw))) return 'politics'
  if (['bitcoin', 'ethereum', 'btc', 'eth', 'crypto', 'solana', 'doge', 'coinbase', 'binance', 'blockchain'].some(kw => t.includes(kw))) return 'crypto'
  if (['nba', 'nfl', 'nhl', 'mlb', 'mls', 'ufc', 'pga', 'ncaa', 'wnba', 'basketball', 'football', 'soccer', 'baseball', 'hockey', 'tennis', 'golf', 'boxing', 'mma', 'super bowl', 'world cup', 'champions league', 'playoffs', 'finals', 'match winner', 'game winner'].some(kw => t.includes(kw))) return 'sports'
  return 'other'
}

async function computeStrengthScore(supabase, wallet, usdSize) {
  // Size component (1–5)
  let sizeScore = 1
  if (usdSize >= 200000)     sizeScore = 5
  else if (usdSize >= 100000) sizeScore = 4
  else if (usdSize >= 50000)  sizeScore = 3
  else if (usdSize >= 25000)  sizeScore = 2

  // Wallet activity component (1–5): all-time trade count from wallet_activity
  let activityScore = 1
  try {
    const { data } = await supabase
      .from('wallet_activity')
      .select('trade_count')
      .eq('wallet', wallet)
      .single()
    const count = data?.trade_count ?? 0
    if (count >= 31)      activityScore = 5
    else if (count >= 16) activityScore = 4
    else if (count >= 6)  activityScore = 3
    else if (count >= 3)  activityScore = 2
  } catch (_) {}

  return sizeScore + activityScore // 2–10
}

async function pollSignals(supabase) {
  try {
    const res = await fetch(`${DATA_API}/trades?limit=2000`, {
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

    // Filter for whale trades across all categories
    const whales = trades.filter(t => {
      const usd = (t.size || 0) * (t.price || 0)
      return usd >= WHALE_THRESHOLD_USD
    })

    if (whales.length === 0) {
      console.log('[signals] No whale trades in current window')
      return
    }

    // Map to DB schema
    const rawRecords = whales.map(t => ({
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

    if (rawRecords.length === 0) return

    // Compute strength scores (parallel for performance)
    const records = await Promise.all(
      rawRecords.map(async r => ({
        ...r,
        strength_score: await computeStrengthScore(supabase, r.wallet, r.usd_size),
      }))
    )

    const { error } = await supabase
      .from('whale_signals')
      .upsert(records, { onConflict: 'tx_hash', ignoreDuplicates: true })

    if (error) {
      console.error('[signals] Supabase upsert error:', error.message)
    } else {
      console.log(`[signals] Stored ${records.length} whale signal(s): ${records.map(r => `$${r.usd_size.toLocaleString()} ${r.side} "${r.title?.slice(0, 40)}"`).join(' | ')}`)

      // Increment all-time wallet activity counts
      const wallets = records.map(r => r.wallet).filter(Boolean)
      if (wallets.length > 0) {
        await supabase.rpc('increment_wallet_trades', { p_wallets: wallets })
      }

      // Fire admin Discord webhook for each new signal
      const adminWebhook = process.env.DISCORD_ADMIN_WEBHOOK
      if (adminWebhook) {
        for (const record of records) {
          try {
            await postToWebhook(adminWebhook, whaleEmbed(record))
          } catch (err) {
            console.error('[signals] Admin webhook error:', err.message)
          }
        }
      }

      // Fire followed wallet alerts to Pro users
      await sendFollowedWalletAlerts(supabase, records)
    }

    // Prune signals older than 7 days to keep the table lean but historically rich
    const cutoff = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString()
    await supabase.from('whale_signals').delete().lt('traded_at', cutoff)

  } catch (err) {
    console.error('[signals] Poll error:', err.message)
  }
}

async function sendFollowedWalletAlerts(supabase, records) {
  if (records.length === 0) return

  const wallets = [...new Set(records.map(r => r.wallet).filter(Boolean))]
  if (wallets.length === 0) return

  // Find all users following any of these wallets
  const { data: follows } = await supabase
    .from('followed_wallets')
    .select('user_id, wallet')
    .in('wallet', wallets)

  if (!follows || follows.length === 0) return

  // Get Pro users with Discord webhooks
  const userIds = [...new Set(follows.map(f => f.user_id))]
  const { data: users } = await supabase
    .from('users')
    .select('id, discord_webhook_url')
    .in('id', userIds)
    .eq('is_premium', true)
    .not('discord_webhook_url', 'is', null)

  if (!users || users.length === 0) return

  const webhookByUser = Object.fromEntries(users.map(u => [u.id, u.discord_webhook_url]))

  // Build a map: wallet -> signals
  const signalsByWallet = {}
  for (const record of records) {
    if (!record.wallet) continue
    if (!signalsByWallet[record.wallet]) signalsByWallet[record.wallet] = []
    signalsByWallet[record.wallet].push(record)
  }

  for (const follow of follows) {
    const webhook = webhookByUser[follow.user_id]
    if (!webhook) continue

    const signals = signalsByWallet[follow.wallet] || []
    for (const signal of signals) {
      try {
        await postToWebhook(webhook, followedWalletEmbed(signal))
        console.log(`[signals] Sent followed wallet alert to user ${follow.user_id} for ${signal.pseudonym}`)
      } catch (err) {
        console.error(`[signals] Followed wallet alert failed for user ${follow.user_id}:`, err.message)
      }
    }
  }
}

module.exports = { pollSignals }
