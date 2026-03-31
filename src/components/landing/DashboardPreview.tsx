const SIGNALS = [
  {
    pseudonym: 'CryptoKing',
    color: '#7c3aed',
    side: 'BUY',
    category: 'POLITICS',
    title: 'Will Republicans win the House in 2026?',
    outcome: 'Yes',
    polyProb: 67,
    size: '$42K',
    ago: '2m ago',
  },
  {
    pseudonym: 'SharpMoney7',
    color: '#06b6d4',
    side: 'SELL',
    category: 'CRYPTO',
    title: 'Will Bitcoin hit $150K before July 2026?',
    outcome: 'No',
    polyProb: 34,
    size: '$28K',
    ago: '7m ago',
  },
  {
    pseudonym: 'WhalePunter',
    color: '#f59e0b',
    side: 'BUY',
    category: 'SPORTS',
    title: 'Will the Celtics win the 2026 NBA Finals?',
    outcome: 'Yes',
    polyProb: 58,
    size: '$19K',
    ago: '14m ago',
  },
  {
    pseudonym: 'EdgeHunter',
    color: '#22c55e',
    side: 'BUY',
    category: 'POLITICS',
    title: 'Will the Fed cut rates in May 2026?',
    outcome: 'Yes',
    polyProb: 72,
    size: '$35K',
    ago: '22m ago',
  },
]

const CAT_COLORS: Record<string, string> = {
  POLITICS: '#f59e0b',
  CRYPTO: '#06b6d4',
  SPORTS: '#22c55e',
  OTHER: '#9999aa',
}

export default function DashboardPreview() {
  return (
    <div className="relative w-full max-w-xl">
      {/* Glow */}
      <div className="absolute -inset-4 bg-gradient-to-r from-violet-500/10 via-green-500/5 to-cyan-500/10 rounded-2xl blur-2xl" />

      {/* Browser chrome */}
      <div className="relative rounded-xl border border-[#2a2a32] bg-[#0a0a0d] overflow-hidden shadow-2xl">

        {/* Title bar */}
        <div className="flex items-center gap-2 px-4 py-3 bg-[#111114] border-b border-[#1a1a1f]">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
            <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
            <div className="w-3 h-3 rounded-full bg-[#28c840]" />
          </div>
          <div className="flex-1 mx-4 bg-[#1a1a1f] rounded-md px-3 py-1 text-[10px] text-[#4a4a55] font-mono text-center">
            getsharpbet.com/dashboard
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-green-400">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            LIVE
          </div>
        </div>

        {/* Tab bar */}
        <div className="px-4 pt-2.5 pb-0 flex items-center gap-3 border-b border-[#1a1a1f]">
          <div className="pb-2 border-b-2 border-[#7c3aed] text-[10px] font-mono font-semibold text-[#a78bfa]">
            🐋 SIGNALS
          </div>
          <div className="ml-auto pb-2 text-[10px] font-mono text-[#3a3a45]">
            4 signals · All categories
          </div>
        </div>

        {/* Signal rows */}
        <div className="divide-y divide-[#0d0d10]">
          {SIGNALS.map((s, i) => {
            const isBuy = s.side === 'BUY'
            const catColor = CAT_COLORS[s.category] ?? '#9999aa'
            return (
              <div key={i} className={`px-3 py-2.5 ${i === 0 ? 'bg-violet-500/[0.04]' : ''}`}>
                {/* Top row */}
                <div className="flex items-center gap-2 mb-1.5">
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0"
                    style={{ background: s.color }}
                  >
                    {s.pseudonym[0]}
                  </div>
                  <span className="text-[10px] font-mono text-[#6b6b80] shrink-0">{s.pseudonym}</span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0 ${
                    isBuy ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                  }`}>
                    {isBuy ? '↑' : '↓'} {s.side}
                  </span>
                  <span
                    className="text-[8px] font-mono px-1 py-0.5 rounded shrink-0"
                    style={{ color: catColor, background: catColor + '15' }}
                  >
                    {s.category}
                  </span>
                  <span className="text-[9px] text-[#3a3a45] font-mono ml-auto shrink-0">{s.ago}</span>
                </div>

                {/* Market title */}
                <p className="text-[10px] text-[#9999aa] font-mono truncate mb-2 pl-7">{s.title}</p>

                {/* Prob + size */}
                <div className="pl-7 flex items-center gap-3">
                  <div className="text-center">
                    <p className="text-[8px] text-[#4a4a55] font-mono uppercase tracking-widest">POLY</p>
                    <p className="text-xs font-bold text-white">{s.polyProb}%</p>
                  </div>
                  <div className="flex-1 h-1 rounded-full bg-[#1c1c2e] overflow-hidden">
                    <div
                      className={`h-full rounded-full ${isBuy ? 'bg-green-500' : 'bg-red-500'}`}
                      style={{ width: `${s.polyProb}%` }}
                    />
                  </div>
                  <div className={`text-xs font-bold font-mono ${isBuy ? 'text-green-400' : 'text-red-400'}`}>
                    {s.size}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Bottom bar */}
        <div className="px-4 py-2 bg-[#0d0d10] flex items-center justify-between border-t border-[#1a1a1f]">
          <span className="text-[9px] text-[#3a3a45] font-mono">POLYMARKET · POLYGON · $10K+ THRESHOLD</span>
          <span className="text-[9px] text-[#7c3aed] font-mono font-semibold">ON-CHAIN VERIFIED ✓</span>
        </div>
      </div>
    </div>
  )
}
