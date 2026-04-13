'use client'

import { useEffect, useState } from 'react'

interface Stats {
  whaleSignalCount: number
  whaleVolume: number
  walletsTracked: number
  marketsMonitored: number
}

function formatVolume(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000)     return `$${(n / 1_000).toFixed(0)}K`
  return `$${n}`
}

export default function LiveStatsBar() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [updated, setUpdated] = useState<Date | null>(null)

  useEffect(() => {
    function load() {
      fetch('/api/stats')
        .then(r => r.json())
        .then(d => { setStats(d); setUpdated(new Date()) })
        .catch(() => {})
    }
    load()
    const interval = setInterval(load, 30_000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="border-y border-[#1e1e24] bg-[#0a0a0d]/80 backdrop-blur-sm">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-6 overflow-x-auto">
        <div className="flex items-center gap-8 shrink-0">
          <Stat
            label="Whale volume tracked"
            value={stats ? formatVolume(stats.whaleVolume) : '—'}
            accent
          />
          <Stat
            label="Whale signals"
            value={stats ? stats.whaleSignalCount.toLocaleString() : '—'}
            accent
          />
          <Stat
            label="Wallets tracked"
            value={stats ? stats.walletsTracked.toLocaleString() : '—'}
          />
          <Stat
            label="Markets monitored"
            value={stats ? stats.marketsMonitored.toLocaleString() : '—'}
          />
        </div>
        <div className="flex items-center gap-1.5 shrink-0 text-xs text-[#3a3a45]">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          {updated
            ? `Updated ${updated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`
            : 'Live'}
        </div>
      </div>
    </div>
  )
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex flex-col">
      <span className={`font-mono text-base font-semibold tabular-nums ${accent ? 'text-green-400' : 'text-[#e8e8f0]'}`}>
        {value}
      </span>
      <span className="text-[10px] text-[#4a4a55] uppercase tracking-wider mt-0.5">{label}</span>
    </div>
  )
}
