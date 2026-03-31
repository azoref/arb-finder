'use client'

import { useState, useEffect } from 'react'
import TerminalSignals from './TerminalSignals'
import TerminalHotMarkets from './TerminalHotMarkets'
import TerminalLeaderboard from './TerminalLeaderboard'
import TerminalFollowing from './TerminalFollowing'

type PaneType = 'signals' | 'movers' | 'leaderboard' | 'following'

interface PaneConfig {
  id: PaneType
  label: string
  icon: string
}

const PANES: PaneConfig[] = [
  { id: 'signals',     label: 'Signals',     icon: '🐋' },
  { id: 'movers',      label: 'Hot Markets', icon: '🔥' },
  { id: 'leaderboard', label: 'Leaderboard', icon: '🏆' },
  { id: 'following',   label: 'Following',   icon: '★'  },
]

const DEFAULT_LAYOUT: [PaneType, PaneType, PaneType, PaneType] = ['signals', 'movers', 'leaderboard', 'following']

function PaneHeader({ type, onChange }: { type: PaneType; onChange: (t: PaneType) => void }) {
  const current = PANES.find(p => p.id === type)!
  return (
    <div className="flex items-center justify-between px-3 py-1.5 border-b border-[#1a1a1f] bg-[#0a0a0d] shrink-0">
      <div className="flex items-center gap-1.5">
        <span className="text-[10px]">{current.icon}</span>
        <span className="text-[10px] font-mono font-semibold text-[#a78bfa] uppercase tracking-widest">{current.label}</span>
      </div>
      <select
        value={type}
        onChange={e => onChange(e.target.value as PaneType)}
        className="text-[9px] font-mono bg-[#111114] border border-[#2a2a32] text-[#6b6b80] rounded px-1 py-0.5 focus:outline-none focus:border-[#7c3aed]/50 cursor-pointer"
      >
        {PANES.map(p => (
          <option key={p.id} value={p.id}>{p.icon} {p.label}</option>
        ))}
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
  const [layout, setLayout] = useState<[PaneType, PaneType, PaneType, PaneType]>(DEFAULT_LAYOUT)
  const [followedWallets, setFollowedWallets] = useState<Set<string>>(new Set())
  const [now, setNow] = useState('')

  useEffect(() => {
    setNow(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
    const t = setInterval(() => setNow(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })), 1000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    if (!isPremium) return
    fetch('/api/follow').then(r => r.json()).then(d => {
      if (Array.isArray(d)) setFollowedWallets(new Set(d.map((f: { wallet: string }) => f.wallet)))
    }).catch(() => {})
  }, [isPremium])

  function setPane(index: number, type: PaneType) {
    setLayout(prev => {
      const next = [...prev] as [PaneType, PaneType, PaneType, PaneType]
      next[index] = type
      return next
    })
  }

  return (
    <div className="flex flex-col h-[calc(100vh-56px)]">
      {/* Terminal top bar */}
      <div className="flex items-center gap-3 px-4 py-1.5 bg-[#080810] border-b border-[#1a1a1f] shrink-0">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          <span className="text-[9px] font-mono text-green-400">LIVE</span>
        </div>
        <span className="text-[9px] font-mono text-[#3a3a45]">POLYMARKET · $10K+ · ON-CHAIN</span>
        <span className="ml-auto text-[9px] font-mono text-[#3a3a45]">{now}</span>
        {!isLoggedIn && (
          <a href="/auth/signup" className="text-[9px] font-mono px-2 py-0.5 rounded bg-green-600 hover:bg-green-500 text-white transition-colors">Sign up free</a>
        )}
      </div>

      {/* 2x2 grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 grid-rows-2 flex-1 min-h-0 divide-y divide-[#1a1a1f] sm:divide-y-0">
        {layout.map((type, i) => (
          <div key={i} className={`flex flex-col min-h-0 border-[#1a1a1f] ${i % 2 === 0 ? 'sm:border-r' : ''} ${i < 2 ? 'sm:border-b' : ''} border`}>
            <PaneHeader type={type} onChange={t => setPane(i, t)} />
            <div className="flex-1 min-h-0 overflow-hidden">
              <PaneContent type={type} isPremium={isPremium} followedWallets={followedWallets} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
