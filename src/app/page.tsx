import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Nav from '@/components/ui/Nav'
import LiveStatsBar from '@/components/landing/LiveStatsBar'
import ArbTicker from '@/components/landing/ArbTicker'
import BookStrip from '@/components/landing/BookStrip'
import DashboardPreview from '@/components/landing/DashboardPreview'
import BlinkingCursor from '@/components/landing/BlinkingCursor'
import TelegramPreview from '@/components/landing/TelegramPreview'
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
                LIVE · SHARPBET · NBA ARBITRAGE
              </div>

              <h1 className="text-5xl sm:text-6xl font-bold tracking-tight leading-[1.1] mb-6">
                Pure math.<br />
                <span className="bg-gradient-to-r from-green-400 to-emerald-300 bg-clip-text text-transparent">
                  Zero luck.<BlinkingCursor />
                </span>
              </h1>

              <p className="text-[#9999aa] text-lg leading-relaxed mb-10 max-w-md">
                SharpBet watches every major US sportsbook around the clock.
                When the math lines up, we text you. You act. Guaranteed profit, no edge required.
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
                <span>✓ Telegram alerts</span>
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
            Sportsbooks disagree on lines constantly. When the disagreement creates a mathematical edge, we catch it in seconds.
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-6">
          {[
            {
              num: '01',
              title: 'We scan every book',
              body: 'Our worker polls 12+ US sportsbooks every 60 seconds: moneylines, spreads, and totals across all NBA games.',
            },
            {
              num: '02',
              title: 'The math finds the edge',
              body: 'When two books\' implied probabilities sum to less than 100%, a guaranteed profit exists. We flag it instantly.',
            },
            {
              num: '03',
              title: 'You get the alert',
              body: 'A Telegram message hits your phone with exact stakes to place on each book. You bet, you profit. No matter the outcome.',
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
                Most tools assume you&apos;re glued to a dashboard.<br />
                <span className="text-green-400">We don&apos;t.</span>
              </h2>
              <p className="text-[#6b6b80] leading-relaxed mb-6">
                Arb windows close fast, sometimes in minutes. The only way to catch them is to be watching constantly. Nobody has time for that.
              </p>
              <p className="text-[#6b6b80] leading-relaxed">
                That&apos;s why SharpBet sends a Telegram alert the moment an opportunity appears, with the exact books, odds, and stakes you need to act. You&apos;re in, you&apos;re out, you&apos;re profitable.
              </p>
            </div>
            <div className="space-y-3">
              {[
                { emoji: '📡', label: 'Scans 12+ books', sub: 'Every 60 seconds, 24/7' },
                { emoji: '⚡', label: 'Instant Telegram alert', sub: 'Fires the moment an arb is found' },
                { emoji: '🧮', label: 'Exact stakes calculated', sub: 'Optimal split for your bankroll' },
                { emoji: '🔒', label: 'Risk-free by definition', sub: 'Math guarantees profit on both outcomes' },
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

      {/* Telegram preview */}
      <TelegramPreview />

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
              NBA arbitrage is just the start. Here&apos;s what we&apos;re building.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-5">
            {[
              {
                tag: 'MORE SPORTS',
                icon: '🏈',
                title: 'NFL, MLB, NHL + more',
                body: 'The same real-time arb detection across football, baseball, hockey, soccer, and college sports. More games means more edges.',
                soon: true,
              },
              {
                tag: '+EV BETTING',
                icon: '📊',
                title: 'Expected value finder',
                body: 'Compare sharp reference books against soft books to find mispriced lines. You don\'t need two accounts — just one edge.',
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
              a: 'It varies. Some last minutes, some hours. Line movements can close an arb quickly, which is why instant Telegram alerts matter.',
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

      {/* Pricing */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-[#2a2a32]">
        <h2 className="text-2xl font-semibold text-center mb-3">Simple pricing</h2>
        <p className="text-center text-[#6b6b80] mb-12 text-sm">Start free. Upgrade when you&apos;re ready to move fast.</p>
        <div className="grid sm:grid-cols-2 gap-6">
          {/* Free */}
          <div className="bg-[#0d0d10] border border-[#2a2a32] rounded-xl p-6 space-y-5">
            <div>
              <h3 className="font-semibold text-lg">Free</h3>
              <p className="text-3xl font-bold mt-1">$0</p>
              <p className="text-xs text-[#4a4a55] mt-1">forever</p>
            </div>
            <ul className="space-y-2.5 text-sm text-[#9999aa]">
              {[
                'Up to 5 arbs visible',
                '5-minute data delay',
                'Book names hidden',
                'Arb calculator',
                'Live odds viewer',
              ].map(f => (
                <li key={f} className="flex items-center gap-2">
                  <span className="text-[#3a3a45]">✓</span> {f}
                </li>
              ))}
            </ul>
            <Link href="/auth/signup" className="block text-center py-2.5 border border-[#2a2a32] rounded-lg text-sm font-medium hover:bg-[#1a1a1f] transition-colors">
              Get started free
            </Link>
          </div>

          {/* Premium */}
          <div className="bg-[#0d0d10] border border-green-500/30 rounded-xl p-6 space-y-5 relative overflow-hidden">
            <div className="absolute top-4 right-4">
              <span className="px-2 py-0.5 rounded text-xs font-mono font-medium bg-green-500/10 text-green-400 border border-green-500/20">
                PREMIUM
              </span>
            </div>
            <div>
              <h3 className="font-semibold text-lg">Premium</h3>
              <p className="text-3xl font-bold mt-1 text-green-400">$29<span className="text-base font-normal text-[#9999aa]">/mo</span></p>
              <p className="text-xs text-[#4a4a55] mt-1">cancel anytime</p>
            </div>
            <ul className="space-y-2.5 text-sm text-[#9999aa]">
              {[
                'Real-time arbs, no delay',
                'All book names revealed',
                'Unlimited arbs',
                'Telegram alerts instantly',
                'Custom bankroll calculator',
                'Filter by book / margin / market',
                'Live odds comparison table',
              ].map(f => (
                <li key={f} className="flex items-center gap-2">
                  <span className="text-green-400">✓</span> {f}
                </li>
              ))}
            </ul>
            <Link href="/auth/signup" className="block text-center py-2.5 bg-green-600 hover:bg-green-500 rounded-lg text-sm font-medium text-white transition-colors">
              Start free, upgrade anytime
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
            <Link href="/calculator" className="hover:text-[#6b6b80]">Calculator</Link>
            <Link href="/tracker" className="hover:text-[#6b6b80]">Tracker</Link>
            <Link href="/dashboard" className="hover:text-[#6b6b80]">Dashboard</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
