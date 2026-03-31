'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'

const now = Math.floor(Date.now() / 1000)

const DEMO_SIGNALS = [
  {
    wallet: '0x3a1f9b2c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a',
    pseudonym: 'CryptoKing',
    side: 'BUY',
    outcome: 'Yes',
    price: 0.67,
    usdSize: 42000,
    title: 'Will Republicans win the House in 2026?',
    category: 'Politics',
    slug: 'republicans-win-house-2026',
    timestamp: now - 180,
    txHash: '0xabc123def456abc123def456abc123def456abc123def456abc123def456abc123',
    impliedProb: 67,
    strengthScore: 7,
  },
  {
    wallet: '0x9b8a7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b',
    pseudonym: 'SharpMoney7',
    side: 'SELL',
    outcome: 'No',
    price: 0.34,
    usdSize: 28500,
    title: 'Will Bitcoin hit $150K before July 2026?',
    category: 'Crypto',
    slug: 'bitcoin-150k-july-2026',
    timestamp: now - 420,
    txHash: '0xdef456abc123def456abc123def456abc123def456abc123def456abc123def456',
    impliedProb: 34,
    strengthScore: 6,
  },
  {
    wallet: '0x1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d',
    pseudonym: 'EdgeHunter',
    side: 'BUY',
    outcome: 'Yes',
    price: 0.72,
    usdSize: 55000,
    title: 'Will the Fed cut rates in May 2026?',
    category: 'Politics',
    slug: 'fed-rate-cut-may-2026',
    timestamp: now - 900,
    txHash: '0x789abc123def456789abc123def456789abc123def456789abc123def456789abc',
    impliedProb: 72,
    strengthScore: 9,
  },
  {
    wallet: '0x5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f',
    pseudonym: 'WhalePunter',
    side: 'BUY',
    outcome: 'Yes',
    price: 0.58,
    usdSize: 19000,
    title: 'Will the Celtics win the 2026 NBA Finals?',
    category: 'Sports',
    slug: 'celtics-win-nba-finals-2026',
    timestamp: now - 1800,
    txHash: '0x321cba654fed987321cba654fed987321cba654fed987321cba654fed987321cb',
    impliedProb: 58,
    strengthScore: 4,
  },
  {
    wallet: '0x2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c',
    pseudonym: 'PolyShark',
    side: 'SELL',
    outcome: 'No',
    price: 0.41,
    usdSize: 31000,
    title: 'Will Ethereum flip Bitcoin by market cap in 2026?',
    category: 'Crypto',
    slug: 'ethereum-flip-bitcoin-2026',
    timestamp: now - 3600,
    txHash: '0x654fed321cba987654fed321cba987654fed321cba987654fed321cba987654fe',
    impliedProb: 41,
    strengthScore: 8,
  },
  {
    wallet: '0x7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e',
    pseudonym: 'AlphaFlow',
    side: 'BUY',
    outcome: 'Yes',
    price: 0.63,
    usdSize: 22000,
    title: 'Will Trump sign a crypto reserve bill in 2026?',
    category: 'Politics',
    slug: 'trump-crypto-reserve-2026',
    timestamp: now - 5400,
    txHash: '0x987321654cba321987654abc321cba987654abc321cba987654abc321cba98765',
    impliedProb: 63,
    strengthScore: 5,
  },
  {
    wallet: '0x4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a',
    pseudonym: 'DeepLiquid',
    side: 'BUY',
    outcome: 'Yes',
    price: 0.55,
    usdSize: 12500,
    title: 'Will the US enter a recession in 2026?',
    category: 'Other',
    slug: 'us-recession-2026',
    timestamp: now - 9000,
    txHash: '0xcba987654321cba987654321cba987654321cba987654321cba987654321cba98',
    impliedProb: 55,
    strengthScore: 3,
  },
]

const CAT_COLORS: Record<string, string> = {
  Politics: '#f59e0b',
  Crypto: '#06b6d4',
  Sports: '#22c55e',
  Other: '#9999aa',
}

function StrengthBadge({ score }: { score: number | null }) {
  if (score == null) return null
  const color = score >= 8 ? { text: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20' }
    : score >= 5 ? { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' }
    : { text: 'text-[#6b7280]', bg: 'bg-[#1c1c2e]', border: 'border-[#2a2a3e]' }
  return (
    <span className="relative group">
      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border cursor-help ${color.text} ${color.bg} ${color.border}`}>
        ⚡{score}
      </span>
      <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 w-52 rounded-lg bg-[#1a1a2e] border border-[#2a2a3e] px-2.5 py-2 text-[11px] text-[#c4c4d4] leading-snug opacity-0 group-hover:opacity-100 transition-opacity z-50 shadow-xl">
        <span className="font-semibold text-white">Signal strength: {score}/10</span>
        <br />Based on trade size and wallet activity.
        <br /><span className="text-green-400">8–10</span> strong · <span className="text-amber-400">5–7</span> moderate · <span className="text-[#6b7280]">2–4</span> weak
      </span>
    </span>
  )
}

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

export default function DemoDashboard() {
  const [sideFilter, setSideFilter] = useState<'all' | 'buy' | 'sell'>('all')
  const [catFilter, setCatFilter] = useState<'all' | 'Politics' | 'Crypto' | 'Sports' | 'Other'>('all')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<'recent' | 'high' | 'low'>('recent')

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
    if (catFilter !== 'all') result = result.filter(s => s.category === catFilter)
    if (search) result = result.filter(s =>
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.pseudonym.toLowerCase().includes(search.toLowerCase())
    )
    if (sort === 'high') result.sort((a, b) => b.usdSize - a.usdSize)
    else if (sort === 'low') result.sort((a, b) => a.usdSize - b.usdSize)
    else result.sort((a, b) => b.timestamp - a.timestamp)
    return result
  }, [sideFilter, catFilter, search, sort])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">SharpBet Dashboard</h1>
          <p className="text-[#6b6b80] text-sm mt-0.5">
            Whale activity on Polymarket · all categories · demo data
          </p>
        </div>
        <span className="px-2 py-0.5 rounded text-xs font-mono font-medium bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
          DEMO
        </span>
      </div>

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
                Every Polymarket trade is a smart contract on a public blockchain. No account limits, no restrictions, no bans. The sharpest money in the world flows freely here across politics, crypto, sports, and more. When a wallet with a track record moves $10K+, the signal is real and verifiable. That is the edge.
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
            {buys.length} whale buy{buys.length !== 1 ? 's' : ''} vs {sells.length} sell{sells.length !== 1 ? 's' : ''} detected across all Polymarket categories.
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
          <div className="flex items-center gap-2 flex-wrap">
            {([
              { key: 'all', label: '≡ All', type: 'side' },
              { key: 'buy', label: '↑ BUY', type: 'side' },
              { key: 'sell', label: '↓ SELL', type: 'side' },
            ] as const).map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setSideFilter(key)}
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
            <span className="text-[#2a2a32]">|</span>
            {(['all', 'Politics', 'Crypto', 'Sports', 'Other'] as const).map(cat => {
              const color = cat === 'all' ? '#9999aa' : CAT_COLORS[cat]
              const active = catFilter === cat
              return (
                <button
                  key={cat}
                  onClick={() => setCatFilter(cat)}
                  className={`px-3 py-1 rounded-lg text-xs font-mono border transition-colors ${
                    active ? '' : 'bg-[#0f0f17] text-[#6b7280] border-[#1c1c2e] hover:text-white'
                  }`}
                  style={active ? { color, background: color + '18', borderColor: color + '40' } : {}}
                >
                  {cat === 'all' ? 'All' : cat}
                </button>
              )
            })}
          </div>
          <div className="flex items-center gap-2 text-xs text-[#6b7280]">
            <span>Sort:</span>
            <select
              value={sort}
              onChange={e => setSort(e.target.value as 'recent' | 'high' | 'low')}
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
          {filtered.map((signal, i) => {
            const catColor = CAT_COLORS[signal.category] ?? '#9999aa'
            return (
              <div key={`${signal.wallet}-${i}`}
                className="bg-[#0f0f17] border border-[#1c1c2e] rounded-xl overflow-hidden hover:border-[#2a2a3e] transition-colors">
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white text-sm leading-snug truncate">{signal.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className="text-[9px] font-mono px-1.5 py-0.5 rounded"
                          style={{ color: catColor, background: catColor + '18' }}
                        >
                          {signal.category.toUpperCase()}
                        </span>
                        <StrengthBadge score={signal.strengthScore} />
                        <span className="text-[11px] text-[#6b7280]">{demoTimeAgo(signal.timestamp)}</span>
                      </div>
                    </div>
                    <span className="shrink-0 px-3 py-1.5 rounded-lg bg-[#1c1c2e] text-xs text-[#9999aa] border border-[#2a2a3e] whitespace-nowrap cursor-default">
                      Trade ↗
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-3 flex-wrap">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${signal.outcome === 'Yes' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                      {signal.outcome}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#1c1c2e] text-[#9999aa]">
                      {signal.impliedProb}% implied
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
            )
          })}
        </div>

        <p className="text-[10px] text-[#3a3a45] font-mono text-center pt-2">
          Demo data only · Sign up to see live on-chain signals · $10K+ threshold · all categories
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
    </div>
  )
}
