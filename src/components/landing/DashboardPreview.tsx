const SIGNALS = [
  { pseudonym: 'CryptoKing',  side: 'BUY',  category: 'POL', catColor: '#f59e0b', title: 'Will Republicans win the House in 2026?',  outcome: 'Yes', prob: 67, size: '$42K', ago: '2m ago',  strength: 9 },
  { pseudonym: 'SharpMoney7', side: 'SELL', category: 'CRY', catColor: '#06b6d4', title: 'Will Bitcoin hit $150K before July 2026?',  outcome: 'No',  prob: 34, size: '$28K', ago: '7m ago',  strength: 6 },
  { pseudonym: 'WhalePunter', side: 'BUY',  category: 'SPT', catColor: '#22c55e', title: 'Will the Celtics win the 2026 NBA Finals?', outcome: 'Yes', prob: 58, size: '$19K', ago: '14m ago', strength: 4 },
  { pseudonym: 'EdgeHunter',  side: 'BUY',  category: 'POL', catColor: '#f59e0b', title: 'Will the Fed cut rates in May 2026?',        outcome: 'Yes', prob: 72, size: '$35K', ago: '22m ago', strength: 8 },
]

const HOT_MARKETS = [
  { rank: 1, title: 'Will Trump sign the budget by April 30?',    vol: '$1.2M', buyPct: 71, cat: 'POL', catColor: '#f59e0b' },
  { rank: 2, title: 'Will Bitcoin hit $150K before July 2026?',   vol: '$840K', buyPct: 34, cat: 'CRY', catColor: '#06b6d4' },
  { rank: 3, title: 'Will the Celtics win the 2026 NBA Finals?',  vol: '$530K', buyPct: 58, cat: 'SPT', catColor: '#22c55e' },
]

const LEADERBOARD = [
  { rank: '🥇', name: 'CryptoKing',  vol: '$4.2M', trades: 38, buyPct: 74, cat: 'POL', catColor: '#f59e0b', initial: 'C', color: '#00c805' },
  { rank: '🥈', name: 'EdgeHunter',  vol: '$2.8M', trades: 24, buyPct: 68, cat: 'CRY', catColor: '#06b6d4', initial: 'E', color: '#06b6d4' },
  { rank: '🥉', name: 'SharpMoney7', vol: '$1.9M', trades: 19, buyPct: 45, cat: 'SPT', catColor: '#22c55e', initial: 'S', color: '#f59e0b' },
]

export default function DashboardPreview() {
  return (
    <div className="relative w-full max-w-2xl">

      {/* ── MOBILE: signals-only card ── */}
      <div className="block lg:hidden">
        <div className="rounded-xl border border-[#222222] bg-black overflow-hidden shadow-2xl">
          {/* Title bar */}
          <div className="flex items-center gap-2 px-4 py-2.5 bg-[#0a0a0a] border-b border-[#1f1f1f]">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
            </div>
            <span className="flex-1 text-center text-[10px] font-mono text-[#444444]">getsharpbet.com/dashboard</span>
            <div className="flex items-center gap-1 text-[10px] font-mono text-[#00c805] font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00c805] animate-pulse" />LIVE
            </div>
          </div>
          {/* Pane header */}
          <div className="flex items-center gap-2 px-3 py-2 bg-[#0a0a0a] border-b border-[#1f1f1f]">
            <span>🐋</span>
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#00c805]">Signals</span>
            <span className="ml-auto text-[10px] font-mono text-[#333333]">4 signals · 24h</span>
          </div>
          {/* Signal rows */}
          {SIGNALS.map((s, i) => {
            const isBuy = s.side === 'BUY'
            return (
              <div key={i} className={`px-4 py-3 border-b border-[#111111] ${i % 2 === 0 ? 'bg-black' : 'bg-[#080808]'}`}>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${isBuy ? 'bg-[#00c805]/15 text-[#00c805]' : 'bg-red-500/15 text-red-400'}`}>{isBuy ? '▲ BUY' : '▼ SELL'}</span>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded" style={{ color: s.catColor, background: s.catColor + '18' }}>{s.category}</span>
                  <span className={`text-[9px] font-mono font-semibold ${s.strength >= 8 ? 'text-[#00c805]' : s.strength >= 5 ? 'text-amber-400' : 'text-[#444444]'}`}>⚡{s.strength}</span>
                  <span className="ml-auto text-[9px] font-mono text-[#444444]">{s.ago}</span>
                </div>
                <p className="text-sm text-white font-medium leading-snug mb-1.5">{s.title}</p>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-[#555555]">{s.pseudonym}</span>
                  <span className="text-[9px] font-mono text-[#333333]">·</span>
                  <span className="text-[9px] font-mono text-[#555555]">{s.outcome} · {s.prob}%</span>
                  <span className="ml-auto text-sm font-bold font-mono text-white">{s.size}</span>
                </div>
              </div>
            )
          })}
          {/* Footer */}
          <div className="px-4 py-2 bg-[#0a0a0a] flex items-center justify-between">
            <span className="text-[9px] text-[#333333] font-mono">POLYMARKET · $10K+ THRESHOLD</span>
            <span className="text-[9px] text-[#00c805] font-mono font-semibold">ON-CHAIN VERIFIED ✓</span>
          </div>
        </div>
      </div>

      {/* ── DESKTOP: full terminal layout ── */}
      <div className="hidden lg:block">
      {/* Glow */}
      <div className="absolute -inset-4 bg-gradient-to-r from-[#00c805]/10 via-transparent to-[#06b6d4]/10 rounded-2xl blur-2xl" />

      {/* Browser chrome */}
      <div className="relative rounded-xl border border-[#222222] bg-black overflow-hidden shadow-2xl">

        {/* Title bar */}
        <div className="flex items-center gap-2 px-4 py-3 bg-[#0a0a0a] border-b border-[#1f1f1f]">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
            <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
            <div className="w-3 h-3 rounded-full bg-[#28c840]" />
          </div>
          <div className="flex-1 mx-4 bg-[#111111] rounded-md px-3 py-1 text-[10px] text-[#444444] font-mono text-center">
            getsharpbet.com/dashboard
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#00c805] font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00c805] animate-pulse" />
            LIVE
          </div>
        </div>

        {/* Status bar */}
        <div className="flex items-center gap-2 px-4 py-1.5 bg-black border-b border-[#1a1a1a]">
          <span className="text-[9px] font-mono text-[#333333]">POLYMARKET</span>
          <span className="text-[9px] font-mono text-[#222222]">·</span>
          <span className="text-[9px] font-mono text-[#333333]">$10K+ THRESHOLD</span>
          <span className="text-[9px] font-mono text-[#222222]">·</span>
          <span className="text-[9px] font-mono text-[#333333]">ON-CHAIN VERIFIED</span>
          <span className="ml-auto text-[9px] font-mono text-[#222222]">06:24:51 PM</span>
        </div>

        {/* Main layout */}
        <div className="flex" style={{ height: '340px' }}>

          {/* Left 60%: Signals */}
          <div className="flex flex-col border-r border-[#1f1f1f]" style={{ width: '60%' }}>
            {/* Pane header */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-[#1f1f1f] bg-[#0a0a0a]">
              <div className="flex items-center gap-2">
                <span className="text-xs">🐋</span>
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#00c805]">Signals</span>
              </div>
            </div>
            {/* Filters */}
            <div className="flex flex-col border-b border-[#1f1f1f] bg-[#0a0a0a]">
              <div className="flex items-center gap-2 px-3 pt-1.5 pb-1">
                {['ALL', '▲ BUY', '▼ SELL'].map((f, i) => (
                  <span key={f} className={`text-[9px] font-mono font-semibold px-2 py-0.5 rounded border ${i === 0 ? 'bg-[#1a1a1a] text-white border-[#333333]' : 'text-[#444444] border-transparent'}`}>{f}</span>
                ))}
                <span className="ml-auto text-[9px] font-mono text-[#333333]">4 signals · 24h</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 pb-1.5">
                {['ALL','POL','CRY','SPT','OTH'].map((c, i) => (
                  <span key={c} className={`text-[9px] font-mono px-1.5 py-px rounded border ${i === 0 ? 'text-[#00c805] bg-[#00c805]/15 border-[#00c805]/40' : 'text-[#444444] border-transparent'}`}>{c}</span>
                ))}
              </div>
            </div>
            {/* Signal rows */}
            <div className="overflow-hidden flex-1 divide-y divide-[#111111]">
              {SIGNALS.map((s, i) => {
                const isBuy = s.side === 'BUY'
                return (
                  <div key={i} className={`px-3 py-2 ${i % 2 === 0 ? 'bg-black' : 'bg-[#080808]'}`}>
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className={`text-[9px] font-mono font-bold px-1 py-px rounded ${isBuy ? 'bg-[#00c805]/15 text-[#00c805]' : 'bg-red-500/15 text-red-400'}`}>
                        {isBuy ? '▲ BUY' : '▼ SELL'}
                      </span>
                      <span className="text-[8px] font-mono px-1 py-px rounded" style={{ color: s.catColor, background: s.catColor + '18' }}>{s.category}</span>
                      <span className={`text-[8px] font-mono font-semibold ${s.strength >= 8 ? 'text-[#00c805]' : s.strength >= 5 ? 'text-amber-400' : 'text-[#444444]'}`}>⚡{s.strength}</span>
                      <span className="ml-auto text-[8px] font-mono text-[#333333]">{s.ago}</span>
                    </div>
                    <p className="text-[11px] text-white font-medium leading-snug mb-1 truncate">{s.title}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-mono text-[#555555]">{s.pseudonym}</span>
                      <span className="text-[8px] font-mono text-[#444444]">·</span>
                      <span className="text-[8px] font-mono text-[#444444]">{s.outcome} · {s.prob}%</span>
                      <span className="ml-auto text-[11px] font-bold font-mono text-white">{s.size}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Right 40%: Hot Markets + Leaderboard */}
          <div className="flex flex-col" style={{ width: '40%' }}>

            {/* Hot Markets - top 50% */}
            <div className="flex flex-col border-b border-[#1f1f1f]" style={{ height: '50%' }}>
              <div className="flex items-center justify-between px-3 py-2 border-b border-[#1f1f1f] bg-[#0a0a0a]">
                <div className="flex items-center gap-2">
                  <span className="text-xs">🔥</span>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#666666]">Hot Markets</span>
                </div>
              </div>
              <div className="overflow-hidden flex-1 divide-y divide-[#111111] bg-black">
                {HOT_MARKETS.map((m) => {
                  const isBull = m.buyPct >= 65
                  const isBear = m.buyPct <= 35
                  return (
                    <div key={m.rank} className="flex items-start gap-2 px-3 py-2 hover:bg-[#0f0f0f]">
                      <span className="text-[9px] font-mono text-[#333333] w-4 shrink-0">#{m.rank}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] text-[#cccccc] leading-snug truncate font-medium">{m.title}</p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="text-[8px] font-mono px-1 py-px rounded" style={{ color: m.catColor, background: m.catColor + '18' }}>{m.cat}</span>
                          <div className="flex-1 h-0.5 rounded-full bg-[#1a1a1a]">
                            <div className="h-full rounded-full" style={{ width: `${m.buyPct}%`, background: isBull ? '#00c805' : isBear ? '#ef4444' : '#f59e0b' }} />
                          </div>
                          <span className={`text-[8px] font-mono font-semibold shrink-0 ${isBull ? 'text-[#00c805]' : isBear ? 'text-red-400' : 'text-amber-400'}`}>{m.buyPct}%</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-white shrink-0">{m.vol}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Leaderboard - bottom 50% */}
            <div className="flex flex-col" style={{ height: '50%' }}>
              <div className="flex items-center justify-between px-3 py-2 border-b border-[#1f1f1f] bg-[#0a0a0a]">
                <div className="flex items-center gap-2">
                  <span className="text-xs">🏆</span>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#666666]">Leaderboard</span>
                </div>
              </div>
              <div className="overflow-hidden flex-1 divide-y divide-[#111111] bg-black">
                {LEADERBOARD.map((w) => (
                  <div key={w.name} className="flex items-center gap-2 px-3 py-2 hover:bg-[#0f0f0f]">
                    <span className="text-[9px] font-mono text-[#333333] w-5 shrink-0 text-center">{w.rank}</span>
                    <div className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold text-black shrink-0" style={{ background: w.color }}>
                      {w.initial}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] text-[#cccccc] truncate font-medium">{w.name}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[8px] font-mono px-1 py-px rounded" style={{ color: w.catColor, background: w.catColor + '18' }}>{w.cat}</span>
                        <span className="text-[8px] font-mono text-[#444444]">{w.trades} trades</span>
                        <span className={`text-[8px] font-mono ml-auto ${w.buyPct > 60 ? 'text-[#00c805]' : 'text-amber-400'}`}>{w.buyPct}% buy</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-white shrink-0">{w.vol}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
      </div>{/* end desktop wrapper */}

    </div>
  )
}
