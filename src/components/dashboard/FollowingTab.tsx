'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'

interface FollowedWallet {
  wallet: string
  created_at: string
}

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
}

function timeAgo(ts: number) {
  const diff = Math.floor(Date.now() / 1000) - ts
  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

function WalletAvatar({ name, size = 6 }: { name: string; size?: number }) {
  const colors = ['#7c3aed', '#06b6d4', '#22c55e', '#f59e0b', '#ef4444', '#ec4899']
  const color = colors[name.charCodeAt(0) % colors.length]
  return (
    <div
      className={`w-${size} h-${size} rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0`}
      style={{ background: color }}
    >
      {name[0]?.toUpperCase() ?? 'W'}
    </div>
  )
}

export default function FollowingTab() {
  const [followed, setFollowed] = useState<FollowedWallet[]>([])
  const [signals, setSignals] = useState<Signal[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/follow').then(r => r.json()),
      fetch('/api/signals').then(r => r.json()),
    ]).then(([followData, signalData]) => {
      setFollowed(Array.isArray(followData) ? followData : [])
      setSignals(signalData?.signals ?? [])
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const followedSet = useMemo(() => new Set(followed.map(f => f.wallet)), [followed])

  const followedSignals = useMemo(
    () => signals.filter(s => followedSet.has(s.wallet)).sort((a, b) => b.timestamp - a.timestamp),
    [signals, followedSet]
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-[#4a4a55] font-mono text-sm animate-pulse">
        Loading your followed wallets...
      </div>
    )
  }

  if (followed.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="text-4xl mb-4">★</div>
        <p className="text-[#e8e8f0] font-semibold mb-2">No wallets followed yet</p>
        <p className="text-[#6b6b80] text-sm max-w-sm mb-6">
          Visit a whale&apos;s profile from the Signals feed and click &quot;Follow wallet&quot; to get alerted when they trade.
        </p>
        <Link
          href="/dashboard"
          className="px-4 py-2 rounded-lg bg-[#1a1a1f] border border-[#2a2a32] text-sm text-[#9999aa] hover:text-white transition-colors"
          onClick={() => {/* handled by parent tab switch */}}
        >
          Browse signals
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">

      {/* Followed wallets list */}
      <div>
        <h3 className="font-semibold text-[#e8e8f0] mb-3">Wallets you follow ({followed.length})</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {followed.map(f => {
            const recentSignal = followedSignals.find(s => s.wallet === f.wallet)
            const pseudonym = recentSignal?.pseudonym ?? `${f.wallet.slice(0, 6)}...${f.wallet.slice(-4)}`
            return (
              <Link
                key={f.wallet}
                href={`/whale/${f.wallet}`}
                className="flex items-center gap-3 p-3 bg-[#0f0f17] border border-[#1c1c2e] rounded-xl hover:border-[#7c3aed]/40 transition-colors"
              >
                <WalletAvatar name={pseudonym} size={8} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#e8e8f0] truncate">{pseudonym}</p>
                  <p className="text-[10px] font-mono text-[#4a4a55] truncate">{f.wallet}</p>
                </div>
                {recentSignal && (
                  <span className="text-[10px] text-[#6b6b80] shrink-0">{timeAgo(recentSignal.timestamp)}</span>
                )}
              </Link>
            )
          })}
        </div>
      </div>

      {/* Recent activity from followed wallets */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <h3 className="font-semibold text-[#e8e8f0]">Recent activity</h3>
          <span className="text-[#6b6b80] text-sm">({followedSignals.length})</span>
        </div>

        {followedSignals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center bg-[#0f0f17] border border-[#1c1c2e] rounded-xl">
            <p className="text-[#4a4a55] text-sm font-mono mb-1">No recent activity</p>
            <p className="text-[#3a3a45] text-xs">Your followed wallets haven&apos;t traded in the last 7 days.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {followedSignals.map((signal, i) => (
              <div key={`${signal.wallet}-${signal.slug}-${i}`}
                className="bg-[#0f0f17] border border-violet-500/20 rounded-xl overflow-hidden hover:border-violet-500/40 transition-colors">
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-violet-500/10 text-violet-400 border border-violet-500/20">
                          ★ FOLLOWING
                        </span>
                      </div>
                      <p className="font-semibold text-white text-sm leading-snug truncate">{signal.title}</p>
                      <p className="text-[11px] text-[#6b7280] mt-0.5">{timeAgo(signal.timestamp)}</p>
                    </div>
                    <a
                      href={`https://polymarket.com/event/${signal.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 px-3 py-1.5 rounded-lg bg-[#1c1c2e] hover:bg-[#252535] text-xs text-[#9999aa] hover:text-white transition-colors border border-[#2a2a3e] whitespace-nowrap"
                    >
                      Trade ↗
                    </a>
                  </div>
                  <div className="flex items-center gap-2 mt-3 flex-wrap">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#1c1c2e] text-[#9999aa]">
                      {signal.outcome}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#7c3aed]/15 text-[#a78bfa] border border-[#7c3aed]/20">
                      ⊙ {signal.impliedProb}% implied
                    </span>
                  </div>
                </div>
                <div className="px-4 pb-4">
                  <div className="bg-[#08080f] border border-[#1c1c2e] rounded-lg p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className={`flex items-center gap-1 text-sm font-bold ${signal.side === 'BUY' ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>
                        {signal.side === 'BUY' ? '↑' : '↓'} {signal.side}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <WalletAvatar name={signal.pseudonym} />
                        <Link
                          href={`/whale/${signal.wallet}`}
                          className="text-[11px] text-[#a78bfa] hover:text-[#c4b5fd] transition-colors font-mono hover:underline underline-offset-2"
                        >
                          {signal.pseudonym}
                        </Link>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-white">
                        ${signal.usdSize.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </p>
                      <a
                        href={`https://polygonscan.com/tx/${signal.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] text-[#3a3a45] hover:text-[#7c3aed] transition-colors font-mono"
                      >
                        verify on-chain →
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
