import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Nav from '@/components/ui/Nav'
import ArbTicker from '@/components/landing/ArbTicker'
import TerminalPreview from '@/components/landing/TerminalPreview'

export const dynamic = 'force-dynamic'

export default async function LandingPage() {
  let user = null
  let profile = null

  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    try {
      const supabase = await createClient()
      const { data: { user: authUser } } = await supabase.auth.getUser()
      user = authUser
      if (user) {
        const { data } = await supabase.from('users').select('is_premium').eq('id', user.id).single()
        profile = data
      }
    } catch {}
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Nav user={user} isPremium={profile?.is_premium} />

      {/* Hero */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-green-500/4 rounded-full blur-[160px]" />
        </div>
        <div className="absolute inset-0 pointer-events-none opacity-[0.025]"
          style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '80px 80px' }} />

        <div className="relative text-center max-w-2xl mx-auto px-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-green-500/20 bg-green-500/5 text-green-500/60 text-[11px] font-mono tracking-widest mb-10">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            BOT ACTIVE
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.08] mb-6">
            We analyzed 86 million trades.<br />
            <span className="text-green-400">The bot does the rest.</span>
          </h1>

          <p className="text-[#9999aa] text-base leading-relaxed mb-4 max-w-md mx-auto">
            We scored every wallet on Polymarket. Four factors. The top 200 get watched 24/7. Every trade mirrored automatically.
          </p>
          <p className="text-[#666677] text-sm mb-12 max-w-sm mx-auto">
            No Bloomberg terminal. No team. No manual work.
          </p>

          <div className="flex items-center justify-center gap-4 flex-wrap mb-14">
            <Link
              href="/auth/signup"
              className="px-8 py-4 bg-white text-black rounded-full text-sm font-semibold hover:bg-green-400 transition-all duration-300"
            >
              Get access
            </Link>
            <Link
              href="/demo"
              className="px-8 py-4 border border-[#1a1a22] hover:border-[#2a2a35] rounded-full text-sm font-medium text-[#777788] hover:text-[#aaaacc] transition-all"
            >
              View live signals
            </Link>
          </div>

          <div className="flex items-center justify-center gap-8 flex-wrap">
            {[
              { val: '86M', label: 'Trades analyzed' },
              { val: '70%', label: 'Win rate', green: true },
              { val: '200', label: 'Wallets watched' },
              { val: '$29/mo', label: 'Total cost' },
            ].map(({ val, label, green }) => (
              <div key={label} className="text-center">
                <p className={`text-xl font-bold font-mono ${green ? 'text-green-400' : 'text-white'}`}>{val}</p>
                <p className="text-[10px] text-[#666677] tracking-widest uppercase mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <div className="w-px h-12 bg-gradient-to-b from-transparent to-[#1a1a22]" />
        </div>
      </section>

      {/* Terminal preview */}
      <section className="border-t border-[#111116] bg-[#030305] py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-[10px] font-mono text-[#666677] tracking-widest mb-6 uppercase text-center">Live right now</div>
          <TerminalPreview />
        </div>
      </section>

      {/* Ticker */}
      <ArbTicker />

      {/* The insight */}
      <section className="border-t border-[#111116]">
        <div className="max-w-5xl mx-auto px-6 py-24">
          <div className="text-[10px] font-mono text-[#666677] tracking-widest mb-10 uppercase">The insight</div>
          <h2 className="text-3xl font-bold mb-4 max-w-xl">
            Same exact entries.<br />
            <span className="text-green-400">The exits make it a different game.</span>
          </h2>
          <p className="text-[#9999aa] text-sm mb-16 max-w-lg">
            The disposition coefficient changed everything. It does not measure how you enter. It measures how you exit.
          </p>

          <div className="grid sm:grid-cols-2 gap-6 max-w-2xl">
            <div className="bg-[#0a0a0d] border border-green-500/10 rounded-xl p-6">
              <div className="text-[10px] font-mono text-green-500/50 tracking-widest mb-4 uppercase">Top wallets</div>
              <div className="space-y-4">
                <div>
                  <p className="text-3xl font-bold font-mono text-green-400">86%</p>
                  <p className="text-xs text-[#9999aa] mt-1">of winner value captured</p>
                </div>
                <div>
                  <p className="text-3xl font-bold font-mono text-white">12%</p>
                  <p className="text-xs text-[#9999aa] mt-1">losers cut at</p>
                </div>
              </div>
            </div>

            <div className="bg-[#0a0a0d] border border-[#1a1a22] rounded-xl p-6">
              <div className="text-[10px] font-mono text-[#666677] tracking-widest mb-4 uppercase">Everyone else</div>
              <div className="space-y-4">
                <div>
                  <p className="text-3xl font-bold font-mono text-[#888899]">58%</p>
                  <p className="text-xs text-[#777788] mt-1">of winner value captured</p>
                </div>
                <div>
                  <p className="text-3xl font-bold font-mono text-[#888899]">41%</p>
                  <p className="text-xs text-[#777788] mt-1">losers held to</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The four factors */}
      <section className="border-t border-[#111116] bg-[#030305]">
        <div className="max-w-5xl mx-auto px-6 py-24">
          <div className="text-[10px] font-mono text-[#666677] tracking-widest mb-10 uppercase">The four factors</div>
          <h2 className="text-3xl font-bold mb-16 max-w-xl">
            No opinions. No news.<br />
            <span className="text-green-400">Four numbers that align or do not.</span>
          </h2>

          <div className="grid sm:grid-cols-2 gap-4">
            {[
              {
                name: 'Capital Velocity',
                code: 'capital_velocity',
                stat: '49x',
                statLabel: 'top wallets recycle capital vs average',
                body: 'Every dollar recycled 49 times before the average trader recycles once. Velocity separates informed conviction from casual noise.',
              },
              {
                name: 'Cross-Market Divergence',
                code: 'cross_market_div',
                stat: 'early',
                statLabel: 'bets placed before the crowd moves',
                body: 'When a wallet bets at 0.18 on a market the crowd prices at 0.31, that gap is the signal. Divergence from consensus means they know something.',
              },
              {
                name: 'Disposition Coefficient',
                code: 'disposition_coef',
                stat: '86%',
                statLabel: 'winner value captured by top wallets',
                body: 'How you exit determines everything. Top wallets hold winners and cut losers fast. Everyone else does the opposite.',
              },
              {
                name: 'Pair Network Correlation',
                code: 'pair_network',
                stat: '42',
                statLabel: 'pair correlations found across 11 markets',
                body: 'When MSFT beats Q3 is at 80c but the model reads 93%, it enters. When the gap closes, it exits. Pure structure. Zero opinions.',
              },
            ].map(({ name, code, stat, statLabel, body }) => (
              <div key={code} className="bg-[#080808] border border-[#111116] rounded-xl p-6 hover:border-[#1a1a22] transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <p className="text-[10px] font-mono text-green-500/40 tracking-widest uppercase">{code}</p>
                  <div className="text-right">
                    <p className="font-mono text-lg font-bold text-green-400">{stat}</p>
                    <p className="text-[9px] text-[#777788] max-w-[120px] text-right leading-tight">{statLabel}</p>
                  </div>
                </div>
                <h3 className="font-semibold text-[#e8e8f0] mb-2">{name}</h3>
                <p className="text-xs text-[#888899] leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-[#111116]">
        <div className="max-w-5xl mx-auto px-6 py-24">
          <div className="text-[10px] font-mono text-[#666677] tracking-widest mb-10 uppercase">How SharpBet works</div>
          <h2 className="text-3xl font-bold mb-16">Automated. Continuous. No input needed.</h2>

          <div className="grid sm:grid-cols-3 gap-6">
            {[
              {
                num: '01',
                title: 'We scored every wallet',
                body: '86 million trades. 50,000 markets. Every wallet on Polymarket scored across all four factors. The top 200 make up the live watchlist.',
              },
              {
                num: '02',
                title: 'The bot watches 24/7',
                body: 'When a watchlisted wallet places a significant trade, SharpBet detects it on-chain within seconds. Size, market, direction, all four factor scores checked.',
              },
              {
                num: '03',
                title: 'Position opened automatically',
                body: 'A paper trade mirrors the position immediately. Same market. Same outcome. No delay. No manual action. You just watch the P&L.',
              },
            ].map(({ num, title, body }) => (
              <div key={num} className="border-t border-[#111116] pt-6">
                <div className="font-mono text-4xl text-[#1a1a22] font-bold mb-6">{num}</div>
                <h3 className="font-semibold text-[#e8e8f0] mb-3">{title}</h3>
                <p className="text-sm text-[#888899] leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The setup */}
      <section className="border-t border-[#111116] bg-[#030305]">
        <div className="max-w-3xl mx-auto px-6 py-24 text-center">
          <div className="text-[10px] font-mono text-[#666677] tracking-widest mb-10 uppercase">The setup</div>
          <h2 className="text-3xl font-bold mb-12">
            Their fund. Your fund.
          </h2>

          <div className="grid sm:grid-cols-2 gap-6 text-left">
            <div className="bg-[#080808] border border-[#111116] rounded-xl p-6">
              <p className="text-[10px] font-mono text-[#666677] tracking-widest mb-4 uppercase">Quant fund</p>
              <div className="space-y-2 text-sm text-[#888899]">
                <p>Floor of PhDs</p>
                <p>$800M AUM</p>
                <p>Bloomberg terminals</p>
                <p>Proprietary infrastructure</p>
                <p>Years of R&D</p>
              </div>
            </div>

            <div className="bg-[#080808] border border-green-500/10 rounded-xl p-6">
              <p className="text-[10px] font-mono text-green-500/50 tracking-widest mb-4 uppercase">SharpBet</p>
              <div className="space-y-3 text-sm">
                <p className="text-[#e8e8f0] flex items-center gap-2"><span className="text-green-500/60">✓</span> Automated bot, runs 24/7</p>
                <p className="text-[#e8e8f0] flex items-center gap-2"><span className="text-green-500/60">✓</span> 86M trades analyzed</p>
                <p className="text-[#e8e8f0] flex items-center gap-2"><span className="text-green-500/60">✓</span> 200 sharp wallets tracked live</p>
                <p className="text-[#e8e8f0] flex items-center gap-2"><span className="text-green-500/60">✓</span> Starts on paper. Moves to real money.</p>
                <p className="text-[#e8e8f0] flex items-center gap-2"><span className="text-green-500/60">✓</span> No setup. No manual work.</p>
              </div>
              <p className="text-green-400 font-mono font-bold mt-5">$29/month</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-[#111116]">
        <div className="max-w-2xl mx-auto px-6 py-24 text-center">
          <h2 className="text-4xl font-bold mb-4">
            Start on paper.<br />Graduate to real money.
          </h2>
          <p className="text-[#9999aa] mb-3 text-sm">The bot mirrors the top 200 wallets automatically. Paper first so you can see the returns before a dollar is at risk. Real trading unlocks once the track record is there.</p>
          <p className="text-[#666677] text-xs mb-10 font-mono">$29/month · paper trading now · real money coming</p>

          <Link
            href="/auth/signup"
            className="inline-block px-10 py-4 bg-white text-black rounded-full text-sm font-semibold hover:bg-green-400 transition-all duration-300"
          >
            Get access
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#111116] py-8">
        <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#555566]">
          <p>2025 SharpBet</p>
          <p className="text-center">For informational purposes only. Not financial advice.</p>
          <div className="flex gap-4">
            <Link href="/leaderboard" className="hover:text-[#555566]">Leaderboard</Link>
            <Link href="/movers" className="hover:text-[#555566]">Movers</Link>
            <Link href="/pricing" className="hover:text-[#555566]">Pricing</Link>
            <Link href="/demo" className="hover:text-[#555566]">Terminal</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
