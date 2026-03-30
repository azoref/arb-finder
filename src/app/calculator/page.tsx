'use client'

import { useState } from 'react'
import Link from 'next/link'
import { calculateArb, americanToDecimal } from '@/lib/arb'
import { ArbCalculatorResult } from '@/types'

export default function CalculatorPage() {
  const [format, setFormat] = useState<'american' | 'decimal'>('american')
  const [oddsA, setOddsA] = useState('')
  const [oddsB, setOddsB] = useState('')
  const [bankroll, setBankroll] = useState('1000')
  const [result, setResult] = useState<ArbCalculatorResult | null>(null)

  function calculate() {
    const a = parseFloat(oddsA)
    const b = parseFloat(oddsB)
    const br = parseFloat(bankroll)
    if (isNaN(a) || isNaN(b) || isNaN(br) || br <= 0) return
    setResult(calculateArb(a, b, br, format))
  }

  function getDecimalPreview(val: string) {
    const n = parseFloat(val)
    if (isNaN(n) || format === 'decimal') return null
    return americanToDecimal(n).toFixed(3)
  }

  return (
    <div className="min-h-screen">
      {/* Simple header */}
      <nav className="border-b border-[#2a2a32] bg-[#0a0a0b]">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-green-500 font-mono font-bold text-lg">ARB</span>
            <span className="font-semibold">Finder</span>
          </Link>
          <div className="flex items-center gap-4 text-sm text-[#9999aa]">
            <Link href="/dashboard" className="hover:text-[#e8e8f0] transition-colors">Dashboard</Link>
            <Link href="/auth/signin" className="hover:text-[#e8e8f0] transition-colors">Sign in</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-lg mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold">Arb Calculator</h1>
          <p className="text-[#6b6b80] text-sm mt-1">
            Enter odds for two outcomes to check if an arb exists
          </p>
        </div>

        <div className="bg-[#111114] border border-[#2a2a32] rounded-lg p-6 space-y-5">
          {/* Format toggle */}
          <div className="flex items-center gap-1 bg-[#1a1a1f] rounded-md p-1 w-fit">
            {(['american', 'decimal'] as const).map(f => (
              <button
                key={f}
                onClick={() => { setFormat(f); setResult(null) }}
                className={`px-3 py-1 rounded text-sm font-medium capitalize transition-colors ${format === f ? 'bg-[#2a2a32] text-[#e8e8f0]' : 'text-[#6b6b80] hover:text-[#9999aa]'}`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Odds inputs */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-[#9999aa] mb-1">Side A odds</label>
              <input
                type="number"
                value={oddsA}
                onChange={e => { setOddsA(e.target.value); setResult(null) }}
                placeholder={format === 'american' ? '-110' : '1.91'}
                className="w-full px-3 py-2.5 bg-[#1a1a1f] border border-[#2a2a32] rounded-md text-sm font-mono focus:outline-none focus:border-green-600 transition-colors"
              />
              {getDecimalPreview(oddsA) && (
                <p className="text-xs text-[#6b6b80] mt-1">= {getDecimalPreview(oddsA)} decimal</p>
              )}
            </div>
            <div>
              <label className="block text-xs text-[#9999aa] mb-1">Side B odds</label>
              <input
                type="number"
                value={oddsB}
                onChange={e => { setOddsB(e.target.value); setResult(null) }}
                placeholder={format === 'american' ? '+105' : '2.05'}
                className="w-full px-3 py-2.5 bg-[#1a1a1f] border border-[#2a2a32] rounded-md text-sm font-mono focus:outline-none focus:border-green-600 transition-colors"
              />
              {getDecimalPreview(oddsB) && (
                <p className="text-xs text-[#6b6b80] mt-1">= {getDecimalPreview(oddsB)} decimal</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs text-[#9999aa] mb-1">Bankroll ($)</label>
            <input
              type="number"
              value={bankroll}
              onChange={e => { setBankroll(e.target.value); setResult(null) }}
              min={1}
              className="w-full px-3 py-2.5 bg-[#1a1a1f] border border-[#2a2a32] rounded-md text-sm font-mono focus:outline-none focus:border-green-600 transition-colors"
            />
          </div>

          <button
            onClick={calculate}
            className="w-full py-2.5 bg-green-600 hover:bg-green-500 rounded-md text-sm font-semibold transition-colors"
          >
            Calculate
          </button>
        </div>

        {/* Result */}
        {result && (
          <div className={`mt-4 bg-[#111114] border rounded-lg p-6 ${result.isArb ? 'border-green-500/40' : 'border-red-500/30'}`}>
            <div className={`text-center text-xl font-semibold mb-4 ${result.isArb ? 'text-green-400' : 'text-red-400'}`}>
              {result.isArb ? '✓ Arbitrage opportunity' : '✗ Not an arbitrage'}
            </div>

            <div className="grid grid-cols-2 gap-3 font-mono text-sm">
              <div className="bg-[#1a1a1f] rounded p-3">
                <div className="text-xs text-[#6b6b80] mb-1">Implied total</div>
                <div className={result.isArb ? 'text-green-400' : 'text-[#e8e8f0]'}>
                  {(result.arbPercentage * 100).toFixed(3)}%
                </div>
              </div>
              <div className="bg-[#1a1a1f] rounded p-3">
                <div className="text-xs text-[#6b6b80] mb-1">Profit margin</div>
                <div className={result.isArb ? 'text-green-400 font-semibold' : 'text-[#6b6b80]'}>
                  {result.isArb ? `+${result.profitMargin.toFixed(3)}%` : '—'}
                </div>
              </div>

              {result.isArb && (
                <>
                  <div className="bg-[#1a1a1f] rounded p-3">
                    <div className="text-xs text-[#6b6b80] mb-1">Stake A</div>
                    <div>${result.stakeA.toFixed(2)}</div>
                  </div>
                  <div className="bg-[#1a1a1f] rounded p-3">
                    <div className="text-xs text-[#6b6b80] mb-1">Stake B</div>
                    <div>${result.stakeB.toFixed(2)}</div>
                  </div>
                  <div className="col-span-2 bg-green-500/5 border border-green-500/20 rounded p-3 text-center">
                    <div className="text-xs text-[#6b6b80] mb-1">Guaranteed profit</div>
                    <div className="text-green-400 text-lg font-semibold">+${result.guaranteedProfit.toFixed(2)}</div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        <p className="text-center text-xs text-[#4a4a55] mt-6">
          For informational purposes only. Not financial advice.
        </p>
      </div>
    </div>
  )
}
