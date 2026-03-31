'use client'
import { useEffect, useState, useRef } from 'react'

interface Signal {
  wallet: string
  pseudonym: string
  side: string
  outcome: string
  usdSize: number
  title: string
  timestamp: number
  impliedProb: number
}

function formatSize(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`
  return `$${n}`
}

function timeAgo(ts: number) {
  const diff = Math.floor(Date.now() / 1000) - ts
  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  return `${Math.floor(diff / 3600)}h ago`
}

function TickerItem({ s }: { s: Signal }) {
  const isBuy = s.side === 'BUY'
  return (
    <span className="inline-flex items-center gap-1.5 px-4 shrink-0 border-r border-[#1a1a1f]">
      <span className={`text-[10px] font-bold ${isBuy ? 'text-green-400' : 'text-red-400'}`}>
        {isBuy ? '▲' : '▼'}
      </span>
      <span className="text-[10px] font-mono text-[#9999bb]">{s.pseudonym}</span>
      <span className="text-[10px] font-mono font-bold text-white">{formatSize(s.usdSize)}</span>
      <span className="text-[10px] font-mono text-[#5a5a70]">
        {s.outcome} · {s.impliedProb}%
      </span>
      <span className="text-[10px] font-mono text-[#4a4a60] max-w-[200px] truncate">
        {s.title}
      </span>
      <span className="text-[10px] font-mono text-[#3a3a50]">{timeAgo(s.timestamp)}</span>
    </span>
  )
}

export default function TerminalQuotron() {
  const [signals, setSignals] = useState<Signal[]>([])
  const [paused, setPaused] = useState(false)
  const trackRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/api/signals')
      .then(r => r.json())
      .then(d => setSignals(d.signals ?? []))
      .catch(() => {})
    const t = setInterval(() => {
      fetch('/api/signals')
        .then(r => r.json())
        .then(d => setSignals(d.signals ?? []))
        .catch(() => {})
    }, 30000)
    return () => clearInterval(t)
  }, [])

  if (signals.length === 0) return null

  // Duplicate items so the scroll loops seamlessly
  const items = [...signals, ...signals]

  return (
    <div
      className="relative flex items-center h-7 bg-[#07070b] border-b border-[#1a1a1f] overflow-hidden shrink-0 select-none"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Left fade */}
      <div className="absolute left-0 top-0 h-full w-8 z-10 pointer-events-none"
        style={{ background: 'linear-gradient(to right, #07070b, transparent)' }} />

      {/* Scrolling track */}
      <div
        ref={trackRef}
        className="flex items-center whitespace-nowrap"
        style={{
          animation: paused ? 'none' : `quotronScroll ${signals.length * 14}s linear infinite`,
        }}
      >
        {items.map((s, i) => (
          <TickerItem key={`${s.wallet}-${s.title}-${i}`} s={s} />
        ))}
      </div>

      {/* Right fade */}
      <div className="absolute right-0 top-0 h-full w-8 z-10 pointer-events-none"
        style={{ background: 'linear-gradient(to left, #07070b, transparent)' }} />

      <style>{`
        @keyframes quotronScroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  )
}
