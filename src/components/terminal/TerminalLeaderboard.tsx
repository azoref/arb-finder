'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

interface WalletRow {
  wallet: string
  pseudonym: string
  totalVolume: number
  tradeCount: number
  buyCount: number
  winRate: number | null
  winCount: number
  resolvedCount: number
  topCategory: string
}

const CAT_COLORS: Record<string, string> = {
  Politics: '#f59e0b',
  Crypto:   '#06b6d4',
  Sports:   '#22c55e',
  Other:    '#666666',
}

function fmt(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`
  return `$${n}`
}

function walletColor(name: string) {
  const palette = ['#00c805', '#06b6d4', '#f59e0b', '#ef4444', '#ec4899', '#a78bfa']
  return palette[name.charCodeAt(0) % palette.length]
}

function WinRateBadge({ rate, resolved }: { rate: number | null; resolved: number }) {
  if (rate === null) {
    return (
      <span className="text-[10px] font-mono text-[#2a2a2a] px-1.5 py-0.5 rounded border border-[#1a1a1a]">
        —%
      </span>
    )
  }
  const color = rate >= 65 ? '#00c805' : rate >= 50 ? '#f59e0b' : '#ef4444'
  return (
    <span
      className="text-[11px] font-mono font-bold px-1.5 py-0.5 rounded"
      style={{ color, background: color + '18', border: `1px solid ${color}30` }}
      title={`${rate}% win rate across ${resolved} resolved trades`}
    >
      {rate}%W
    </span>
  )
}

export default function TerminalLeaderboard() {
  const [wallets, setWallets] = useState<WalletRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/leaderboard')
      .then(r => r.json())
      .then(d => { setWallets(d.wallets ?? []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-full text-[#444444] font-mono text-xs animate-pulse bg-black">
      Loading...
    </div>
  )
  if (wallets.length === 0) return (
    <div className="flex items-center justify-center h-full text-[#444444] font-mono text-xs bg-black">
      No data
    </div>
  )

  return (
    <div className="overflow-y-auto h-full bg-black">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-1.5 border-b border-[#111111] sticky top-0 bg-black z-10">
        <span className="text-[9px] font-mono text-[#333333] w-5 shrink-0" />
        <span className="text-[9px] font-mono text-[#333333] flex-1">WALLET</span>
        <span className="text-[9px] font-mono text-[#00c805] w-10 text-center">WIN%</span>
        <span className="text-[9px] font-mono text-[#333333] w-14 text-right">VOLUME</span>
      </div>

      {wallets.map((w, i) => {
        const catColor = CAT_COLORS[w.topCategory] ?? '#666666'
        const color = walletColor(w.pseudonym)
        return (
          <Link
            key={w.wallet}
            href={`/whale/${w.wallet}`}
            className="flex items-center gap-2 px-3 py-2.5 border-b border-[#0d0d0d] hover:bg-[#0f0f0f] transition-colors group"
          >
            {/* Rank */}
            <span className="text-[10px] font-mono text-[#333333] w-5 shrink-0 text-center">
              {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`}
            </span>

            {/* Avatar */}
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-black shrink-0"
              style={{ background: color }}
            >
              {w.pseudonym[0]?.toUpperCase()}
            </div>

            {/* Name + meta */}
            <div className="flex-1 min-w-0">
              <p className="text-[12px] text-[#cccccc] truncate group-hover:text-white transition-colors font-medium leading-tight">
                {w.pseudonym}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span
                  className="text-[9px] font-mono px-1 py-px rounded"
                  style={{ color: catColor, background: catColor + '18' }}
                >
                  {(w.topCategory || 'Other').toUpperCase().slice(0, 3)}
                </span>
                <span className="text-[9px] font-mono text-[#3a3a3a]">{w.tradeCount} trades</span>
                {w.resolvedCount > 0 && (
                  <span className="text-[9px] font-mono text-[#2a2a2a]">{w.resolvedCount} resolved</span>
                )}
              </div>
            </div>

            {/* Win rate — hero number */}
            <WinRateBadge rate={w.winRate} resolved={w.resolvedCount} />

            {/* Volume */}
            <span className="text-[11px] font-mono font-bold text-[#555555] shrink-0 w-14 text-right">
              {fmt(w.totalVolume)}
            </span>
          </Link>
        )
      })}
    </div>
  )
}
