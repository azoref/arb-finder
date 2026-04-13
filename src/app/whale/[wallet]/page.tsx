import Link from 'next/link'
import Nav from '@/components/ui/Nav'
import FollowButton from '@/components/whale/FollowButton'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'

export const revalidate = 0

// ── helpers ──────────────────────────────────────────────────────────────────

function formatUsd(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000)     return `$${(n / 1_000).toFixed(1)}K`
  return `$${Math.round(n)}`
}

function timeAgo(iso: string) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (diff < 60)    return `${diff}s ago`
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

function walletColor(name: string) {
  const palette = ['#7c3aed','#06b6d4','#22c55e','#f59e0b','#ef4444','#ec4899']
  return palette[name.charCodeAt(0) % palette.length]
}

import { inferCategory, CAT_COLORS, type Category } from '@/lib/categories'

// ── resolve Polymarket profile from proxy wallet ─────────────────────────────

async function resolvePolymarketProfile(proxy: string): Promise<string | null> {
  try {
    // Polymarket Gamma API — look up profile by proxy wallet address
    const res = await fetch(
      `https://gamma-api.polymarket.com/profiles?address=${proxy}`,
      { next: { revalidate: 3600 }, headers: { 'Accept': 'application/json' } }
    )
    if (!res.ok) return null
    const data = await res.json()
    const profile = Array.isArray(data) ? data[0] : data
    // Returns { slug, name, ... } — slug is used in polymarket.com/profile/{slug}
    if (profile?.slug) return `https://polymarket.com/profile/${profile.slug}`
    if (profile?.username) return `https://polymarket.com/profile/${profile.username}`
    if (profile?.proxyWallet || profile?.address) return `https://polymarket.com/profile/${proxy}`
    return null
  } catch {
    return null
  }
}

// ── page ─────────────────────────────────────────────────────────────────────

export default async function WhalePage({
  params,
}: {
  params: Promise<{ wallet: string }>
}) {
  const { wallet } = await params

  // Get auth user for Nav
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
    .select('*')
    .eq('wallet', wallet)
    .order('traded_at', { ascending: false })
    .limit(50)

  if (!rows || rows.length === 0) notFound()

  // Resolve Polymarket profile (proxy → profile URL)
  const polymarketUrl = await resolvePolymarketProfile(wallet)

  // Aggregate stats
  const totalVolume   = rows.reduce((s, r) => s + (r.usd_size ?? 0), 0)
  const buys          = rows.filter(r => r.side === 'BUY')
  const sells         = rows.filter(r => r.side === 'SELL')
  const avgSize       = totalVolume / rows.length
  const pseudonym     = rows[0]?.pseudonym ?? `${wallet.slice(0, 6)}...${wallet.slice(-4)}`
  const buyPct        = Math.round((buys.length / rows.length) * 100)
  const avatarColor   = walletColor(pseudonym)

  // Win rate (BUY trades only — SELL is closing a position, not a directional call)
  const resolvedBuys  = rows.filter(r => r.side === 'BUY' && r.is_win !== null && r.is_win !== undefined)
  const winCount      = resolvedBuys.filter(r => r.is_win === true).length
  const lossCount     = resolvedBuys.filter(r => r.is_win === false).length
  const winRate       = resolvedBuys.length >= 3
    ? Math.round((winCount / resolvedBuys.length) * 100)
    : null

  // Category breakdown
  const catCounts: Record<Category, number> = { Politics: 0, Crypto: 0, Sports: 0, Other: 0 }
  const catVolume:  Record<Category, number> = { Politics: 0, Crypto: 0, Sports: 0, Other: 0 }
  for (const r of rows) {
    const cat = inferCategory(r.title ?? '')
    catCounts[cat]++
    catVolume[cat] += r.usd_size ?? 0
  }
  const topCat = (Object.entries(catCounts) as [Category, number][])
    .sort((a, b) => b[1] - a[1])[0][0]

  // Top markets
  const mktMap = new Map<string, { title: string; vol: number }>()
  for (const r of rows) {
    const key = r.event_slug || r.slug || r.title || ''
    if (!key) continue
    const prev = mktMap.get(key) ?? { title: r.title ?? key, vol: 0 }
    mktMap.set(key, { title: prev.title, vol: prev.vol + (r.usd_size ?? 0) })
  }
  const topMarkets = [...mktMap.entries()]
    .sort((a, b) => b[1].vol - a[1].vol)
    .slice(0, 4)

  const isPremium = profile?.is_premium ?? false

  return (
    <div className="min-h-screen">
      <Nav user={user} isPremium={isPremium} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Back */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs text-[#6b6b80] hover:text-[#e8e8f0] transition-colors mb-8"
        >
          Back to dashboard
        </Link>

        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-8 flex-wrap">
          <div className="flex items-center gap-5">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold text-white shrink-0"
              style={{ background: avatarColor }}
            >
              {pseudonym[0]?.toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-semibold text-[#e8e8f0]">{pseudonym}</h1>
                <span
                  className="text-[9px] font-mono px-1.5 py-0.5 rounded"
                  style={{ color: CAT_COLORS[topCat], background: CAT_COLORS[topCat] + '18' }}
                >
                  {topCat.toUpperCase()}
                </span>
              </div>
              <p className="text-xs font-mono text-[#4a4a55] mt-1 max-w-xs truncate">{wallet}</p>
              <div className="flex items-center gap-3 mt-2">
                {polymarketUrl && (
                  <a
                    href={polymarketUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-[#7c3aed] hover:text-[#a78bfa] transition-colors"
                  >
                    View on Polymarket ↗
                  </a>
                )}
                <a
                  href={`https://polygonscan.com/address/${wallet}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[#4a4a55] hover:text-[#9999aa] transition-colors"
                >
                  PolygonScan ↗
                </a>
              </div>
            </div>
          </div>

          <FollowButton wallet={wallet} isPremium={isPremium} isLoggedIn={!!user} />
        </div>

        {/* KPI row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {/* Win Rate — hero KPI */}
          <div className="bg-[#0f0f17] border border-[#1c1c2e] rounded-xl p-4">
            <p className="text-[11px] text-[#6b7280] mb-1">Win Rate</p>
            {winRate !== null ? (
              <>
                <p className="text-2xl font-bold" style={{ color: winRate >= 65 ? '#00c805' : winRate >= 50 ? '#f59e0b' : '#ef4444' }}>
                  {winRate}%
                </p>
                <p className="text-[10px] font-mono text-[#4a4a55] mt-0.5">{winCount}W · {lossCount}L · {resolvedBuys.length} resolved</p>
              </>
            ) : (
              <>
                <p className="text-2xl font-bold text-[#333333]">—</p>
                <p className="text-[10px] font-mono text-[#3a3a45] mt-0.5">
                  {resolvedBuys.length > 0 ? `${resolvedBuys.length} resolved (need 3+)` : 'no resolved trades yet'}
                </p>
              </>
            )}
          </div>

          {[
            { label: 'Total Volume', value: formatUsd(totalVolume), color: '#06b6d4' },
            { label: 'Trade Count',  value: rows.length.toString(), color: '#7c3aed' },
            { label: 'Avg Trade',    value: formatUsd(avgSize),     color: '#f59e0b' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-[#0f0f17] border border-[#1c1c2e] rounded-xl p-4">
              <p className="text-[11px] text-[#6b7280] mb-1">{label}</p>
              <p className="text-2xl font-bold" style={{ color }}>{value}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">

          {/* Trade history */}
          <div className="lg:col-span-2 space-y-3">
            <h2 className="font-semibold text-[#e8e8f0] mb-3">Trade History</h2>
            {rows.map((r, i) => {
              const cat = inferCategory(r.title ?? '')
              const catColor = CAT_COLORS[cat]
              return (
                <div
                  key={`${r.tx_hash}-${i}`}
                  className="bg-[#0f0f17] border border-[#1c1c2e] rounded-xl p-4 hover:border-[#2a2a3e] transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#e8e8f0] truncate">{r.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className="text-[9px] font-mono px-1.5 py-0.5 rounded"
                          style={{ color: catColor, background: catColor + '18' }}
                        >
                          {cat.toUpperCase()}
                        </span>
                        <span className="text-[11px] text-[#6b7280]">{timeAgo(r.traded_at)}</span>
                      </div>
                    </div>
                    <p className="text-base font-bold text-white shrink-0">{formatUsd(r.usd_size ?? 0)}</p>
                  </div>
                  <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                    <span className={`text-xs font-bold ${r.side === 'BUY' ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>
                      {r.side === 'BUY' ? '↑' : '↓'} {r.side}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${r.outcome === 'Yes' ? 'bg-green-500/10 text-green-400' : r.outcome === 'No' ? 'bg-red-500/10 text-red-400' : 'bg-[#1c1c2e] text-[#9999aa]'}`}>
                      {r.outcome}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-[#1c1c2e] text-[#9999aa]">
                      {Math.round((r.price ?? 0) * 100)}% implied
                    </span>
                    {r.is_win === true && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#00c805]/10 text-[#00c805]">
                        ✓ WIN
                      </span>
                    )}
                    {r.is_win === false && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/10 text-red-400">
                        ✗ LOSS
                      </span>
                    )}
                    <a
                      href={`https://polygonscan.com/tx/${r.tx_hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-auto text-[10px] font-mono text-[#3a3a45] hover:text-[#7c3aed] transition-colors"
                    >
                      verify →
                    </a>
                  </div>
                  {r.side === 'BUY' && (r.event_slug || r.slug) && (
                    <div className="mt-2">
                      <a
                        href={`https://polymarket.com/event/${r.event_slug || r.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded text-[11px] font-mono font-bold bg-[#00c805]/10 text-[#00c805] border border-[#00c805]/20 hover:bg-[#00c805]/20 hover:border-[#00c805]/40 transition-colors"
                      >
                        Copy Trade: {r.outcome} ↗
                      </a>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Right sidebar */}
          <div className="space-y-5">

            {/* Direction bias */}
            <div className="bg-[#0f0f17] border border-[#1c1c2e] rounded-xl p-5">
              <h3 className="text-sm font-semibold text-[#e8e8f0] mb-4">Direction Bias</h3>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-[#22c55e] font-semibold">BUY {buyPct}%</span>
                <span className="text-[#ef4444] font-semibold">SELL {100 - buyPct}%</span>
              </div>
              <div className="w-full h-2.5 rounded-full overflow-hidden bg-[#1c1c2e] flex">
                <div className="h-full bg-[#22c55e]" style={{ width: `${buyPct}%` }} />
                <div className="h-full bg-[#ef4444]" style={{ width: `${100 - buyPct}%` }} />
              </div>
              <div className="flex justify-between text-[11px] mt-2 text-[#6b7280]">
                <span>{buys.length} buys</span>
                <span>{sells.length} sells</span>
              </div>
            </div>

            {/* Category breakdown */}
            <div className="bg-[#0f0f17] border border-[#1c1c2e] rounded-xl p-5">
              <h3 className="text-sm font-semibold text-[#e8e8f0] mb-4">Category Breakdown</h3>
              <div className="space-y-2.5">
                {(Object.entries(catCounts) as [Category, number][])
                  .filter(([, count]) => count > 0)
                  .sort((a, b) => b[1] - a[1])
                  .map(([cat, count]) => {
                    const pct = Math.round((count / rows.length) * 100)
                    const color = CAT_COLORS[cat]
                    return (
                      <div key={cat}>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span style={{ color }}>{cat}</span>
                          <span className="text-[#6b7280]">{count} trades · {formatUsd(catVolume[cat])}</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-[#1c1c2e] overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
                        </div>
                      </div>
                    )
                  })}
              </div>
            </div>

            {/* Top markets */}
            <div className="bg-[#0f0f17] border border-[#1c1c2e] rounded-xl p-5">
              <h3 className="text-sm font-semibold text-[#e8e8f0] mb-4">Top Markets</h3>
              <div className="space-y-3">
                {topMarkets.map(([slug, { title, vol }]) => (
                  <div key={slug}>
                    <p className="text-xs text-[#e8e8f0] leading-snug line-clamp-2">{title}</p>
                    <p className="text-[11px] text-[#22c55e] font-mono mt-0.5">{formatUsd(vol)}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* First / last seen */}
            <div className="bg-[#0f0f17] border border-[#1c1c2e] rounded-xl p-5 space-y-3">
              <div>
                <p className="text-[10px] text-[#4a4a55] uppercase tracking-widest">First detected</p>
                <p className="text-xs text-[#9999aa] mt-0.5">{timeAgo(rows[rows.length - 1]?.traded_at)}</p>
              </div>
              <div>
                <p className="text-[10px] text-[#4a4a55] uppercase tracking-widest">Last active</p>
                <p className="text-xs text-[#9999aa] mt-0.5">{timeAgo(rows[0]?.traded_at)}</p>
              </div>
              <p className="text-[10px] text-[#3a3a45] font-mono pt-1">
                On-chain verified · SharpBet
              </p>
            </div>

            {/* Follow wallet upsell */}
            {!isPremium && (
              <div className="bg-violet-500/5 border border-violet-500/20 rounded-xl p-5">
                <p className="text-sm font-semibold text-[#e8e8f0] mb-1">Follow this wallet</p>
                <p className="text-xs text-[#6b6b80] mb-3">
                  Get a Discord alert the moment this wallet makes a new $10K+ trade.
                </p>
                <Link
                  href="/pricing"
                  className="block text-center px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition-colors"
                >
                  Upgrade to Pro
                </Link>
              </div>
            )}



          </div>
        </div>
      </div>
    </div>
  )
}
