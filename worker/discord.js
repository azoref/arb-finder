'use strict'

const marketLabels = { h2h: 'Moneyline', spreads: 'Spread', totals: 'Total' }

function fmtOdds(n) {
  return `${n > 0 ? '+' : ''}${n}`
}

function arbEmbed(arb) {
  const market = marketLabels[arb.market] || arb.market
  const profit = ((arb.stake_a + arb.stake_b) * (1 / arb.arb_percentage - 1)).toFixed(2)

  return {
    embeds: [{
      color: 0x22c55e,
      title: '🔔 New Arb Detected',
      fields: [
        { name: 'Event', value: arb.event_name, inline: false },
        { name: 'Market', value: market, inline: true },
        { name: 'Margin', value: `**+${arb.profit_margin.toFixed(2)}%**`, inline: true },
        { name: '\u200b', value: '\u200b', inline: false },
        { name: arb.book_a, value: `${arb.outcome_a} **${fmtOdds(arb.odds_a)}**`, inline: true },
        { name: arb.book_b, value: `${arb.outcome_b} **${fmtOdds(arb.odds_b)}**`, inline: true },
        { name: '\u200b', value: '\u200b', inline: false },
        { name: 'Stakes ($1,000 bankroll)', value: `${arb.book_a}: **$${arb.stake_a}** · ${arb.book_b}: **$${arb.stake_b}**`, inline: false },
        { name: 'Guaranteed Profit', value: `**$${profit}**`, inline: true },
      ],
      footer: { text: 'SharpBet · getsharpbet.com' },
      timestamp: new Date().toISOString(),
    }],
  }
}

function whaleEmbed(signal) {
  const isBuy = signal.side === 'BUY'
  return {
    embeds: [{
      color: isBuy ? 0x22c55e : 0xef4444,
      title: `🐋 Whale Signal · ${isBuy ? '↑ BUY' : '↓ SELL'}`,
      fields: [
        { name: 'Market', value: signal.title || 'Unknown', inline: false },
        { name: 'Outcome', value: signal.outcome || '—', inline: true },
        { name: 'Size', value: `**$${Math.round(signal.usd_size).toLocaleString()}**`, inline: true },
        { name: 'Polymarket Implied', value: `**${Math.round((signal.price || 0) * 100)}%**`, inline: true },
        { name: 'Wallet', value: signal.pseudonym || signal.wallet?.slice(0, 10) + '...', inline: true },
      ],
      footer: { text: 'SharpBet · Polymarket on-chain · getsharpbet.com' },
      timestamp: new Date().toISOString(),
    }],
  }
}

async function postToWebhook(webhookUrl, payload) {
  const res = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(8000),
  })
  if (!res.ok && res.status !== 204) {
    const text = await res.text().catch(() => '')
    throw new Error(`Discord webhook returned ${res.status}: ${text}`)
  }
}

async function sendAlerts(supabase, newArbs) {
  if (newArbs.length === 0) return

  // Always fire to the admin webhook (your personal Discord) for every alert
  const adminWebhook = process.env.DISCORD_ADMIN_WEBHOOK
  if (adminWebhook) {
    for (const arb of newArbs) {
      try {
        await postToWebhook(adminWebhook, arbEmbed(arb))
      } catch (err) {
        console.error('[discord] Admin webhook error:', err.message)
      }
    }
  }

  const { data: prefs } = await supabase
    .from('alert_preferences')
    .select('user_id, min_profit_margin, markets, enabled')
    .eq('enabled', true)

  if (!prefs || prefs.length === 0) return

  const { data: premiumUsers } = await supabase
    .from('users')
    .select('id, discord_webhook_url')
    .eq('is_premium', true)
    .not('discord_webhook_url', 'is', null)

  if (!premiumUsers || premiumUsers.length === 0) return

  const prefsByUser = Object.fromEntries(prefs.map(p => [p.user_id, p]))

  for (const user of premiumUsers) {
    const pref = prefsByUser[user.id]
    if (!pref?.enabled) continue

    for (const arb of newArbs) {
      if (arb.profit_margin < pref.min_profit_margin) continue
      if (!pref.markets.includes(arb.market)) continue

      try {
        await postToWebhook(user.discord_webhook_url, arbEmbed(arb))
      } catch (err) {
        console.error(`[discord] Failed to send arb alert to user ${user.id}:`, err.message)
      }
    }
  }

  const arbIds = newArbs.map(a => a.id).filter(Boolean)
  if (arbIds.length > 0) {
    await supabase.from('arbs').update({ alert_sent: true }).in('id', arbIds)
  }
}

function followedWalletEmbed(signal) {
  const isBuy = signal.side === 'BUY'
  return {
    embeds: [{
      color: isBuy ? 0x7c3aed : 0xef4444,
      title: `🔔 Wallet you follow just traded`,
      description: `**${signal.pseudonym || signal.wallet?.slice(0, 10) + '...'}** made a new $10K+ move on Polymarket.`,
      fields: [
        { name: 'Market', value: signal.title || 'Unknown', inline: false },
        { name: 'Side', value: `**${isBuy ? '↑ BUY' : '↓ SELL'}**`, inline: true },
        { name: 'Outcome', value: signal.outcome || 'Unknown', inline: true },
        { name: 'Size', value: `**$${Math.round(signal.usd_size).toLocaleString()}**`, inline: true },
        { name: 'Implied Prob', value: `**${Math.round((signal.price || 0) * 100)}%**`, inline: true },
        { name: 'Profile', value: `[View on SharpBet](https://getsharpbet.com/whale/${signal.wallet})`, inline: true },
      ],
      footer: { text: 'SharpBet · Polymarket on-chain · getsharpbet.com' },
      timestamp: new Date().toISOString(),
    }],
  }
}

module.exports = { sendAlerts, postToWebhook, whaleEmbed, arbEmbed, followedWalletEmbed }
