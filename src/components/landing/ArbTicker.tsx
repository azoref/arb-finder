'use client'

import { useEffect, useState } from 'react'

interface TickerTrade {
  tx_hash: string
  pseudonym: string
  side: 'BUY' | 'SELL'
  outcome: string
  price: number
  usd_size: number
  title: string
  traded_at: string
}

function timeAgo(iso: string) {
  const secs = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (secs < 60) return `${secs}s ago`
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`
  return `${Math.floor(secs / 3600)}h ago`
}

function fmtSize(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `$${Math.round(n / 1_000)}K`
  return `$${Math.round(n)}`
}

// Fallback demo data when whale_signals table is still empty
const DEMO: TickerTrade[] = [
  { tx_hash: 'd1', pseudonym: 'CryptoKing', side: 'BUY', outcome: 'Yes', price: 0.61, usd_size: 42000, title: 'Will the Republicans win the House in 2026?', traded_at: new Date(Date.now() - 180000).toISOString() },
  { tx_hash: 'd2', pseudonym: 'SharpMoney7', side: 'SELL', outcome: 'No', price: 0.38, usd_size: 28500, title: 'Will Bitcoin hit $150K before July 2026?', traded_at: new Date(Date.now() - 420000).toISOString() },
  { tx_hash: 'd3', pseudonym: 'WhalePunter', side: 'BUY', outcome: 'Yes', price: 0.54, usd_size: 19000, title: 'Will the Chiefs win Super Bowl LX?', traded_at: new Date(Date.now() - 600000).toISOString() },
  { tx_hash: 'd4', pseudonym: 'EdgeHunter', side: 'BUY', outcome: 'Yes', price: 0.72, usd_size: 55000, title: 'Will the Fed cut rates in May 2026?', traded_at: new Date(Date.now() - 900000).toISOString() },
  { tx_hash: 'd5', pseudonym: 'PolyShark', side: 'SELL', outcome: 'No', price: 0.41, usd_size: 31000, title: 'Will Ethereum flip Bitcoin by market cap in 2026?', traded_at: new Date(Date.now() - 1200000).toISOString() },
  { tx_hash: 'd6', pseudonym: 'MarketMaker9', side: 'BUY', outcome: 'Yes', price: 0.58, usd_size: 22000, title: 'Will Celtics win the 2026 NBA Finals?', traded_at: new Date(Date.now() - 1500000).toISOString() },
]

export default function ArbTicker() {
  const [trades, setTrades] = useState<TickerTrade[]>([])
  const [isDemo, setIsDemo] = useState(false)

  useEffect(() => {
    fetch('/api/ticker')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data) && data.length >= 3) {
          setTrades(data)
          setIsDemo(false)
        } else {
          setTrades(DEMO)
          setIsDemo(true)
        }
      })
      .catch(() => { setTrades(DEMO); setIsDemo(true) })
  }, [])

  const display = trades.length > 0 ? [...trades, ...trades] : []

  if (display.length === 0) return null

  return (
    <div className="relative overflow-hidden border-y border-[#1e1e24] bg-[#080808] py-2.5 pointer-events-none select-none">
      {/* Fades */}
      <div className="absolute left-0 top-0 bottom-0 w-20 z-10 bg-gradient-to-r from-[#080808] to-transparent pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-20 z-10 bg-gradient-to-l from-[#080808] to-transparent pointer-events-none" />

      <div
        className="arb-ticker-track flex gap-4 animate-ticker"
        style={{ width: 'max-content', animationPlayState: 'running' }}
      >
        {display.map((t, i) => (
          <div
            key={`${t.tx_hash}-${i}`}
            className="flex items-center gap-2 px-4 py-1.5 rounded border border-[#1a1a1f] bg-[#0d0d10] shrink-0 font-mono text-xs"
          >
            {/* Whale dot */}
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${t.side === 'BUY' ? 'bg-green-500' : 'bg-red-500'}`} />

            {/* Side */}
            <span className={`font-bold text-[11px] ${t.side === 'BUY' ? 'text-green-400' : 'text-red-400'}`}>
              {t.side === 'BUY' ? '↑' : '↓'} {t.side}
            </span>

            <span className="text-[#2a2a32]">·</span>

            {/* Pseudonym */}
            <span className="text-[#7c3aed] text-[10px]">{t.pseudonym}</span>

            <span className="text-[#2a2a32]">·</span>

            {/* Market title — truncated */}
            <span className="text-[#6b6b80] max-w-[220px] truncate">{t.title}</span>

            <span className="text-[#2a2a32]">·</span>

            {/* Outcome */}
            <span className="text-[10px] text-[#4a4a55] uppercase tracking-widest">OUTCOME</span>
            <span className="text-[#9999aa]">{t.outcome}</span>

            <span className="text-[#2a2a32]">·</span>

            {/* Implied prob */}
            <span className="text-[10px] text-[#4a4a55] uppercase tracking-widest">POLY</span>
            <span className="text-white font-semibold">{Math.round(t.price * 100)}%</span>

            <span className="text-[#2a2a32]">·</span>

            {/* Size */}
            <span className="text-[10px] text-[#4a4a55] uppercase tracking-widest">SIZE</span>
            <span className={`font-bold ${t.side === 'BUY' ? 'text-green-400' : 'text-red-400'}`}>
              {fmtSize(t.usd_size)}
            </span>

            <span className="text-[#2a2a32]">·</span>

            <span className="text-[#3a3a45]">{timeAgo(t.traded_at)}</span>
          </div>
        ))}
      </div>

      {isDemo && (
        <div className="absolute bottom-1 right-4 text-[9px] text-[#2a2a32] font-mono">DEMO DATA</div>
      )}

      <style jsx>{`
        @keyframes ticker {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-ticker {
          animation: ticker 140s linear infinite;
        }
        .arb-ticker-track,
        .arb-ticker-track:hover,
        .arb-ticker-track *,
        .arb-ticker-track *:hover {
          animation-play-state: running !important;
        }
      `}</style>
    </div>
  )
}
