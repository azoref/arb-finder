'use client'
import { useState, useEffect, useCallback } from 'react'
import AddBetModal from './AddBetModal'

interface Bet {
  id: string
  created_at: string
  sport: string
  event: string
  market: string
  selection: string
  book: string
  odds: number
  stake: number
  result: 'pending' | 'win' | 'loss' | 'push'
  profit: number | null
  notes: string | null
  is_arb: boolean
}

function formatOdds(odds: number) {
  return odds > 0 ? `+${odds}` : `${odds}`
}

function ResultBadge({ result, id, onUpdate }: { result: string; id: string; onUpdate: () => void }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const colors: Record<string, string> = {
    pending: 'text-[#6b6b80] border-[#2a2a32]',
    win: 'text-green-400 border-green-500/30 bg-green-500/10',
    loss: 'text-red-400 border-red-500/30 bg-red-500/10',
    push: 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10',
  }

  async function setResult(newResult: string) {
    setLoading(true)
    await fetch(`/api/bets/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ result: newResult }),
    })
    setOpen(false)
    setLoading(false)
    onUpdate()
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-widest border ${colors[result]} hover:opacity-80 transition-opacity`}
      >
        {loading ? '...' : result}
      </button>
      {open && (
        <div className="absolute right-0 top-6 z-10 bg-[#0d0d10] border border-[#2a2a32] rounded-lg overflow-hidden shadow-xl">
          {['win', 'loss', 'push', 'pending'].map(r => (
            <button key={r} onClick={() => setResult(r)}
              className="block w-full px-4 py-2 text-xs text-left hover:bg-[#1a1a1f] text-[#9999aa] hover:text-[#e8e8f0] transition-colors capitalize">
              {r}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function BetTracker() {
  const [bets, setBets] = useState<Bet[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [filter, setFilter] = useState<'all' | 'pending' | 'win' | 'loss'>('all')

  const fetchBets = useCallback(async () => {
    const res = await fetch('/api/bets')
    if (res.ok) setBets(await res.json())
    setLoading(false)
  }, [])

  useEffect(() => { fetchBets() }, [fetchBets])

  async function deleteBet(id: string) {
    await fetch(`/api/bets/${id}`, { method: 'DELETE' })
    fetchBets()
  }

  // Stats
  const settled = bets.filter(b => b.result !== 'pending')
  const wins = bets.filter(b => b.result === 'win')
  const totalProfit = settled.reduce((sum, b) => sum + (b.profit ?? 0), 0)
  const totalStaked = settled.reduce((sum, b) => sum + b.stake, 0)
  const roi = totalStaked > 0 ? (totalProfit / totalStaked) * 100 : 0
  const winRate = settled.length > 0 ? (wins.length / settled.filter(b => b.result !== 'push').length) * 100 : 0

  const filtered = filter === 'all' ? bets : bets.filter(b => b.result === filter)

  const stats = [
    { label: 'TOTAL P&L', value: `${totalProfit >= 0 ? '+' : ''}$${totalProfit.toFixed(2)}`, color: totalProfit >= 0 ? 'text-green-400' : 'text-red-400' },
    { label: 'ROI', value: `${roi >= 0 ? '+' : ''}${roi.toFixed(1)}%`, color: roi >= 0 ? 'text-green-400' : 'text-red-400' },
    { label: 'WIN RATE', value: `${winRate.toFixed(0)}%`, color: 'text-[#e8e8f0]' },
    { label: 'BETS LOGGED', value: `${bets.length}`, color: 'text-[#e8e8f0]' },
  ]

  return (
    <div className="min-h-screen bg-[#080808] text-[#e8e8f0]">
      {/* Header */}
      <div className="border-b border-[#1a1a1f] bg-[#0a0a0b]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">Bet Tracker</h1>
            <p className="text-sm text-[#4a4a55] mt-0.5 font-mono">Track every bet. Measure your edge.</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-green-500 hover:bg-green-400 text-black font-semibold text-sm rounded-lg transition-colors"
          >
            + Log bet
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

        {/* Bets table */}
        {loading ? (
          <div className="text-center text-[#4a4a55] py-20 font-mono text-sm">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-[#4a4a55] text-sm font-mono mb-4">No bets logged yet.</p>
            <button onClick={() => setShowModal(true)}
              className="px-4 py-2 bg-green-500 hover:bg-green-400 text-black font-semibold text-sm rounded-lg transition-colors">
              Log your first bet
            </button>
          </div>
        ) : (
          <div className="bg-[#0d0d10] border border-[#1a1a1f] rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#1a1a1f]">
                  {['EVENT', 'SELECTION', 'BOOK', 'ODDS', 'STAKE', 'P&L', 'RESULT', ''].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[10px] font-mono text-[#4a4a55] uppercase tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((bet, i) => (
                  <tr key={bet.id} className={`border-b border-[#0f0f12] hover:bg-[#111114] transition-colors ${i === filtered.length - 1 ? 'border-b-0' : ''}`}>
                    <td className="px-4 py-3">
                      <div className="font-medium text-[#e8e8f0] truncate max-w-[160px]">{bet.event}</div>
                      <div className="text-[10px] text-[#4a4a55] font-mono mt-0.5">{bet.sport} · {bet.market}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[#9999aa]">{bet.selection}</span>
                      {bet.is_arb && <span className="ml-2 text-[9px] font-mono text-green-500/60 bg-green-500/10 px-1 py-0.5 rounded">ARB</span>}
                    </td>
                    <td className="px-4 py-3 text-[#6b6b80] font-mono text-xs">{bet.book}</td>
                    <td className="px-4 py-3 font-mono text-[#e8e8f0]">{formatOdds(bet.odds)}</td>
                    <td className="px-4 py-3 font-mono text-[#6b6b80]">${bet.stake.toFixed(2)}</td>
                    <td className="px-4 py-3 font-mono font-semibold">
                      {bet.profit === null
                        ? <span className="text-[#4a4a55]">—</span>
                        : <span className={bet.profit >= 0 ? 'text-green-400' : 'text-red-400'}>
                            {bet.profit >= 0 ? '+' : ''}${bet.profit.toFixed(2)}
                          </span>
                      }
                    </td>
                    <td className="px-4 py-3">
                      <ResultBadge result={bet.result} id={bet.id} onUpdate={fetchBets} />
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => deleteBet(bet.id)}
                        className="text-[#3a3a45] hover:text-red-400 transition-colors text-xs font-mono">
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <AddBetModal
          onClose={() => setShowModal(false)}
          onSave={() => { setShowModal(false); fetchBets() }}
        />
      )}
    </div>
  )
}
