'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Mover {
  title: string
  slug: string
  totalVolume: number
  tradeCount: number
  buyCount: number
  category: 'Politics' | 'Crypto' | 'Sports' | 'Other'
}

const CAT_COLORS: Record<string, string> = {
  Politics: '#f59e0b',
  Crypto:   '#06b6d4',
  Sports:   '#22c55e',
  Other:    '#9999aa',
}

function formatUsd(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000)     return `$${(n / 1_000).toFixed(0)}K`
  return `$${Math.round(n)}`
}

export default function HotMarkets() {
  const [movers, setMovers] = useState<Mover[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/movers')
      .then(r => r.json())
      .then(d => { setMovers(d.movers ?? []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="bg-[#0a0a10] border border-[#1c1c2e] rounded-xl p-4 animate-pulse">
      <div className="h-3 w-32 bg-[#1c1c2e] rounded mb-3" />
      <div className="flex gap-2">
        {[...Array(5)].map((_, i) => <div key={i} className="h-16 flex-1 bg-[#1c1c2e] rounded-lg" />)}
      </div>
    </div>
  )

  if (movers.length === 0) return null

  return (
    <div className="bg-[#0a0a10] border border-[#1c1c2e] rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-[#4a4a55] uppercase tracking-widest">🔥 Hot Markets</span>
          <span className="text-[9px] font-mono text-[#3a3a45]">last 24h</span>
        </div>
        <Link href="/movers" className="text-[10px] font-mono text-[#6b6b80] hover:text-[#a78bfa] transition-colors">
          See all →
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
        {movers.map((m, i) => {
          const buyPct = Math.round((m.buyCount / m.tradeCount) * 100)
          const catColor = CAT_COLORS[m.category] ?? '#9999aa'
          const isBullish = buyPct >= 65
          const isBearish = buyPct <= 35
          const polyUrl = `https://polymarket.com/event/${m.slug}`
          return (
            <a
              key={m.slug || m.title}
              href={polyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-[#0d0d12] border border-[#1c1c2e] hover:border-[#2a2a3e] rounded-lg p-3 flex flex-col gap-2 transition-colors"
            >
              <div className="flex items-center justify-between gap-1">
                <span
                  className="text-[8px] font-mono px-1 py-0.5 rounded"
                  style={{ color: catColor, background: catColor + '18' }}
                >
                  {m.category.toUpperCase()}
                </span>
                <span className="text-[9px] font-mono text-[#4a4a55]">#{i + 1}</span>
              </div>
              <p className="text-[11px] text-[#c4c4d4] leading-snug line-clamp-2 group-hover:text-white transition-colors">{m.title}</p>
              <div className="flex items-center justify-between mt-auto">
                <span className="text-xs font-bold font-mono text-white">{formatUsd(m.totalVolume)}</span>
                <span className={`text-[10px] font-mono font-semibold ${isBullish ? 'text-green-400' : isBearish ? 'text-red-400' : 'text-[#f59e0b]'}`}>
                  {isBullish ? '↑' : isBearish ? '↓' : '⇌'} {buyPct}%
                </span>
              </div>
              {/* Volume bar */}
              <div className="w-full h-0.5 rounded-full bg-[#1c1c2e] overflow-hidden">
                <div
                  className={`h-full rounded-full ${isBullish ? 'bg-green-500' : isBearish ? 'bg-red-500' : 'bg-amber-500'}`}
                  style={{ width: `${buyPct}%` }}
                />
              </div>
            </a>
          )
        })}
      </div>
    </div>
  )
}
