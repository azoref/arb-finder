'use client'
import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import HotMarkets from './HotMarkets'

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
  polyAmericanOdds: string
  strengthScore: number | null
}

interface SignalsData {
  signals: Signal[]
  updatedAt: string
  error?: string
}

import { inferCategory as _inferCat } from '@/lib/categories'

type Category = 'all' | 'politics' | 'crypto' | 'sports' | 'other'

function inferCategory(title: string): Category {
  return _inferCat(title).toLowerCase() as Category
}

function timeAgo(ts: number) {
  const diff = Math.floor(Date.now() / 1000) - ts
  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  return `${Math.floor(diff / 3600)}h ago`
}

function StrengthBadge({ score }: { score: number | null }) {
  if (score == null) return null
  const color = score >= 8 ? { text: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20' }
    : score >= 5 ? { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' }
    : { text: 'text-[#6b7280]', bg: 'bg-[#1c1c2e]', border: 'border-[#2a2a3e]' }
  return (
    <span className="relative group">
      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${color.text} ${color.bg} ${color.border}`}>
        ⚡{score}
      </span>
      <span className="pointer-events-none absolute top-full left-0 mt-1.5 w-52 rounded-lg bg-[#1a1a2e] border border-[#2a2a3e] px-2.5 py-2 text-[11px] text-[#c4c4d4] leading-snug opacity-0 group-hover:opacity-100 transition-opacity z-50 shadow-xl">
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

const CATEGORY_LABELS: Record<Category, string> = {
  all: 'All',
  politics: 'Politics',
  crypto: 'Crypto',
  sports: 'Sports',
  other: 'Other',
}

export default function SignalsTab({ isPremium }: { isPremium?: boolean }) {
  const [data, setData] = useState<SignalsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [sideFilter, setSideFilter] = useState<'all' | 'buy' | 'sell'>('all')
  const [category, setCategory] = useState<Category>('all')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<'recent' | 'high' | 'low'>('recent')
  const [followedWallets, setFollowedWallets] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetch('/api/signals')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!isPremium) return
    fetch('/api/follow')
      .then(r => r.json())
      .then(d => {
        if (Array.isArray(d)) setFollowedWallets(new Set(d.map((f: { wallet: string }) => f.wallet)))
      })
      .catch(() => {})
  }, [isPremium])

  const signals = data?.signals ?? []

  const totalVolume = signals.reduce((s, t) => s + t.usdSize, 0)
  const buys = signals.filter(s => s.side === 'BUY')
  const sells = signals.filter(s => s.side === 'SELL')
  const avgSize = signals.length > 0 ? totalVolume / signals.length : 0
  const buyPct = signals.length > 0 ? (buys.length / signals.length) * 100 : 0
  const sellPct = 100 - buyPct
  const buyVol = buys.reduce((s, t) => s + t.usdSize, 0)
  const sellVol = sells.reduce((s, t) => s + t.usdSize, 0)
  const sentiment = buyPct > 60 ? 'Bullish' : buyPct < 40 ? 'Bearish' : 'Neutral'
  const sentimentColor = sentiment === 'Bullish' ? '#22c55e' : sentiment === 'Bearish' ? '#ef4444' : '#f59e0b'

  const filtered = useMemo(() => {
    let result = [...signals]
    if (category !== 'all') result = result.filter(s => inferCategory(s.title) === category)
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
  }, [signals, category, sideFilter, search, sort])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-[#4a4a55] font-mono text-sm animate-pulse">
        Scanning Polymarket on-chain data...
      </div>
    )
  }

  return (
    <div className="space-y-5">

      {/* Hot Markets */}
      <HotMarkets />

      {/* Thesis explainer */}
      <div className="bg-[#0a0a10] border border-[#1c1c2e] rounded-xl p-5">
        <div className="flex items-start gap-4">
          <div className="shrink-0 w-8 h-8 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400 text-sm">
            ◎
          </div>
          <div>
            <p className="text-sm font-semibold text-[#e8e8f0] mb-1">The only market where insiders can&apos;t be limited</p>
            <p className="text-xs text-[#6b6b80] leading-relaxed">
              Polymarket is a smart contract on a public blockchain. No accounts, no restrictions. The sharpest traders in the world: sports bettors, political insiders, crypto funds. They trade freely at full size. When a wallet with a track record bets $10K+, that trade is a statement. SharpBet surfaces it the moment it happens.
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
          {signals.length === 0
            ? 'No whale activity detected right now.'
            : `${buys.length} whale buy${buys.length !== 1 ? 's' : ''} vs ${sells.length} sell${sells.length !== 1 ? 's' : ''} across all Polymarket categories.`}
        </p>
      </div>

      {/* Category filter */}
      <div className="flex items-center gap-2 flex-wrap">
        {(['all', 'politics', 'crypto', 'sports', 'other'] as Category[]).map(cat => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-colors ${
              category === cat
                ? 'bg-[#7c3aed]/15 text-[#a78bfa] border-[#7c3aed]/30'
                : 'bg-[#0f0f17] text-[#6b7280] border-[#1c1c2e] hover:text-white'
            }`}
          >
            {CATEGORY_LABELS[cat]}
          </button>
        ))}
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
          placeholder="Search markets..."
          className="bg-[#0f0f17] border border-[#1c1c2e] rounded-lg px-3 py-1.5 text-sm text-white placeholder-[#4a4a55] focus:outline-none focus:border-[#7c3aed]/50 w-48"
        />
      </div>

      {/* Side filter + Sort */}
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
                  ? key === 'buy'
                    ? 'bg-[#22c55e]/15 text-[#22c55e] border-[#22c55e]/30'
                    : key === 'sell'
                    ? 'bg-[#ef4444]/15 text-[#ef4444] border-[#ef4444]/30'
                    : 'bg-[#7c3aed]/15 text-[#7c3aed] border-[#7c3aed]/30'
                  : 'bg-[#0f0f17] text-[#6b7280] border-[#1c1c2e] hover:text-white'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 text-xs text-[#6b7280]">
          <span>Sort:</span>
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
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="text-4xl mb-3">🐋</div>
          <p className="text-[#4a4a55] text-sm font-mono mb-1">No whale signals detected</p>
          <p className="text-[#3a3a45] text-xs max-w-sm">
            Signals appear when a wallet trades $10,000+ on Polymarket. The threshold filters out noise and captures only meaningful conviction.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((signal, i) => {
            const cat = inferCategory(signal.title)
            const catColors: Record<string, string> = {
              politics: '#f59e0b',
              crypto: '#06b6d4',
              sports: '#22c55e',
              other: '#9999aa',
            }
            return (
              <div key={`${signal.wallet}-${signal.slug}-${i}`}
                className="bg-[#0f0f17] border border-[#1c1c2e] rounded-xl overflow-hidden hover:border-[#2a2a3e] transition-colors">

                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded border"
                          style={{ color: catColors[cat], borderColor: catColors[cat] + '40', background: catColors[cat] + '15' }}>
                          {cat.toUpperCase()}
                        </span>
                        <StrengthBadge score={signal.strengthScore} />
                        {followedWallets.has(signal.wallet) && (
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-violet-500/10 text-violet-400 border border-violet-500/20">
                            ★ FOLLOWING
                          </span>
                        )}
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
                      <span className={`flex items-center gap-1 text-sm font-bold ${
                        signal.side === 'BUY' ? 'text-[#22c55e]' : 'text-[#ef4444]'
                      }`}>
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
            )
          })}
        </div>
      )}

      <p className="text-[10px] text-[#3a3a45] font-mono text-center pt-2">
        All trades verified on-chain · Polymarket · Polygon network · $10K+ threshold
      </p>
    </div>
  )
}
