import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { inferCategory, type Category } from '@/lib/categories'

export const revalidate = 60

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const since = new Date(Date.now() - 24 * 3600 * 1000).toISOString()

    const { data: rows } = await supabase
      .from('whale_signals')
      .select('slug, event_slug, title, usd_size, side, pseudonym, wallet, traded_at')
      .gte('usd_size', 10000)
      .gte('traded_at', since)

    const marketMap = new Map<string, {
      title: string
      slug: string
      totalVolume: number
      tradeCount: number
      buyCount: number
      category: Category
    }>()

    for (const r of rows ?? []) {
      const key = r.event_slug || r.slug || r.title
      if (!key) continue
      const size = r.usd_size ?? 0
      const prev = marketMap.get(key)
      if (!prev) {
        marketMap.set(key, {
          title: r.title,
          slug: r.event_slug || r.slug,
          totalVolume: size,
          tradeCount: 1,
          buyCount: r.side === 'BUY' ? 1 : 0,
          category: inferCategory(r.title ?? ''),
        })
      } else {
        marketMap.set(key, {
          ...prev,
          totalVolume: prev.totalVolume + size,
          tradeCount: prev.tradeCount + 1,
          buyCount: prev.buyCount + (r.side === 'BUY' ? 1 : 0),
        })
      }
    }

    const movers = [...marketMap.values()]
      .sort((a, b) => b.totalVolume - a.totalVolume)
      .slice(0, 5)

    return NextResponse.json({ movers })
  } catch (err: any) {
    return NextResponse.json({ movers: [], error: err.message }, { status: 500 })
  }
}
