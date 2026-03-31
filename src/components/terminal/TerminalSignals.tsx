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
  if (diff < 60) return `${diff}s`
  if (diff < 3600) return `${Math.floor(diff / 60)}m`
  return `${Math.floor(diff / 3600)}h`
}

function inferCategory(title: string) {
  const t = (title || '').toLowerCase()
  if (['election','president','senate','congress','governor','trump','biden','harris','vote','ballot','republican','democrat','fed','federal reserve'].some(kw => t.includes(kw))) return 'POL'
  if (['bitcoin','ethereum','btc','eth','crypto','solana','doge','coinbase','binance','blockchain'].some(kw => t.includes(kw))) return 'CRY'
  if (['nba','nfl','nhl','mlb','ufc','basketball','football','soccer','baseball','hockey','tennis','golf','mma','super bowl','world cup','playoffs','finals'].some(kw => t.includes(kw))) return 'SPT'
  return 'OTH'
}

const CAT_COLORS: Record<string, string> = { POL: '#f59e0b', CRY: '#06b6d4', SPT: '#22c55e', OTH: '#9999aa' }

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
    return r.slice(0, 100)
  }, [signals, side])

  if (loading) return <div className="flex items-center justify-center h-full text-[#3a3a45] font-mono text-xs animate-pulse">Scanning...</div>

  return (
    <div className="flex flex-col h-full">
      {/* Filter bar */}
      <div className="flex items-center gap-1.5 px-3 py-1.5 border-b border-[#1a1a1f] shrink-0">
        {(['all', 'buy', 'sell'] as const).map(f => (
          <button key={f} onClick={() => setSide(f)}
            className={`text-[9px] font-mono px-1.5 py-0.5 rounded transition-colors ${side === f
              ? f === 'buy' ? 'bg-green-500/20 text-green-400' : f === 'sell' ? 'bg-red-500/20 text-red-400' : 'bg-[#2a2a3e] text-[#a78bfa]'
              : 'text-[#3a3a45] hover:text-[#6b6b80]'}`}>
            {f.toUpperCase()}
          </button>
        ))}
        <span className="ml-auto text-[9px] font-mono text-[#3a3a45]">{filtered.length} signals</span>
      </div>

      {/* Signal rows */}
      <div className="overflow-y-auto flex-1 divide-y divide-[#0f0f12]">
        {filtered.length === 0 ? (
          <div className="flex items-center justify-center h-24 text-[#3a3a45] text-xs font-mono">No signals</div>
        ) : filtered.map((s, i) => {
          const cat = inferCategory(s.title)
          const catColor = CAT_COLORS[cat]
          const isBuy = s.side === 'BUY'
          const isFollowed = followedWallets?.has(s.wallet)
          return (
            <div key={`${s.wallet}-${s.slug}-${i}`} className={`px-3 py-2 hover:bg-[#0d0d14] transition-colors ${isFollowed ? 'border-l-2 border-violet-500' : ''}`}>
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className={`text-[9px] font-bold ${isBuy ? 'text-green-400' : 'text-red-400'}`}>{isBuy ? '▲' : '▼'}</span>
                <span className="text-[9px] font-mono px-1 py-px rounded shrink-0" style={{ color: catColor, background: catColor + '18' }}>{cat}</span>
                {s.strengthScore != null && (
                  <span className={`text-[9px] font-mono ${s.strengthScore >= 8 ? 'text-green-400' : s.strengthScore >= 5 ? 'text-amber-400' : 'text-[#4a4a55]'}`}>⚡{s.strengthScore}</span>
                )}
                <span className="text-[9px] font-mono text-[#3a3a45] ml-auto shrink-0">{timeAgo(s.timestamp)}</span>
              </div>
              <p className="text-[11px] text-[#c4c4d4] leading-snug truncate">{s.title}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <Link href={`/whale/${s.wallet}`} className="text-[9px] font-mono text-[#6b6b80] hover:text-[#a78bfa] transition-colors truncate">{s.pseudonym}</Link>
                <span className="text-[9px] font-mono font-bold text-white ml-auto shrink-0">${(s.usdSize / 1000).toFixed(0)}K</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
