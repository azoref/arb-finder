import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const revalidate = 120

type Category = 'Politics' | 'Crypto' | 'Sports' | 'Other'

function inferCategory(title: string): Category {
  const t = (title || '').toLowerCase()
  if (['election','president','senate','congress','governor','trump','biden','harris','vote','ballot','republican','democrat','fed','federal reserve','interest rate'].some(kw => t.includes(kw))) return 'Politics'
  if (['bitcoin','ethereum','btc','eth','crypto','solana','doge','coinbase','binance','blockchain'].some(kw => t.includes(kw))) return 'Crypto'
  if (['nba','nfl','nhl','mlb','ufc','basketball','football','soccer','baseball','hockey','tennis','golf','mma','super bowl','world cup','playoffs','finals'].some(kw => t.includes(kw))) return 'Sports'
  return 'Other'
}

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: rows } = await supabase
      .from('whale_signals')
      .select('wallet, pseudonym, usd_size, side, title')
      .gte('usd_size', 10000)

    const walletMap = new Map<string, { pseudonym: string; totalVolume: number; tradeCount: number; buyCount: number; catCounts: Record<Category, number> }>()

    for (const r of rows ?? []) {
      const prev = walletMap.get(r.wallet) ?? { pseudonym: r.pseudonym, totalVolume: 0, tradeCount: 0, buyCount: 0, catCounts: { Politics: 0, Crypto: 0, Sports: 0, Other: 0 } }
      const cat = inferCategory(r.title ?? '')
      walletMap.set(r.wallet, {
        pseudonym: r.pseudonym || prev.pseudonym,
        totalVolume: prev.totalVolume + (r.usd_size ?? 0),
        tradeCount: prev.tradeCount + 1,
        buyCount: prev.buyCount + (r.side === 'BUY' ? 1 : 0),
        catCounts: { ...prev.catCounts, [cat]: prev.catCounts[cat] + 1 },
      })
    }

    const wallets = [...walletMap.entries()]
      .map(([wallet, s]) => ({
        wallet,
        pseudonym: s.pseudonym,
        totalVolume: s.totalVolume,
        tradeCount: s.tradeCount,
        buyCount: s.buyCount,
        topCategory: (Object.entries(s.catCounts) as [Category, number][]).sort((a, b) => b[1] - a[1])[0][0],
      }))
      .sort((a, b) => b.totalVolume - a.totalVolume)
      .slice(0, 20)

    return NextResponse.json({ wallets })
  } catch (err: any) {
    return NextResponse.json({ wallets: [], error: err.message }, { status: 500 })
  }
}
