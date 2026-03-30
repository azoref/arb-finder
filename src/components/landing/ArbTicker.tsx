'use client'

import { useEffect, useState, useRef } from 'react'

interface ArbEntry {
  id: string
  event_name: string
  market: string
  book_a: string
  book_b: string
  odds_a: number
  odds_b: number
  profit_margin: number
  created_at: string
}

const MARKET_SHORT: Record<string, string> = {
  h2h: 'ML',
  spreads: 'SPR',
  totals: 'TOT',
}

function fmt(odds: number) {
  return `${odds > 0 ? '+' : ''}${odds}`
}

function timeAgo(iso: string) {
  const secs = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (secs < 60) return `${secs}s ago`
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`
  return `${Math.floor(secs / 3600)}h ago`
}

// Fallback demo data when no real arbs exist yet
const DEMO: ArbEntry[] = [
  { id: 'd1', event_name: 'Boston Celtics vs Miami Heat', market: 'h2h', book_a: 'DraftKings', book_b: 'FanDuel', odds_a: +105, odds_b: -102, profit_margin: 1.4, created_at: new Date(Date.now() - 120000).toISOString() },
  { id: 'd2', event_name: 'Lakers vs Nuggets', market: 'spreads', book_a: 'BetMGM', book_b: 'Caesars', odds_a: -108, odds_b: -106, profit_margin: 0.9, created_at: new Date(Date.now() - 340000).toISOString() },
  { id: 'd3', event_name: 'Bucks vs 76ers', market: 'totals', book_a: 'DraftKings', book_b: 'PointsBet', odds_a: +102, odds_b: -100, profit_margin: 1.1, created_at: new Date(Date.now() - 510000).toISOString() },
  { id: 'd4', event_name: 'Warriors vs Suns', market: 'h2h', book_a: 'FanDuel', book_b: 'BetMGM', odds_a: +112, odds_b: -105, profit_margin: 1.7, created_at: new Date(Date.now() - 720000).toISOString() },
  { id: 'd5', event_name: 'Clippers vs Mavericks', market: 'spreads', book_a: 'Caesars', book_b: 'DraftKings', odds_a: -110, odds_b: -104, profit_margin: 0.6, created_at: new Date(Date.now() - 900000).toISOString() },
]

export default function ArbTicker() {
  const [entries, setEntries] = useState<ArbEntry[]>([])
  const [isDemo, setIsDemo] = useState(false)
  const trackRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/api/arbs/recent')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setEntries(data)
          setIsDemo(false)
        } else {
          setEntries(DEMO)
          setIsDemo(true)
        }
      })
      .catch(() => { setEntries(DEMO); setIsDemo(true) })
  }, [])

  const display = entries.length > 0 ? [...entries, ...entries] : []

  if (display.length === 0) return null

  return (
    <div className="relative overflow-hidden border-y border-[#1e1e24] bg-[#080808] py-3 group">
      {/* Left fade */}
      <div className="absolute left-0 top-0 bottom-0 w-16 z-10 bg-gradient-to-r from-[#080808] to-transparent pointer-events-none" />
      {/* Right fade */}
      <div className="absolute right-0 top-0 bottom-0 w-16 z-10 bg-gradient-to-l from-[#080808] to-transparent pointer-events-none" />

      <div
        ref={trackRef}
        className="flex gap-6 animate-ticker group-hover:[animation-play-state:paused]"
        style={{ width: 'max-content' }}
      >
        {display.map((arb, i) => (
          <div
            key={`${arb.id}-${i}`}
            className="flex items-center gap-2.5 px-4 py-1.5 rounded border border-[#1a1a1f] bg-[#0d0d10] shrink-0 font-mono text-xs"
          >
            {/* Event */}
            <span className="text-[#4a4a55] text-[9px] uppercase tracking-widest">EVENT</span>
            <span className="text-[#9999aa]">{arb.event_name}</span>

            <span className="text-[#2a2a32]">·</span>

            {/* Market */}
            <span className="text-[#4a4a55] text-[9px] uppercase tracking-widest">MKT</span>
            <span className="text-[#6b6b80] uppercase">{MARKET_SHORT[arb.market] ?? arb.market}</span>

            <span className="text-[#2a2a32]">·</span>

            {/* BID */}
            <span className="text-[#4a4a55] text-[9px] uppercase tracking-widest">BID</span>
            <span className="text-[#6b6b80]">{arb.book_a}</span>
            <span className="text-green-400 font-semibold">{fmt(arb.odds_a)}</span>

            <span className="text-[#2a2a32]">·</span>

            {/* ASK */}
            <span className="text-[#4a4a55] text-[9px] uppercase tracking-widest">ASK</span>
            <span className="text-[#6b6b80]">{arb.book_b}</span>
            <span className="text-green-400 font-semibold">{fmt(arb.odds_b)}</span>

            <span className="text-[#2a2a32]">·</span>

            {/* Margin */}
            <span className="text-[#4a4a55] text-[9px] uppercase tracking-widest">MARGIN</span>
            <span className="text-green-400 font-bold">+{arb.profit_margin.toFixed(2)}%</span>

            <span className="text-[#2a2a32]">·</span>

            <span className="text-[#3a3a45]">{timeAgo(arb.created_at)}</span>
          </div>
        ))}
      </div>

      {isDemo && (
        <div className="absolute bottom-1 right-4 text-[9px] text-[#2a2a32] font-mono">DEMO DATA</div>
      )}

      <style jsx>{`
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-ticker {
          animation: ticker 90s linear infinite;
        }
      `}</style>
    </div>
  )
}
