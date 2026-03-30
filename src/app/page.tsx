import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Nav from '@/components/ui/Nav'
import LiveStatsBar from '@/components/landing/LiveStatsBar'
import ArbTicker from '@/components/landing/ArbTicker'
import BookStrip from '@/components/landing/BookStrip'
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
                LIVE · SHARPBET · SMART MONEY INTELLIGENCE
              </div>

              <h1 className="text-5xl sm:text-6xl font-bold tracking-tight leading-[1.1] mb-6">
                Follow the<br />
                <span className="bg-gradient-to-r from-green-400 to-emerald-300 bg-clip-text text-transparent">
                  smart money.<BlinkingCursor />
                </span>
              </h1>

              <p className="text-[#9999aa] text-lg leading-relaxed mb-10 max-w-md">
                SharpBet tracks whale activity on Polymarket, surfaces arbitrage across 12+ sportsbooks, and alerts you the moment an edge appears.
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

            {/* Right — dashboard preview */}
            <div className="flex justify-center lg:justify-end">
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
            Smart money moves first. SharpBet watches where it goes: prediction markets, sportsbooks, and on-chain. It tells you before the lines catch up.
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-6">
          {[
            {
              num: '01',
              title: 'We watch the whales',
              body: 'Polymarket is fully on-chain. Every trade is public. We track wallets that consistently beat the market and alert you when they make a big move.',
            },
            {
              num: '02',
              title: 'We find the gaps',
              body: 'When Polymarket prices a team at 62% and a sportsbook has them at +145 (40%), that\'s an edge. We surface it instantly across 12+ books.',
            },
            {
              num: '03',
              title: 'You act first',
              body: 'You get the signal before the sportsbook adjusts the line. Place the bet, lock the edge, move on. No math, no monitoring required.',
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

      {/* "You don't have to be here" section */}
      <section className="border-t border-[#2a2a32] bg-[#080808]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-2xl font-semibold mb-4">
                The sharpest bettors in the world<br />
                <span className="text-green-400">leave footprints.</span>
              </h2>
              <p className="text-[#6b6b80] leading-relaxed mb-6">
                Prediction markets like Polymarket aggregate information from the smartest traders globally, including people with genuine informational edges. Sportsbooks can't limit them. The signal is public.
              </p>
              <p className="text-[#6b6b80] leading-relaxed">
                SharpBet reads those footprints in real time, cross-references them against sportsbook lines, and alerts you the moment the gap is wide enough to act on.
              </p>
            </div>
            <div className="space-y-3">
              {[
                { emoji: '🐋', label: 'Whale tracker', sub: 'Tracks $500+ sports trades on Polymarket in real time' },
                { emoji: '📡', label: 'Scans 12+ books', sub: 'Arbitrage detection every 60 seconds' },
                { emoji: '📊', label: 'Prediction market edge', sub: 'Polymarket vs sportsbook gap analysis' },
                { emoji: '⚡', label: 'Instant Discord alerts', sub: 'Signal fires before the line moves' },
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
            <h2 className="text-2xl font-semibold mb-3">Why prediction markets change everything</h2>
            <p className="text-[#6b6b80] max-w-xl mx-auto text-sm">
              Sportsbooks are closed systems. Polymarket is open. That difference is the edge.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Left — the problem */}
            <div className="space-y-6">
              <div className="border-l-2 border-red-500/30 pl-5">
                <h3 className="font-semibold text-[#e8e8f0] mb-2">The problem with sportsbooks</h3>
                <p className="text-sm text-[#6b6b80] leading-relaxed">
                  Sportsbooks protect themselves. The moment you win consistently, they limit your account: cut your max bet to $50, then $20, then nothing. Sharp bettors get exiled. The market never fully reflects their information.
                </p>
              </div>
              <div className="border-l-2 border-green-500/30 pl-5">
                <h3 className="font-semibold text-[#e8e8f0] mb-2">Prediction markets can&apos;t do that</h3>
                <p className="text-sm text-[#6b6b80] leading-relaxed">
                  Polymarket is a smart contract on a public blockchain. There are no accounts to limit, no managers to call, no restrictions on bet size. A hedge fund and a college student trade at the same price. The sharpest bettors in the world are free to trade at full size.
                </p>
              </div>
              <div className="border-l-2 border-yellow-500/30 pl-5">
                <h3 className="font-semibold text-[#e8e8f0] mb-2">The result: better prices</h3>
                <p className="text-sm text-[#6b6b80] leading-relaxed">
                  Because sharp money flows freely, Polymarket prices are often more accurate than sportsbook lines. When Polymarket says a team has a 63% chance and the sportsbook is still pricing them at +150 (40%), one of them is wrong. It&apos;s almost never Polymarket.
                </p>
              </div>
            </div>

            {/* Right — the opportunity */}
            <div className="bg-[#0d0d10] border border-[#2a2a32] rounded-2xl p-6 space-y-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-xs font-mono text-[#4a4a55] uppercase tracking-widest">The opportunity</span>
              </div>

              {[
                {
                  step: '01',
                  title: 'Whale takes a position',
                  body: 'A wallet with a strong track record buys $40K of Team A on Polymarket at 61%. On-chain, public, verifiable.',
                },
                {
                  step: '02',
                  title: 'Sportsbook hasn\'t moved',
                  body: 'DraftKings still has Team A at +155 (39% implied). The books are slow. They aggregate public data, not on-chain signals.',
                },
                {
                  step: '03',
                  title: 'You see it first',
                  body: 'SharpBet detects the divergence and alerts you. You place the bet at the sportsbook before the line adjusts. That\'s the edge.',
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
                  All trades are public on Polygon blockchain · No accounts · No limits · $8B+ Polymarket volume in 2024
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Discord preview */}
      <DiscordPreview />

      {/* Books strip */}
      <BookStrip />

      {/* Coming Soon */}
      <section className="border-t border-[#2a2a32]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#2a2a32] bg-[#0d0d10] text-[#4a4a55] text-xs font-mono mb-6">
              ROADMAP
            </div>
            <h2 className="text-2xl font-semibold mb-3">What&apos;s coming next</h2>
            <p className="text-[#6b6b80] max-w-md mx-auto text-sm">
              The platform is expanding. Here&apos;s what we&apos;re building.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-5">
            {[
              {
                tag: 'SIGNALS',
                icon: '🐋',
                title: 'Whale signal tracker',
                body: 'Track top-performing Polymarket wallets in real time. When smart money moves on a game, you\'ll know before the sportsbook adjusts.',
                soon: true,
              },
              {
                tag: 'MORE SPORTS',
                icon: '🏈',
                title: 'NFL, MLB, NHL + more',
                body: 'The same arb detection and signal tracking across football, baseball, hockey, soccer, and college sports.',
                soon: true,
              },
              {
                tag: 'MIDDLES',
                icon: '🎯',
                title: 'Middle opportunities',
                body: 'Bet both sides at different point spreads. If the result lands in the middle, you win both bets. Higher upside than standard arbs.',
                soon: true,
              },
            ].map(({ tag, icon, title, body }) => (
              <div
                key={title}
                className="relative bg-[#0d0d10] border border-[#2a2a32] rounded-xl p-6 group"
              >
                <div className="flex items-start justify-between mb-4">
                  <span className="text-2xl">{icon}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono tracking-widest border border-[#2a2a32] text-[#4a4a55]">
                    COMING SOON
                  </span>
                </div>
                <div className="text-[10px] font-mono text-green-500/50 tracking-widest mb-2">{tag}</div>
                <h3 className="font-semibold text-[#e8e8f0] mb-2">{title}</h3>
                <p className="text-sm text-[#6b6b80] leading-relaxed">{body}</p>
              </div>
            ))}
          </div>

          <p className="text-center text-xs text-[#3a3a45] mt-10 font-mono">
            Want early access?{' '}<a href="/auth/signup" className="text-green-500/60 hover:text-green-400 transition-colors underline underline-offset-2">Sign up free</a>{' '}and you&apos;ll be first to know.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-[#2a2a32]">
        <h2 className="text-2xl font-semibold text-center mb-12">Common questions</h2>
        <div className="space-y-4">
          {[
            {
              q: 'Is arbitrage betting legal?',
              a: 'Yes. Arbitrage betting is legal in every US state where sports betting is permitted. Sportsbooks don\'t love it, but it\'s completely within the rules.',
            },
            {
              q: 'Will my accounts get limited?',
              a: 'Sharp bettors do sometimes get limited by sportsbooks. Keeping bet sizes reasonable, using multiple accounts, and rotating books helps reduce this risk.',
            },
            {
              q: 'How fast do arb windows close?',
              a: 'It varies. Some last minutes, some hours. Line movements can close an arb quickly, which is why instant Discord alerts matter.',
            },
            {
              q: 'How much can I realistically make?',
              a: 'Margins are typically 0.5–3%. On a $1,000 bankroll bet repeatedly, experienced arbers can generate $500–2,000/month in guaranteed profit depending on volume and speed.',
            },
            {
              q: 'Do I need accounts at all the sportsbooks?',
              a: 'You only need accounts at the two books involved in each specific arb. We show you exactly which books are involved for every opportunity.',
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
              Free gives you limited signals and delayed arbs. SharpBet Pro unlocks real-time whale feeds, divergence scores, wallet profiles, and instant alerts. Everything you need to act before the line moves.
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
            The math doesn&apos;t care<br />who wins the game.
          </h2>
          <p className="text-[#9999aa] mb-8">
            Stop picking sides. Start exploiting the spread between books.
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
            For informational purposes only. Not financial advice. Check local laws regarding sports betting.
            Arbitrage opportunities are time-sensitive and not guaranteed to remain available.
          </p>
          <div className="flex gap-4">
            <Link href="/pricing" className="hover:text-[#6b6b80]">Pricing</Link>
            <Link href="/calculator" className="hover:text-[#6b6b80]">Calculator</Link>
            <Link href="/tracker" className="hover:text-[#6b6b80]">Tracker</Link>
            <Link href="/demo" className="hover:text-[#6b6b80]">Demo</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
