import Link from 'next/link'
import Nav from '@/components/ui/Nav'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { Metadata } from 'next'
import { inferCategory, CAT_COLORS, type Category } from '@/lib/categories'

export const revalidate = 120

export const metadata: Metadata = {
  title: 'Whale Leaderboard — SharpBet',
  description: 'Top Polymarket whale wallets ranked by volume. On-chain verified smart money across politics, crypto, sports, and more.',
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

function walletColor(name: string) {
  const palette = ['#7c3aed','#06b6d4','#22c55e','#f59e0b','#ef4444','#ec4899']
  return palette[name.charCodeAt(0) % palette.length]
}

interface WalletStat {
  wallet: string
  pseudonym: string
  totalVolume: number
  tradeCount: number
  buyCount: number
  topCategory: Category
  lastActive: string
}

export default async function LeaderboardPage() {
  const supabaseAuth = await createClient()
  const { data: { user } } = await supabaseAuth.auth.getUser()
  const { data: profile } = user
    ? await supabaseAuth.from('users').select('is_premium').eq('id', user.id).single()
    : { data: null }

  const supabase = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: rows } = await supabase
    .from('whale_signals')
    .select('wallet, pseudonym, usd_size, side, title, traded_at')
    .gte('usd_size', 10000)
    .order('traded_at', { ascending: false })

  // Aggregate by wallet
  const walletMap = new Map<string, {
    pseudonym: string
    totalVolume: number
    tradeCount: number
    buyCount: number
    catCounts: Record<Category, number>
    lastActive: string
  }>()

  for (const r of rows ?? []) {
    const prev = walletMap.get(r.wallet) ?? {
      pseudonym: r.pseudonym,
      totalVolume: 0,
      tradeCount: 0,
      buyCount: 0,
      catCounts: { Politics: 0, Crypto: 0, Sports: 0, Other: 0 },
      lastActive: r.traded_at,
    }
    const cat = inferCategory(r.title ?? '')
    walletMap.set(r.wallet, {
      pseudonym: r.pseudonym || prev.pseudonym,
      totalVolume: prev.totalVolume + (r.usd_size ?? 0),
      tradeCount: prev.tradeCount + 1,
      buyCount: prev.buyCount + (r.side === 'BUY' ? 1 : 0),
      catCounts: { ...prev.catCounts, [cat]: prev.catCounts[cat] + 1 },
      lastActive: prev.lastActive > r.traded_at ? prev.lastActive : r.traded_at,
    })
  }

  const allWallets: WalletStat[] = [...walletMap.entries()]
    .map(([wallet, stats]) => ({
      wallet,
      pseudonym: stats.pseudonym,
      totalVolume: stats.totalVolume,
      tradeCount: stats.tradeCount,
      buyCount: stats.buyCount,
      topCategory: (Object.entries(stats.catCounts) as [Category, number][])
        .sort((a, b) => b[1] - a[1])[0][0],
      lastActive: stats.lastActive,
    }))
    .sort((a, b) => b.totalVolume - a.totalVolume)

  // Compute stats from ALL wallets before slicing
  const totalVolume = allWallets.reduce((s, w) => s + w.totalVolume, 0)
  const totalWallets = allWallets.length

  const leaderboard = allWallets.slice(0, 50)

  return (
    <div className="min-h-screen">
      <Nav user={user} isPremium={profile?.is_premium ?? false} />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-mono text-[#4a4a55] uppercase tracking-widest">Polymarket · On-chain verified</span>
          </div>
          <h1 className="text-3xl font-bold text-[#e8e8f0] mb-2">Whale Leaderboard</h1>
          <p className="text-[#6b6b80] text-sm max-w-xl">
            Top wallets ranked by volume across all Polymarket categories. All data is public and on-chain. Updated every 2 minutes.
          </p>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total Volume', value: formatUsd(totalVolume) },
            { label: 'Wallets Tracked', value: totalWallets.toString() },
            { label: 'Min Trade Size', value: '$10K+' },
          ].map(({ label, value }) => (
            <div key={label} className="bg-[#0f0f17] border border-[#1c1c2e] rounded-xl p-4 text-center">
              <p className="text-[11px] text-[#4a4a55] uppercase tracking-widest font-mono mb-1">{label}</p>
              <p className="text-xl font-bold text-white">{value}</p>
            </div>
          ))}
        </div>

        {/* Table */}
        {leaderboard.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="text-4xl mb-4">🐋</div>
            <p className="text-[#4a4a55] font-mono text-sm">No whale data yet. Check back soon.</p>
          </div>
        ) : (
          <div className="bg-[#0d0d10] border border-[#1c1c2e] rounded-2xl overflow-hidden">
            {/* Table header */}
            <div className="grid grid-cols-[40px_1fr_120px_80px_80px_90px_80px] gap-3 px-4 py-3 border-b border-[#1c1c2e] bg-[#0a0a0d]">
              {['#', 'Wallet', 'Volume', 'Trades', 'Buy %', 'Category', 'Last Active'].map(h => (
                <p key={h} className="text-[10px] font-mono text-[#4a4a55] uppercase tracking-widest">{h}</p>
              ))}
            </div>

            {/* Rows */}
            <div className="divide-y divide-[#0f0f12]">
              {leaderboard.map((w, i) => {
                const color = walletColor(w.pseudonym)
                const buyPct = Math.round((w.buyCount / w.tradeCount) * 100)
                const catColor = CAT_COLORS[w.topCategory]
                const isTop3 = i < 3
                return (
                  <Link
                    key={w.wallet}
                    href={`/whale/${w.wallet}`}
                    className={`grid grid-cols-[40px_1fr_120px_80px_80px_90px_80px] gap-3 px-4 py-3.5 items-center hover:bg-[#111118] transition-colors ${isTop3 ? 'bg-[#0a0a0f]' : ''}`}
                  >
                    {/* Rank */}
                    <div className={`text-sm font-bold font-mono ${i === 0 ? 'text-yellow-400' : i === 1 ? 'text-[#9999aa]' : i === 2 ? 'text-amber-700' : 'text-[#3a3a45]'}`}>
                      {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`}
                    </div>

                    {/* Wallet */}
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0"
                        style={{ background: color }}
                      >
                        {w.pseudonym[0]?.toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-[#e8e8f0] truncate">{w.pseudonym}</p>
                        <p className="text-[10px] font-mono text-[#3a3a45] truncate">{w.wallet.slice(0, 8)}...{w.wallet.slice(-4)}</p>
                      </div>
                    </div>

                    {/* Volume */}
                    <p className="text-sm font-bold font-mono text-white">{formatUsd(w.totalVolume)}</p>

                    {/* Trades */}
                    <p className="text-sm font-mono text-[#9999aa]">{w.tradeCount}</p>

                    {/* Buy % */}
                    <p className={`text-sm font-mono font-semibold ${buyPct > 60 ? 'text-green-400' : buyPct < 40 ? 'text-red-400' : 'text-[#f59e0b]'}`}>
                      {buyPct}%
                    </p>

                    {/* Category */}
                    <span
                      className="text-[9px] font-mono px-1.5 py-0.5 rounded w-fit"
                      style={{ color: catColor, background: catColor + '18' }}
                    >
                      {w.topCategory.toUpperCase()}
                    </span>

                    {/* Last active */}
                    <p className="text-[11px] text-[#4a4a55] font-mono">{timeAgo(w.lastActive)}</p>
                  </Link>
                )
              })}
            </div>
          </div>
        )}

        <p className="text-[10px] text-[#3a3a45] font-mono text-center mt-6">
          Last 7 days · $10K+ trades only · Polymarket · Polygon blockchain · On-chain verified
        </p>
      </div>
    </div>
  )
}
