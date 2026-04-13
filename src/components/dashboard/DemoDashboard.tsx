'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'

const now = Math.floor(Date.now() / 1000)

const DEMO_SIGNALS = [
  { pseudonym: 'CryptoKing',  side: 'BUY',  outcome: 'Yes', usdSize: 42000, title: 'Will Republicans win the House in 2026?',          slug: 'republicans-win-house-2026',    timestamp: now - 180,  impliedProb: 67, strengthScore: 9, category: 'POL', catColor: '#f59e0b' },
  { pseudonym: 'SharpMoney7', side: 'SELL', outcome: 'No',  usdSize: 28500, title: 'Will Bitcoin hit $150K before July 2026?',          slug: 'bitcoin-150k-july-2026',        timestamp: now - 420,  impliedProb: 34, strengthScore: 6, category: 'CRY', catColor: '#06b6d4' },
  { pseudonym: 'EdgeHunter',  side: 'BUY',  outcome: 'Yes', usdSize: 55000, title: 'Will the Fed cut rates in May 2026?',               slug: 'fed-rate-cut-may-2026',         timestamp: now - 900,  impliedProb: 72, strengthScore: 9, category: 'POL', catColor: '#f59e0b' },
  { pseudonym: 'WhalePunter', side: 'BUY',  outcome: 'Yes', usdSize: 19000, title: 'Will the Celtics win the 2026 NBA Finals?',         slug: 'celtics-win-nba-finals-2026',   timestamp: now - 1800, impliedProb: 58, strengthScore: 4, category: 'SPT', catColor: '#22c55e' },
  { pseudonym: 'PolyShark',   side: 'SELL', outcome: 'No',  usdSize: 31000, title: 'Will Ethereum flip Bitcoin by market cap in 2026?', slug: 'ethereum-flip-bitcoin-2026',    timestamp: now - 3600, impliedProb: 41, strengthScore: 8, category: 'CRY', catColor: '#06b6d4' },
  { pseudonym: 'AlphaFlow',   side: 'BUY',  outcome: 'Yes', usdSize: 22000, title: 'Will Trump sign a crypto reserve bill in 2026?',    slug: 'trump-crypto-reserve-2026',     timestamp: now - 5400, impliedProb: 63, strengthScore: 5, category: 'POL', catColor: '#f59e0b' },
  { pseudonym: 'DeepLiquid',  side: 'BUY',  outcome: 'Yes', usdSize: 12500, title: 'Will the US enter a recession in 2026?',            slug: 'us-recession-2026',             timestamp: now - 9000, impliedProb: 55, strengthScore: 3, category: 'OTH', catColor: '#666666' },
]

const DEMO_HOT_MARKETS = [
  { rank: 1, title: 'Will Republicans win the House in 2026?',          vol: '$124K', buyPct: 72, cat: 'POL', catColor: '#f59e0b' },
  { rank: 2, title: 'Will Bitcoin hit $150K before July 2026?',         vol: '$98K',  buyPct: 34, cat: 'CRY', catColor: '#06b6d4' },
  { rank: 3, title: 'Will the Fed cut rates in May 2026?',              vol: '$87K',  buyPct: 68, cat: 'POL', catColor: '#f59e0b' },
  { rank: 4, title: 'Will the Celtics win the 2026 NBA Finals?',        vol: '$61K',  buyPct: 55, cat: 'SPT', catColor: '#22c55e' },
  { rank: 5, title: 'Will Ethereum flip Bitcoin by market cap in 2026?',vol: '$44K',  buyPct: 29, cat: 'CRY', catColor: '#06b6d4' },
]

const DEMO_LEADERBOARD = [
  { rank: '🥇', name: 'CryptoKing',  vol: '$4.2M', trades: 38, buyPct: 74, cat: 'POL', catColor: '#f59e0b', initial: 'C', color: '#00c805' },
  { rank: '🥈', name: 'EdgeHunter',  vol: '$2.8M', trades: 24, buyPct: 68, cat: 'CRY', catColor: '#06b6d4', initial: 'E', color: '#06b6d4' },
  { rank: '🥉', name: 'SharpMoney7', vol: '$1.9M', trades: 19, buyPct: 45, cat: 'SPT', catColor: '#22c55e', initial: 'S', color: '#f59e0b' },
  { rank: '4',  name: 'WhalePunter', vol: '$1.1M', trades: 15, buyPct: 60, cat: 'POL', catColor: '#f59e0b', initial: 'W', color: '#ef4444' },
  { rank: '5',  name: 'PolyShark',   vol: '$890K', trades: 12, buyPct: 33, cat: 'CRY', catColor: '#06b6d4', initial: 'P', color: '#ec4899' },
]

type CategoryFilter = 'all' | 'POL' | 'CRY' | 'SPT' | 'OTH'
const CATEGORIES: { id: CategoryFilter; label: string; color: string }[] = [
  { id: 'all', label: 'ALL', color: '#00c805' },
  { id: 'POL', label: 'POL', color: '#f59e0b' },
  { id: 'CRY', label: 'CRY', color: '#06b6d4' },
  { id: 'SPT', label: 'SPT', color: '#22c55e' },
  { id: 'OTH', label: 'OTH', color: '#666666' },
]

function timeAgo(ts: number) {
  const diff = Math.floor(Date.now() / 1000) - ts
  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  return `${Math.floor(diff / 3600)}h ago`
}

function fmt(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`
  return `$${n}`
}

export default function DemoDashboard() {
  const [side, setSide] = useState<'all' | 'buy' | 'sell'>('all')
  const [category, setCategory] = useState<CategoryFilter>('all')
  const [mobileTab, setMobileTab] = useState<'signals' | 'markets' | 'leaders'>('signals')

  const filtered = useMemo(() => {
    let r = [...DEMO_SIGNALS]
    if (side !== 'all') r = r.filter(s => s.side === side.toUpperCase())
    if (category !== 'all') r = r.filter(s => s.category === category)
    return r
  }, [side, category])

  return (
    <div className="flex flex-col bg-black" style={{ height: 'calc(100vh - 56px - 45px)' }}>

      {/* Status bar */}
      <div className="flex items-center gap-3 px-4 py-1.5 bg-black border-b border-[#1f1f1f] shrink-0">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          <span className="text-[10px] font-mono text-amber-400 font-semibold">DEMO</span>
        </div>
        <span className="text-[10px] font-mono text-[#2a2a2a]">·</span>
        <span className="text-[10px] font-mono text-[#444444]">POLYMARKET</span>
        <span className="text-[10px] font-mono text-[#2a2a2a]">·</span>
        <span className="text-[10px] font-mono text-[#444444]">$10K+ THRESHOLD</span>
        <span className="text-[10px] font-mono text-[#2a2a2a]">·</span>
        <span className="text-[10px] font-mono text-[#444444]">SAMPLE DATA</span>
        <div className="ml-auto">
          <Link href="/auth/signup" className="text-[10px] font-mono px-2.5 py-1 rounded bg-[#00c805] hover:bg-[#00e006] text-black font-bold transition-colors">
            Sign up free
          </Link>
        </div>
      </div>

      {/* Quotron (static demo) */}
      <div className="relative flex items-center h-7 bg-[#050505] border-b border-[#1a1a1a] overflow-hidden shrink-0 select-none pointer-events-none">
        <div className="absolute left-0 top-0 h-full w-10 z-10 pointer-events-none" style={{ background: 'linear-gradient(to right, #050505, transparent)' }} />
        <div className="flex items-center whitespace-nowrap" style={{ animation: 'quotronScroll 90s linear infinite' }}>
          {[...DEMO_SIGNALS, ...DEMO_SIGNALS].map((s, i) => (
            <span key={i} className="inline-flex items-center gap-2 px-5 shrink-0 border-r border-[#1a1a1a]">
              <span className={`text-[10px] font-bold ${s.side === 'BUY' ? 'text-[#00c805]' : 'text-red-400'}`}>{s.side === 'BUY' ? '▲' : '▼'}</span>
              <span className="text-[10px] font-mono text-[#888888]">{s.pseudonym}</span>
              <span className="text-[10px] font-mono font-bold text-white">{fmt(s.usdSize)}</span>
              <span className="text-[10px] font-mono text-[#555555]">{s.outcome} · {s.impliedProb}%</span>
              <span className="text-[10px] font-mono text-[#444444] max-w-[200px] truncate">{s.title}</span>
            </span>
          ))}
        </div>
        <div className="absolute right-0 top-0 h-full w-10 z-10 pointer-events-none" style={{ background: 'linear-gradient(to left, #050505, transparent)' }} />
        <style>{`@keyframes quotronScroll { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }`}</style>
      </div>

      {/* ── DESKTOP: 60/40 split ── */}
      <div className="hidden md:flex flex-1 min-h-0">

        {/* Left 60%: Signals */}
        <div className="flex flex-col border-r border-[#1f1f1f]" style={{ width: '60%' }}>
          {/* Pane header */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-[#1f1f1f] bg-[#0a0a0a] shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-sm">🐋</span>
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#00c805]">Signals</span>
            </div>
            <span className="text-[10px] font-mono text-amber-400/70">demo data</span>
          </div>
          {/* Filters */}
          <div className="flex flex-col border-b border-[#1f1f1f] bg-[#0a0a0a] shrink-0">
            <div className="flex items-center gap-2 px-3 pt-2 pb-1.5">
              {(['all', 'buy', 'sell'] as const).map(f => (
                <button key={f} onClick={() => setSide(f)}
                  className={`text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded transition-colors ${side === f
                    ? f === 'buy'  ? 'bg-[#00c805]/15 text-[#00c805] border border-[#00c805]/30'
                    : f === 'sell' ? 'bg-red-500/15 text-red-400 border border-red-500/30'
                    : 'bg-[#1a1a1a] text-white border border-[#333333]'
                    : 'text-[#444444] hover:text-[#888888] border border-transparent'}`}>
                  {f === 'all' ? 'ALL' : f === 'buy' ? '▲ BUY' : '▼ SELL'}
                </button>
              ))}
              <span className="ml-auto text-[10px] font-mono text-[#333333]">{filtered.length} signals</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 pb-2">
              {CATEGORIES.map(c => {
                const active = category === c.id
                return (
                  <button key={c.id} onClick={() => setCategory(c.id)}
                    style={active ? { color: c.color, background: c.color + '18', borderColor: c.color + '40' } : {}}
                    className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border transition-colors ${active ? 'border' : 'text-[#444444] hover:text-[#888888] border-transparent'}`}>
                    {c.label}
                  </button>
                )
              })}
            </div>
          </div>
          {/* Signal rows */}
          <div className="overflow-y-auto flex-1">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 gap-2">
                <p className="text-[#444444] text-sm font-mono">No signals</p>
              </div>
            ) : filtered.map((s, i) => {
              const isBuy = s.side === 'BUY'
              return (
                <div key={i} className={`px-4 py-3 border-b border-[#111111] hover:bg-[#0f0f0f] transition-colors ${i % 2 === 0 ? 'bg-black' : 'bg-[#080808]'}`}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className={`text-xs font-mono font-bold px-1.5 py-0.5 rounded ${isBuy ? 'bg-[#00c805]/15 text-[#00c805]' : 'bg-red-500/15 text-red-400'}`}>
                      {isBuy ? '▲ BUY' : '▼ SELL'}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded" style={{ color: s.catColor, background: s.catColor + '18' }}>{s.category}</span>
                    {s.strengthScore != null && (
                      <span className={`text-[10px] font-mono font-semibold ${s.strengthScore >= 8 ? 'text-[#00c805]' : s.strengthScore >= 5 ? 'text-amber-400' : 'text-[#444444]'}`}>⚡{s.strengthScore}</span>
                    )}
                    <span className="ml-auto text-[10px] font-mono text-[#444444]">{timeAgo(s.timestamp)}</span>
                    <span className="text-[10px] font-mono text-[#333333] cursor-default">Trade ↗</span>
                  </div>
                  <p className="text-sm text-white font-medium leading-snug mb-1.5 truncate">{s.title}</p>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-[#555555] truncate">{s.pseudonym}</span>
                    <span className="text-[10px] font-mono text-[#333333]">·</span>
                    <span className="text-[10px] font-mono text-[#555555]">{s.outcome} · {s.impliedProb}%</span>
                    <span className="ml-auto text-sm font-bold font-mono text-white shrink-0">{fmt(s.usdSize)}</span>
                  </div>
                </div>
              )
            })}
            {/* Signup nudge at bottom of feed */}
            <div className="m-4 p-4 rounded-xl border border-[#00c805]/20 bg-[#00c805]/5 flex items-center justify-between gap-4">
              <p className="text-sm text-[#888888]">Viewing <span className="text-white font-semibold">demo data</span> — sign up to see live on-chain signals.</p>
              <Link href="/auth/signup" className="shrink-0 px-4 py-1.5 bg-[#00c805] hover:bg-[#00e006] rounded-lg font-bold text-sm text-black transition-colors">
                Get started free
              </Link>
            </div>
          </div>
        </div>

        {/* Right 40%: Hot Markets + Leaderboard */}
        <div className="flex flex-col" style={{ width: '40%' }}>

          {/* Hot Markets */}
          <div className="flex flex-col border-b border-[#1f1f1f]" style={{ height: '50%' }}>
            <div className="flex items-center justify-between px-3 py-2 border-b border-[#1f1f1f] bg-[#0a0a0a] shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-sm">🔥</span>
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#666666]">Hot Markets</span>
              </div>
              <span className="text-[10px] font-mono text-amber-400/70">demo data</span>
            </div>
            <div className="overflow-y-auto flex-1 divide-y divide-[#111111] bg-black">
              {DEMO_HOT_MARKETS.map(m => {
                const isBull = m.buyPct >= 65
                const isBear = m.buyPct <= 35
                return (
                  <div key={m.rank} className="flex items-start gap-2 px-3 py-3 hover:bg-[#0f0f0f] transition-colors">
                    <span className="text-[10px] font-mono text-[#333333] w-4 shrink-0 mt-0.5">#{m.rank}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] text-[#cccccc] leading-snug truncate font-medium">{m.title}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-[9px] font-mono px-1 py-px rounded" style={{ color: m.catColor, background: m.catColor + '18' }}>{m.cat}</span>
                        <div className="flex-1 h-0.5 rounded-full bg-[#1a1a1a]">
                          <div className="h-full rounded-full" style={{ width: `${m.buyPct}%`, background: isBull ? '#00c805' : isBear ? '#ef4444' : '#f59e0b' }} />
                        </div>
                        <span className={`text-[10px] font-mono font-semibold shrink-0 ${isBull ? 'text-[#00c805]' : isBear ? 'text-red-400' : 'text-amber-400'}`}>{m.buyPct}%</span>
                      </div>
                    </div>
                    <span className="text-[11px] font-mono font-bold text-white shrink-0">{m.vol}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Leaderboard */}
          <div className="flex flex-col" style={{ height: '50%' }}>
            <div className="flex items-center justify-between px-3 py-2 border-b border-[#1f1f1f] bg-[#0a0a0a] shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-sm">🏆</span>
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#666666]">Leaderboard</span>
              </div>
              <span className="text-[10px] font-mono text-amber-400/70">demo data</span>
            </div>
            <div className="overflow-y-auto flex-1 divide-y divide-[#111111] bg-black">
              {DEMO_LEADERBOARD.map(w => (
                <div key={w.name} className="flex items-center gap-2 px-3 py-2.5 hover:bg-[#0f0f0f] transition-colors">
                  <span className="text-[10px] font-mono text-[#333333] w-5 shrink-0 text-center">{w.rank}</span>
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-black shrink-0" style={{ background: w.color }}>
                    {w.initial}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] text-[#cccccc] truncate font-medium">{w.name}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[9px] font-mono px-1 py-px rounded" style={{ color: w.catColor, background: w.catColor + '18' }}>{w.cat}</span>
                      <span className="text-[9px] font-mono text-[#444444]">{w.trades} trades</span>
                      <span className={`text-[9px] font-mono ml-auto ${w.buyPct > 60 ? 'text-[#00c805]' : w.buyPct < 40 ? 'text-red-400' : 'text-amber-400'}`}>{w.buyPct}% buy</span>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono font-bold text-white shrink-0">{w.vol}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* ── MOBILE: full-width tabbed panes ── */}
      <div className="flex md:hidden flex-col flex-1 min-h-0">

        {/* Tab bar */}
        <div className="flex border-b border-[#1f1f1f] bg-[#0a0a0a] shrink-0">
          {([
            { id: 'signals' as const,  icon: '🐋', label: 'Signals'  },
            { id: 'markets' as const,  icon: '🔥', label: 'Markets'  },
            { id: 'leaders' as const,  icon: '🏆', label: 'Leaders'  },
          ]).map(tab => (
            <button key={tab.id} onClick={() => setMobileTab(tab.id)}
              className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 text-[9px] font-mono font-bold uppercase tracking-widest transition-colors border-b-2 ${
                mobileTab === tab.id ? 'text-[#00c805] border-[#00c805]' : 'text-[#444444] border-transparent'
              }`}>
              <span className="text-base leading-none">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Signals tab */}
        {mobileTab === 'signals' && (
          <div className="flex flex-col flex-1 min-h-0">
            <div className="flex flex-col border-b border-[#1f1f1f] bg-[#0a0a0a] shrink-0">
              <div className="flex items-center gap-2 px-3 pt-2 pb-1.5">
                {(['all', 'buy', 'sell'] as const).map(f => (
                  <button key={f} onClick={() => setSide(f)}
                    className={`text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded transition-colors ${side === f
                      ? f === 'buy'  ? 'bg-[#00c805]/15 text-[#00c805] border border-[#00c805]/30'
                      : f === 'sell' ? 'bg-red-500/15 text-red-400 border border-red-500/30'
                      : 'bg-[#1a1a1a] text-white border border-[#333333]'
                      : 'text-[#444444] border border-transparent'}`}>
                    {f === 'all' ? 'ALL' : f === 'buy' ? '▲ BUY' : '▼ SELL'}
                  </button>
                ))}
                <span className="ml-auto text-[10px] font-mono text-[#333333]">{filtered.length}</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 pb-2">
                {CATEGORIES.map(c => {
                  const active = category === c.id
                  return (
                    <button key={c.id} onClick={() => setCategory(c.id)}
                      style={active ? { color: c.color, background: c.color + '18', borderColor: c.color + '40' } : {}}
                      className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border transition-colors ${active ? 'border' : 'text-[#444444] border-transparent'}`}>
                      {c.label}
                    </button>
                  )
                })}
              </div>
            </div>
            <div className="overflow-y-auto flex-1">
              {filtered.map((s, i) => {
                const isBuy = s.side === 'BUY'
                return (
                  <div key={i} className={`px-4 py-3 border-b border-[#111111] ${i % 2 === 0 ? 'bg-black' : 'bg-[#080808]'}`}>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className={`text-xs font-mono font-bold px-1.5 py-0.5 rounded ${isBuy ? 'bg-[#00c805]/15 text-[#00c805]' : 'bg-red-500/15 text-red-400'}`}>{isBuy ? '▲ BUY' : '▼ SELL'}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded" style={{ color: s.catColor, background: s.catColor + '18' }}>{s.category}</span>
                      {s.strengthScore != null && <span className={`text-[10px] font-mono font-semibold ${s.strengthScore >= 8 ? 'text-[#00c805]' : s.strengthScore >= 5 ? 'text-amber-400' : 'text-[#444444]'}`}>⚡{s.strengthScore}</span>}
                      <span className="ml-auto text-[10px] font-mono text-[#444444]">{s.timestamp ? Math.floor((Date.now()/1000 - s.timestamp)/60) + 'm ago' : ''}</span>
                    </div>
                    <p className="text-sm text-white font-medium leading-snug mb-1.5">{s.title}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-[#555555]">{s.pseudonym}</span>
                      <span className="text-[10px] font-mono text-[#444444]">{s.outcome} · {s.impliedProb}%</span>
                      <span className="ml-auto text-sm font-bold font-mono text-white">{fmt(s.usdSize)}</span>
                    </div>
                  </div>
                )
              })}
              <div className="m-4 p-4 rounded-xl border border-[#00c805]/20 bg-[#00c805]/5 flex flex-col gap-3">
                <p className="text-sm text-[#888888]">Viewing <span className="text-white font-semibold">demo data</span> — sign up for live signals.</p>
                <Link href="/auth/signup" className="w-full text-center py-2 bg-[#00c805] hover:bg-[#00e006] rounded-lg font-bold text-sm text-black transition-colors">Get started free</Link>
              </div>
            </div>
          </div>
        )}

        {/* Markets tab */}
        {mobileTab === 'markets' && (
          <div className="overflow-y-auto flex-1 divide-y divide-[#111111] bg-black">
            {DEMO_HOT_MARKETS.map(m => {
              const isBull = m.buyPct >= 65; const isBear = m.buyPct <= 35
              return (
                <div key={m.rank} className="flex items-start gap-2 px-4 py-4">
                  <span className="text-[11px] font-mono text-[#333333] w-5 shrink-0 mt-0.5">#{m.rank}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#cccccc] leading-snug font-medium mb-2">{m.title}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-mono px-1 py-px rounded" style={{ color: m.catColor, background: m.catColor + '18' }}>{m.cat}</span>
                      <div className="flex-1 h-1 rounded-full bg-[#1a1a1a]">
                        <div className="h-full rounded-full" style={{ width: `${m.buyPct}%`, background: isBull ? '#00c805' : isBear ? '#ef4444' : '#f59e0b' }} />
                      </div>
                      <span className={`text-[11px] font-mono font-semibold shrink-0 ${isBull ? 'text-[#00c805]' : isBear ? 'text-red-400' : 'text-amber-400'}`}>{m.buyPct}%</span>
                    </div>
                  </div>
                  <span className="text-sm font-mono font-bold text-white shrink-0">{m.vol}</span>
                </div>
              )
            })}
          </div>
        )}

        {/* Leaders tab */}
        {mobileTab === 'leaders' && (
          <div className="overflow-y-auto flex-1 divide-y divide-[#111111] bg-black">
            {DEMO_LEADERBOARD.map(w => (
              <div key={w.name} className="flex items-center gap-3 px-4 py-3.5">
                <span className="text-[11px] font-mono text-[#333333] w-6 shrink-0 text-center">{w.rank}</span>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold text-black shrink-0" style={{ background: w.color }}>{w.initial}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[#cccccc] font-medium">{w.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[9px] font-mono px-1 py-px rounded" style={{ color: w.catColor, background: w.catColor + '18' }}>{w.cat}</span>
                    <span className="text-[10px] font-mono text-[#444444]">{w.trades} trades</span>
                    <span className={`text-[10px] font-mono ml-auto ${w.buyPct > 60 ? 'text-[#00c805]' : w.buyPct < 40 ? 'text-red-400' : 'text-amber-400'}`}>{w.buyPct}% buy</span>
                  </div>
                </div>
                <span className="text-sm font-mono font-bold text-white shrink-0">{w.vol}</span>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}
