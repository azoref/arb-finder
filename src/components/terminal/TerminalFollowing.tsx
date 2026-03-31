'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Signal {
  wallet: string
  pseudonym: string
  side: string
  usdSize: number
  title: string
  slug: string
  timestamp: number
  strengthScore: number | null
}

interface Follow { wallet: string; pseudonym?: string }

function timeAgo(ts: number) {
  const diff = Math.floor(Date.now() / 1000) - ts
  if (diff < 60) return `${diff}s`
  if (diff < 3600) return `${Math.floor(diff / 60)}m`
  return `${Math.floor(diff / 3600)}h`
}

export default function TerminalFollowing({ isPremium }: { isPremium?: boolean }) {
  const [signals, setSignals] = useState<Signal[]>([])
  const [followed, setFollowed] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isPremium) { setLoading(false); return }
    Promise.all([
      fetch('/api/follow').then(r => r.json()),
      fetch('/api/signals').then(r => r.json()),
    ]).then(([follows, data]) => {
      const wallets = new Set<string>((Array.isArray(follows) ? follows : []).map((f: Follow) => f.wallet))
      setFollowed(wallets)
      const filtered = (data.signals ?? []).filter((s: Signal) => wallets.has(s.wallet))
      setSignals(filtered)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [isPremium])

  if (!isPremium) return (
    <div className="flex flex-col items-center justify-center h-full gap-3 px-4 text-center bg-black">
      <span className="text-2xl">★</span>
      <p className="text-[11px] text-[#555555]">Follow whale wallets and get alerts when they trade.</p>
      <Link href="/pricing" className="text-[10px] px-3 py-1.5 rounded bg-[#00c805] hover:bg-[#00e006] text-black font-bold transition-colors">Upgrade to Pro</Link>
    </div>
  )

  if (loading) return <div className="flex items-center justify-center h-full text-[#444444] font-mono text-xs animate-pulse bg-black">Loading...</div>

  if (followed.size === 0) return (
    <div className="flex flex-col items-center justify-center h-full gap-2 px-4 text-center bg-black">
      <p className="text-[11px] text-[#555555]">You are not following any wallets yet.</p>
      <Link href="/leaderboard" className="text-[10px] text-[#00c805] hover:underline">Browse leaderboard →</Link>
    </div>
  )

  if (signals.length === 0) return (
    <div className="flex flex-col items-center justify-center h-full gap-2 px-4 text-center bg-black">
      <p className="text-[11px] text-[#555555]">No recent signals from your {followed.size} followed wallet{followed.size !== 1 ? 's' : ''}.</p>
    </div>
  )

  return (
    <div className="overflow-y-auto h-full divide-y divide-[#111111] bg-black">
      {signals.map((s, i) => {
        const isBuy = s.side === 'BUY'
        return (
          <div key={`${s.wallet}-${i}`} className="px-3 py-2.5 hover:bg-[#0f0f0f] transition-colors border-l-2 border-[#00c805]/40">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className={`text-[10px] font-bold ${isBuy ? 'text-[#00c805]' : 'text-red-400'}`}>{isBuy ? '▲' : '▼'}</span>
              {s.strengthScore != null && (
                <span className={`text-[10px] font-mono ${s.strengthScore >= 8 ? 'text-[#00c805]' : s.strengthScore >= 5 ? 'text-amber-400' : 'text-[#444444]'}`}>⚡{s.strengthScore}</span>
              )}
              <span className="text-[10px] font-mono text-[#333333] ml-auto">{timeAgo(s.timestamp)}</span>
            </div>
            <p className="text-[12px] text-[#cccccc] leading-snug truncate font-medium">{s.title}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <Link href={`/whale/${s.wallet}`} className="text-[10px] font-mono text-[#00c805] hover:text-[#00e006] transition-colors truncate">{s.pseudonym}</Link>
              <span className="text-[10px] font-mono font-bold text-white ml-auto shrink-0">${(s.usdSize / 1000).toFixed(0)}K</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
