'use client'

import { useEffect, useState, useRef } from 'react'

function useCountUp(target: number, duration = 3200) {
  const [display, setDisplay] = useState(target)
  const prev = useRef(target)
  const frame = useRef<number | null>(null)

  useEffect(() => {
    const start = prev.current
    const diff = target - start
    if (diff === 0) return

    const startTime = performance.now()

    function tick(now: number) {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(start + diff * eased)
      if (progress < 1) {
        frame.current = requestAnimationFrame(tick)
      } else {
        prev.current = target
      }
    }

    if (frame.current) cancelAnimationFrame(frame.current)
    frame.current = requestAnimationFrame(tick)
    return () => { if (frame.current) cancelAnimationFrame(frame.current) }
  }, [target, duration])

  return display
}

export default function ProfitMeter() {
  const [whaleVolume, setWhaleVolume] = useState<number | null>(null)
  const [signalCount, setSignalCount] = useState<number>(0)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  useEffect(() => {
    function load() {
      fetch('/api/stats')
        .then(r => r.json())
        .then(d => {
          setWhaleVolume(d.whaleVolume ?? 0)
          setSignalCount(d.whaleSignalCount ?? 0)
          setLastUpdate(new Date())
        })
        .catch(() => {})
    }
    load()
    const interval = setInterval(load, 30_000)
    return () => clearInterval(interval)
  }, [])

  const animated = useCountUp(whaleVolume ?? 0)

  const dollars = Math.floor(animated)

  return (
    <section className="border-t border-[#2a2a32] bg-[#050507]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <p className="text-xs text-[#4a4a55] uppercase tracking-widest font-mono mb-8">
          Whale volume tracked · Polymarket · all categories · all-time
        </p>

        {/* Big number */}
        <div className="relative inline-block">
          <div className="flex items-start justify-center gap-1">
            <span className="text-3xl sm:text-4xl font-bold text-green-400/60 mt-2 sm:mt-3 font-mono">$</span>
            <span className="text-5xl sm:text-6xl lg:text-7xl font-bold text-green-400 font-mono tabular-nums tracking-tight">
              {whaleVolume === null ? '——' : dollars.toLocaleString()}
            </span>
          </div>

          {/* Live pulse */}
          <div className="absolute -top-1 -right-4 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          </div>
        </div>

        <p className="mt-6 text-[#6b6b80] text-sm">
          {signalCount > 0 ? (
            <>across <span className="text-[#9999aa] font-medium">{signalCount.toLocaleString()} whale signals</span> on Polymarket · all categories</>
          ) : (
            'tracking smart money on Polymarket · all categories'
          )}
        </p>

        {lastUpdate && (
          <p className="mt-2 text-xs text-[#3a3a45] font-mono">
            updated {lastUpdate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </p>
        )}

        <p className="mt-8 text-xs text-[#3a3a45] max-w-md mx-auto">
          Every $10,000+ trade across all Polymarket categories. On-chain verified, updated every 60 seconds.
        </p>
      </div>
    </section>
  )
}
