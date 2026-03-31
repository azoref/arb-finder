'use client'

import { useState, useEffect } from 'react'
import TerminalSignals from './TerminalSignals'
import TerminalHotMarkets from './TerminalHotMarkets'
import TerminalLeaderboard from './TerminalLeaderboard'
import TerminalFollowing from './TerminalFollowing'

type PaneType = 'signals' | 'movers' | 'leaderboard' | 'following'

const PANES = [
  { id: 'signals'     as PaneType, label: 'Signals',     icon: '🐋' },
  { id: 'movers'      as PaneType, label: 'Hot Markets', icon: '🔥' },
  { id: 'leaderboard' as PaneType, label: 'Leaderboard', icon: '🏆' },
  { id: 'following'   as PaneType, label: 'Following',   icon: '★'  },
]

function PaneHeader({ type, onChange, accent }: { type: PaneType; onChange: (t: PaneType) => void; accent?: boolean }) {
  const current = PANES.find(p => p.id === type)!
  return (
    <div className="flex items-center justify-between px-3 py-2 border-b border-[#1a1a1f] bg-[#09090d] shrink-0">
      <div className="flex items-center gap-2">
        <span className="text-sm">{current.icon}</span>
        <span className={`text-xs font-mono font-bold uppercase tracking-widest ${accent ? 'text-green-400' : 'text-[#7c7c9a]'}`}>{current.label}</span>
      </div>
      <select
        value={type}
        onChange={e => onChange(e.target.value as PaneType)}
        className="text-[10px] font-mono bg-[#111118] border border-[#2a2a32] text-[#6b6b80] rounded px-1.5 py-0.5 focus:outline-none focus:border-[#7c3aed]/50 cursor-pointer"
      >
        {PANES.map(p => <option key={p.id} value={p.id}>{p.icon} {p.label}</option>)}
      </select>
    </div>
  )
}

function PaneContent({ type, isPremium, followedWallets }: { type: PaneType; isPremium: boolean; followedWallets: Set<string> }) {
  switch (type) {
    case 'signals':     return <TerminalSignals isPremium={isPremium} followedWallets={followedWallets} />
    case 'movers':      return <TerminalHotMarkets />
    case 'leaderboard': return <TerminalLeaderboard />
    case 'following':   return <TerminalFollowing isPremium={isPremium} />
  }
}

export default function TerminalDashboard({ isPremium, isLoggedIn }: { isPremium: boolean; isLoggedIn: boolean }) {
  const [leftPane, setLeftPane]     = useState<PaneType>('signals')
  const [rightTop, setRightTop]     = useState<PaneType>('movers')
  const [rightBottom, setRightBottom] = useState<PaneType>('leaderboard')
  const [followedWallets, setFollowedWallets] = useState<Set<string>>(new Set())
  const [now, setNow] = useState('')

  useEffect(() => {
    const tick = () => setNow(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
    tick()
    const t = setInterval(tick, 1000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    if (!isPremium) return
    fetch('/api/follow').then(r => r.json()).then(d => {
      if (Array.isArray(d)) setFollowedWallets(new Set(d.map((f: { wallet: string }) => f.wallet)))
    }).catch(() => {})
  }, [isPremium])

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 56px)' }}>

      {/* Terminal status bar */}
      <div className="flex items-center gap-3 px-4 py-1.5 bg-[#06060a] border-b border-[#1a1a1f] shrink-0">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          <span className="text-[10px] font-mono text-green-400 font-semibold">LIVE</span>
        </div>
        <span className="text-[10px] font-mono text-[#2a2a3e]">·</span>
        <span className="text-[10px] font-mono text-[#4a4a55]">POLYMARKET</span>
        <span className="text-[10px] font-mono text-[#2a2a3e]">·</span>
        <span className="text-[10px] font-mono text-[#4a4a55]">$10K+ THRESHOLD</span>
        <span className="text-[10px] font-mono text-[#2a2a3e]">·</span>
        <span className="text-[10px] font-mono text-[#4a4a55]">ON-CHAIN VERIFIED</span>
        <div className="ml-auto flex items-center gap-3">
          <span className="text-[10px] font-mono text-[#3a3a45] tabular-nums">{now}</span>
          {!isLoggedIn && (
            <a href="/auth/signup" className="text-[10px] font-mono px-2.5 py-1 rounded bg-green-600 hover:bg-green-500 text-white font-semibold transition-colors">
              Sign up free
            </a>
          )}
        </div>
      </div>

      {/* Main layout: left (signals) + right (movers + leaderboard) */}
      <div className="flex flex-1 min-h-0">

        {/* Left: main signals pane — 60% */}
        <div className="flex flex-col border-r border-[#1a1a1f]" style={{ width: '60%' }}>
          <PaneHeader type={leftPane} onChange={setLeftPane} accent />
          <div className="flex-1 min-h-0 overflow-hidden">
            <PaneContent type={leftPane} isPremium={isPremium} followedWallets={followedWallets} />
          </div>
        </div>

        {/* Right: two stacked panes — 40% */}
        <div className="flex flex-col" style={{ width: '40%' }}>
          {/* Top right */}
          <div className="flex flex-col border-b border-[#1a1a1f]" style={{ height: '50%' }}>
            <PaneHeader type={rightTop} onChange={setRightTop} />
            <div className="flex-1 min-h-0 overflow-hidden">
              <PaneContent type={rightTop} isPremium={isPremium} followedWallets={followedWallets} />
            </div>
          </div>
          {/* Bottom right */}
          <div className="flex flex-col" style={{ height: '50%' }}>
            <PaneHeader type={rightBottom} onChange={setRightBottom} />
            <div className="flex-1 min-h-0 overflow-hidden">
              <PaneContent type={rightBottom} isPremium={isPremium} followedWallets={followedWallets} />
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
