'use client'
import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'

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
}

function timeAgo(ts: number) {
  const diff = Math.floor(Date.now() / 1000) - ts
  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  return `${Math.floor(diff / 3600)}h ago`
}

function inferCategory(title: string) {
  const t = (title || '').toLowerCase()
  if (['election','president','senate','congress','governor','trump','biden','harris','vote','ballot','republican','democrat','fed','federal reserve'].some(kw => t.includes(kw))) return { short: 'POL', full: 'Politics', color: '#f59e0b' }
  if (['bitcoin','ethereum','btc','eth','crypto','solana','doge','coinbase','binance','blockchain'].some(kw => t.includes(kw))) return { short: 'CRY', full: 'Crypto', color: '#06b6d4' }
  if (['nba','nfl','nhl','mlb','ufc','basketball','football','soccer','baseball','hockey','tennis','golf','mma','super bowl','world cup','playoffs','finals'].some(kw => t.includes(kw))) return { short: 'SPT', full: 'Sports', color: '#22c55e' }
  return { short: 'OTH', full: 'Other', color: '#9999aa' }
}

function formatSize(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`
  return `$${n}`
}

export default function TerminalSignals({ isPremium, followedWallets }: { isPremium?: boolean; followedWallets?: Set<string> }) {
  const [signals, setSignals] = useState<Signal[]>([])
  const [loading, setLoading] = useState(true)
  const [side, setSide] = useState<'all' | 'buy' | 'sell'>('all')

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
    return r
  }, [signals, side])

  if (loading) return (
    <div className="flex items-center justify-center h-full text-[#4a4a55] font-mono text-sm animate-pulse">
      Scanning Polymarket...
    </div>
  )

  return (
    <div className="flex flex-col h-full">
      {/* Filter bar */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-[#1a1a1f] shrink-0 bg-[#0a0a0e]">
        {(['all', 'buy', 'sell'] as const).map(f => (
          <button key={f} onClick={() => setSide(f)}
            className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded transition-colors ${side === f
              ? f === 'buy' ? 'bg-green-500/20 text-green-400 border border-green-500/30'
              : f === 'sell' ? 'bg-red-500/20 text-red-400 border border-red-500/30'
              : 'bg-[#2a2a3e] text-[#a78bfa] border border-[#7c3aed]/30'
              : 'text-[#4a4a55] hover:text-[#9999aa] border border-transparent'}`}>
            {f === 'all' ? 'ALL' : f === 'buy' ? '▲ BUY' : '▼ SELL'}
          </button>
        ))}
        <span className="ml-auto text-[10px] font-mono text-[#3a3a45]">{filtered.length} signals · 24h</span>
      </div>

      {/* Signal rows */}
      <div className="overflow-y-auto flex-1">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 gap-2">
            <span className="text-2xl">🐋</span>
            <p className="text-[#4a4a55] text-sm font-mono">No signals yet</p>
          </div>
        ) : filtered.map((s, i) => {
          const cat = inferCategory(s.title)
          const isBuy = s.side === 'BUY'
          const isFollowed = followedWallets?.has(s.wallet)
          return (
            <div key={`${s.wallet}-${s.slug}-${i}`}
              className={`px-4 py-3 border-b border-[#0f0f12] hover:bg-[#0d0d15] transition-colors ${isFollowed ? 'border-l-2 border-l-violet-500' : ''} ${i % 2 === 0 ? '' : 'bg-[#09090d]/50'}`}>

              {/* Row 1: side + category + strength + time + trade link */}
              <div className="flex items-center gap-2 mb-1.5">
                <span className={`text-xs font-mono font-bold px-1.5 py-0.5 rounded ${isBuy ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400'}`}>
                  {isBuy ? '▲ BUY' : '▼ SELL'}
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded" style={{ color: cat.color, background: cat.color + '18' }}>
                  {cat.short}
                </span>
                {s.strengthScore != null && (
                  <span className={`text-[10px] font-mono font-semibold ${s.strengthScore >= 8 ? 'text-green-400' : s.strengthScore >= 5 ? 'text-amber-400' : 'text-[#4a4a55]'}`}>
                    ⚡{s.strengthScore}
                  </span>
                )}
                {isFollowed && <span className="text-[10px] font-mono text-violet-400">★ FOLLOWING</span>}
                <span className="ml-auto text-[10px] font-mono text-[#4a4a55]">{timeAgo(s.timestamp)}</span>
                <a href={`https://polymarket.com/event/${s.slug}`} target="_blank" rel="noopener noreferrer"
                  className="text-[10px] font-mono text-[#4a4a55] hover:text-[#a78bfa] transition-colors">
                  Trade ↗
                </a>
              </div>

              {/* Row 2: market title */}
              <p className="text-sm text-[#d4d4e8] font-medium leading-snug mb-1.5 truncate">{s.title}</p>

              {/* Row 3: wallet + outcome + size */}
              <div className="flex items-center gap-3">
                <Link href={`/whale/${s.wallet}`} className="text-xs font-mono text-[#7c7c9a] hover:text-[#a78bfa] transition-colors truncate">
                  {s.pseudonym}
                </Link>
                <span className="text-[10px] font-mono text-[#4a4a55]">·</span>
                <span className="text-[10px] font-mono text-[#6b6b80]">{s.outcome} · {s.impliedProb}%</span>
                <span className="ml-auto text-sm font-bold font-mono text-white shrink-0">{formatSize(s.usdSize)}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
