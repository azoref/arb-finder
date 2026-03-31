const SIGNALS = [
  {
    pseudonym: 'CryptoKing',
    color: '#7c3aed',
    side: 'BUY',
    title: 'Will Germany win the 2026 FIFA World Cup?',
    outcome: 'Yes',
    polyProb: 61,
    bookProb: 40,
    bookName: 'DraftKings',
    divergence: '+21',
    size: '$42K',
    ago: '2m ago',
  },
  {
    pseudonym: 'SharpMoney7',
    color: '#06b6d4',
    side: 'BUY',
    title: 'NBA Finals 2026 — Celtics win?',
    outcome: 'Yes',
    polyProb: 58,
    bookProb: 43,
    bookName: 'FanDuel',
    divergence: '+15',
    size: '$28K',
    ago: '7m ago',
  },
  {
    pseudonym: 'WhalePunter',
    color: '#f59e0b',
    side: 'SELL',
    title: 'Lakers vs Nuggets — Lakers win',
    outcome: 'No',
    polyProb: 38,
    bookProb: 45,
    bookName: 'BetMGM',
    divergence: '-7',
    size: '$19K',
    ago: '14m ago',
  },
  {
    pseudonym: 'EdgeHunter',
    color: '#22c55e',
    side: 'BUY',
    title: 'Champions League Final — Man City win',
    outcome: 'Yes',
    polyProb: 54,
    bookProb: 44,
    bookName: 'Caesars',
    divergence: '+10',
    size: '$35K',
    ago: '22m ago',
  },
]

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
          <div className="pb-2 text-[10px] font-mono text-[#3a3a45]">🎯 ARBS</div>
          <div className="ml-auto pb-2 text-[10px] font-mono text-[#3a3a45]">
            4 signals · Polymarket
          </div>
        </div>

        {/* Signal rows */}
        <div className="divide-y divide-[#0d0d10]">
          {SIGNALS.map((s, i) => {
            const isBuy = s.side === 'BUY'
            const divNum = parseInt(s.divergence)
            const isHot = Math.abs(divNum) >= 10
            return (
              <div key={i} className={`px-3 py-2.5 ${i === 0 ? 'bg-violet-500/[0.04]' : ''}`}>
                {/* Top row */}
                <div className="flex items-center gap-2 mb-1.5">
                  {/* Avatar */}
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
                  <span className="text-[9px] text-[#3a3a45] font-mono ml-auto shrink-0">{s.ago}</span>
                </div>

                {/* Market title */}
                <p className="text-[10px] text-[#9999aa] font-mono truncate mb-2 pl-7">{s.title}</p>

                {/* Divergence bar */}
                <div className="pl-7 flex items-center gap-2">
                  {/* Poly */}
                  <div className="text-center">
                    <p className="text-[8px] text-[#4a4a55] font-mono uppercase tracking-widest">POLY</p>
                    <p className="text-xs font-bold text-white">{s.polyProb}%</p>
                  </div>

                  {/* Gap */}
                  <div className="flex-1 flex flex-col items-center gap-0.5">
                    <span className={`text-[10px] font-bold font-mono ${
                      isHot && divNum > 0 ? 'text-green-400' :
                      isHot && divNum < 0 ? 'text-red-400' :
                      'text-yellow-500'
                    }`}>
                      {s.divergence}pt
                    </span>
                    <div className="w-full h-1 rounded-full bg-[#1c1c2e] overflow-hidden">
                      <div
                        className={`h-full rounded-full ${divNum > 0 ? 'bg-green-500' : 'bg-red-500'}`}
                        style={{ width: `${Math.min(Math.abs(divNum) * 4, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Book */}
                  <div className="text-center">
                    <p className="text-[8px] text-[#4a4a55] font-mono uppercase tracking-widest">{s.bookName.slice(0, 6).toUpperCase()}</p>
                    <p className="text-xs font-bold text-[#6b6b80]">{s.bookProb}%</p>
                  </div>

                  {/* Size */}
                  <div className={`text-xs font-bold font-mono ml-1 ${isBuy ? 'text-green-400' : 'text-red-400'}`}>
                    {s.size}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Bottom bar */}
        <div className="px-4 py-2 bg-[#0d0d10] flex items-center justify-between border-t border-[#1a1a1f]">
          <span className="text-[9px] text-[#3a3a45] font-mono">POLYMARKET · POLYGON · $1K+ THRESHOLD</span>
          <span className="text-[9px] text-[#7c3aed] font-mono font-semibold">ON-CHAIN VERIFIED ✓</span>
        </div>
      </div>
    </div>
  )
}
