import Link from 'next/link'
import Nav from '@/components/ui/Nav'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { Metadata } from 'next'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Market Movers — SharpBet',
  description: 'Polymarket markets with the most whale activity right now. Track where smart money is flowing across politics, crypto, sports, and more.',
}

function formatUsd(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000)     return `$${(n / 1_000).toFixed(1)}K`
  return `$${Math.round(n)}`
}

function timeAgo(iso: string) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

type Category = 'Politics' | 'Crypto' | 'Sports' | 'Other'

const CAT_COLORS: Record<Category, string> = {
  Politics: '#f59e0b',
  Crypto:   '#06b6d4',
  Sports:   '#22c55e',
  Other:    '#9999aa',
}

function inferCategory(title: string): Category {
  const t = (title || '').toLowerCase()
  if (['election','president','senate','congress','governor','trump','biden','harris','vote','ballot','prime minister','republican','democrat','fed','federal reserve','interest rate'].some(kw => t.includes(kw))) return 'Politics'
  if (['bitcoin','ethereum','btc','eth','crypto','solana','doge','coinbase','binance','blockchain'].some(kw => t.includes(kw))) return 'Crypto'
  if (['nba','nfl','nhl','mlb','mls','ufc','pga','ncaa','wnba','basketball','football','soccer','baseball','hockey','tennis','golf','boxing','mma','super bowl','world cup','champions league','playoffs','finals'].some(kw => t.includes(kw))) return 'Sports'
  return 'Other'
}

export default async function MoversPage() {
  const supabaseAuth = await createClient()
  const { data: { user } } = await supabaseAuth.auth.getUser()
  const { data: profile } = user
    ? await supabaseAuth.from('users').select('is_premium').eq('id', user.id).single()
    : { data: null }

  const supabase = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const since = new Date(Date.now() - 24 * 3600 * 1000).toISOString()

  const { data: rows } = await supabase
    .from('whale_signals')
    .select('slug, event_slug, title, usd_size, side, pseudonym, wallet, traded_at')
    .gte('usd_size', 10000)
    .gte('traded_at', since)
    .order('traded_at', { ascending: false })

  // Aggregate by market slug
  const marketMap = new Map<string, {
    title: string
    slug: string
    totalVolume: number
    tradeCount: number
    buyCount: number
    topTrader: { pseudonym: string; wallet: string; size: number }
    lastActive: string
    category: Category
  }>()

  for (const r of rows ?? []) {
    const key = r.event_slug || r.slug || r.title
    if (!key) continue
    const prev = marketMap.get(key)
    const size = r.usd_size ?? 0
    if (!prev) {
      marketMap.set(key, {
        title: r.title,
        slug: r.event_slug || r.slug,
        totalVolume: size,
        tradeCount: 1,
        buyCount: r.side === 'BUY' ? 1 : 0,
        topTrader: { pseudonym: r.pseudonym, wallet: r.wallet, size },
        lastActive: r.traded_at,
        category: inferCategory(r.title ?? ''),
      })
    } else {
      marketMap.set(key, {
        ...prev,
        totalVolume: prev.totalVolume + size,
        tradeCount: prev.tradeCount + 1,
        buyCount: prev.buyCount + (r.side === 'BUY' ? 1 : 0),
        topTrader: size > prev.topTrader.size
          ? { pseudonym: r.pseudonym, wallet: r.wallet, size }
          : prev.topTrader,
        lastActive: prev.lastActive > r.traded_at ? prev.lastActive : r.traded_at,
      })
    }
  }

  const movers = [...marketMap.values()]
    .sort((a, b) => b.totalVolume - a.totalVolume)
    .slice(0, 50)

  const totalVolume = [...marketMap.values()].reduce((s, m) => s + m.totalVolume, 0)
  const totalMarkets = marketMap.size

  return (
    <div className="min-h-screen">
      <Nav user={user} isPremium={profile?.is_premium ?? false} />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-mono text-[#4a4a55] uppercase tracking-widest">Polymarket · Last 24 hours</span>
          </div>
          <h1 className="text-3xl font-bold text-[#e8e8f0] mb-2">Market Movers</h1>
          <p className="text-[#6b6b80] text-sm max-w-xl">
            Markets ranked by whale volume in the last 24 hours. Where smart money is flowing right now.
          </p>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total Volume (24h)', value: formatUsd(totalVolume) },
            { label: 'Active Markets', value: totalMarkets.toString() },
            { label: 'Window', value: '24 hours' },
          ].map(({ label, value }) => (
            <div key={label} className="bg-[#0f0f17] border border-[#1c1c2e] rounded-xl p-4 text-center">
              <p className="text-[11px] text-[#4a4a55] uppercase tracking-widest font-mono mb-1">{label}</p>
              <p className="text-xl font-bold text-white">{value}</p>
            </div>
          ))}
        </div>

        {/* Table */}
        {movers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="text-4xl mb-4">📈</div>
            <p className="text-[#4a4a55] font-mono text-sm">No whale activity in the last 24 hours. Check back soon.</p>
          </div>
        ) : (
          <div className="bg-[#0d0d10] border border-[#1c1c2e] rounded-2xl overflow-hidden">
            {/* Table header */}
            <div className="grid grid-cols-[40px_1fr_110px_70px_70px_90px_80px] gap-3 px-4 py-3 border-b border-[#1c1c2e] bg-[#0a0a0d]">
              {['#', 'Market', 'Volume', 'Trades', 'Buy %', 'Category', 'Last Trade'].map(h => (
                <p key={h} className="text-[10px] font-mono text-[#4a4a55] uppercase tracking-widest">{h}</p>
              ))}
            </div>

            {/* Rows */}
            <div className="divide-y divide-[#0f0f12]">
              {movers.map((m, i) => {
                const buyPct = Math.round((m.buyCount / m.tradeCount) * 100)
                const catColor = CAT_COLORS[m.category]
                const isTop3 = i < 3
                const polyUrl = `https://polymarket.com/event/${m.slug}`
                return (
                  <a
                    key={m.slug || m.title}
                    href={polyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`grid grid-cols-[40px_1fr_110px_70px_70px_90px_80px] gap-3 px-4 py-3.5 items-center hover:bg-[#111118] transition-colors ${isTop3 ? 'bg-[#0a0a0f]' : ''}`}
                  >
                    {/* Rank */}
                    <div className={`text-sm font-bold font-mono ${i === 0 ? 'text-yellow-400' : i === 1 ? 'text-[#9999aa]' : i === 2 ? 'text-amber-700' : 'text-[#3a3a45]'}`}>
                      {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`}
                    </div>

                    {/* Market */}
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[#e8e8f0] truncate leading-snug">{m.title}</p>
                      <p className="text-[10px] font-mono text-[#3a3a45] mt-0.5 truncate">
                        Biggest: <span className="text-[#6b6b80]">{m.topTrader.pseudonym}</span> · {formatUsd(m.topTrader.size)}
                      </p>
                    </div>

                    {/* Volume */}
                    <p className="text-sm font-bold font-mono text-white">{formatUsd(m.totalVolume)}</p>

                    {/* Trades */}
                    <p className="text-sm font-mono text-[#9999aa]">{m.tradeCount}</p>

                    {/* Buy % */}
                    <p className={`text-sm font-mono font-semibold ${buyPct > 60 ? 'text-green-400' : buyPct < 40 ? 'text-red-400' : 'text-[#f59e0b]'}`}>
                      {buyPct}%
                    </p>

                    {/* Category */}
                    <span
                      className="text-[9px] font-mono px-1.5 py-0.5 rounded w-fit"
                      style={{ color: catColor, background: catColor + '18' }}
                    >
                      {m.category.toUpperCase()}
                    </span>

                    {/* Last trade */}
                    <p className="text-[11px] text-[#4a4a55] font-mono">{timeAgo(m.lastActive)}</p>
                  </a>
                )
              })}
            </div>
          </div>
        )}

        <p className="text-[10px] text-[#3a3a45] font-mono text-center mt-6">
          Last 24 hours · $10K+ trades only · Polymarket · Polygon blockchain · On-chain verified
        </p>
      </div>
    </div>
  )
}
