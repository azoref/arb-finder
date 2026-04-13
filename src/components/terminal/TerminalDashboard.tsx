'use client'

import { useState, useEffect, useRef } from 'react'
import TerminalSignals from './TerminalSignals'
import TerminalHotMarkets from './TerminalHotMarkets'
import TerminalLeaderboard from './TerminalLeaderboard'
import TerminalFollowing from './TerminalFollowing'
import TerminalQuotron from './TerminalQuotron'
import TerminalNews from './TerminalNews'

type PaneType = 'signals' | 'movers' | 'leaderboard' | 'following' | 'news'

const PANES = [
  { id: 'signals'     as PaneType, label: 'Signals',     icon: '🐋' },
  { id: 'movers'      as PaneType, label: 'Hot Markets', icon: '🔥' },
  { id: 'leaderboard' as PaneType, label: 'Leaderboard', icon: '🏆' },
  { id: 'news'        as PaneType, label: 'News',         icon: '📰' },
  { id: 'following'   as PaneType, label: 'Following',   icon: '★'  },
]

function PaneHeader({ type, onChange, accent }: { type: PaneType; onChange: (t: PaneType) => void; accent?: boolean }) {
  const current = PANES.find(p => p.id === type)!
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div className="flex items-center justify-between px-3 py-2 border-b border-[#1f1f1f] bg-[#0a0a0a] shrink-0">
      <div className="flex items-center gap-2">
        <span className="text-sm">{current.icon}</span>
        <span className={`text-xs font-mono font-bold uppercase tracking-widest ${accent ? 'text-[#00c805]' : 'text-[#666666]'}`}>{current.label}</span>
      </div>

      {/* Custom dropdown */}
      <div ref={ref} className="relative">
        <button
          onClick={() => setOpen(o => !o)}
          className="flex items-center gap-1.5 text-[10px] font-mono text-[#444444] hover:text-[#888888] px-2 py-1 rounded border border-[#222222] hover:border-[#333333] bg-[#111111] transition-colors"
        >
          <span>{current.icon} {current.label}</span>
          <span className={`transition-transform text-[8px] ${open ? 'rotate-180' : ''}`}>▼</span>
        </button>
        {open && (
          <div className="absolute right-0 top-full mt-1 w-36 rounded-lg border border-[#222222] bg-[#111111] shadow-xl z-50 overflow-hidden">
            {PANES.map(p => (
              <button
                key={p.id}
                onClick={() => { onChange(p.id); setOpen(false) }}
                className={`w-full flex items-center gap-2 px-3 py-2 text-[11px] font-mono transition-colors text-left ${
                  p.id === type
                    ? 'bg-[#1a1a1a] text-white'
                    : 'text-[#666666] hover:bg-[#1a1a1a] hover:text-[#cccccc]'
                }`}
              >
                <span>{p.icon}</span>
                <span>{p.label}</span>
                {p.id === type && <span className="ml-auto text-[#00c805] text-[8px]">●</span>}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function PaneContent({ type, isPremium, followedWallets }: { type: PaneType; isPremium: boolean; followedWallets: Set<string> }) {
  switch (type) {
    case 'signals':     return <TerminalSignals isPremium={isPremium} followedWallets={followedWallets} />
    case 'movers':      return <TerminalHotMarkets />
    case 'leaderboard': return <TerminalLeaderboard />
    case 'news':        return <TerminalNews />
    case 'following':   return <TerminalFollowing isPremium={isPremium} />
  }
}

export default function TerminalDashboard({ isPremium, isLoggedIn }: { isPremium: boolean; isLoggedIn: boolean }) {
  const [leftPane, setLeftPane]       = useState<PaneType>('signals')
  const [rightTop, setRightTop]       = useState<PaneType>('news')
  const [rightBottom, setRightBottom] = useState<PaneType>('leaderboard')
  const [mobileTab, setMobileTab]     = useState<PaneType>('signals')
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
    <div className="flex flex-col bg-black" style={{ height: 'calc(100vh - 56px)' }}>

      {/* Status bar */}
      <div className="flex items-center gap-2 md:gap-3 px-3 md:px-4 py-1.5 bg-black border-b border-[#1f1f1f] shrink-0">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00c805] animate-pulse" />
          <span className="text-[10px] font-mono text-[#00c805] font-semibold">LIVE</span>
        </div>
        <span className="text-[10px] font-mono text-[#2a2a2a]">·</span>
        <span className="text-[10px] font-mono text-[#444444]">POLYMARKET</span>
        <span className="hidden md:inline text-[10px] font-mono text-[#2a2a2a]">·</span>
        <span className="hidden md:inline text-[10px] font-mono text-[#444444]">$10K+ THRESHOLD</span>
        <span className="hidden md:inline text-[10px] font-mono text-[#2a2a2a]">·</span>
        <span className="hidden md:inline text-[10px] font-mono text-[#444444]">ON-CHAIN VERIFIED</span>
        <div className="ml-auto flex items-center gap-2 md:gap-3">
          <span className="hidden md:inline text-[10px] font-mono text-[#333333] tabular-nums">{now}</span>
          {!isLoggedIn && (
            <a href="/auth/signup" className="text-[10px] font-mono px-2.5 py-1 rounded bg-[#00c805] hover:bg-[#00e006] text-black font-bold transition-colors whitespace-nowrap">
              Sign up free
            </a>
          )}
        </div>
      </div>

      {/* Quotron ticker */}
      <TerminalQuotron />

      {/* ── DESKTOP: 60/40 split ── */}
      <div className="hidden md:flex flex-1 min-h-0">

        {/* Left 60%: main signals pane */}
        <div className="flex flex-col border-r border-[#1f1f1f]" style={{ width: '60%' }}>
          <PaneHeader type={leftPane} onChange={setLeftPane} accent />
          <div className="flex-1 min-h-0 overflow-hidden">
            <PaneContent type={leftPane} isPremium={isPremium} followedWallets={followedWallets} />
          </div>
        </div>

        {/* Right 40%: two stacked panes */}
        <div className="flex flex-col" style={{ width: '40%' }}>
          <div className="flex flex-col border-b border-[#1f1f1f]" style={{ height: '50%' }}>
            <PaneHeader type={rightTop} onChange={setRightTop} />
            <div className="flex-1 min-h-0 overflow-hidden">
              <PaneContent type={rightTop} isPremium={isPremium} followedWallets={followedWallets} />
            </div>
          </div>
          <div className="flex flex-col" style={{ height: '50%' }}>
            <PaneHeader type={rightBottom} onChange={setRightBottom} />
            <div className="flex-1 min-h-0 overflow-hidden">
              <PaneContent type={rightBottom} isPremium={isPremium} followedWallets={followedWallets} />
            </div>
          </div>
        </div>

      </div>

      {/* ── MOBILE: full-width tabbed panes ── */}
      <div className="flex md:hidden flex-col flex-1 min-h-0">

        {/* Tab bar */}
        <div className="flex border-b border-[#1f1f1f] bg-[#0a0a0a] shrink-0">
          {PANES.map(p => {
            const active = mobileTab === p.id
            return (
              <button
                key={p.id}
                onClick={() => setMobileTab(p.id)}
                className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 text-[9px] font-mono font-bold uppercase tracking-widest transition-colors border-b-2 ${
                  active
                    ? 'text-[#00c805] border-[#00c805]'
                    : 'text-[#444444] border-transparent hover:text-[#888888]'
                }`}
              >
                <span className="text-base leading-none">{p.icon}</span>
                <span>{p.label}</span>
              </button>
            )
          })}
        </div>

        {/* Active pane — full width, full height */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <PaneContent type={mobileTab} isPremium={isPremium} followedWallets={followedWallets} />
        </div>

      </div>
    </div>
  )
}
