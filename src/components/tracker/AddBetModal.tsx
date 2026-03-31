'use client'
import { useState } from 'react'

const CATEGORIES = ['Politics', 'Crypto', 'Sports', 'Other']

interface Props {
  onClose: () => void
  onSave: () => void
}

export default function AddBetModal({ onClose, onSave }: Props) {
  const [form, setForm] = useState({
    sport: 'Politics',
    event: '',
    selection: 'Yes',
    odds: '',
    stake: '',
    notes: '',
    is_arb: false,
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const set = (k: string, v: string | boolean) => setForm(f => ({ ...f, [k]: v }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.event || !form.odds || !form.stake) {
      setError('Please fill in all required fields.')
      return
    }
    const price = parseFloat(form.odds)
    if (isNaN(price) || price <= 0 || price >= 100) {
      setError('Entry price must be between 1 and 99.')
      return
    }
    setSaving(true)
    setError('')
    const res = await fetch('/api/bets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, market: form.selection, book: 'Polymarket' }),
    })
    if (res.ok) {
      onSave()
    } else {
      const d = await res.json()
      setError(d.error ?? 'Failed to save trade.')
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#0d0d10] border border-[#2a2a32] rounded-2xl w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1a1a1f]">
          <h2 className="font-semibold text-[#e8e8f0]">Log a trade</h2>
          <button onClick={onClose} className="text-[#4a4a55] hover:text-[#9999aa] transition-colors text-xl leading-none">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Row 1: category + outcome */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-mono text-[#4a4a55] uppercase tracking-widest mb-1 block">Category</label>
              <select value={form.sport} onChange={e => set('sport', e.target.value)}
                className="w-full bg-[#111114] border border-[#2a2a32] rounded-lg px-3 py-2 text-sm text-[#e8e8f0] focus:outline-none focus:border-green-500/50">
                {CATEGORIES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-mono text-[#4a4a55] uppercase tracking-widest mb-1 block">Outcome</label>
              <select value={form.selection} onChange={e => set('selection', e.target.value)}
                className="w-full bg-[#111114] border border-[#2a2a32] rounded-lg px-3 py-2 text-sm text-[#e8e8f0] focus:outline-none focus:border-green-500/50">
                <option>Yes</option>
                <option>No</option>
              </select>
            </div>
          </div>

          {/* Market question */}
          <div>
            <label className="text-[10px] font-mono text-[#4a4a55] uppercase tracking-widest mb-1 block">Market *</label>
            <input value={form.event} onChange={e => set('event', e.target.value)}
              placeholder="e.g. Will Republicans win the House in 2026?"
              className="w-full bg-[#111114] border border-[#2a2a32] rounded-lg px-3 py-2 text-sm text-[#e8e8f0] placeholder-[#3a3a45] focus:outline-none focus:border-green-500/50" />
          </div>

          {/* Row: entry price + stake */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-mono text-[#4a4a55] uppercase tracking-widest mb-1 block">Entry price (¢) *</label>
              <input value={form.odds} onChange={e => set('odds', e.target.value)}
                placeholder="e.g. 65"
                className="w-full bg-[#111114] border border-[#2a2a32] rounded-lg px-3 py-2 text-sm text-[#e8e8f0] placeholder-[#3a3a45] focus:outline-none focus:border-green-500/50" />
            </div>
            <div>
              <label className="text-[10px] font-mono text-[#4a4a55] uppercase tracking-widest mb-1 block">Stake ($) *</label>
              <input value={form.stake} onChange={e => set('stake', e.target.value)}
                placeholder="100"
                className="w-full bg-[#111114] border border-[#2a2a32] rounded-lg px-3 py-2 text-sm text-[#e8e8f0] placeholder-[#3a3a45] focus:outline-none focus:border-green-500/50" />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-[10px] font-mono text-[#4a4a55] uppercase tracking-widest mb-1 block">Notes</label>
            <input value={form.notes} onChange={e => set('notes', e.target.value)}
              placeholder="Optional, e.g. which whale signal you followed"
              className="w-full bg-[#111114] border border-[#2a2a32] rounded-lg px-3 py-2 text-sm text-[#e8e8f0] placeholder-[#3a3a45] focus:outline-none focus:border-green-500/50" />
          </div>

          {/* Followed signal toggle */}
          <label className="flex items-center gap-3 cursor-pointer">
            <div className={`w-8 h-4 rounded-full transition-colors ${form.is_arb ? 'bg-green-500' : 'bg-[#2a2a32]'}`}
              onClick={() => set('is_arb', !form.is_arb)}>
              <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${form.is_arb ? 'translate-x-4' : 'translate-x-0'}`} />
            </div>
            <span className="text-sm text-[#6b6b80]">Followed a whale signal</span>
          </label>

          {error && <p className="text-red-400 text-xs">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-lg border border-[#2a2a32] text-sm text-[#6b6b80] hover:text-[#9999aa] transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 px-4 py-2.5 rounded-lg bg-green-500 hover:bg-green-400 text-black font-semibold text-sm transition-colors disabled:opacity-50">
              {saving ? 'Saving...' : 'Log trade'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
