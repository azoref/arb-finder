import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { inferCategory, type Category } from '@/lib/categories'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: rows } = await supabase
      .from('whale_signals')
      .select('wallet, pseudonym, usd_size, side, title, is_win')
      .gte('usd_size', 10000)

    const walletMap = new Map<string, {
      pseudonym: string
      totalVolume: number
      tradeCount: number
      buyCount: number
      winCount: number
      resolvedCount: number
      catCounts: Record<Category, number>
    }>()

    for (const r of rows ?? []) {
      const prev = walletMap.get(r.wallet) ?? {
        pseudonym: r.pseudonym,
        totalVolume: 0,
        tradeCount: 0,
        buyCount: 0,
        winCount: 0,
        resolvedCount: 0,
        catCounts: { Politics: 0, Crypto: 0, Sports: 0, Other: 0 },
      }
      const cat = inferCategory(r.title ?? '')
      walletMap.set(r.wallet, {
        pseudonym: r.pseudonym || prev.pseudonym,
        totalVolume: prev.totalVolume + (r.usd_size ?? 0),
        tradeCount: prev.tradeCount + 1,
        buyCount: prev.buyCount + (r.side === 'BUY' ? 1 : 0),
        winCount: prev.winCount + (r.is_win === true ? 1 : 0),
        resolvedCount: prev.resolvedCount + (r.is_win !== null && r.is_win !== undefined ? 1 : 0),
        catCounts: { ...prev.catCounts, [cat]: prev.catCounts[cat] + 1 },
      })
    }

    const wallets = [...walletMap.entries()]
      .map(([wallet, s]) => {
        const winRate = s.resolvedCount >= 3
          ? Math.round((s.winCount / s.resolvedCount) * 100)
          : null
        return {
          wallet,
          pseudonym: s.pseudonym,
          totalVolume: s.totalVolume,
          tradeCount: s.tradeCount,
          buyCount: s.buyCount,
          winRate,
          winCount: s.winCount,
          resolvedCount: s.resolvedCount,
          topCategory: (Object.entries(s.catCounts) as [Category, number][])
            .sort((a, b) => b[1] - a[1])[0][0],
        }
      })
      .sort((a, b) => {
        // Primary sort: win rate (wallets with resolved trades float to top)
        if (a.winRate !== null && b.winRate !== null) return b.winRate - a.winRate
        if (a.winRate !== null) return -1
        if (b.winRate !== null) return 1
        // Fallback: volume
        return b.totalVolume - a.totalVolume
      })
      .slice(0, 20)

    return NextResponse.json({ wallets })
  } catch (err: any) {
    return NextResponse.json({ wallets: [], error: err.message }, { status: 500 })
  }
}
