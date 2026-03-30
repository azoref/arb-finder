const ROWS = [
  { event: 'Celtics vs Heat', mkt: 'ML', bookA: 'DraftKings', oddsA: '+108', bookB: 'FanDuel', oddsB: '+106', margin: '+1.42%' },
  { event: 'Lakers vs Nuggets', mkt: 'SPR', bookA: 'BetMGM', oddsA: '-108', bookB: 'Caesars', oddsB: '-106', margin: '+0.87%' },
  { event: 'Bucks vs 76ers', mkt: 'TOT', bookA: 'DraftKings', oddsA: '+102', bookB: 'PointsBet', oddsB: '-100', margin: '+1.12%' },
  { event: 'Warriors vs Suns', mkt: 'ML', bookA: 'FanDuel', oddsA: '+115', bookB: 'BetMGM', oddsB: '+103', margin: '+1.74%' },
]

export default function DashboardPreview() {
  return (
    <div className="relative w-full max-w-xl">
      {/* Glow behind card */}
      <div className="absolute -inset-4 bg-gradient-to-r from-green-500/10 via-emerald-500/5 to-teal-500/10 rounded-2xl blur-2xl" />

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

        {/* Dashboard header */}
        <div className="px-4 pt-3 pb-2 flex items-center justify-between border-b border-[#1a1a1f]">
          <div>
            <p className="text-xs font-semibold text-[#e8e8f0]">Dashboard</p>
            <p className="text-[10px] text-[#4a4a55] font-mono mt-0.5">4 active arbs · live</p>
          </div>
          <div className="flex gap-2">
            <span className="px-2 py-0.5 rounded text-[9px] font-mono border border-green-500/30 bg-green-500/5 text-green-400">🎯 Arbs</span>
            <span className="px-2 py-0.5 rounded text-[9px] font-mono border border-[#2a2a32] text-[#4a4a55]">📊 Odds</span>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden">
          <table className="w-full text-[10px] font-mono">
            <thead>
              <tr className="border-b border-[#1a1a1f] bg-[#0d0d10]">
                <th className="text-left px-3 py-2 text-[#3a3a45] uppercase tracking-widest">Event</th>
                <th className="text-left px-2 py-2 text-[#3a3a45] uppercase tracking-widest">Mkt</th>
                <th className="text-left px-2 py-2 text-[#3a3a45] uppercase tracking-widest">Bid</th>
                <th className="text-left px-2 py-2 text-[#3a3a45] uppercase tracking-widest">Ask</th>
                <th className="text-right px-3 py-2 text-[#3a3a45] uppercase tracking-widest">Margin</th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row, i) => (
                <tr key={i} className={`border-b border-[#0d0d10] ${i === 0 ? 'bg-green-500/[0.04]' : ''}`}>
                  <td className="px-3 py-2.5 text-[#9999aa]">{row.event}</td>
                  <td className="px-2 py-2.5 text-[#4a4a55] uppercase">{row.mkt}</td>
                  <td className="px-2 py-2.5">
                    <span className="text-[#6b6b80]">{row.bookA} </span>
                    <span className="text-green-400">{row.oddsA}</span>
                  </td>
                  <td className="px-2 py-2.5">
                    <span className="text-[#6b6b80]">{row.bookB} </span>
                    <span className="text-green-400">{row.oddsB}</span>
                  </td>
                  <td className="px-3 py-2.5 text-right font-semibold text-green-400">{row.margin}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Bottom bar */}
        <div className="px-4 py-2 bg-[#0d0d10] flex items-center justify-between">
          <span className="text-[9px] text-[#3a3a45] font-mono">WORKER: ONLINE · SCANNING 12 BOOKS</span>
          <span className="text-[9px] text-green-400 font-mono">↑ $14.20 guaranteed</span>
        </div>
      </div>
    </div>
  )
}
