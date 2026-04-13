'use client'
import { useEffect, useState } from 'react'

interface NewsItem {
  title: string
  url: string
  source: string
  publishedAt: string
  category: string
  categoryColor: string
  categoryShort: string
}

function timeAgo(iso: string) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (diff < 60)    return `${diff}s ago`
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

export default function TerminalNews() {
  const [items, setItems]   = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'ALL' | 'POL' | 'CRY' | 'SPT' | 'OTH'>('ALL')

  useEffect(() => {
    fetch('/api/news')
      .then(r => r.json())
      .then(d => { setItems(d.items ?? []); setLoading(false) })
      .catch(() => setLoading(false))

    const t = setInterval(() => {
      fetch('/api/news').then(r => r.json()).then(d => setItems(d.items ?? [])).catch(() => {})
    }, 15 * 60 * 1000) // refresh every 15 min
    return () => clearInterval(t)
  }, [])

  const filtered = filter === 'ALL'
    ? items
    : items.filter(i => i.categoryShort === filter)

  if (loading) return (
    <div className="flex items-center justify-center h-full text-[#444444] font-mono text-xs animate-pulse bg-black">
      Loading news...
    </div>
  )

  return (
    <div className="flex flex-col h-full bg-black">
      {/* Filter bar */}
      <div className="flex items-center gap-1.5 px-3 py-2 border-b border-[#1f1f1f] bg-[#0a0a0a] shrink-0">
        {(['ALL', 'POL', 'CRY', 'SPT', 'OTH'] as const).map(f => {
          const colors: Record<string, string> = {
            ALL: '#00c805', POL: '#f59e0b', CRY: '#06b6d4', SPT: '#22c55e', OTH: '#666666'
          }
          const active = filter === f
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={active ? { color: colors[f], background: colors[f] + '18', borderColor: colors[f] + '40' } : {}}
              className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border transition-colors ${
                active ? 'border' : 'text-[#444444] hover:text-[#888888] border-transparent'
              }`}
            >
              {f}
            </button>
          )
        })}
        <span className="ml-auto text-[10px] font-mono text-[#333333]">{filtered.length} stories</span>
      </div>

      {/* News list */}
      <div className="overflow-y-auto flex-1">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 gap-2">
            <span className="text-2xl">📰</span>
            <p className="text-[#444444] text-sm font-mono">No stories</p>
          </div>
        ) : filtered.filter(i => i.url?.startsWith('http')).map((item, i) => (
          <a
            key={`${item.url}-${i}`}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`block px-4 py-3 border-b border-[#111111] hover:bg-[#0f0f0f] transition-colors ${
              i % 2 === 0 ? 'bg-black' : 'bg-[#080808]'
            }`}
          >
            {/* Row 1: category + source + time */}
            <div className="flex items-center gap-2 mb-1.5">
              <span
                className="text-[10px] font-mono px-1.5 py-0.5 rounded shrink-0"
                style={{ color: item.categoryColor, background: item.categoryColor + '18' }}
              >
                {item.categoryShort}
              </span>
              <span className="text-[10px] font-mono text-[#555555] truncate">{item.source}</span>
              <span className="ml-auto text-[10px] font-mono text-[#444444] shrink-0">{timeAgo(item.publishedAt)}</span>
            </div>

            {/* Row 2: headline */}
            <p className="text-sm text-[#cccccc] leading-snug line-clamp-2 hover:text-white transition-colors">
              {item.title}
            </p>

            {/* Row 3: read more */}
            <p className="text-[10px] font-mono text-[#333333] mt-1 hover:text-[#00c805] transition-colors">
              Read ↗
            </p>
          </a>
        ))}
      </div>
    </div>
  )
}
