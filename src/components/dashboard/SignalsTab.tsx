'use client'
import { useEffect, useState, useMemo } from 'react'

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
  // Matched sportsbook data (null when no odds_snapshot match)
  bookName:        string | null
  bookOdds:        number | null
  bookImpliedProb: number | null
  divergencePts:   number | null
}

interface SignalsData {
  signals: Signal[]
  updatedAt: string
  error?: string
}

function timeAgo(ts: number) {
  const diff = Math.floor(Date.now() / 1000) - ts
  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  return `${Math.floor(diff / 3600)}h ago`
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

export default function SignalsTab() {
  const [data, setData] = useState<SignalsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [sideFilter, setSideFilter] = useState<'all' | 'buy' | 'sell'>('all')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<'recent' | 'high' | 'low'>('recent')

  useEffect(() => {
    fetch('/api/signals')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const signals = data?.signals ?? []

  // Stats
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

  // Filtered + sorted signals
  const filtered = useMemo(() => {
    let result = [...signals]
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
  }, [signals, sideFilter, search, sort])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-[#4a4a55] font-mono text-sm animate-pulse">
        Scanning Polymarket on-chain data...
      </div>
    )
  }

  return (
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

        {/* Buy/sell split bar */}
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
            ? 'No whale activity detected on active sports markets right now.'
            : `${buys.length} whale buy${buys.length !== 1 ? 's' : ''} vs ${sells.length} sell${sells.length !== 1 ? 's' : ''} detected across active sports markets.`}
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

      {/* Filter + Sort bar */}
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
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="text-4xl mb-3">🐋</div>
          <p className="text-[#4a4a55] text-sm font-mono mb-1">No whale signals detected</p>
          <p className="text-[#3a3a45] text-xs max-w-sm">
            Signals appear when a wallet trades $10K+ on an active sports market on Polymarket. Check back when games are live.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((signal, i) => (
            <div key={`${signal.wallet}-${signal.slug}-${i}`}
              className="bg-[#0f0f17] border border-[#1c1c2e] rounded-xl overflow-hidden hover:border-[#2a2a3e] transition-colors">

              {/* Top section — market info */}
              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
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

                {/* Badges */}
                <div className="flex items-center gap-2 mt-3 flex-wrap">
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#1c1c2e] text-[#9999aa]">
                    {signal.outcome}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#7c3aed]/15 text-[#a78bfa] border border-[#7c3aed]/20">
                    ⊙ ${signal.usdSize.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </span>
                </div>

                {/* Divergence card */}
                <div className="mt-3 bg-[#08080f] border border-[#1c1c2e] rounded-lg p-3">
                  <div className="flex items-center justify-between gap-4">

                    {/* Polymarket side */}
                    <div className="text-center">
                      <p className="text-[10px] text-[#4a4a55] font-mono uppercase tracking-widest mb-1">Polymarket</p>
                      <p className="text-lg font-bold text-white">{signal.impliedProb}%</p>
                      <p className="text-[11px] font-mono text-[#6b7280]">{signal.polyAmericanOdds ?? '—'}</p>
                    </div>

                    {/* Gap indicator */}
                    <div className="flex-1 flex flex-col items-center gap-1">
                      {signal.divergencePts !== null ? (
                        <>
                          <div className={`text-sm font-bold px-2 py-0.5 rounded ${
                            signal.divergencePts > 5
                              ? 'text-green-400 bg-green-500/10'
                              : signal.divergencePts < -5
                              ? 'text-red-400 bg-red-500/10'
                              : 'text-yellow-400 bg-yellow-500/10'
                          }`}>
                            {signal.divergencePts > 0 ? '+' : ''}{signal.divergencePts}pt
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-[#1c1c2e] overflow-hidden">
                            <div
                              className={`h-full rounded-full ${signal.divergencePts > 0 ? 'bg-green-500' : 'bg-red-500'}`}
                              style={{ width: `${Math.min(Math.abs(signal.divergencePts) * 2, 100)}%`, marginLeft: signal.divergencePts < 0 ? 'auto' : undefined }}
                            />
                          </div>
                          <p className="text-[10px] text-[#4a4a55]">
                            {signal.divergencePts > 5 ? 'Poly higher than books' : signal.divergencePts < -5 ? 'Books higher than Poly' : 'Roughly aligned'}
                          </p>
                        </>
                      ) : (
                        <p className="text-[10px] text-[#3a3a45] text-center font-mono">no book line<br />matched</p>
                      )}
                    </div>

                    {/* Sportsbook side */}
                    <div className="text-center">
                      <p className="text-[10px] text-[#4a4a55] font-mono uppercase tracking-widest mb-1">
                        {signal.bookName ?? 'Sportsbook'}
                      </p>
                      {signal.bookImpliedProb !== null ? (
                        <>
                          <p className="text-lg font-bold text-[#9999aa]">{signal.bookImpliedProb}%</p>
                          <p className="text-[11px] font-mono text-[#6b7280]">
                            {signal.bookOdds !== null
                              ? `${signal.bookOdds > 0 ? '+' : ''}${signal.bookOdds}`
                              : '—'}
                          </p>
                        </>
                      ) : (
                        <p className="text-lg font-bold text-[#3a3a45]">—</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom sub-card — trade detail */}
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
                      <a
                        href={`https://polymarket.com/profile/${signal.wallet}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-[#6b7280] hover:text-[#9999aa] transition-colors font-mono"
                      >
                        {signal.pseudonym}
                      </a>
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

      <p className="text-[10px] text-[#3a3a45] font-mono text-center pt-2">
        All trades verified on-chain · Polymarket · Polygon network · $10K+ threshold
      </p>
    </div>
  )
}
