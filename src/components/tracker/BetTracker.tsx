'use client'
import { useState, useEffect, useCallback } from 'react'
import AddBetModal from './AddBetModal'

interface Trade {
  id: string
  created_at: string
  sport: string
  event: string
  selection: string
  odds: number
  stake: number
  result: 'pending' | 'win' | 'loss' | 'push'
  profit: number | null
  notes: string | null
  is_arb: boolean
}

const CAT_COLORS: Record<string, string> = {
  Politics: '#f59e0b',
  Crypto: '#06b6d4',
  Sports: '#22c55e',
  Other: '#9999aa',
}

function ResultSelect({ result, id, onUpdate }: { result: string; id: string; onUpdate: () => void }) {
  const [loading, setLoading] = useState(false)

  const colorClass: Record<string, string> = {
    pending: 'text-[#6b6b80]',
    win: 'text-green-400',
    loss: 'text-red-400',
    push: 'text-yellow-400',
  }

  async function handleChange(newResult: string) {
    setLoading(true)
    await fetch(`/api/bets/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ result: newResult }),
    })
    setLoading(false)
    onUpdate()
  }

  return (
    <select
      value={result}
      disabled={loading}
      onChange={e => handleChange(e.target.value)}
      className={`bg-[#111114] border border-[#2a2a32] rounded px-2 py-1 text-[11px] font-mono uppercase tracking-widest focus:outline-none focus:border-green-500/50 cursor-pointer disabled:opacity-50 ${colorClass[result]}`}
    >
      <option value="pending">Pending</option>
      <option value="win">Win</option>
      <option value="loss">Loss</option>
      <option value="push">Push</option>
    </select>
  )
}

export default function BetTracker() {
  const [trades, setTrades] = useState<Trade[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [filter, setFilter] = useState<'all' | 'pending' | 'win' | 'loss'>('all')

  const fetchTrades = useCallback(async () => {
    const res = await fetch('/api/bets')
    if (res.ok) setTrades(await res.json())
    setLoading(false)
  }, [])

  useEffect(() => { fetchTrades() }, [fetchTrades])

  async function deleteTrade(id: string) {
    await fetch(`/api/bets/${id}`, { method: 'DELETE' })
    fetchTrades()
  }

  const settled = trades.filter(b => b.result !== 'pending')
  const wins = trades.filter(b => b.result === 'win')
  const totalProfit = settled.reduce((sum, b) => sum + (b.profit ?? 0), 0)
  const totalStaked = settled.reduce((sum, b) => sum + b.stake, 0)
  const roi = totalStaked > 0 ? (totalProfit / totalStaked) * 100 : 0
  const winRate = settled.length > 0 ? (wins.length / settled.filter(b => b.result !== 'push').length) * 100 : 0

  const filtered = filter === 'all' ? trades : trades.filter(b => b.result === filter)

  const stats = [
    { label: 'TOTAL P&L', value: `${totalProfit >= 0 ? '+' : ''}$${totalProfit.toFixed(2)}`, color: totalProfit >= 0 ? 'text-green-400' : 'text-red-400' },
    { label: 'ROI', value: `${roi >= 0 ? '+' : ''}${roi.toFixed(1)}%`, color: roi >= 0 ? 'text-green-400' : 'text-red-400' },
    { label: 'WIN RATE', value: `${winRate.toFixed(0)}%`, color: 'text-[#e8e8f0]' },
    { label: 'TRADES LOGGED', value: `${trades.length}`, color: 'text-[#e8e8f0]' },
  ]

  return (
    <div className="min-h-screen bg-[#080808] text-[#e8e8f0]">
      {/* Header */}
      <div className="border-b border-[#1a1a1f] bg-[#0a0a0b]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">Trade Journal</h1>
            <p className="text-sm text-[#4a4a55] mt-0.5 font-mono">Track your Polymarket positions.</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-green-500 hover:bg-green-400 text-black font-semibold text-sm rounded-lg transition-colors"
          >
            + Log trade
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {stats.map(({ label, value, color }) => (
            <div key={label} className="bg-[#0d0d10] border border-[#1a1a1f] rounded-xl p-4">
              <p className="text-[10px] font-mono text-[#4a4a55] uppercase tracking-widest mb-1">{label}</p>
              <p className={`text-2xl font-bold font-mono ${color}`}>{value}</p>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2">
          {(['all', 'pending', 'win', 'loss'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded text-xs font-mono uppercase tracking-widest transition-colors ${
                filter === f
                  ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                  : 'text-[#4a4a55] hover:text-[#6b6b80]'
              }`}>
              {f}
            </button>
          ))}
        </div>

        {/* Trades table */}
        {loading ? (
          <div className="text-center text-[#4a4a55] py-20 font-mono text-sm">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-[#4a4a55] text-sm font-mono mb-4">No trades logged yet.</p>
            <button onClick={() => setShowModal(true)}
              className="px-4 py-2 bg-green-500 hover:bg-green-400 text-black font-semibold text-sm rounded-lg transition-colors">
              Log your first trade
            </button>
          </div>
        ) : (
          <div className="bg-[#0d0d10] border border-[#1a1a1f] rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#1a1a1f]">
                  {['MARKET', 'OUTCOME', 'ENTRY', 'STAKE', 'P&L', 'RESULT', ''].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[10px] font-mono text-[#4a4a55] uppercase tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((trade, i) => {
                  const catColor = CAT_COLORS[trade.sport] ?? '#9999aa'
                  return (
                    <tr key={trade.id} className={`border-b border-[#0f0f12] hover:bg-[#111114] transition-colors ${i === filtered.length - 1 ? 'border-b-0' : ''}`}>
                      <td className="px-4 py-3">
                        <div className="font-medium text-[#e8e8f0] truncate max-w-[200px]">{trade.event}</div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span
                            className="text-[9px] font-mono px-1 py-0.5 rounded"
                            style={{ color: catColor, background: catColor + '18' }}
                          >
                            {trade.sport.toUpperCase()}
                          </span>
                          {trade.is_arb && (
                            <span className="text-[9px] font-mono text-violet-400 bg-violet-500/10 px-1 py-0.5 rounded">SIGNAL</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-mono font-semibold ${trade.selection === 'Yes' ? 'text-green-400' : 'text-red-400'}`}>
                          {trade.selection}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-[#e8e8f0]">{trade.odds}¢</td>
                      <td className="px-4 py-3 font-mono text-[#6b6b80]">${trade.stake.toFixed(2)}</td>
                      <td className="px-4 py-3 font-mono font-semibold">
                        {trade.profit === null
                          ? <span className="text-[#4a4a55]">—</span>
                          : <span className={trade.profit >= 0 ? 'text-green-400' : 'text-red-400'}>
                              {trade.profit >= 0 ? '+' : ''}${trade.profit.toFixed(2)}
                            </span>
                        }
                      </td>
                      <td className="px-4 py-3">
                        <ResultSelect result={trade.result} id={trade.id} onUpdate={fetchTrades} />
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => deleteTrade(trade.id)}
                          className="text-[#3a3a45] hover:text-red-400 transition-colors text-xs font-mono">
                          ✕
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <AddBetModal
          onClose={() => setShowModal(false)}
          onSave={() => { setShowModal(false); fetchTrades() }}
        />
      )}
    </div>
  )
}
