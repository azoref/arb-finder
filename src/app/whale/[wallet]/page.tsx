import Link from 'next/link'
import Nav from '@/components/ui/Nav'
import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'

export const revalidate = 60

// ── helpers ──────────────────────────────────────────────────────────────────

function formatUsd(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000)     return `$${(n / 1_000).toFixed(1)}K`
  return `$${Math.round(n)}`
}

function timeAgo(iso: string) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (diff < 60)   return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

function walletColors(name: string) {
  const palette = ['#7c3aed','#06b6d4','#22c55e','#f59e0b','#ef4444','#ec4899']
  return palette[name.charCodeAt(0) % palette.length]
}

// ── page ─────────────────────────────────────────────────────────────────────

export default async function WhalePage({
  params,
}: {
  params: Promise<{ wallet: string }>
}) {
  const { wallet } = await params

  const supabase = createClient(
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

  // Aggregate stats
  const totalVolume  = rows.reduce((s, r) => s + (r.usd_size ?? 0), 0)
  const buys         = rows.filter(r => r.side === 'BUY')
  const sells        = rows.filter(r => r.side === 'SELL')
  const avgSize      = totalVolume / rows.length
  const pseudonym    = rows[0]?.pseudonym ?? `${wallet.slice(0, 6)}...${wallet.slice(-4)}`
  const buyPct       = Math.round((buys.length / rows.length) * 100)
  const avatarColor  = walletColors(pseudonym)

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

  return (
    <div className="min-h-screen">
      <Nav user={null} isPremium={false} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Back */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs text-[#6b6b80] hover:text-[#e8e8f0] transition-colors mb-8"
        >
          ← Back to dashboard
        </Link>

        {/* Header */}
        <div className="flex items-center gap-5 mb-8">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold text-white shrink-0"
            style={{ background: avatarColor }}
          >
            {pseudonym[0]?.toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-[#e8e8f0]">{pseudonym}</h1>
            <p className="text-xs font-mono text-[#4a4a55] mt-1">{wallet}</p>
            <div className="flex items-center gap-3 mt-2">
              <a
                href={`https://polymarket.com/profile/${wallet}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[#7c3aed] hover:text-[#a78bfa] transition-colors"
              >
                View on Polymarket ↗
              </a>
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

        {/* KPI row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            { label: 'Total Volume', value: formatUsd(totalVolume), color: '#06b6d4' },
            { label: 'Trade Count',  value: rows.length.toString(), color: '#7c3aed' },
            { label: 'Avg Trade',    value: formatUsd(avgSize),     color: '#f59e0b' },
            { label: 'Buy Rate',     value: `${buyPct}%`,           color: buyPct > 60 ? '#22c55e' : buyPct < 40 ? '#ef4444' : '#f59e0b' },
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
            {rows.map((r, i) => (
              <div
                key={`${r.tx_hash}-${i}`}
                className="bg-[#0f0f17] border border-[#1c1c2e] rounded-xl p-4 hover:border-[#2a2a3e] transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#e8e8f0] truncate">{r.title}</p>
                    <p className="text-[11px] text-[#6b7280] mt-0.5">{timeAgo(r.traded_at)}</p>
                  </div>
                  <p className="text-base font-bold text-white shrink-0">{formatUsd(r.usd_size ?? 0)}</p>
                </div>
                <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                  <span className={`text-xs font-bold ${r.side === 'BUY' ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>
                    {r.side === 'BUY' ? '↑' : '↓'} {r.side}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-[#1c1c2e] text-[#9999aa]">
                    {r.outcome}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-[#1c1c2e] text-[#9999aa]">
                    {Math.round((r.price ?? 0) * 100)}% implied
                  </span>
                  <a
                    href={`https://polygonscan.com/tx/${r.tx_hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-auto text-[10px] font-mono text-[#3a3a45] hover:text-[#7c3aed] transition-colors"
                  >
                    verify →
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* Right sidebar */}
          <div className="space-y-5">

            {/* Buy/sell breakdown */}
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
                Data from SharpBet signal tracker · on-chain verified
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
