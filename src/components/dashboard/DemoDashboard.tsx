'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { MARKET_LABELS } from '@/lib/config'
import OddsTable from './OddsTable'

type Tab = 'signals' | 'arbs' | 'odds'

// ── Demo whale signals ──────────────────────────────────────────────────
const now = Math.floor(Date.now() / 1000)

const DEMO_SIGNALS = [
  {
    wallet: '0x3a1f9b2c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a',
    pseudonym: 'WhaleWatcher',
    side: 'BUY',
    outcome: 'Kansas City Chiefs',
    price: 0.67,
    usdSize: 42000,
    title: 'Kansas City Chiefs vs Baltimore Ravens – AFC Championship',
    slug: 'chiefs-vs-ravens-afc-championship',
    timestamp: now - 420,
    txHash: '0xabc123def456abc123def456abc123def456abc123def456abc123def456abc123',
    impliedProb: 67,
  },
  {
    wallet: '0x9b8a7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b',
    pseudonym: 'SilentEdge',
    side: 'BUY',
    outcome: 'Boston Celtics',
    price: 0.61,
    usdSize: 28500,
    title: 'Boston Celtics vs Miami Heat – Game 5',
    slug: 'celtics-vs-heat-game-5',
    timestamp: now - 900,
    txHash: '0xdef456abc123def456abc123def456abc123def456abc123def456abc123def456',
    impliedProb: 61,
  },
  {
    wallet: '0x1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d',
    pseudonym: 'PolyShark',
    side: 'SELL',
    outcome: 'Philadelphia Eagles',
    price: 0.44,
    usdSize: 22000,
    title: 'Philadelphia Eagles vs San Francisco 49ers – Spread',
    slug: 'eagles-vs-49ers-spread',
    timestamp: now - 1800,
    txHash: '0x789abc123def456789abc123def456789abc123def456789abc123def456789abc',
    impliedProb: 44,
  },
  {
    wallet: '0x5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f',
    pseudonym: 'BlockTrader',
    side: 'BUY',
    outcome: 'Dustin Poirier',
    price: 0.58,
    usdSize: 18200,
    title: 'UFC 302: Poirier vs Gaethje – Winner',
    slug: 'ufc-302-poirier-vs-gaethje',
    timestamp: now - 3600,
    txHash: '0x321cba654fed987321cba654fed987321cba654fed987321cba654fed987321cb',
    impliedProb: 58,
  },
  {
    wallet: '0x2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c',
    pseudonym: 'AlphaFlow',
    side: 'BUY',
    outcome: 'Over 224.5',
    price: 0.53,
    usdSize: 15800,
    title: 'LA Lakers vs Denver Nuggets – Total Points',
    slug: 'lakers-vs-nuggets-total',
    timestamp: now - 5400,
    txHash: '0x654fed321cba987654fed321cba987654fed321cba987654fed321cba987654fe',
    impliedProb: 53,
  },
  {
    wallet: '0x7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e',
    pseudonym: 'DeepLiquid',
    side: 'SELL',
    outcome: 'Manchester City',
    price: 0.38,
    usdSize: 12400,
    title: 'UEFA Champions League Winner 2024–25',
    slug: 'champions-league-winner-2025',
    timestamp: now - 7200,
    txHash: '0x987321654cba321987654abc321cba987654abc321cba987654abc321cba98765',
    impliedProb: 38,
  },
  {
    wallet: '0x4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a',
    pseudonym: 'NightOwl',
    side: 'BUY',
    outcome: 'Golden State Warriors',
    price: 0.55,
    usdSize: 11000,
    title: 'Golden State Warriors vs Phoenix Suns – Moneyline',
    slug: 'warriors-vs-suns-ml',
    timestamp: now - 9000,
    txHash: '0xcba987654321cba987654321cba987654321cba987654321cba987654321cba98',
    impliedProb: 55,
  },
]

function WalletAvatar({ name }: { name: string }) {
  const colors = ['#7c3aed', '#06b6d4', '#22c55e', '#f59e0b', '#ef4444', '#ec4899']
  const color = colors[name.charCodeAt(0) % colors.length]
  return (
    <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
      style={{ background: color }}>
      {name[0]?.toUpperCase() ?? 'W'}
    </div>
  )
}

function demoTimeAgo(ts: number) {
  const diff = Math.floor(Date.now() / 1000) - ts
  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  return `${Math.floor(diff / 3600)}h ago`
}

const DEMO_ARBS = [
  {
    id: '1',
    event_name: 'Boston Celtics vs Miami Heat',
    commence_time: new Date(Date.now() + 4 * 3600000).toISOString(),
    market: 'h2h',
    book_a: 'DraftKings',
    book_b: 'FanDuel',
    outcome_a: 'Celtics',
    outcome_b: 'Heat',
    odds_a: +108,
    odds_b: +106,
    profit_margin: 1.42,
    stake_a: 480.77,
    stake_b: 485.44,
    status: 'active',
    created_at: new Date(Date.now() - 90000).toISOString(),
  },
  {
    id: '2',
    event_name: 'LA Lakers vs Denver Nuggets',
    commence_time: new Date(Date.now() + 6 * 3600000).toISOString(),
    market: 'spreads',
    book_a: 'BetMGM',
    book_b: 'Caesars',
    outcome_a: 'Lakers +4.5',
    outcome_b: 'Nuggets -3.5',
    odds_a: -108,
    odds_b: -106,
    profit_margin: 0.87,
    stake_a: 495.40,
    stake_b: 491.23,
    status: 'active',
    created_at: new Date(Date.now() - 240000).toISOString(),
  },
  {
    id: '3',
    event_name: 'Milwaukee Bucks vs Philadelphia 76ers',
    commence_time: new Date(Date.now() + 2 * 3600000).toISOString(),
    market: 'totals',
    book_a: 'DraftKings',
    book_b: 'PointsBet',
    outcome_a: 'Over 224.5',
    outcome_b: 'Under 226.5',
    odds_a: +102,
    odds_b: -100,
    profit_margin: 1.12,
    stake_a: 495.05,
    stake_b: 505.00,
    status: 'active',
    created_at: new Date(Date.now() - 420000).toISOString(),
  },
  {
    id: '4',
    event_name: 'Golden State Warriors vs Phoenix Suns',
    commence_time: new Date(Date.now() + 7 * 3600000).toISOString(),
    market: 'h2h',
    book_a: 'FanDuel',
    book_b: 'BetMGM',
    outcome_a: 'Warriors',
    outcome_b: 'Suns',
    odds_a: +115,
    odds_b: +103,
    profit_margin: 1.74,
    stake_a: 465.12,
    stake_b: 488.75,
    status: 'active',
    created_at: new Date(Date.now() - 600000).toISOString(),
  },
  {
    id: '5',
    event_name: 'Brooklyn Nets vs New York Knicks',
    commence_time: new Date(Date.now() + 5 * 3600000).toISOString(),
    market: 'h2h',
    book_a: 'Caesars',
    book_b: 'BetRivers',
    outcome_a: 'Nets',
    outcome_b: 'Knicks',
    odds_a: +118,
    odds_b: +105,
    profit_margin: 2.01,
    stake_a: 457.80,
    stake_b: 482.50,
    status: 'active',
    created_at: new Date(Date.now() - 900000).toISOString(),
  },
]

function timeAgo(iso: string) {
  const secs = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (secs < 60) return `${secs}s ago`
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`
  return `${Math.floor(secs / 3600)}h ago`
}

export default function DemoDashboard() {
  const [tab, setTab] = useState<Tab>('signals')
  const [bankroll, setBankroll] = useState(1000)
  const [sideFilter, setSideFilter] = useState<'all' | 'buy' | 'sell'>('all')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<'recent' | 'high' | 'low'>('recent')

  const scaledArbs = DEMO_ARBS.map(arb => {
    const factor = bankroll / 1000
    return {
      ...arb,
      stake_a: parseFloat((arb.stake_a * factor).toFixed(2)),
      stake_b: parseFloat((arb.stake_b * factor).toFixed(2)),
    }
  })

  // Signal stats
  const buys = DEMO_SIGNALS.filter(s => s.side === 'BUY')
  const sells = DEMO_SIGNALS.filter(s => s.side === 'SELL')
  const totalVolume = DEMO_SIGNALS.reduce((s, t) => s + t.usdSize, 0)
  const avgSize = totalVolume / DEMO_SIGNALS.length
  const buyPct = (buys.length / DEMO_SIGNALS.length) * 100
  const sellPct = 100 - buyPct
  const buyVol = buys.reduce((s, t) => s + t.usdSize, 0)
  const sellVol = sells.reduce((s, t) => s + t.usdSize, 0)
  const sentiment = buyPct > 60 ? 'Bullish' : buyPct < 40 ? 'Bearish' : 'Neutral'
  const sentimentColor = sentiment === 'Bullish' ? '#22c55e' : sentiment === 'Bearish' ? '#ef4444' : '#f59e0b'

  const filtered = useMemo(() => {
    let result = [...DEMO_SIGNALS]
    if (sideFilter !== 'all') result = result.filter(s => s.side === sideFilter.toUpperCase())
    if (search) result = result.filter(s =>
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.outcome.toLowerCase().includes(search.toLowerCase()) ||
      s.pseudonym.toLowerCase().includes(search.toLowerCase())
    )
    if (sort === 'high') result.sort((a, b) => b.usdSize - a.usdSize)
    else if (sort === 'low') result.sort((a, b) => a.usdSize - b.usdSize)
    else result.sort((a, b) => b.timestamp - a.timestamp)
    return result
  }, [sideFilter, search, sort])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">SharpBet Dashboard</h1>
          <p className="text-[#6b6b80] text-sm mt-0.5">
            {tab === 'signals' ? 'Whale activity on Polymarket · demo data' : tab === 'arbs' ? `${DEMO_ARBS.length} sample arbs · demo data` : 'Live odds across all major US sportsbooks'}
          </p>
        </div>
        <span className="px-2 py-0.5 rounded text-xs font-mono font-medium bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
          DEMO
        </span>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-[#2a2a32]">
        <button
          onClick={() => setTab('signals')}
          className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
            tab === 'signals' ? 'border-green-500 text-green-400' : 'border-transparent text-[#6b6b80] hover:text-[#e8e8f0]'
          }`}
        >
          🐋 Whale Signals
          <span className="ml-2 px-1.5 py-0.5 rounded text-xs bg-green-500/10 text-green-400 font-mono">
            {DEMO_SIGNALS.length}
          </span>
        </button>
        <button
          onClick={() => setTab('arbs')}
          className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
            tab === 'arbs' ? 'border-green-500 text-green-400' : 'border-transparent text-[#6b6b80] hover:text-[#e8e8f0]'
          }`}
        >
          🎯 Arb Opportunities
          <span className="ml-2 px-1.5 py-0.5 rounded text-xs bg-green-500/10 text-green-400 font-mono">
            {DEMO_ARBS.length}
          </span>
        </button>
        <button
          onClick={() => setTab('odds')}
          className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
            tab === 'odds' ? 'border-green-500 text-green-400' : 'border-transparent text-[#6b6b80] hover:text-[#e8e8f0]'
          }`}
        >
          📊 Live Odds
        </button>
      </div>

      {tab === 'odds' && <OddsTable />}

      {/* ── Signals tab ── */}
      {tab === 'signals' && (
        <div className="space-y-5">

          {/* Thesis explainer */}
          <div className="bg-[#0a0a10] border border-[#1c1c2e] rounded-xl p-5">
            <div className="flex items-start gap-4">
              <div className="shrink-0 w-8 h-8 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400 text-sm">
                ◎
              </div>
              <div>
                <p className="text-sm font-semibold text-[#e8e8f0] mb-1">Why on-chain signals matter</p>
                <p className="text-xs text-[#6b6b80] leading-relaxed">
                  Sportsbooks limit sharp bettors. Polymarket cannot. Every trade is a smart contract on a public blockchain: no account limits, no restrictions. The sharpest money in the world flows freely here, which means Polymarket prices are often ahead of sportsbook lines. When a whale moves size, the sportsbook has not caught up yet. That window is the edge.
                </p>
              </div>
            </div>
          </div>

          {/* KPI Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Total Volume', value: `$${totalVolume.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, icon: '💵', color: '#06b6d4' },
              { label: 'Buy Orders', value: buys.length.toString(), icon: '↑', color: '#22c55e' },
              { label: 'Sell Orders', value: sells.length.toString(), icon: '↓', color: '#ef4444' },
              { label: 'Avg Trade Size', value: `$${avgSize.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, icon: '⚡', color: '#7c3aed' },
            ].map(({ label, value, icon, color }) => (
              <div key={label} className="bg-[#0f0f17] border border-[#1c1c2e] rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-[11px] text-[#6b7280] mb-1">{label}</p>
                  <p className="text-2xl font-bold text-white">{value}</p>
                </div>
                <div className="text-2xl opacity-60" style={{ color }}>{icon}</div>
              </div>
            ))}
          </div>

          {/* Sentiment Panel */}
          <div className="bg-[#0f0f17] border border-[#1c1c2e] rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white">Market Sentiment</h3>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold border"
                style={{ color: sentimentColor, borderColor: sentimentColor + '40', background: sentimentColor + '15' }}>
                {sentiment}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-[#22c55e] font-semibold">Buy {buyPct.toFixed(1)}%</span>
              <span className="text-[#ef4444] font-semibold">Sell {sellPct.toFixed(1)}%</span>
            </div>
            <div className="w-full h-2.5 rounded-full overflow-hidden bg-[#1c1c2e] flex">
              <div className="h-full bg-[#22c55e] transition-all" style={{ width: `${buyPct}%` }} />
              <div className="h-full bg-[#ef4444] transition-all" style={{ width: `${sellPct}%` }} />
            </div>
            <div className="flex items-center justify-between text-[11px] mt-1.5">
              <span className="text-[#22c55e]">${buyVol.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
              <span className="text-[#ef4444]">${sellVol.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
            </div>
            <p className="text-xs text-[#6b7280] mt-3 italic">
              {buys.length} whale buy{buys.length !== 1 ? 's' : ''} vs {sells.length} sell{sells.length !== 1 ? 's' : ''} detected across active sports markets.
            </p>
          </div>

          {/* Trade Feed Header */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-white">Recent Whale Trades</h3>
              <span className="text-[#6b7280] text-sm">({filtered.length})</span>
            </div>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search trades..."
              className="bg-[#0f0f17] border border-[#1c1c2e] rounded-lg px-3 py-1.5 text-sm text-white placeholder-[#4a4a55] focus:outline-none focus:border-[#7c3aed]/50 w-48"
            />
          </div>

          {/* Filter + Sort */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              {[
                { key: 'all', label: '≡ All' },
                { key: 'buy', label: '↑ BUY' },
                { key: 'sell', label: '↓ SELL' },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setSideFilter(key as any)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-colors ${
                    sideFilter === key
                      ? key === 'buy' ? 'bg-[#22c55e]/15 text-[#22c55e] border-[#22c55e]/30'
                      : key === 'sell' ? 'bg-[#ef4444]/15 text-[#ef4444] border-[#ef4444]/30'
                      : 'bg-[#7c3aed]/15 text-[#7c3aed] border-[#7c3aed]/30'
                      : 'bg-[#0f0f17] text-[#6b7280] border-[#1c1c2e] hover:text-white'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 text-xs text-[#6b7280]">
              <span>Sort by:</span>
              <select
                value={sort}
                onChange={e => setSort(e.target.value as any)}
                className="bg-[#0f0f17] border border-[#1c1c2e] rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-[#7c3aed]/50"
              >
                <option value="recent">Most Recent</option>
                <option value="high">High to Low</option>
                <option value="low">Low to High</option>
              </select>
            </div>
          </div>

          {/* Trade Cards */}
          <div className="space-y-3">
            {filtered.map((signal, i) => (
              <div key={`${signal.wallet}-${i}`}
                className="bg-[#0f0f17] border border-[#1c1c2e] rounded-xl overflow-hidden hover:border-[#2a2a3e] transition-colors">
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white text-sm leading-snug truncate">{signal.title}</p>
                      <p className="text-[11px] text-[#6b7280] mt-0.5">{demoTimeAgo(signal.timestamp)}</p>
                    </div>
                    <span className="shrink-0 px-3 py-1.5 rounded-lg bg-[#1c1c2e] text-xs text-[#9999aa] border border-[#2a2a3e] whitespace-nowrap cursor-default">
                      Trade ↗
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-3 flex-wrap">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#1c1c2e] text-[#9999aa]">
                      {signal.outcome}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#1c1c2e] text-[#9999aa]">
                      {signal.impliedProb.toFixed(1)}% probability
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#7c3aed]/15 text-[#a78bfa] border border-[#7c3aed]/20">
                      ⊙ ${signal.usdSize.toLocaleString(undefined, { maximumFractionDigits: 0 })}
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
                        <span className="text-[11px] text-[#6b7280] font-mono">{signal.pseudonym}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-white">
                        ${signal.usdSize.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </p>
                      <span className="text-[10px] text-[#3a3a45] font-mono">demo data</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <p className="text-[10px] text-[#3a3a45] font-mono text-center pt-2">
            Demo data only · Sign up to see live on-chain signals · $10K+ threshold
          </p>

          {/* Signup nudge */}
          <div className="p-5 rounded-xl border border-green-500/20 bg-green-500/5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-[#e8e8f0]">See live whale signals</p>
              <p className="text-sm text-[#9999aa] mt-1">
                Sign up free to track real Polymarket whale trades the moment they hit the blockchain.
              </p>
            </div>
            <Link
              href="/auth/signup"
              className="shrink-0 px-6 py-2.5 bg-green-600 hover:bg-green-500 rounded-lg font-semibold text-sm transition-colors"
            >
              Get started free
            </Link>
          </div>
        </div>
      )}

      {tab === 'arbs' && (
        <>
          {/* Controls */}
          <div className="flex flex-wrap items-center gap-4 mb-4 p-3 bg-[#111114] border border-[#2a2a32] rounded-lg">
            <div className="flex items-center gap-2">
              <label className="text-xs text-[#6b6b80]">Bankroll</label>
              <input
                type="number"
                value={bankroll}
                onChange={e => setBankroll(parseFloat(e.target.value) || 1000)}
                min={100}
                step={100}
                className="text-sm bg-[#1a1a1f] border border-[#2a2a32] rounded px-2 py-1 w-24 focus:outline-none focus:border-green-600 font-mono"
              />
            </div>
            <span className="text-xs text-[#4a4a55]">Stakes auto-scale to your bankroll</span>
            <div className="ml-auto">
              <Link
                href="/auth/signup"
                className="text-xs px-3 py-1.5 rounded bg-green-600/10 border border-green-500/20 text-green-400 hover:bg-green-600/20 transition-colors"
              >
                Sign up for real-time alerts →
              </Link>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-lg border border-[#2a2a32]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#2a2a32] bg-[#111114]">
                  <th className="text-left px-4 py-3 text-[10px] text-[#4a4a55] font-medium uppercase tracking-widest font-mono">Event</th>
                  <th className="text-left px-4 py-3 text-[10px] text-[#4a4a55] font-medium uppercase tracking-widest font-mono">Mkt</th>
                  <th className="text-left px-4 py-3 text-[10px] text-[#4a4a55] font-medium uppercase tracking-widest font-mono">Bid</th>
                  <th className="text-left px-4 py-3 text-[10px] text-[#4a4a55] font-medium uppercase tracking-widest font-mono">Ask</th>
                  <th className="text-right px-4 py-3 text-[10px] text-[#4a4a55] font-medium uppercase tracking-widest font-mono">Margin</th>
                  <th className="text-right px-4 py-3 text-[10px] text-[#4a4a55] font-medium uppercase tracking-widest font-mono">Stakes</th>
                  <th className="text-right px-4 py-3 text-[10px] text-[#4a4a55] font-medium uppercase tracking-widest font-mono">Found</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1a1a1f]">
                {scaledArbs.map(arb => (
                  <tr key={arb.id} className="hover:bg-[#111114] transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-[#e8e8f0]">{arb.event_name}</div>
                      <div className="text-xs text-[#6b6b80] mt-0.5">
                        {new Date(arb.commence_time).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-1.5 py-0.5 rounded text-xs bg-[#1a1a1f] border border-[#2a2a32] text-[#9999aa] font-mono">
                        {MARKET_LABELS[arb.market] ?? arb.market}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono">
                      <div className="text-[#e8e8f0]">{arb.book_a}</div>
                      <div className="text-xs text-[#9999aa] mt-0.5">
                        {arb.outcome_a} <span className="text-green-400">{arb.odds_a > 0 ? '+' : ''}{arb.odds_a}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono">
                      <div className="text-[#e8e8f0]">{arb.book_b}</div>
                      <div className="text-xs text-[#9999aa] mt-0.5">
                        {arb.outcome_b} <span className="text-green-400">{arb.odds_b > 0 ? '+' : ''}{arb.odds_b}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="font-mono font-semibold text-green-400">+{arb.profit_margin.toFixed(2)}%</span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-xs text-[#9999aa]">
                      <div>${arb.stake_a.toFixed(0)} / ${arb.stake_b.toFixed(0)}</div>
                      <div className="text-green-400 mt-0.5">
                        +${((arb.stake_a + arb.stake_b) * arb.profit_margin / 100).toFixed(2)}
                      </div>

                    </td>
                    <td className="px-4 py-3 text-right text-xs text-[#6b6b80]">
                      {timeAgo(arb.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Signup nudge */}
          <div className="mt-6 p-5 rounded-xl border border-green-500/20 bg-green-500/5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-[#e8e8f0]">Ready for real opportunities?</p>
              <p className="text-sm text-[#9999aa] mt-1">
                Sign up free — get 5-minute delayed arbs instantly. Upgrade for real-time Telegram alerts.
              </p>
            </div>
            <Link
              href="/auth/signup"
              className="shrink-0 px-6 py-2.5 bg-green-600 hover:bg-green-500 rounded-lg font-semibold text-sm transition-colors"
            >
              Get started free
            </Link>
          </div>
        </>
      )}
    </div>
  )
}
