'use client'

import { useEffect, useRef, useState } from 'react'

// ── Static data ───────────────────────────────────────────────────────────────

const ALL_SIGNALS = [
  { wallet: '0x3f8a...c2d1', market: 'MSFT beats Q3',       price: 0.624, size: 2400, score: 91 },
  { wallet: '0x9c1d...7e3a', market: 'Trump indictment',    price: 0.318, size: 5100, score: 88 },
  { wallet: '0x7b2e...4f9c', market: 'ETH $4K Aug',         price: 0.481, size: 1800, score: 94 },
  { wallet: '0x2a5f...8b0d', market: 'Fed rate cut Sept',   price: 0.712, size: 3200, score: 87 },
  { wallet: '0x4d8c...1a6e', market: 'Senate vote 60',      price: 0.643, size: 900,  score: 82 },
  { wallet: '0x1e9b...5c3f', market: 'Silver $35',          price: 0.558, size: 2100, score: 89 },
  { wallet: '0x6f0a...2d8b', market: 'AMD beats Q2',        price: 0.761, size: 4400, score: 93 },
  { wallet: '0x8c3d...9f1e', market: 'Tesla Robotaxi',      price: 0.493, size: 3700, score: 90 },
  { wallet: '0x5a7e...3c2a', market: 'NYC heat record',     price: 0.387, size: 1200, score: 85 },
  { wallet: '0xb1f4...6d9c', market: 'Iran deal signed',    price: 0.271, size: 2900, score: 88 },
]

const LIVE_ENTRIES = [
  { market: 'MSFT beats Q3',    mkt: '80¢', true_: '93¢', gap: '+13¢', status: 'HOLD', pnl: '+$96'  },
  { market: 'Trump indictment', mkt: '62¢', true_: '79¢', gap: '+17¢', status: 'BUY',  pnl: '+$184' },
  { market: 'ETH $4K Aug',      mkt: '48¢', true_: '64¢', gap: '+16¢', status: 'BUY',  pnl: '+$142' },
  { market: 'Fed rate cut',     mkt: '71¢', true_: '87¢', gap: '+16¢', status: 'HOLD', pnl: '+$68'  },
  { market: 'Senate vote 60',   mkt: '64¢', true_: '78¢', gap: '+14¢', status: 'SCAN', pnl: null    },
  { market: 'Silver $35',       mkt: '55¢', true_: '72¢', gap: '+17¢', status: 'BUY',  pnl: '+$211' },
]

// ── Chart path (200-wide viewport, y inverted) ────────────────────────────────

const BASE_POINTS: [number, number][] = [
  [0, 195], [18, 188], [36, 180], [54, 175], [72, 182], [90, 168],
  [108, 155], [126, 160], [144, 143], [162, 130], [180, 135], [198, 118],
  [216, 108], [234, 115], [252, 100], [270, 88], [288, 92], [306, 78],
  [324, 68], [342, 72], [360, 58], [378, 48], [396, 52], [414, 40],
  [432, 32], [450, 36], [468, 25], [486, 18], [504, 22], [520, 12],
]

function buildPath(pts: [number, number][]) {
  return pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'} ${x},${y}`).join(' ')
}
function buildArea(pts: [number, number][]) {
  return `M 0,210 ${pts.map(([x, y]) => `L ${x},${y}`).join(' ')} L 520,210 Z`
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function TerminalPreview() {
  const [clock, setClock] = useState('')
  const [feed, setFeed] = useState(ALL_SIGNALS.slice(0, 5))
  const [feedIdx, setFeedIdx] = useState(5)
  const [pnl, setPnl] = useState(2847)
  const [chartPts, setChartPts] = useState(BASE_POINTS.slice(0, 10))
  const [chartFull, setChartFull] = useState(false)
  const [blink, setBlink] = useState(true)
  const feedRef = useRef<HTMLDivElement>(null)

  // Clock
  useEffect(() => {
    const fmt = () => new Date().toLocaleTimeString('en-US', { hour12: false })
    setClock(fmt())
    const t = setInterval(() => setClock(fmt()), 1000)
    return () => clearInterval(t)
  }, [])

  // Build chart line progressively
  useEffect(() => {
    if (chartFull) return
    const t = setInterval(() => {
      setChartPts(prev => {
        if (prev.length >= BASE_POINTS.length) { setChartFull(true); return prev }
        return BASE_POINTS.slice(0, prev.length + 1)
      })
    }, 120)
    return () => clearInterval(t)
  }, [chartFull])

  // Blink cursor
  useEffect(() => {
    const t = setInterval(() => setBlink(b => !b), 600)
    return () => clearInterval(t)
  }, [])

  // Roll in new signals every 3s
  useEffect(() => {
    const t = setInterval(() => {
      setFeed(prev => {
        const next = ALL_SIGNALS[feedIdx % ALL_SIGNALS.length]
        return [next, ...prev.slice(0, 6)]
      })
      setFeedIdx(i => i + 1)
      setPnl(p => p + Math.floor(Math.random() * 40 + 10))
    }, 3000)
    return () => clearInterval(t)
  }, [feedIdx])

  // Auto-scroll feed
  useEffect(() => {
    if (feedRef.current) feedRef.current.scrollTop = 0
  }, [feed])

  const pathD = buildPath(chartPts)
  const areaD = buildArea(chartPts)
  const lastPt = chartPts[chartPts.length - 1]

  return (
    <div className="w-full max-w-5xl mx-auto rounded-xl overflow-hidden border border-[#1a1a22] bg-[#050507] font-mono text-[11px] shadow-2xl shadow-black/60">

      {/* ── Header ── */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-[#111116] bg-[#030305]">
        <div className="flex items-center gap-3">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          <span className="text-green-500/70 tracking-widest text-[10px] font-bold">SHARPBET</span>
          <span className="text-[#222230]">·</span>
          <span className="text-[#2a2a3a] tracking-widest text-[10px]">BOT ACTIVE · 200 WALLETS WATCHED</span>
        </div>
        <div className="flex items-center gap-4 text-[#2a2a35]">
          <span className="text-green-500/40">{clock}{blink ? '█' : ' '}</span>
        </div>
      </div>

      {/* ── Body: 3 columns ── */}
      <div className="grid grid-cols-[210px_1fr_230px] min-h-[340px]">

        {/* ── Left: Signal feed ── */}
        <div className="border-r border-[#111116] flex flex-col">
          <div className="px-3 py-1.5 border-b border-[#111116] text-[#2a2a3a] tracking-widest text-[9px] uppercase flex justify-between">
            <span>Alpha Feed</span>
            <span className="text-green-500/30">SCANNING</span>
          </div>
          <div ref={feedRef} className="flex-1 overflow-hidden">
            {feed.map((s, i) => (
              <div
                key={`${s.wallet}-${i}`}
                className={`px-3 py-2 border-b border-[#0a0a0d] transition-all duration-500 ${i === 0 ? 'bg-green-500/5' : ''}`}
              >
                <div className="flex justify-between mb-0.5">
                  <span className="text-[#222230] text-[9px]">{s.wallet}</span>
                  <span className={`text-[9px] ${i === 0 ? 'text-green-500/60' : 'text-[#2a2a3a]'}`}>
                    {s.score}
                  </span>
                </div>
                <div className={`truncate text-[10px] ${i === 0 ? 'text-[#aaaacc]' : 'text-[#444455]'}`}>
                  {s.market}
                </div>
                <div className="flex justify-between mt-0.5">
                  <span className={`text-[9px] ${i === 0 ? 'text-green-400/70' : 'text-[#333344]'}`}>
                    BUY @ {s.price.toFixed(3)}
                  </span>
                  <span className="text-[#2a2a3a] text-[9px]">${s.size.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Center: Chart ── */}
        <div className="border-r border-[#111116] flex flex-col">
          <div className="px-4 py-1.5 border-b border-[#111116] flex items-center justify-between">
            <span className="text-[#2a2a3a] tracking-widest text-[9px] uppercase">Paper Portfolio · Live Session</span>
            <span className="text-green-400 font-bold text-base tracking-tight">
              +${pnl.toLocaleString()}
            </span>
          </div>

          {/* Chart SVG */}
          <div className="flex-1 relative p-2">
            <svg viewBox="0 0 520 210" className="w-full h-full" preserveAspectRatio="none">
              <defs>
                <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22c55e" stopOpacity="0.18" />
                  <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
                </linearGradient>
              </defs>
              {/* Grid */}
              {[52, 104, 156].map(y => (
                <line key={y} x1="0" y1={y} x2="520" y2={y} stroke="#0f0f14" strokeWidth="1" />
              ))}
              {/* Area fill */}
              <path d={areaD} fill="url(#grad)" />
              {/* Line */}
              <path d={pathD} fill="none" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              {/* Live dot */}
              {lastPt && (
                <>
                  <circle cx={lastPt[0]} cy={lastPt[1]} r="4" fill="#22c55e" opacity="0.3" />
                  <circle cx={lastPt[0]} cy={lastPt[1]} r="2.5" fill="#22c55e" />
                </>
              )}
            </svg>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-4 border-t border-[#111116]">
            {[
              { label: 'OPEN',     val: '6',   green: false },
              { label: 'WON',      val: '18',  green: false },
              { label: 'LOST',     val: '5',   green: false },
              { label: 'WIN RATE', val: '78%', green: true  },
            ].map(({ label, val, green }) => (
              <div key={label} className="px-3 py-2 border-r border-[#111116] last:border-r-0">
                <div className="text-[#222230] text-[9px] tracking-widest uppercase mb-1">{label}</div>
                <div className={`font-bold text-sm ${green ? 'text-green-400' : 'text-[#555566]'}`}>{val}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right: Live entries + meters ── */}
        <div className="flex flex-col">
          <div className="px-3 py-1.5 border-b border-[#111116] text-[#2a2a3a] tracking-widest text-[9px] uppercase">
            Live Entries
          </div>

          <div className="flex-1 overflow-hidden">
            {LIVE_ENTRIES.map((e, i) => (
              <div key={i} className="px-3 py-2 border-b border-[#0a0a0d] flex items-start justify-between">
                <div>
                  <div className="text-[#555566] text-[10px] truncate w-[120px]">{e.market}</div>
                  <div className="text-[#2a2a3a] text-[9px] mt-0.5">
                    MKT {e.mkt} → <span className="text-green-400/50">{e.true_}</span> <span className="text-green-400/40">{e.gap}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className={`text-[9px] tracking-widest font-bold ${
                    e.status === 'BUY'  ? 'text-green-400' :
                    e.status === 'HOLD' ? 'text-yellow-500/70' :
                    'text-[#333344]'
                  }`}>{e.status}</div>
                  {e.pnl && <div className="text-green-400/60 text-[9px] mt-0.5">{e.pnl}</div>}
                </div>
              </div>
            ))}
          </div>

          {/* Disposition meter */}
          <div className="border-t border-[#111116] px-3 py-2">
            <div className="text-[#2a2a3a] text-[9px] tracking-widest uppercase mb-2">Disposition Meter</div>
            <div className="flex justify-between mb-1.5">
              <div>
                <div className="text-green-400 font-bold">86%</div>
                <div className="text-[#222230] text-[8px]">WIN CAPTURE</div>
              </div>
              <div className="text-center">
                <div className="text-[#888844] font-bold text-[10px]">D=0.74</div>
                <div className="text-[#222230] text-[8px]">COEFF</div>
              </div>
              <div className="text-right">
                <div className="text-red-400/60 font-bold">12%</div>
                <div className="text-[#222230] text-[8px]">LOSS CUT</div>
              </div>
            </div>
            <div className="h-px bg-[#111116] relative">
              <div className="absolute left-0 top-0 h-full bg-green-500/40" style={{ width: '74%' }} />
            </div>
          </div>

          {/* Capital velocity */}
          <div className="border-t border-[#111116] px-3 py-2">
            <div className="text-[#2a2a3a] text-[9px] tracking-widest uppercase mb-1">Capital Velocity</div>
            <div className="flex items-baseline gap-1">
              <span className="text-white font-bold text-xl">49</span>
              <span className="text-[#333344] text-sm">×</span>
              <span className="text-[#2a2a3a] text-[9px]">vs avg wallet</span>
            </div>
          </div>

          {/* Pair network */}
          <div className="border-t border-[#111116] px-3 py-2 flex justify-between items-center">
            <div className="text-[#2a2a3a] text-[9px] tracking-widest uppercase">Pair Network</div>
            <div className="font-bold text-[#444455]">42 <span className="text-[9px] font-normal text-[#2a2a3a]">correlations</span></div>
          </div>
        </div>
      </div>
    </div>
  )
}
