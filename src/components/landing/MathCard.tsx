'use client'

import { useState, useEffect } from 'react'

const EXAMPLES = [
  {
    game: 'Celtics vs Heat',
    teamA: 'Celtics',
    teamB: 'Heat',
    bookA: { name: 'DraftKings', odds: +108 },
    bookB: { name: 'FanDuel', odds: +106 },
    impliedA: 48.08,
    impliedB: 48.54,
  },
  {
    game: 'Lakers vs Nuggets',
    teamA: 'Lakers',
    teamB: 'Nuggets',
    bookA: { name: 'BetMGM', odds: +112 },
    bookB: { name: 'Caesars', odds: +104 },
    impliedA: 47.17,
    impliedB: 49.04,
  },
  {
    game: 'Warriors vs Suns',
    teamA: 'Warriors',
    teamB: 'Suns',
    bookA: { name: 'DraftKings', odds: +115 },
    bookB: { name: 'PointsBet', odds: +100 },
    impliedA: 46.51,
    impliedB: 50.0,
  },
]

export default function MathCard() {
  const [idx, setIdx] = useState(0)
  const [step, setStep] = useState(0)

  const ex = EXAMPLES[idx]
  const total = ex.impliedA + ex.impliedB
  const profit = (100 - total).toFixed(2)

  useEffect(() => {
    // Cycle through steps 0→3, then move to next example
    const t = setTimeout(() => {
      if (step < 3) {
        setStep(s => s + 1)
      } else {
        setTimeout(() => {
          setIdx(i => (i + 1) % EXAMPLES.length)
          setStep(0)
        }, 2000)
      }
    }, 1200)
    return () => clearTimeout(t)
  }, [step, idx])

  return (
    <div className="bg-[#0d0d10] border border-[#2a2a32] rounded-xl p-6 font-mono text-sm max-w-md w-full">
      {/* Game header */}
      <div className="flex items-center justify-between mb-5">
        <span className="text-[#6b6b80] text-xs uppercase tracking-wider">{ex.game}</span>
        <span className="text-[10px] px-2 py-0.5 rounded border border-green-500/20 text-green-400 bg-green-500/5">
          ARB DETECTED
        </span>
      </div>

      {/* Row A */}
      <div className={`flex items-center justify-between py-2 border-b border-[#1a1a1f] transition-opacity duration-500 ${step >= 1 ? 'opacity-100' : 'opacity-0'}`}>
        <div>
          <span className="text-[#9999aa]">{ex.bookA.name}</span>
          <span className="text-[#4a4a55] mx-2">·</span>
          <span className="text-[#e8e8f0]">{ex.teamA}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-green-400">+{ex.bookA.odds}</span>
          {step >= 2 && (
            <span className="text-[#6b6b80] text-xs">= {ex.impliedA.toFixed(1)}%</span>
          )}
        </div>
      </div>

      {/* Row B */}
      <div className={`flex items-center justify-between py-2 border-b border-[#1a1a1f] transition-opacity duration-500 ${step >= 1 ? 'opacity-100' : 'opacity-0'}`}>
        <div>
          <span className="text-[#9999aa]">{ex.bookB.name}</span>
          <span className="text-[#4a4a55] mx-2">·</span>
          <span className="text-[#e8e8f0]">{ex.teamB}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-green-400">+{ex.bookB.odds}</span>
          {step >= 2 && (
            <span className="text-[#6b6b80] text-xs">= {ex.impliedB.toFixed(1)}%</span>
          )}
        </div>
      </div>

      {/* Sum */}
      {step >= 2 && (
        <div className="flex items-center justify-between pt-3 pb-1 text-xs text-[#6b6b80]">
          <span>Combined implied probability</span>
          <span className={total < 100 ? 'text-green-400 font-semibold' : 'text-red-400'}>
            {total.toFixed(1)}%
          </span>
        </div>
      )}

      {/* Profit */}
      {step >= 3 && (
        <div className="mt-3 p-3 rounded-lg bg-green-500/5 border border-green-500/20 flex items-center justify-between">
          <div>
            <p className="text-green-400 font-semibold text-sm">Guaranteed profit</p>
            <p className="text-[#6b6b80] text-xs mt-0.5">Bet both sides with optimal stakes</p>
          </div>
          <span className="text-green-400 font-bold text-lg">+{profit}%</span>
        </div>
      )}

      {/* Dots */}
      <div className="flex justify-center gap-1.5 mt-5">
        {EXAMPLES.map((_, i) => (
          <span
            key={i}
            className={`w-1 h-1 rounded-full transition-colors ${i === idx ? 'bg-green-400' : 'bg-[#2a2a32]'}`}
          />
        ))}
      </div>
    </div>
  )
}
