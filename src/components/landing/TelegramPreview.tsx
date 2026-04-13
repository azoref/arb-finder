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
            <span className="text-green-400">You act on the signal.</span>
          </h2>
          <p className="text-[#6b6b80] leading-relaxed mb-6">
            No refreshing tabs. No monitoring dashboards. The moment a whale makes a significant move on Polymarket, your Discord channel gets a rich embed with the wallet, the market, the size, and the implied probability. Everything you need to decide in seconds.
          </p>
          <ul className="space-y-3 text-sm text-[#9999aa]">
            {[
              'Fires within 60 seconds of on-chain detection',
              'Wallet pseudonym, trade size, and implied probability',
              'Category tagged: Politics, Sports, Crypto, and more',
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
                          <p className="text-[#dbdee1]">Will the Celtics win the NBA Finals 2026?</p>
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

                {/* Second whale signal */}
                <div className="flex gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#06b6d4] flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5">
                    SB
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-white text-sm font-semibold">SharpBet</span>
                      <span className="text-[10px] bg-[#5865F2] text-white px-1 py-0.5 rounded text-[9px] font-medium">APP</span>
                      <span className="text-[#72767d] text-xs">{timeStr}</span>
                    </div>
                    <div className="bg-[#2b2d31] rounded border-l-4 border-[#06b6d4] p-3">
                      <p className="text-white text-xs font-semibold mb-2">🐋 Whale Signal · ↓ SELL</p>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[11px]">
                        <div className="col-span-2">
                          <p className="text-[#72767d] uppercase text-[9px] tracking-wide font-medium">Market</p>
                          <p className="text-[#dbdee1]">Will Trump win the 2026 midterms?</p>
                        </div>
                        <div>
                          <p className="text-[#72767d] uppercase text-[9px] tracking-wide font-medium">Size</p>
                          <p className="text-red-400 font-bold">$45K</p>
                        </div>
                        <div>
                          <p className="text-[#72767d] uppercase text-[9px] tracking-wide font-medium">Polymarket</p>
                          <p className="text-white font-bold">34%</p>
                        </div>
                      </div>
                      <p className="text-[#72767d] text-[9px] mt-2">SharpBet · Polymarket on-chain</p>
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
