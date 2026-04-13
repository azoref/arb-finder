import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

function parseJsonField(val: unknown): string[] {
  if (Array.isArray(val)) return val.map(String)
  if (typeof val === 'string') {
    try { return JSON.parse(val) } catch { return [] }
  }
  return []
}

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Find distinct slugs for unresolved BUY signals older than 2 hours
    // (markets can't resolve instantly; 2h gives time for settlement)
    const cutoff = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()

    const { data: slugRows } = await supabase
      .from('whale_signals')
      .select('slug')
      .eq('market_resolved', false)
      .eq('side', 'BUY')
      .lt('traded_at', cutoff)
      .not('slug', 'is', null)

    const slugs = [...new Set((slugRows ?? []).map(r => r.slug).filter(Boolean))]

    let resolved = 0
    let checked = 0

    for (const slug of slugs.slice(0, 40)) {
      checked++
      try {
        const res = await fetch(
          `https://gamma-api.polymarket.com/markets?event_slug=${encodeURIComponent(slug)}`,
          { headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(5000) }
        )
        if (!res.ok) continue

        const markets: any[] = await res.json()
        if (!Array.isArray(markets) || markets.length === 0) continue

        // Find the winning outcome across all markets in this event
        let winningOutcome: string | null = null

        for (const market of markets) {
          if (!market.closed) continue

          const outcomes = parseJsonField(market.outcomes)
          const prices   = parseJsonField(market.outcomePrices)

          for (let i = 0; i < outcomes.length; i++) {
            const price = parseFloat(prices[i] ?? '0')
            if (price >= 0.99) {
              winningOutcome = outcomes[i]
              break
            }
          }
          if (winningOutcome) break
        }

        // Check if any market in this event is still active (not yet resolved)
        const anyActive = markets.some(m => m.active && !m.closed)

        if (winningOutcome) {
          // Fetch all unresolved BUY signals with this slug
          const { data: signals } = await supabase
            .from('whale_signals')
            .select('id, outcome')
            .eq('slug', slug)
            .eq('market_resolved', false)
            .eq('side', 'BUY')

          if (signals && signals.length > 0) {
            // Batch update
            const updates = signals.map(sig => ({
              id: sig.id,
              market_resolved: true,
              winning_outcome: winningOutcome,
              is_win: (sig.outcome ?? '').toLowerCase() === (winningOutcome ?? '').toLowerCase(),
            }))

            for (const upd of updates) {
              await supabase
                .from('whale_signals')
                .update({
                  market_resolved: upd.market_resolved,
                  winning_outcome: upd.winning_outcome,
                  is_win: upd.is_win,
                })
                .eq('id', upd.id)
            }
            resolved++
          }
        } else if (!anyActive && markets.every(m => m.closed)) {
          // All markets closed but no clear winner — mark resolved without is_win
          await supabase
            .from('whale_signals')
            .update({ market_resolved: true })
            .eq('slug', slug)
            .eq('market_resolved', false)
        }
      } catch {
        // Skip slugs that error or timeout
      }
    }

    return NextResponse.json({
      ok: true,
      slugsFound: slugs.length,
      slugsChecked: checked,
      marketsResolved: resolved,
      timestamp: new Date().toISOString(),
    })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 })
  }
}
