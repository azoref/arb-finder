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

const CAT_COLORS: Record<string, string> = { Politics: '#f59e0b', Crypto: '#06b6d4', Sports: '#22c55e', Other: '#666666' }

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

  if (loading) return <div className="flex items-center justify-center h-full text-[#444444] font-mono text-xs animate-pulse bg-black">Loading...</div>
  if (movers.length === 0) return <div className="flex items-center justify-center h-full text-[#444444] font-mono text-xs bg-black">No data</div>

  return (
    <div className="overflow-y-auto h-full divide-y divide-[#111111] bg-black">
      {movers.map((m, i) => {
        const buyPct = Math.round((m.buyCount / m.tradeCount) * 100)
        const isBullish = buyPct >= 65
        const isBearish = buyPct <= 35
        const catColor = CAT_COLORS[m.category] ?? '#666666'
        const polyUrl = `https://polymarket.com/event/${m.slug}`
        return (
          <a key={m.slug || m.title} href={polyUrl} target="_blank" rel="noopener noreferrer"
            className="flex items-start gap-2 px-3 py-3 hover:bg-[#0f0f0f] transition-colors group">
            <span className="text-[10px] font-mono text-[#333333] w-4 shrink-0 mt-0.5">#{i + 1}</span>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] text-[#cccccc] leading-snug truncate group-hover:text-white transition-colors font-medium">{m.title}</p>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-[9px] font-mono px-1 py-px rounded" style={{ color: catColor, background: catColor + '18' }}>{m.category.toUpperCase()}</span>
                <span className="text-[10px] font-mono text-[#444444]">{m.tradeCount} trades</span>
                <div className="flex-1 h-0.5 rounded-full bg-[#1a1a1a] overflow-hidden">
                  <div className={`h-full rounded-full`} style={{ width: `${buyPct}%`, background: isBullish ? '#00c805' : isBearish ? '#ef4444' : '#f59e0b' }} />
                </div>
                <span className={`text-[10px] font-mono font-semibold shrink-0 ${isBullish ? 'text-[#00c805]' : isBearish ? 'text-red-400' : 'text-amber-400'}`}>{buyPct}%</span>
              </div>
            </div>
            <span className="text-[11px] font-mono font-bold text-white shrink-0">{fmt(m.totalVolume)}</span>
          </a>
        )
      })}
    </div>
  )
}
