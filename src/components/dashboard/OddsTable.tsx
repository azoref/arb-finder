'use client'

import { useState, useEffect } from 'react'
import { MARKET_LABELS } from '@/lib/config'

interface Outcome {
  name: string
  price: number
  point?: number
}

interface Market {
  key: string
  outcomes: Outcome[]
}

interface Bookmaker {
  key: string
  title: string
  markets: Market[]
}

interface OddsEvent {
  id: string
  home_team: string
  away_team: string
  commence_time: string
  bookmakers: Bookmaker[]
}

type MarketKey = 'h2h' | 'spreads' | 'totals'

function americanToImplied(odds: number): number {
  if (odds > 0) return 100 / (odds + 100)
  return Math.abs(odds) / (Math.abs(odds) + 100)
}

function formatOdds(price: number, point?: number): string {
  const prefix = price > 0 ? '+' : ''
  const pointStr = point !== undefined ? ` (${point > 0 ? '+' : ''}${point})` : ''
  return `${prefix}${price}${pointStr}`
}

function isBestOdds(price: number, allPrices: number[]): boolean {
  // Higher odds = better for bettor
  return price === Math.max(...allPrices)
}

export default function OddsTable() {
  const [events, setEvents] = useState<OddsEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [market, setMarket] = useState<MarketKey>('h2h')
  const [lastFetched, setLastFetched] = useState<Date | null>(null)

  useEffect(() => {
    async function fetchOdds() {
      try {
        setLoading(true)
        const res = await fetch('/api/odds')
        if (!res.ok) throw new Error('Failed to fetch odds')
        const data = await res.json()
        setEvents(data)
        setLastFetched(new Date())
        setError(null)
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to load odds')
      } finally {
        setLoading(false)
      }
    }
    fetchOdds()
    const interval = setInterval(fetchOdds, 60_000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="text-center py-20 text-[#6b6b80]">
        <div className="animate-pulse text-2xl mb-3">📡</div>
        <p>Fetching live odds...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-20 text-[#6b6b80]">
        <div className="text-2xl mb-3">📡</div>
        <p className="font-medium text-[#9999aa]">Odds data is loading</p>
        <p className="text-sm mt-1">The worker fetches fresh odds every 30 minutes. Check back shortly.</p>
      </div>
    )
  }

  const upcomingEvents = events
    .filter(e => new Date(e.commence_time) > new Date(Date.now() - 3 * 60 * 60 * 1000))
    .sort((a, b) => new Date(a.commence_time).getTime() - new Date(b.commence_time).getTime())

  if (upcomingEvents.length === 0) {
    return (
      <div className="text-center py-20 text-[#6b6b80]">
        <div className="text-4xl mb-3">🏀</div>
        <p className="font-medium">No upcoming NBA games right now</p>
        <p className="text-sm mt-1">Check back when games are scheduled</p>
      </div>
    )
  }

  // Collect all books that appear across events
  const allBooksMap = new Map<string, string>()
  upcomingEvents.forEach(e =>
    e.bookmakers.forEach(b => allBooksMap.set(b.key, b.title))
  )
  const allBooks = Array.from(allBooksMap.entries())

  return (
    <div>
      {/* Market selector */}
      <div className="flex gap-2 mb-5">
        {(['h2h', 'spreads', 'totals'] as MarketKey[]).map(m => (
          <button
            key={m}
            onClick={() => setMarket(m)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              market === m
                ? 'bg-green-600 text-white'
                : 'bg-[#111114] border border-[#2a2a32] text-[#9999aa] hover:text-[#e8e8f0] hover:border-[#3a3a45]'
            }`}
          >
            {MARKET_LABELS[m]}
          </button>
        ))}
        {lastFetched && (
          <span className="ml-auto text-xs text-[#4a4a55] self-center">
            Updated {lastFetched.toLocaleTimeString()}
          </span>
        )}
      </div>

      {/* Games */}
      <div className="space-y-4">
        {upcomingEvents.map(event => {
          const bookOddsMap = new Map<string, Market>()
          event.bookmakers.forEach(b => {
            const m = b.markets.find(mk => mk.key === market)
            if (m) bookOddsMap.set(b.key, m)
          })

          if (bookOddsMap.size === 0) return null

          // Get all outcome names for this market
          const sampleMarket = Array.from(bookOddsMap.values())[0]
          const outcomeNames = sampleMarket.outcomes.map(o => o.name)

          // For each outcome, collect all prices across books for best-odds highlighting
          const pricesByOutcome: Record<string, number[]> = {}
          outcomeNames.forEach(name => {
            pricesByOutcome[name] = []
          })
          bookOddsMap.forEach(m => {
            m.outcomes.forEach(o => {
              if (pricesByOutcome[o.name] !== undefined) {
                pricesByOutcome[o.name].push(o.price)
              }
            })
          })

          const gameTime = new Date(event.commence_time)
          const isLive = gameTime <= new Date()

          return (
            <div key={event.id} className="border border-[#2a2a32] rounded-lg overflow-hidden">
              {/* Game header */}
              <div className="px-4 py-3 bg-[#111114] flex items-center justify-between">
                <div>
                  <span className="font-medium text-[#e8e8f0]">
                    {event.away_team} <span className="text-[#4a4a55]">@</span> {event.home_team}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {isLive ? (
                    <span className="flex items-center gap-1.5 text-xs font-mono text-red-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                      LIVE
                    </span>
                  ) : (
                    <span className="text-xs text-[#6b6b80]">
                      {gameTime.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}{' '}
                      {gameTime.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}
                    </span>
                  )}
                  <span className="text-xs text-[#4a4a55]">{bookOddsMap.size} books</span>
                </div>
              </div>

              {/* Odds grid */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#1a1a1f]">
                      <th className="text-left px-4 py-2 text-xs text-[#6b6b80] font-medium w-36 sticky left-0 bg-[#0d0d10]">
                        {market === 'totals' ? 'Line' : 'Team'}
                      </th>
                      {allBooks.map(([key, title]) => {
                        const hasData = bookOddsMap.has(key)
                        return (
                          <th
                            key={key}
                            className={`text-center px-3 py-2 text-xs font-medium whitespace-nowrap ${
                              hasData ? 'text-[#9999aa]' : 'text-[#2a2a32]'
                            }`}
                          >
                            {title}
                          </th>
                        )
                      })}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1a1a1f]">
                    {outcomeNames.map(outcomeName => (
                      <tr key={outcomeName} className="hover:bg-[#111114] transition-colors">
                        <td className="px-4 py-2.5 font-medium text-[#e8e8f0] sticky left-0 bg-[#0d0d10] text-xs">
                          {outcomeName}
                        </td>
                        {allBooks.map(([bookKey]) => {
                          const bookMarket = bookOddsMap.get(bookKey)
                          const outcome = bookMarket?.outcomes.find(o => o.name === outcomeName)
                          if (!outcome) {
                            return (
                              <td key={bookKey} className="px-3 py-2.5 text-center text-[#2a2a32]">—</td>
                            )
                          }
                          const best = isBestOdds(outcome.price, pricesByOutcome[outcomeName] ?? [])
                          const implied = (americanToImplied(outcome.price) * 100).toFixed(1)
                          return (
                            <td key={bookKey} className="px-3 py-2.5 text-center">
                              <div className={`font-mono font-medium ${best ? 'text-green-400' : 'text-[#9999aa]'}`}>
                                {formatOdds(outcome.price, outcome.point)}
                              </div>
                              <div className="text-[10px] text-[#4a4a55] mt-0.5">{implied}%</div>
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
        })}
      </div>

      <p className="text-xs text-[#4a4a55] text-center mt-6">
        🟢 Green = best available odds · % = implied probability · Refreshes every 60s
      </p>
    </div>
  )
}
