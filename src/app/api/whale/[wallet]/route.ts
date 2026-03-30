import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const revalidate = 60

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ wallet: string }> }
) {
  const { wallet } = await params

  if (!wallet || wallet.length < 10) {
    return NextResponse.json({ error: 'Invalid wallet' }, { status: 400 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // All trades for this wallet (no time limit — full history we have)
  const { data: trades, error } = await supabase
    .from('whale_signals')
    .select('*')
    .eq('wallet', wallet)
    .order('traded_at', { ascending: false })
    .limit(50)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Try to enrich with Polymarket portfolio value (best-effort)
  let polyStats: { value?: number; pnl?: number } = {}
  try {
    const res = await fetch(
      `https://data-api.polymarket.com/value?user=${wallet}`,
      { signal: AbortSignal.timeout(5000) }
    )
    if (res.ok) {
      const json = await res.json()
      // API returns { value: number, pnl: number } or similar
      if (typeof json.value === 'number') polyStats.value = json.value
      if (typeof json.pnl   === 'number') polyStats.pnl   = json.pnl
    }
  } catch { /* silently ignore */ }

  // Aggregate stats from our data
  const rows = trades ?? []
  const totalVolume   = rows.reduce((s, r) => s + (r.usd_size ?? 0), 0)
  const buys          = rows.filter(r => r.side === 'BUY')
  const sells         = rows.filter(r => r.side === 'SELL')
  const avgTradeSize  = rows.length ? totalVolume / rows.length : 0
  const pseudonym     = rows[0]?.pseudonym ?? `${wallet.slice(0,6)}...${wallet.slice(-4)}`

  // Markets traded
  const marketCounts = new Map<string, { title: string; count: number; volume: number }>()
  for (const r of rows) {
    const key = r.event_slug || r.slug || r.title
    if (!key) continue
    const prev = marketCounts.get(key) ?? { title: r.title ?? key, count: 0, volume: 0 }
    marketCounts.set(key, { title: prev.title, count: prev.count + 1, volume: prev.volume + (r.usd_size ?? 0) })
  }
  const topMarkets = [...marketCounts.entries()]
    .sort((a, b) => b[1].volume - a[1].volume)
    .slice(0, 5)
    .map(([slug, v]) => ({ slug, ...v }))

  return NextResponse.json({
    wallet,
    pseudonym,
    tradeCount:  rows.length,
    totalVolume: Math.round(totalVolume),
    avgTradeSize: Math.round(avgTradeSize),
    buyCount:    buys.length,
    sellCount:   sells.length,
    buyPct:      rows.length ? Math.round((buys.length / rows.length) * 100) : 0,
    topMarkets,
    trades: rows.map(r => ({
      side:        r.side,
      outcome:     r.outcome,
      price:       r.price,
      usdSize:     r.usd_size,
      title:       r.title,
      slug:        r.event_slug || r.slug,
      tradedAt:    r.traded_at,
      txHash:      r.tx_hash,
      impliedProb: Math.round((r.price ?? 0) * 100),
    })),
    polyStats,
    firstSeen: rows.length ? rows[rows.length - 1]?.traded_at : null,
    lastSeen:  rows.length ? rows[0]?.traded_at : null,
  })
}
