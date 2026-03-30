export default function DiscordPreview() {
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
            The alert hits your Discord.<br />
            <span className="text-green-400">You place the bets. Done.</span>
          </h2>
          <p className="text-[#6b6b80] leading-relaxed mb-6">
            No refreshing tabs. No monitoring dashboards. The moment a whale makes a significant move on Polymarket, your Discord channel gets a rich embed with the wallet, the market, the size, and the implied probability — everything you need to decide in seconds.
          </p>
          <ul className="space-y-3 text-sm text-[#9999aa]">
            {[
              'Fires within 60 seconds of on-chain detection',
              'Wallet pseudonym, trade size, and implied probability',
              'Polymarket vs sportsbook divergence included',
              'Direct link to the full wallet profile',
            ].map(item => (
              <li key={item} className="flex items-center gap-2">
                <span className="text-green-400 font-mono">→</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Discord mockup */}
        <div className="flex justify-center lg:justify-end">
          <div className="relative w-[340px]">
            {/* Discord window */}
            <div className="bg-[#313338] rounded-xl overflow-hidden shadow-2xl border border-[#1e1f22]">

              {/* Title bar */}
              <div className="bg-[#1e1f22] px-4 py-2.5 flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                  <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
                  <div className="w-3 h-3 rounded-full bg-[#28c840]" />
                </div>
                <div className="flex items-center gap-2 ml-2">
                  <span className="text-[#6b6b80] text-xs">#</span>
                  <span className="text-[#e0e0e0] text-xs font-semibold">sharp-alerts</span>
                </div>
              </div>

              {/* Channel area */}
              <div className="px-4 py-4 space-y-4 min-h-[320px]">

                {/* Whale signal embed */}
                <div className="flex gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#7c3aed] flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5">
                    SB
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-white text-sm font-semibold">SharpBet</span>
                      <span className="text-[10px] bg-[#5865F2] text-white px-1 py-0.5 rounded text-[9px] font-medium">APP</span>
                      <span className="text-[#72767d] text-xs">{timeStr}</span>
                    </div>
                    <div className="bg-[#2b2d31] rounded border-l-4 border-[#7c3aed] p-3">
                      <p className="text-white text-xs font-semibold mb-2">🐋 Whale Signal · ↑ BUY</p>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[11px]">
                        <div className="col-span-2">
                          <p className="text-[#72767d] uppercase text-[9px] tracking-wide font-medium">Market</p>
                          <p className="text-[#dbdee1]">NBA Finals 2026 — Celtics win?</p>
                        </div>
                        <div>
                          <p className="text-[#72767d] uppercase text-[9px] tracking-wide font-medium">Size</p>
                          <p className="text-green-400 font-bold">$28K</p>
                        </div>
                        <div>
                          <p className="text-[#72767d] uppercase text-[9px] tracking-wide font-medium">Polymarket</p>
                          <p className="text-white font-bold">58%</p>
                        </div>
                      </div>
                      <p className="text-[#72767d] text-[9px] mt-2">SharpBet · Polymarket on-chain</p>
                    </div>
                  </div>
                </div>

                {/* Arb alert embed */}
                <div className="flex gap-3">
                  {/* Bot avatar */}
                  <div className="w-9 h-9 rounded-full bg-[#22c55e] flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5">
                    SB
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-white text-sm font-semibold">SharpBet</span>
                      <span className="text-[10px] bg-[#5865F2] text-white px-1 py-0.5 rounded text-[9px] font-medium">APP</span>
                      <span className="text-[#72767d] text-xs">{timeStr}</span>
                    </div>

                    {/* Embed card */}
                    <div className="bg-[#2b2d31] rounded border-l-4 border-[#22c55e] p-3">
                      <p className="text-white text-xs font-semibold mb-2">🔔 New Arb Detected</p>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[11px]">
                        <div>
                          <p className="text-[#72767d] uppercase text-[9px] tracking-wide font-medium">Event</p>
                          <p className="text-[#dbdee1]">Celtics vs Heat</p>
                        </div>
                        <div>
                          <p className="text-[#72767d] uppercase text-[9px] tracking-wide font-medium">Margin</p>
                          <p className="text-green-400 font-bold">+1.42%</p>
                        </div>
                        <div>
                          <p className="text-[#72767d] uppercase text-[9px] tracking-wide font-medium">DraftKings</p>
                          <p className="text-[#dbdee1]">Celtics <span className="text-green-400">+108</span></p>
                        </div>
                        <div>
                          <p className="text-[#72767d] uppercase text-[9px] tracking-wide font-medium">FanDuel</p>
                          <p className="text-[#dbdee1]">Heat <span className="text-green-400">+106</span></p>
                        </div>
                      </div>
                      <div className="border-t border-[#3f4147] mt-2.5 pt-2.5">
                        <p className="text-[#72767d] uppercase text-[9px] tracking-wide font-medium mb-1">Stakes ($1,000)</p>
                        <p className="text-[11px] text-[#dbdee1]">DraftKings: <span className="text-white font-mono">$481</span> · FanDuel: <span className="text-white font-mono">$486</span></p>
                        <p className="text-[11px] mt-1">Profit: <span className="text-green-400 font-bold font-mono">$14.20</span> guaranteed</p>
                      </div>
                      <p className="text-[#72767d] text-[9px] mt-2">SharpBet · getsharpbet.com</p>
                    </div>
                  </div>
                </div>

              </div>

              {/* Input bar */}
              <div className="bg-[#383a40] mx-4 mb-4 rounded-lg px-3 py-2.5 flex items-center gap-2">
                <span className="flex-1 text-[#72767d] text-xs">Message #sharp-alerts</span>
              </div>
            </div>

            {/* Glow */}
            <div className="absolute inset-0 rounded-xl bg-[#5865F2]/5 blur-xl -z-10 scale-110" />
          </div>
        </div>
      </div>
    </section>
  )
}
