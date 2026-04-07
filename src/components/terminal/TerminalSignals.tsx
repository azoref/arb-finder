'use client'
import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { inferCategoryWithMeta, type Category } from '@/lib/categories'

interface Signal {
  wallet: string
  pseudonym: string
  side: string
  outcome: string
  price: number
  usdSize: number
  title: string
  slug: string
  timestamp: number
  txHash: string
  impliedProb: number
  strengthScore: number | null
  walletWinRate: number | null
}

function timeAgo(ts: number) {
  const diff = Math.floor(Date.now() / 1000) - ts
  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  return `${Math.floor(diff / 3600)}h ago`
}


function formatSize(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`
  return `$${n}`
}

type CategoryFilter = 'all' | 'POL' | 'CRY' | 'SPT' | 'OTH'

const CATEGORIES: { id: CategoryFilter; label: string; color: string }[] = [
  { id: 'all', label: 'ALL',  color: '#00c805' },
  { id: 'POL', label: 'POL',  color: '#f59e0b' },
  { id: 'CRY', label: 'CRY',  color: '#06b6d4' },
  { id: 'SPT', label: 'SPT',  color: '#22c55e' },
  { id: 'OTH', label: 'OTH',  color: '#666666' },
]

export default function TerminalSignals({ isPremium, followedWallets }: { isPremium?: boolean; followedWallets?: Set<string> }) {
  const [signals, setSignals] = useState<Signal[]>([])
  const [loading, setLoading] = useState(true)
  const [side, setSide] = useState<'all' | 'buy' | 'sell'>('all')
  const [category, setCategory] = useState<CategoryFilter>('all')

  useEffect(() => {
    fetch('/api/signals').then(r => r.json()).then(d => { setSignals(d.signals ?? []); setLoading(false) }).catch(() => setLoading(false))
    const t = setInterval(() => {
      fetch('/api/signals').then(r => r.json()).then(d => setSignals(d.signals ?? [])).catch(() => {})
    }, 30000)
    return () => clearInterval(t)
  }, [])

  const filtered = useMemo(() => {
    let r = [...signals]
    if (side !== 'all') r = r.filter(s => s.side === side.toUpperCase())
    if (category !== 'all') r = r.filter(s => inferCategoryWithMeta(s.title).short === category)
    return r
  }, [signals, side, category])

  if (loading) return (
    <div className="flex items-center justify-center h-full text-[#444444] font-mono text-sm animate-pulse bg-black">
      Scanning Polymarket...
    </div>
  )

  return (
    <div className="flex flex-col h-full bg-black">
      {/* Filter bar */}
      <div className="flex flex-col gap-0 border-b border-[#1f1f1f] shrink-0 bg-[#0a0a0a]">
        {/* Row 1: side + count */}
        <div className="flex items-center gap-2 px-3 pt-2 pb-1.5">
          {(['all', 'buy', 'sell'] as const).map(f => (
            <button key={f} onClick={() => setSide(f)}
              className={`text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded transition-colors ${side === f
                ? f === 'buy'  ? 'bg-[#00c805]/15 text-[#00c805] border border-[#00c805]/30'
                : f === 'sell' ? 'bg-red-500/15 text-red-400 border border-red-500/30'
                : 'bg-[#1a1a1a] text-white border border-[#333333]'
                : 'text-[#444444] hover:text-[#888888] border border-transparent'}`}>
              {f === 'all' ? 'ALL' : f === 'buy' ? '▲ BUY' : '▼ SELL'}
            </button>
          ))}
          <span className="ml-auto text-[10px] font-mono text-[#333333]">{filtered.length} signals · 24h</span>
        </div>
        {/* Row 2: category toggles */}
        <div className="flex items-center gap-1.5 px-3 pb-2">
          {CATEGORIES.map(c => {
            const active = category === c.id
            return (
              <button key={c.id} onClick={() => setCategory(c.id)}
                style={active ? { color: c.color, background: c.color + '18', borderColor: c.color + '40' } : {}}
                className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border transition-colors ${
                  active ? 'border' : 'text-[#444444] hover:text-[#888888] border-transparent'
                }`}>
                {c.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Signal rows */}
      <div className="overflow-y-auto flex-1">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 gap-2">
            <span className="text-2xl">🐋</span>
            <p className="text-[#444444] text-sm font-mono">No signals yet</p>
          </div>
        ) : filtered.map((s, i) => {
          const cat = inferCategoryWithMeta(s.title)
          const isBuy = s.side === 'BUY'
          const isFollowed = followedWallets?.has(s.wallet)
          return (
            <div key={`${s.wallet}-${s.slug}-${i}`}
              className={`px-4 py-3 border-b border-[#111111] hover:bg-[#0f0f0f] transition-colors ${isFollowed ? 'border-l-2 border-l-[#00c805]' : ''} ${i % 2 === 0 ? 'bg-black' : 'bg-[#080808]'}`}>

              {/* Row 1: side + category + strength + followed + time */}
              <div className="flex items-center gap-2 mb-1.5">
                <span className={`text-xs font-mono font-bold px-1.5 py-0.5 rounded ${isBuy ? 'bg-[#00c805]/15 text-[#00c805]' : 'bg-red-500/15 text-red-400'}`}>
                  {isBuy ? '▲ BUY' : '▼ SELL'}
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded" style={{ color: cat.color, background: cat.color + '18' }}>
                  {cat.short}
                </span>
                {s.strengthScore != null && (
                  <span className={`text-[10px] font-mono font-semibold ${s.strengthScore >= 8 ? 'text-[#00c805]' : s.strengthScore >= 5 ? 'text-amber-400' : 'text-[#444444]'}`}>
                    ⚡{s.strengthScore}
                  </span>
                )}
                {isFollowed && <span className="text-[10px] font-mono text-[#00c805]">★ FOLLOWING</span>}
                <span className="ml-auto text-[10px] font-mono text-[#444444]">{timeAgo(s.timestamp)}</span>
              </div>

              {/* Row 2: market title */}
              <p className="text-sm text-white font-medium leading-snug mb-1.5 truncate">{s.title}</p>

              {/* Row 3: wallet + win rate + outcome + size + copy trade */}
              <div className="flex items-center gap-2">
                <Link href={`/whale/${s.wallet}`} className="text-xs font-mono text-[#666666] hover:text-[#00c805] transition-colors truncate">
                  {s.pseudonym}
                </Link>
                {s.walletWinRate !== null && (
                  <span
                    className="text-[10px] font-mono font-bold px-1 py-px rounded shrink-0"
                    style={{
                      color: s.walletWinRate >= 65 ? '#00c805' : s.walletWinRate >= 50 ? '#f59e0b' : '#ef4444',
                      background: s.walletWinRate >= 65 ? '#00c80512' : s.walletWinRate >= 50 ? '#f59e0b12' : '#ef444412',
                    }}
                  >
                    {s.walletWinRate}%W
                  </span>
                )}
                <span className="text-[10px] font-mono text-[#333333]">·</span>
                <span className="text-[10px] font-mono text-[#555555]">{s.outcome} · {s.impliedProb}%</span>
                <span className="ml-auto text-sm font-bold font-mono text-white shrink-0">{formatSize(s.usdSize)}</span>
              </div>

              {/* Row 4: copy trade CTA */}
              {isBuy && (
                <div className="mt-2">
                  <a
                    href={`https://polymarket.com/event/${s.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded text-[11px] font-mono font-bold bg-[#00c805]/10 text-[#00c805] border border-[#00c805]/20 hover:bg-[#00c805]/20 hover:border-[#00c805]/40 transition-colors"
                  >
                    Copy Trade: {s.outcome} ↗
                  </a>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
