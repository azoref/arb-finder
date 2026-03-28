'use strict'

const TelegramBot = require('node-telegram-bot-api')
const { createClient } = require('@supabase/supabase-js')

let bot = null

function getBot() {
  if (!bot && process.env.TELEGRAM_BOT_TOKEN) {
    bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true })
    setupCommands()
  }
  return bot
}

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )
}

function formatAlert(arb) {
  const marketLabels = { h2h: 'Moneyline', spreads: 'Spread', totals: 'Total' }
  const marketLabel = marketLabels[arb.market] || arb.market
  const foundAgo = Math.round((Date.now() - new Date(arb.created_at).getTime()) / 1000)
  const foundStr = foundAgo < 60 ? `${foundAgo} seconds ago` : `${Math.round(foundAgo / 60)} minutes ago`
  const profit = ((arb.stake_a + arb.stake_b) * (1 / arb.arb_percentage - 1)).toFixed(2)

  return `🔔 *NEW ARB FOUND*

*Event:* ${arb.event_name}
*Market:* ${marketLabel}
*Book A:* ${arb.book_a} — ${arb.outcome_a} ${arb.odds_a > 0 ? '+' : ''}${arb.odds_a}
*Book B:* ${arb.book_b} — ${arb.outcome_b} ${arb.odds_b > 0 ? '+' : ''}${arb.odds_b}
*Profit Margin:* ${arb.profit_margin.toFixed(2)}%

*Recommended Stakes ($1000 bankroll):*
  ${arb.book_a}: $${arb.stake_a} on ${arb.outcome_a}
  ${arb.book_b}: $${arb.stake_b} on ${arb.outcome_b}
  Guaranteed Profit: $${profit}

_Found: ${foundStr}_`
}

async function sendAlerts(supabase, newArbs) {
  if (!getBot() || newArbs.length === 0) return

  // Get premium users with telegram linked and alerts enabled
  const { data: prefs } = await supabase
    .from('alert_preferences')
    .select('user_id, min_profit_margin, markets, enabled')
    .eq('enabled', true)

  if (!prefs || prefs.length === 0) return

  const { data: premiumUsers } = await supabase
    .from('users')
    .select('id, telegram_chat_id')
    .eq('is_premium', true)
    .not('telegram_chat_id', 'is', null)

  if (!premiumUsers || premiumUsers.length === 0) return

  const prefsByUser = Object.fromEntries(prefs.map(p => [p.user_id, p]))

  for (const user of premiumUsers) {
    const pref = prefsByUser[user.id]
    if (!pref || !pref.enabled) continue

    for (const arb of newArbs) {
      if (arb.profit_margin < pref.min_profit_margin) continue
      if (!pref.markets.includes(arb.market)) continue

      try {
        await getBot().sendMessage(user.telegram_chat_id, formatAlert(arb), {
          parse_mode: 'Markdown',
        })
      } catch (err) {
        console.error(`Failed to send Telegram alert to ${user.telegram_chat_id}:`, err.message)
      }
    }
  }

  // Mark alerts as sent
  const arbIds = newArbs.map(a => a.id).filter(Boolean)
  if (arbIds.length > 0) {
    await supabase.from('arbs').update({ alert_sent: true }).in('id', arbIds)
  }
}

function setupCommands() {
  const b = getBot()
  const supabase = getServiceClient()

  b.onText(/\/start/, async (msg) => {
    await b.sendMessage(msg.chat.id,
      `Welcome to SharpBet! 🎯\n\nI send real-time arbitrage alerts to premium subscribers.\n\n` +
      `To link your account:\n1. Go to your settings at ${process.env.NEXT_PUBLIC_APP_URL}/settings\n` +
      `2. Generate a link code\n3. Send me: /link <code>\n\n` +
      `/status — Check your subscription\n/settings — Manage alert preferences`
    )
  })

  b.onText(/\/link (.+)/, async (msg, match) => {
    const code = match[1].trim()
    const chatId = String(msg.chat.id)

    const { data: linkCode } = await supabase
      .from('telegram_link_codes')
      .select('user_id, used, expires_at')
      .eq('code', code)
      .single()

    if (!linkCode) {
      return b.sendMessage(chatId, '❌ Invalid code. Generate a new one at /settings.')
    }
    if (linkCode.used) {
      return b.sendMessage(chatId, '❌ This code has already been used. Generate a new one.')
    }
    if (new Date(linkCode.expires_at) < new Date()) {
      return b.sendMessage(chatId, '❌ This code has expired. Generate a new one.')
    }

    await supabase.from('users').update({ telegram_chat_id: chatId }).eq('id', linkCode.user_id)
    await supabase.from('telegram_link_codes').update({ used: true }).eq('code', code)

    await b.sendMessage(chatId, '✅ Account linked! You\'ll now receive arb alerts when new opportunities are found.')
  })

  b.onText(/\/status/, async (msg) => {
    const chatId = String(msg.chat.id)
    const { data: user } = await supabase
      .from('users')
      .select('is_premium, email')
      .eq('telegram_chat_id', chatId)
      .single()

    if (!user) {
      return b.sendMessage(chatId, '❌ Account not linked. Use /link <code> to connect.')
    }

    const { data: pref } = await supabase
      .from('alert_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single()

    const status = user.is_premium ? '✅ Premium' : '⬜ Free'
    const alerts = pref?.enabled ? '🟢 Enabled' : '🔴 Disabled'
    await b.sendMessage(chatId,
      `*Account Status*\n\n` +
      `Email: ${user.email}\nPlan: ${status}\nAlerts: ${alerts}\n` +
      `Min margin: ${pref?.min_profit_margin ?? 0.5}%\n` +
      `Markets: ${(pref?.markets ?? []).join(', ')}`,
      { parse_mode: 'Markdown' }
    )
  })

  b.onText(/\/settings/, async (msg) => {
    const chatId = String(msg.chat.id)
    await b.sendMessage(chatId,
      `Manage your settings at: ${process.env.NEXT_PUBLIC_APP_URL}/settings`
    )
  })

  console.log('Telegram bot polling started')
}

module.exports = { getBot, sendAlerts }
