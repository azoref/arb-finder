export default function TelegramPreview() {
  const now = new Date()
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-[#2a2a32]">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        {/* Copy */}
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#2a2a32] bg-[#0d0d10] text-[#6b6b80] text-xs font-mono mb-6">
            📲 WHAT YOU ACTUALLY GET
          </div>
          <h2 className="text-2xl font-semibold mb-4">
            The alert hits your phone.<br />
            <span className="text-green-400">You place the bets. Done.</span>
          </h2>
          <p className="text-[#6b6b80] leading-relaxed mb-6">
            No spreadsheets. No refreshing tabs. No mental math.
            The moment we detect an arb, your Telegram lights up with everything you need:
            which books, which lines, exactly how much to bet on each side.
          </p>
          <ul className="space-y-3 text-sm text-[#9999aa]">
            {[
              'Fires within seconds of detection',
              'Exact dollar amounts for your bankroll',
              'Guaranteed profit shown upfront',
              'Direct link to the arb in the dashboard',
            ].map(item => (
              <li key={item} className="flex items-center gap-2">
                <span className="text-green-400 font-mono">→</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Phone mockup */}
        <div className="flex justify-center lg:justify-end">
          <div className="relative">
            {/* Phone shell */}
            <div className="w-[280px] bg-[#1a1a1f] rounded-[2.5rem] border-[6px] border-[#2a2a32] shadow-2xl overflow-hidden">
              {/* Status bar */}
              <div className="bg-[#0d0d10] px-5 pt-3 pb-2 flex items-center justify-between">
                <span className="text-[10px] text-[#6b6b80] font-medium">{timeStr}</span>
                <div className="flex items-center gap-1">
                  <div className="flex gap-0.5 items-end h-3">
                    {[2, 3, 4, 5].map(h => (
                      <div key={h} className="w-1 bg-[#6b6b80] rounded-sm" style={{ height: `${h * 3}px` }} />
                    ))}
                  </div>
                  <div className="w-5 h-2.5 rounded-sm border border-[#6b6b80] ml-1">
                    <div className="w-3 h-full bg-green-400 rounded-sm" />
                  </div>
                </div>
              </div>

              {/* Telegram header */}
              <div className="bg-[#17212b] px-4 py-3 flex items-center gap-3 border-b border-[#0d1621]">
                <div className="w-8 h-8 rounded-full bg-[#2AABEE] flex items-center justify-center text-white text-xs font-bold">
                  AF
                </div>
                <div>
                  <p className="text-white text-sm font-medium leading-none">SharpBet</p>
                  <p className="text-[#6b6b80] text-[10px] mt-0.5">bot</p>
                </div>
              </div>

              {/* Chat area */}
              <div className="bg-[#0e1621] px-3 py-4 min-h-[360px]">
                {/* Bot message bubble */}
                <div className="flex justify-start mb-2">
                  <div className="max-w-[230px] bg-[#182533] rounded-2xl rounded-tl-sm px-3.5 py-3 text-xs leading-relaxed">
                    <p className="text-[#2AABEE] font-semibold mb-2">🔔 NEW ARB FOUND</p>

                    <div className="space-y-1.5 text-[#aab8c5]">
                      <p><span className="text-[#6b6b80]">Event:</span> Celtics vs Heat</p>
                      <p><span className="text-[#6b6b80]">Market:</span> Moneyline</p>
                      <div className="border-t border-[#0d1621] my-2" />
                      <p>
                        <span className="text-[#6b6b80]">DraftKings</span>
                        <span className="text-white"> Celtics </span>
                        <span className="text-green-400 font-mono">+108</span>
                      </p>
                      <p>
                        <span className="text-[#6b6b80]">FanDuel</span>
                        <span className="text-white"> Heat </span>
                        <span className="text-green-400 font-mono">+106</span>
                      </p>
                      <div className="border-t border-[#0d1621] my-2" />
                      <p><span className="text-[#6b6b80]">Margin:</span> <span className="text-green-400 font-semibold">+1.42%</span></p>
                      <div className="border-t border-[#0d1621] my-2" />
                      <p className="text-[#6b6b80] text-[10px] font-medium uppercase tracking-wide">Stakes ($1,000)</p>
                      <p>DraftKings: <span className="text-white font-mono">$481</span></p>
                      <p>FanDuel: <span className="text-white font-mono">$486</span></p>
                      <p className="mt-1">
                        Profit: <span className="text-green-400 font-semibold font-mono">$14.20</span> guaranteed
                      </p>
                    </div>

                    <p className="text-[#4a5568] text-[9px] mt-2.5 text-right">
                      {timeStr} ✓✓
                    </p>
                  </div>
                </div>

                {/* Notification badge effect */}
                <div className="flex justify-center mt-4">
                  <span className="text-[9px] text-[#3a4a5a] bg-[#182533] px-3 py-1 rounded-full">
                    Today
                  </span>
                </div>
              </div>

              {/* Input bar */}
              <div className="bg-[#17212b] px-3 py-2 flex items-center gap-2 border-t border-[#0d1621]">
                <div className="flex-1 bg-[#0e1621] rounded-full px-3 py-1.5 text-[10px] text-[#4a5568]">
                  Message
                </div>
                <div className="w-7 h-7 rounded-full bg-[#2AABEE] flex items-center justify-center">
                  <svg className="w-3 h-3 text-white fill-current" viewBox="0 0 24 24">
                    <path d="M2 21l21-9L2 3v7l15 2-15 2v7z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Glow */}
            <div className="absolute inset-0 rounded-[2.5rem] bg-green-500/5 blur-xl -z-10 scale-110" />
          </div>
        </div>
      </div>
    </section>
  )
}
