'use strict'

require('dotenv').config({ path: '../.env.local' })

const { createClient } = require('@supabase/supabase-js')
const { fetchOdds, getApiUsage, SPORTS } = require('./odds')
const { detectArbs } = require('./arb')
const { sendAlerts } = require('./discord')
const { pollSignals } = require('./signals')

const POLL_INTERVAL_MS = parseInt(process.env.POLL_INTERVAL_MS ?? '60000')
const LOW_REQUEST_THRESHOLD = 50

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

let isRunning = false

async function poll() {
  if (isRunning) {
    console.log('[worker] Previous poll still running, skipping...')
    return
  }
  isRunning = true

  const pollStart = Date.now()
  console.log(`\n[worker] Poll started at ${new Date().toISOString()}`)

  try {
    for (const sport of SPORTS) {
      console.log(`[worker] Fetching odds for ${sport}...`)
      let events, requestsRemaining

      try {
        const result = await fetchOdds(sport)
        events = result.events
        requestsRemaining = result.requestsRemaining

        console.log(`[worker] Got ${events.length} events | API requests remaining: ${requestsRemaining}`)

        if (requestsRemaining <= LOW_REQUEST_THRESHOLD) {
          console.warn(`⚠️  [worker] LOW API REQUESTS: only ${requestsRemaining} remaining!`)
        }

        // Save odds snapshot to Supabase so frontend can read without using API credits
        await supabase.from('odds_snapshot').upsert({
          sport,
          data: events,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'sport' })

      } catch (err) {
        console.error(`[worker] Failed to fetch odds for ${sport}:`, err.message)
        continue
      }

      // Detect arbs
      const detected = detectArbs(events, sport)
      console.log(`[worker] Detected ${detected.length} arb opportunities`)

      if (detected.length === 0) {
        // Mark all active arbs for this sport as expired
        await expireArbs(sport, [])
        continue
      }

      // Find existing active arbs to avoid duplicates
      const { data: existingArbs } = await supabase
        .from('arbs')
        .select('id, event_name, market, outcome_a, outcome_b, book_a, book_b')
        .eq('status', 'active')
        .eq('sport', sport)

      const existingKeys = new Set(
        (existingArbs ?? []).map(a =>
          `${a.event_name}::${a.market}::${a.outcome_a}::${a.outcome_b}::${a.book_a}::${a.book_b}`
        )
      )

      // Insert new arbs
      const newArbs = detected.filter(a => {
        const key = `${a.event_name}::${a.market}::${a.outcome_a}::${a.outcome_b}::${a.book_a}::${a.book_b}`
        return !existingKeys.has(key)
      })

      if (newArbs.length > 0) {
        const { data: inserted, error } = await supabase
          .from('arbs')
          .insert(newArbs)
          .select()

        if (error) {
          console.error('[worker] Failed to insert arbs:', error.message)
        } else {
          console.log(`[worker] Inserted ${inserted.length} new arbs`)
          // Send Telegram alerts for new arbs
          await sendAlerts(supabase, inserted)
        }
      }

      // Expire arbs that are no longer in the feed
      const detectedKeys = new Set(
        detected.map(a =>
          `${a.event_name}::${a.market}::${a.outcome_a}::${a.outcome_b}::${a.book_a}::${a.book_b}`
        )
      )

      const toExpire = (existingArbs ?? []).filter(a => {
        const key = `${a.event_name}::${a.market}::${a.outcome_a}::${a.outcome_b}::${a.book_a}::${a.book_b}`
        return !detectedKeys.has(key)
      })

      if (toExpire.length > 0) {
        const ids = toExpire.map(a => a.id)
        await supabase
          .from('arbs')
          .update({ status: 'expired', expired_at: new Date().toISOString() })
          .in('id', ids)
        console.log(`[worker] Expired ${ids.length} stale arbs`)
      }
    }
  } catch (err) {
    console.error('[worker] Unexpected error during poll:', err)
  } finally {
    isRunning = false
    const elapsed = ((Date.now() - pollStart) / 1000).toFixed(1)
    const { requestsRemaining } = getApiUsage()
    console.log(`[worker] Poll completed in ${elapsed}s | API remaining: ${requestsRemaining ?? 'unknown'}`)
  }
}

async function expireArbs(sport, detectedKeys) {
  const { data: activeArbs } = await supabase
    .from('arbs')
    .select('id')
    .eq('status', 'active')
    .eq('sport', sport)

  if (!activeArbs || activeArbs.length === 0) return

  const ids = activeArbs.map(a => a.id)
  await supabase
    .from('arbs')
    .update({ status: 'expired', expired_at: new Date().toISOString() })
    .in('id', ids)
}

async function main() {
  console.log(`
  ╔══════════════════════════════════════╗
  ║     SharpBet Worker Starting        ║
  ║     Poll interval: ${(POLL_INTERVAL_MS / 1000).toString().padEnd(6)}s          ║
  ║     Sports: ${SPORTS.join(', ').padEnd(22)}║
  ╚══════════════════════════════════════╝
  `)

  // Validate env
  const required = ['ODDS_API_KEY', 'NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY']
  for (const key of required) {
    if (!process.env[key]) {
      console.error(`[worker] Missing required env var: ${key}`)
      process.exit(1)
    }
  }

  // Run arb poll immediately, then on interval
  await poll()
  setInterval(poll, POLL_INTERVAL_MS)

  // Polymarket whale signals: poll every 60s independently of arb interval
  await pollSignals(supabase)
  setInterval(() => pollSignals(supabase), 60_000)
}

main().catch(err => {
  console.error('[worker] Fatal error:', err)
  process.exit(1)
})
