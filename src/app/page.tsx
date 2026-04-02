import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Nav from '@/components/ui/Nav'
import LiveStatsBar from '@/components/landing/LiveStatsBar'
import ArbTicker from '@/components/landing/ArbTicker'
import DashboardPreview from '@/components/landing/DashboardPreview'
import BlinkingCursor from '@/components/landing/BlinkingCursor'
import DiscordPreview from '@/components/landing/TelegramPreview'
import ProfitMeter from '@/components/landing/ProfitMeter'


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
    <div className="min-h-screen">
      <Nav user={user} isPremium={profile?.is_premium} />

      {/* Live stats bar */}
      <LiveStatsBar />

      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Background glows */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-green-500/8 rounded-full blur-[120px]" />
          <div className="absolute top-20 right-1/4 w-80 h-80 bg-emerald-600/6 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 left-1/2 w-64 h-64 bg-teal-500/5 rounded-full blur-[80px]" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left copy */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-green-500/30 bg-green-500/5 text-green-400 text-xs font-mono mb-8">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                LIVE · PREDICTION MARKET INTELLIGENCE
              </div>

              <h1 className="text-5xl sm:text-6xl font-bold tracking-tight leading-[1.1] mb-6">
                The wallets that<br />
                <span className="bg-gradient-to-r from-green-400 to-emerald-300 bg-clip-text text-transparent">
                  never lose.<BlinkingCursor />
                </span>
              </h1>

              <p className="text-[#9999aa] text-lg leading-relaxed mb-10 max-w-md">
                We scan every wallet on Polymarket. Find the ones that consistently win. Alert you the moment they make their next move so you can act before the market does.
              </p>

              <div className="flex items-center gap-3 flex-wrap">
                <Link
                  href="/auth/signup"
                  className="px-7 py-3.5 bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-500 hover:to-emerald-400 rounded-full text-base font-semibold transition-all shadow-lg shadow-green-900/30"
                >
                  Start for free
                </Link>
                <Link
                  href="/demo"
                  className="px-7 py-3.5 border border-[#2a2a32] hover:border-green-500/30 rounded-full text-base font-medium text-[#9999aa] hover:text-[#e8e8f0] transition-all"
                >
                  Try demo →
                </Link>
              </div>

              <div className="flex items-center gap-6 mt-8 text-xs text-[#4a4a55]">
                <span>✓ Free to start</span>
                <span>✓ No credit card</span>
                <span>✓ Instant alerts</span>
              </div>
            </div>

            {/* Right dashboard preview */}
            <div className="flex justify-center lg:justify-end w-full overflow-hidden">
              <DashboardPreview />
            </div>
          </div>
        </div>
      </section>

      {/* Arb ticker */}
      <ArbTicker />

      {/* Profit meter */}
      <ProfitMeter />

      {/* How it works */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-[#2a2a32]">
        <div className="text-center mb-14">
          <h2 className="text-2xl font-semibold mb-3">How it works</h2>
          <p className="text-[#6b6b80] max-w-xl mx-auto">
            Thousands of wallets trade on Polymarket. A few of them almost never lose. SharpBet finds them and tells you when they move.
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-6">
          {[
            {
              num: '01',
              title: 'We scan every wallet',
              body: 'Polymarket is fully on-chain. Every trade, every wallet, every dollar is public. We track thousands of wallets across all categories (politics, crypto, sports) and rank them by track record.',
            },
            {
              num: '02',
              title: 'We find the ones that win',
              body: 'Most wallets are noise. A few are consistently right. We score every wallet by win rate, trade size, and activity. High-conviction wallets get a higher signal strength score.',
            },
            {
              num: '03',
              title: 'You copy the move',
              body: 'The moment a top wallet places a $10K+ trade, you see it: who, what market, what side, how much. Their track record is right there. You decide in seconds.',
            },
          ].map(({ num, title, body }) => (
            <div key={num} className="bg-[#0d0d10] border border-[#2a2a32] rounded-xl p-6 hover:border-[#3a3a45] transition-colors">
              <div className="font-mono text-3xl text-green-500/30 font-bold mb-4">{num}</div>
              <h3 className="font-semibold text-[#e8e8f0] mb-2">{title}</h3>
              <p className="text-sm text-[#6b6b80] leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* The edge section */}
      <section className="border-t border-[#2a2a32] bg-[#080808]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-2xl font-semibold mb-4">
                Citadel has 400 engineers.<br />
                <span className="text-green-400">You have one screen.</span>
              </h2>
              <p className="text-[#6b6b80] leading-relaxed mb-6">
                The sharpest funds in the world copy-trade on public markets every day. Polymarket makes it even simpler: every trade is on-chain, every wallet is public, and sharp traders can't be limited or banned.
              </p>
              <p className="text-[#6b6b80] leading-relaxed">
                SharpBet finds the wallets doing it right and shows you their next move the moment it happens. No 400 engineers required.
              </p>
            </div>
            <div className="space-y-3">
              {[
                { emoji: '🐋', label: 'Whale signal feed', sub: 'Every $10K+ trade across all Polymarket categories, live' },
                { emoji: '👤', label: 'Wallet profiles', sub: 'Full on-chain trade history, win rate, and volume' },
                { emoji: '🏆', label: 'Wallet leaderboard', sub: 'Ranked by track record. Find the ones that never lose.' },
                { emoji: '⚡', label: 'Instant alerts', sub: 'Signal fires the moment a top wallet places a trade' },
              ].map(({ emoji, label, sub }) => (
                <div key={label} className="flex items-center gap-4 p-4 bg-[#0d0d10] border border-[#1e1e24] rounded-lg">
                  <span className="text-2xl">{emoji}</span>
                  <div>
                    <p className="text-sm font-medium text-[#e8e8f0]">{label}</p>
                    <p className="text-xs text-[#6b6b80] mt-0.5">{sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* The Thesis */}
      <section className="border-t border-[#2a2a32] bg-[#080808]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#2a2a32] bg-[#0d0d10] text-[#4a4a55] text-xs font-mono mb-6">
              THE THESIS
            </div>
            <h2 className="text-2xl font-semibold mb-3">Some wallets almost never lose. They trade in public.</h2>
            <p className="text-[#6b6b80] max-w-xl mx-auto text-sm">
              Polymarket is a public blockchain. Every trade is visible. Sharp money can't be limited, banned, or hidden. That's the entire edge.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Left */}
            <div className="space-y-6">
              <div className="border-l-2 border-red-500/30 pl-5">
                <h3 className="font-semibold text-[#e8e8f0] mb-2">At a sportsbook, sharp bettors get banned</h3>
                <p className="text-sm text-[#6b6b80] leading-relaxed">
                  Win too much and your account gets limited. Bet too big and they close you out. The house doesn't let you keep the edge.
                </p>
              </div>
              <div className="border-l-2 border-green-500/30 pl-5">
                <h3 className="font-semibold text-[#e8e8f0] mb-2">On Polymarket, nobody can stop you</h3>
                <p className="text-sm text-[#6b6b80] leading-relaxed">
                  Polymarket is a smart contract. No accounts to limit. No managers to call. Political insiders, crypto funds, and sharp bettors trade their full conviction freely. Every trade is public on-chain.
                </p>
              </div>
              <div className="border-l-2 border-yellow-500/30 pl-5">
                <h3 className="font-semibold text-[#e8e8f0] mb-2">The signal is already there</h3>
                <p className="text-sm text-[#6b6b80] leading-relaxed">
                  When a wallet with a 70%+ win rate drops $50K on one side, that's not noise. It's the sharpest signal available anywhere. SharpBet surfaces it the moment it hits the chain.
                </p>
              </div>
            </div>

            {/* Right */}
            <div className="bg-[#0d0d10] border border-[#2a2a32] rounded-2xl p-6 space-y-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-xs font-mono text-[#4a4a55] uppercase tracking-widest">What happens in real time</span>
              </div>

              {[
                {
                  step: '01',
                  title: 'A top wallet moves $50K',
                  body: 'A wallet in our top 50 leaderboard (71% win rate, $2.4M in volume) buys YES on a political market at 58%. On-chain. Public. Verifiable.',
                },
                {
                  step: '02',
                  title: 'SharpBet catches it instantly',
                  body: 'Signal strength score: 9/10. Size, track record, category all factor in. You see it in the terminal before most people know the market moved.',
                },
                {
                  step: '03',
                  title: 'You copy the position',
                  body: 'Same market. Same side. You\'re in within minutes of the sharpest wallet on Polymarket. That\'s the entire play.',
                },
              ].map(({ step, title, body }) => (
                <div key={step} className="flex gap-4">
                  <div className="font-mono text-lg text-green-500/30 font-bold shrink-0 w-6">{step}</div>
                  <div>
                    <p className="text-sm font-semibold text-[#e8e8f0] mb-1">{title}</p>
                    <p className="text-xs text-[#6b6b80] leading-relaxed">{body}</p>
                  </div>
                </div>
              ))}

              <div className="border-t border-[#1a1a1f] pt-4 mt-2">
                <p className="text-[11px] text-[#4a4a55] font-mono">
                  All trades verified on Polygon blockchain · No accounts · No limits · $8B+ Polymarket volume
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Discord preview */}
      <DiscordPreview />


      {/* Roadmap */}
      <section className="border-t border-[#2a2a32]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#2a2a32] bg-[#0d0d10] text-[#4a4a55] text-xs font-mono mb-6">
              ROADMAP
            </div>
            <h2 className="text-2xl font-semibold mb-3">Building the prediction market intelligence stack</h2>
            <p className="text-[#6b6b80] max-w-md mx-auto text-sm">
              We started with whale signals. Here is everything we are building on top.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-5">
            {[
              {
                tag: 'LIVE NOW',
                icon: '🐋',
                title: 'Whale signal feed',
                body: 'Every $10,000+ trade across all Polymarket categories in real time. Side, size, wallet, signal strength score, and direct link to the market.',
                live: true,
              },
              {
                tag: 'LIVE NOW',
                icon: '🏆',
                title: 'Wallet leaderboard',
                body: 'Every whale wallet ranked by total volume and track record. Find the wallets that consistently win and follow them directly.',
                live: true,
              },
              {
                tag: 'LIVE NOW',
                icon: '👤',
                title: 'Wallet profiles',
                body: 'Full on-chain trade history for any whale. Win rate, volume, buy/sell ratio, top markets. Know who is actually sharp before you act.',
                live: true,
              },
              {
                tag: 'LIVE NOW',
                icon: '🎯',
                title: 'Signal strength score',
                body: 'A 1-10 score on every signal. Combines trade size and wallet activity so you know which signals are worth acting on and which are noise.',
                live: true,
              },
              {
                tag: 'LIVE NOW',
                icon: '🔔',
                title: 'Follow a wallet',
                body: 'Subscribe to any whale wallet. Get a Discord alert the instant they place a $10K+ trade. Never miss a move from your top wallets.',
                live: true,
              },
              {
                tag: 'LIVE NOW',
                icon: '📈',
                title: 'Market movers',
                body: 'Markets ranked by whale volume in the last 24 hours. See where the smart money is flowing across politics, crypto, and sports right now.',
                live: true,
              },
              {
                tag: 'COMING SOON',
                icon: '⚡',
                title: '1-click copy trade',
                body: 'See a signal and copy the position on Polymarket in one click. Connect your wallet, set a size limit, and mirror the move before the market reacts.',
                live: false,
              },
              {
                tag: 'COMING SOON',
                icon: '💰',
                title: 'Signal P&L tracker',
                body: 'See exactly what you would have made if you had followed the top wallets this week. Real returns from real signals, automatically tracked.',
                live: false,
              },
              {
                tag: 'COMING SOON',
                icon: '🧠',
                title: 'Smart money consensus',
                body: 'When three or more top wallets pile into the same side within hours, it surfaces as a high-conviction play. The strongest signal SharpBet can fire.',
                live: false,
              },
            ].map(({ tag, icon, title, body, live }) => (
              <div
                key={title}
                className={`relative bg-[#0d0d10] border rounded-xl p-6 ${live ? 'border-green-500/20' : 'border-[#2a2a32]'}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <span className="text-2xl">{icon}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono tracking-widest border ${
                    live
                      ? 'border-green-500/30 bg-green-500/10 text-green-400'
                      : 'border-[#2a2a32] text-[#4a4a55]'
                  }`}>
                    {tag}
                  </span>
                </div>
                <div className={`text-[10px] font-mono tracking-widest mb-2 ${live ? 'text-green-500/60' : 'text-[#3a3a45]'}`}>{tag}</div>
                <h3 className="font-semibold text-[#e8e8f0] mb-2">{title}</h3>
                <p className="text-sm text-[#6b6b80] leading-relaxed">{body}</p>
              </div>
            ))}
          </div>

          <p className="text-center text-xs text-[#3a3a45] mt-10 font-mono">
            Want early access to new features?{' '}<a href="/auth/signup" className="text-green-500/60 hover:text-green-400 transition-colors underline underline-offset-2">Sign up free</a>{' '}and you&apos;ll be first to know.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-[#2a2a32]">
        <h2 className="text-2xl font-semibold text-center mb-12">Common questions</h2>
        <div className="space-y-4">
          {[
            {
              q: 'What is a whale signal?',
              a: 'A whale signal is a trade of $10,000 or more on any Polymarket market. We set the threshold at $10K because it filters out noise and captures only genuine conviction. At that size, you are looking at wallets that have meaningful information and are willing to back it with real money.',
            },
            {
              q: 'Why is a Polymarket whale trade a signal?',
              a: 'Because Polymarket cannot limit sharp traders. There are no accounts and no limits. Informed traders across politics, crypto, sports, and more can express their full conviction freely. When a wallet with a proven track record moves $10K+, that trade is the sharpest signal available anywhere.',
            },
            {
              q: 'How accurate are whale wallets?',
              a: 'It varies by wallet. Some are directional bettors with strong track records, others are market makers or hedgers. That\'s why we\'re building wallet ROI and win-rate tracking so you can see the history before you follow a trade.',
            },
            {
              q: 'How do Discord alerts work?',
              a: 'Pro users paste a Discord webhook URL into their settings. The moment a whale signal or edge is detected, SharpBet posts a rich embed directly to their Discord channel with the wallet, market, size, and implied probability.',
            },
            {
              q: 'Is this only for sports?',
              a: 'All of them. Politics, sports, crypto, economics, entertainment. If a whale is moving size on Polymarket, you will see it. You can filter by category in the dashboard.',
            },
          ].map(({ q, a }) => (
            <details key={q} className="group border border-[#2a2a32] rounded-lg">
              <summary className="flex items-center justify-between px-5 py-4 cursor-pointer text-sm font-medium text-[#e8e8f0] list-none hover:bg-[#0d0d10] rounded-lg transition-colors">
                {q}
                <span className="text-[#4a4a55] group-open:rotate-45 transition-transform ml-4 shrink-0">+</span>
              </summary>
              <p className="px-5 pb-4 text-sm text-[#6b6b80] leading-relaxed border-t border-[#1a1a1f] pt-3">{a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Pricing teaser */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-[#2a2a32]">
        <div className="bg-[#0d0d10] border border-[#2a2a32] rounded-2xl p-8 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-8">
          <div>
            <p className="text-xs font-mono text-[#4a4a55] uppercase tracking-widest mb-2">Pricing</p>
            <h2 className="text-2xl font-semibold mb-2">Start free. Go pro when ready.</h2>
            <p className="text-[#6b6b80] text-sm max-w-md leading-relaxed">
              Free gives you a delayed signal feed and limited history. SharpBet Pro unlocks real-time whale signals, divergence scores, wallet profiles, and instant Discord alerts. Everything you need to act before the market catches up.
            </p>
            <div className="flex items-center gap-6 mt-4 text-xs text-[#4a4a55]">
              <span>✓ Free forever plan</span>
              <span>✓ Pro from $29/mo</span>
              <span>✓ Cancel anytime</span>
            </div>
          </div>
          <div className="flex flex-col gap-3 shrink-0">
            <Link
              href="/pricing"
              className="px-7 py-3 bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-500 hover:to-emerald-400 rounded-full text-sm font-semibold text-white transition-all whitespace-nowrap text-center shadow-lg shadow-green-900/20"
            >
              See full pricing →
            </Link>
            <Link
              href="/auth/signup"
              className="px-7 py-3 border border-[#2a2a32] hover:border-[#3a3a45] rounded-full text-sm font-medium text-[#9999aa] hover:text-[#e8e8f0] transition-all whitespace-nowrap text-center"
            >
              Start for free
            </Link>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="border-t border-[#2a2a32] bg-[#080808]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center py-20">
          <h2 className="text-3xl font-bold mb-4">
            Find the wallets that never lose.<br />
            <span className="text-green-400">Copy what they do next.</span>
          </h2>
          <p className="text-[#9999aa] mb-8 max-w-md mx-auto">
            Every trade is public. Every wallet is traceable. SharpBet surfaces the signal the moment it hits the chain.
          </p>
          <Link
            href="/auth/signup"
            className="inline-block px-8 py-3.5 bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-500 hover:to-emerald-400 rounded-full text-base font-semibold transition-all shadow-lg shadow-green-900/30"
          >
            Get started free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#2a2a32] py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#4a4a55]">
          <p>© {new Date().getFullYear()} SharpBet</p>
          <p className="text-center">
            For informational purposes only. Not financial advice. Prediction market prices are not guaranteed to reflect future outcomes.
          </p>
          <div className="flex gap-4">
            <Link href="/leaderboard" className="hover:text-[#6b6b80]">Leaderboard</Link>
            <Link href="/movers" className="hover:text-[#6b6b80]">Movers</Link>
            <Link href="/tracker" className="hover:text-[#6b6b80]">Journal</Link>
            <Link href="/pricing" className="hover:text-[#6b6b80]">Pricing</Link>
            <Link href="/demo" className="hover:text-[#6b6b80]">Demo</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
