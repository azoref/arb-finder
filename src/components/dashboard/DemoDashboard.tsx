'use client'

import { useState } from 'react'
import Link from 'next/link'
import { MARKET_LABELS } from '@/lib/config'
import OddsTable from './OddsTable'

type Tab = 'arbs' | 'odds'

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
  const [tab, setTab] = useState<Tab>('arbs')
  const [bankroll, setBankroll] = useState(1000)

  const scaledArbs = DEMO_ARBS.map(arb => {
    const factor = bankroll / 1000
    return {
      ...arb,
      stake_a: parseFloat((arb.stake_a * factor).toFixed(2)),
      stake_b: parseFloat((arb.stake_b * factor).toFixed(2)),
    }
  })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">NBA Dashboard</h1>
          <p className="text-[#6b6b80] text-sm mt-0.5">
            {tab === 'arbs' ? `${DEMO_ARBS.length} sample arbs · demo data` : 'Live odds across all major US sportsbooks'}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-[#2a2a32]">
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
