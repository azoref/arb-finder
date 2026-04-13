import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const revalidate = 0

// ── Odds helpers ─────────────────────────────────────────────────────────────

/** American odds → implied probability (0–1), vig-inclusive */
function americanToImplied(odds: number): number {
  if (odds > 0) return 100 / (odds + 100)
  return Math.abs(odds) / (Math.abs(odds) + 100)
}

/** Implied probability (0–1) → American odds string e.g. "-165" or "+140" */
function impliedToAmerican(p: number): string {
  if (p <= 0 || p >= 1) return 'N/A'
  if (p >= 0.5) return `-${Math.round(p / (1 - p) * 100)}`
  return `+${Math.round((1 - p) / p * 100)}`
}

/** Normalise a team/outcome name for fuzzy matching */
function normalise(name: string): string {
  return (name || '')
    .toLowerCase()
    .replace(/\b(fc|cf|sc|ac|afc|nfc|united|city|county|the)\b/g, '')
    .replace(/[^a-z0-9 ]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

// ── Build team → best odds map from odds_snapshot ────────────────────────────

interface OddsMatch {
  bookName:        string
  americanOdds:    number
  bookImpliedProb: number  // 0–100
}

function buildTeamOddsMap(snapshots: { sport: string; data: any[] }[]): Map<string, OddsMatch> {
  const map = new Map<string, OddsMatch>()

  for (const snap of snapshots) {
    for (const event of snap.data ?? []) {
      for (const bm of event.bookmakers ?? []) {
        for (const mkt of bm.markets ?? []) {
          if (mkt.key !== 'h2h') continue
          for (const outcome of mkt.outcomes ?? []) {
            const key = normalise(outcome.name)
            if (!key || map.has(key)) continue   // keep first match only
            map.set(key, {
              bookName:        bm.title || bm.key,
              americanOdds:    outcome.price,
              bookImpliedProb: Math.round(americanToImplied(outcome.price) * 100),
            })
          }
        }
      }
    }
  }

  return map
}

// ── Route ─────────────────────────────────────────────────────────────────────

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Fetch whale signals and odds snapshots in parallel
    const since = new Date(Date.now() - 24 * 3600 * 1000).toISOString()

    const [signalsRes, oddsRes] = await Promise.all([
      supabase
        .from('whale_signals')
        .select('*')
        .gte('traded_at', since)
        .gte('usd_size', 10000)
        .order('usd_size', { ascending: false })
        .limit(30),
      supabase
        .from('odds_snapshot')
        .select('sport, data'),
    ])

    // Build per-wallet win rates from all-time resolved signals
    const uniqueWallets = [...new Set((signalsRes.data ?? []).map(r => r.wallet))]
    let walletWinRates: Map<string, number | null> = new Map()

    if (uniqueWallets.length > 0) {
      const { data: winRows } = await supabase
        .from('whale_signals')
        .select('wallet, is_win')
        .in('wallet', uniqueWallets)
        .not('is_win', 'is', null)
        .gte('usd_size', 10000)

      const winMap = new Map<string, { wins: number; resolved: number }>()
      for (const row of winRows ?? []) {
        const prev = winMap.get(row.wallet) ?? { wins: 0, resolved: 0 }
        winMap.set(row.wallet, {
          wins: prev.wins + (row.is_win === true ? 1 : 0),
          resolved: prev.resolved + 1,
        })
      }
      for (const [wallet, stats] of winMap.entries()) {
        walletWinRates.set(
          wallet,
          stats.resolved >= 3 ? Math.round((stats.wins / stats.resolved) * 100) : null
        )
      }
    }

    if (signalsRes.error) {
      return NextResponse.json({ signals: [], error: signalsRes.error.message })
    }

    // Build team-name → sportsbook odds map
    const teamOdds = buildTeamOddsMap(oddsRes.data ?? [])

    const signals = (signalsRes.data ?? []).map(row => {
      const polyProb = Math.round((row.price ?? 0) * 100)

      // Try to match outcome name against sportsbook odds
      const matchKey = normalise(row.outcome ?? '')
      const match = matchKey ? teamOdds.get(matchKey) : undefined

      const divergencePts = match
        ? Math.round((polyProb - match.bookImpliedProb) * 10) / 10
        : null

      return {
        wallet:          row.wallet,
        pseudonym:       row.pseudonym || `${row.wallet.slice(0, 6)}...${row.wallet.slice(-4)}`,
        side:            row.side,
        outcome:         row.outcome,
        price:           row.price,
        usdSize:         row.usd_size,
        title:           row.title,
        slug:            row.event_slug || row.slug,
        timestamp:       Math.floor(new Date(row.traded_at).getTime() / 1000),
        txHash:          row.tx_hash,
        // Polymarket probability
        impliedProb:     polyProb,
        polyAmericanOdds: impliedToAmerican(row.price ?? 0),
        strengthScore:   row.strength_score ?? null,
        // Matched sportsbook (null if no match in odds_snapshot)
        bookName:        match?.bookName        ?? null,
        bookOdds:        match?.americanOdds    ?? null,
        bookImpliedProb: match?.bookImpliedProb ?? null,
        divergencePts,
        walletWinRate: walletWinRates.get(row.wallet) ?? null,
      }
    })

    return NextResponse.json({ signals, updatedAt: new Date().toISOString() })
  } catch (err: any) {
    return NextResponse.json({ signals: [], error: err.message }, { status: 500 })
  }
}
