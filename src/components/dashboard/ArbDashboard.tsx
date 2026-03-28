'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Arb } from '@/types'
import { MARKET_LABELS, FREE_TIER } from '@/lib/config'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'

const REFRESH_INTERVAL = 30_000

interface Filters {
  market: string
  minMargin: string
  book: string
}

interface ArbDashboardProps {
  isPremium: boolean
}

function applyFreeTier(arbs: Arb[], isPremium: boolean): { arbs: Arb[]; isDelayed: boolean } {
  if (isPremium) return { arbs, isDelayed: false }

  const cutoff = new Date(Date.now() - FREE_TIER.delayMinutes * 60 * 1000)
  const delayed = arbs.filter(a => new Date(a.created_at) <= cutoff)
  return { arbs: delayed.slice(0, FREE_TIER.maxArbs), isDelayed: true }
}

function maskBookName(name: string): string {
  return 'Book ' + name.charCodeAt(0).toString().slice(-1)
}

export default function ArbDashboard({ isPremium }: ArbDashboardProps) {
  const supabase = createClient()
  const [arbs, setArbs] = useState<Arb[]>([])
  const [loading, setLoading] = useState(true)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())
  const [filters, setFilters] = useState<Filters>({ market: 'all', minMargin: '0', book: 'all' })
  const [bankroll, setBankroll] = useState(1000)
  const [allBooks, setAllBooks] = useState<string[]>([])

  const fetchArbs = useCallback(async () => {
    let query = supabase
      .from('arbs')
      .select('*')
      .eq('status', 'active')
      .order('profit_margin', { ascending: false })
      .limit(200)

    if (filters.market !== 'all') query = query.eq('market', filters.market)
    if (parseFloat(filters.minMargin) > 0) query = query.gte('profit_margin', parseFloat(filters.minMargin))

    const { data, error } = await query
    if (error) { console.error(error); return }

    const all = data ?? []
    setAllBooks([...new Set(all.flatMap(a => [a.book_a, a.book_b]))])

    const filtered = filters.book === 'all'
      ? all
      : all.filter(a => a.book_a === filters.book || a.book_b === filters.book)

    setArbs(filtered)
    setLastRefresh(new Date())
    setLoading(false)
  }, [filters])

  useEffect(() => {
    fetchArbs()
    const interval = setInterval(fetchArbs, REFRESH_INTERVAL)
    return () => clearInterval(interval)
  }, [fetchArbs])

  const { arbs: visibleArbs, isDelayed } = applyFreeTier(arbs, isPremium)
  const scaledArbs = visibleArbs.map(arb => {
    if (bankroll === 1000 || !isPremium) return arb
    const factor = bankroll / 1000
    return {
      ...arb,
      stake_a: parseFloat((arb.stake_a * factor).toFixed(2)),
      stake_b: parseFloat((arb.stake_b * factor).toFixed(2)),
    }
  })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header row */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">Live Arb Opportunities</h1>
          <p className="text-[#6b6b80] text-sm mt-0.5">
            {loading ? 'Loading...' : `${arbs.length} active · refreshed ${formatDistanceToNow(lastRefresh, { addSuffix: true })}`}
          </p>
        </div>
        <button
          onClick={fetchArbs}
          className="text-sm text-[#6b6b80] hover:text-[#e8e8f0] border border-[#2a2a32] rounded-md px-3 py-1.5 hover:border-[#3a3a45] transition-colors"
        >
          Refresh
        </button>
      </div>

      {/* Free tier banner */}
      {!isPremium && (
        <div className="mb-4 p-3 rounded-lg border border-green-500/20 bg-green-500/5 flex items-center justify-between gap-4">
          <div>
            <span className="text-green-400 text-sm font-medium">Free tier:</span>
            <span className="text-[#9999aa] text-sm ml-2">
              Showing up to {FREE_TIER.maxArbs} arbs with a {FREE_TIER.delayMinutes}-minute delay. Book names hidden.
            </span>
          </div>
          <Link
            href="/settings"
            className="shrink-0 text-sm px-3 py-1.5 rounded bg-green-600 hover:bg-green-500 text-white font-medium transition-colors"
          >
            Upgrade
          </Link>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4 p-3 bg-[#111114] border border-[#2a2a32] rounded-lg">
        <div className="flex items-center gap-2">
          <label className="text-xs text-[#6b6b80]">Market</label>
          <select
            value={filters.market}
            onChange={e => setFilters(f => ({ ...f, market: e.target.value }))}
            className="text-sm bg-[#1a1a1f] border border-[#2a2a32] rounded px-2 py-1 focus:outline-none focus:border-green-600"
          >
            <option value="all">All</option>
            <option value="h2h">Moneyline</option>
            <option value="spreads">Spread</option>
            <option value="totals">Total</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs text-[#6b6b80]">Min margin</label>
          <select
            value={filters.minMargin}
            onChange={e => setFilters(f => ({ ...f, minMargin: e.target.value }))}
            className="text-sm bg-[#1a1a1f] border border-[#2a2a32] rounded px-2 py-1 focus:outline-none focus:border-green-600"
          >
            <option value="0">Any</option>
            <option value="0.5">≥ 0.5%</option>
            <option value="1">≥ 1%</option>
            <option value="2">≥ 2%</option>
          </select>
        </div>

        {isPremium && (
          <>
            <div className="flex items-center gap-2">
              <label className="text-xs text-[#6b6b80]">Book</label>
              <select
                value={filters.book}
                onChange={e => setFilters(f => ({ ...f, book: e.target.value }))}
                className="text-sm bg-[#1a1a1f] border border-[#2a2a32] rounded px-2 py-1 focus:outline-none focus:border-green-600"
              >
                <option value="all">All</option>
                {allBooks.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

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
          </>
        )}
      </div>

      {/* Arb table */}
      {loading ? (
        <div className="text-center py-20 text-[#6b6b80]">Loading opportunities...</div>
      ) : scaledArbs.length === 0 ? (
        <div className="text-center py-20 text-[#6b6b80]">
          <div className="text-4xl mb-3">🔍</div>
          <p className="font-medium">No active arbs found</p>
          <p className="text-sm mt-1">The worker will alert you when opportunities appear</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-[#2a2a32]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#2a2a32] bg-[#111114]">
                <th className="text-left px-4 py-3 text-xs text-[#6b6b80] font-medium uppercase tracking-wider">Event</th>
                <th className="text-left px-4 py-3 text-xs text-[#6b6b80] font-medium uppercase tracking-wider">Market</th>
                <th className="text-left px-4 py-3 text-xs text-[#6b6b80] font-medium uppercase tracking-wider">Book A</th>
                <th className="text-left px-4 py-3 text-xs text-[#6b6b80] font-medium uppercase tracking-wider">Book B</th>
                <th className="text-right px-4 py-3 text-xs text-[#6b6b80] font-medium uppercase tracking-wider">Profit</th>
                <th className="text-right px-4 py-3 text-xs text-[#6b6b80] font-medium uppercase tracking-wider">Stakes</th>
                <th className="text-right px-4 py-3 text-xs text-[#6b6b80] font-medium uppercase tracking-wider">Found</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1a1a1f]">
              {scaledArbs.map(arb => {
                const bookA = isPremium ? arb.book_a : maskBookName(arb.book_a)
                const bookB = isPremium ? arb.book_b : maskBookName(arb.book_b)
                return (
                  <tr key={arb.id} className="hover:bg-[#111114] transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-[#e8e8f0]">{arb.event_name}</div>
                      <div className="text-xs text-[#6b6b80] mt-0.5">{new Date(arb.commence_time).toLocaleDateString()}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-1.5 py-0.5 rounded text-xs bg-[#1a1a1f] border border-[#2a2a32] text-[#9999aa] font-mono">
                        {MARKET_LABELS[arb.market] ?? arb.market}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono">
                      <div className={isPremium ? 'text-[#e8e8f0]' : 'text-[#6b6b80] blur-[3px] select-none'}>{bookA}</div>
                      <div className="text-xs text-[#9999aa] mt-0.5">
                        {arb.outcome_a} <span className="text-green-400">{arb.odds_a > 0 ? '+' : ''}{arb.odds_a}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono">
                      <div className={isPremium ? 'text-[#e8e8f0]' : 'text-[#6b6b80] blur-[3px] select-none'}>{bookB}</div>
                      <div className="text-xs text-[#9999aa] mt-0.5">
                        {arb.outcome_b} <span className="text-green-400">{arb.odds_b > 0 ? '+' : ''}{arb.odds_b}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="font-mono font-semibold text-green-400">
                        +{arb.profit_margin.toFixed(2)}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-xs text-[#9999aa]">
                      <div>${arb.stake_a} / ${arb.stake_b}</div>
                      <div className="text-green-400 mt-0.5">
                        +${((arb.stake_a + arb.stake_b) * arb.profit_margin / 100).toFixed(2)}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right text-xs text-[#6b6b80]">
                      {isDelayed
                        ? <span className="text-yellow-500/70">delayed</span>
                        : formatDistanceToNow(new Date(arb.created_at), { addSuffix: true })}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Free tier limit message */}
      {!isPremium && arbs.length > FREE_TIER.maxArbs && (
        <div className="mt-4 text-center py-6 border border-dashed border-[#2a2a32] rounded-lg text-[#6b6b80] text-sm">
          {arbs.length - FREE_TIER.maxArbs} more arbs hidden.{' '}
          <Link href="/settings" className="text-green-400 hover:text-green-300">
            Upgrade to Premium
          </Link>{' '}
          for full access.
        </div>
      )}
    </div>
  )
}
