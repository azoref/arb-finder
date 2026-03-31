'use client'
import { useEffect, useState } from 'react'

interface Mover {
  title: string
  slug: string
  totalVolume: number
  tradeCount: number
  buyCount: number
  category: string
}

const CAT_COLORS: Record<string, string> = { Politics: '#f59e0b', Crypto: '#06b6d4', Sports: '#22c55e', Other: '#9999aa' }

function fmt(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`
  return `$${n}`
}

export default function TerminalHotMarkets() {
  const [movers, setMovers] = useState<Mover[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/movers').then(r => r.json()).then(d => { setMovers(d.movers ?? []); setLoading(false) }).catch(() => setLoading(false))
    const t = setInterval(() => {
      fetch('/api/movers').then(r => r.json()).then(d => setMovers(d.movers ?? [])).catch(() => {})
    }, 60000)
    return () => clearInterval(t)
  }, [])

  if (loading) return <div className="flex items-center justify-center h-full text-[#3a3a45] font-mono text-xs animate-pulse">Loading...</div>
  if (movers.length === 0) return <div className="flex items-center justify-center h-full text-[#3a3a45] font-mono text-xs">No data</div>

  return (
    <div className="overflow-y-auto h-full divide-y divide-[#0f0f12]">
      {movers.map((m, i) => {
        const buyPct = Math.round((m.buyCount / m.tradeCount) * 100)
        const isBullish = buyPct >= 65
        const isBearish = buyPct <= 35
        const catColor = CAT_COLORS[m.category] ?? '#9999aa'
        const polyUrl = `https://polymarket.com/event/${m.slug}`
        return (
          <a key={m.slug || m.title} href={polyUrl} target="_blank" rel="noopener noreferrer"
            className="flex items-start gap-2 px-3 py-2.5 hover:bg-[#0d0d14] transition-colors group">
            <span className="text-[9px] font-mono text-[#3a3a45] w-4 shrink-0 mt-0.5">#{i + 1}</span>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] text-[#c4c4d4] leading-snug truncate group-hover:text-white transition-colors">{m.title}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[8px] font-mono px-1 py-px rounded" style={{ color: catColor, background: catColor + '18' }}>{m.category.toUpperCase()}</span>
                <span className="text-[9px] font-mono text-[#4a4a55]">{m.tradeCount} trades</span>
                <div className="flex-1 h-0.5 rounded-full bg-[#1c1c2e] overflow-hidden">
                  <div className={`h-full rounded-full ${isBullish ? 'bg-green-500' : isBearish ? 'bg-red-500' : 'bg-amber-500'}`} style={{ width: `${buyPct}%` }} />
                </div>
                <span className={`text-[9px] font-mono font-semibold shrink-0 ${isBullish ? 'text-green-400' : isBearish ? 'text-red-400' : 'text-amber-400'}`}>{buyPct}%</span>
              </div>
            </div>
            <span className="text-[10px] font-mono font-bold text-white shrink-0">{fmt(m.totalVolume)}</span>
          </a>
        )
      })}
    </div>
  )
}
