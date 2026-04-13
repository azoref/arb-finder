const FEATURES = [
  { label: 'Real-time arb detection',      us: true,  manual: false, others: true  },
  { label: 'Discord alerts',                 us: true,  manual: false, others: false },
  { label: 'Auto-calculated stakes',        us: true,  manual: false, others: false },
  { label: 'No dashboard babysitting',      us: true,  manual: false, others: false },
  { label: 'NBA + spreads + totals',        us: true,  manual: false, others: true  },
  { label: '12+ books monitored',           us: true,  manual: false, others: true  },
  { label: 'Free tier available',           us: true,  manual: true,  others: false },
  { label: 'Clean, simple interface',       us: true,  manual: true,  others: false },
  { label: 'Live odds comparison table',    us: true,  manual: false, others: true  },
]

function Check({ value }: { value: boolean }) {
  return value
    ? <span className="text-green-400 text-base">✓</span>
    : <span className="text-[#2a2a32] text-base">✕</span>
}

export default function ComparisonTable() {
  return (
    <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-[#2a2a32]">
      <div className="text-center mb-12">
        <h2 className="text-2xl font-semibold mb-3">Why SharpBet</h2>
        <p className="text-[#6b6b80] max-w-xl mx-auto text-sm">
          Other tools make you watch a screen. We send the alert to your pocket.
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-[#2a2a32]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#2a2a32] bg-[#0d0d10]">
              <th className="text-left px-5 py-4 text-xs text-[#4a4a55] uppercase tracking-wider font-medium w-1/2">Feature</th>
              <th className="px-5 py-4 text-center">
                <div className="flex flex-col items-center gap-1">
                  <span className="text-green-400 font-semibold text-sm">SharpBet</span>
                  <span className="text-[10px] text-[#4a4a55] font-normal font-mono">YOU ARE HERE</span>
                </div>
              </th>
              <th className="px-5 py-4 text-center">
                <div className="flex flex-col items-center gap-1">
                  <span className="text-[#6b6b80] font-medium text-sm">Manual</span>
                  <span className="text-[10px] text-[#4a4a55] font-normal">checking odds yourself</span>
                </div>
              </th>
              <th className="px-5 py-4 text-center">
                <div className="flex flex-col items-center gap-1">
                  <span className="text-[#6b6b80] font-medium text-sm">Others</span>
                  <span className="text-[10px] text-[#4a4a55] font-normal">OddsJam, etc.</span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1a1a1f]">
            {FEATURES.map(({ label, us, manual, others }) => (
              <tr key={label} className="hover:bg-[#0d0d10] transition-colors">
                <td className="px-5 py-3.5 text-[#9999aa]">{label}</td>
                <td className="px-5 py-3.5 text-center bg-green-500/[0.03]"><Check value={us} /></td>
                <td className="px-5 py-3.5 text-center"><Check value={manual} /></td>
                <td className="px-5 py-3.5 text-center"><Check value={others} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
