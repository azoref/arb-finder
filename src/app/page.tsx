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
                LIVE · PREDICTION MARKET INTELLIGENCE
              </div>

              <h1 className="text-5xl sm:text-6xl font-bold tracking-tight leading-[1.1] mb-6">
                Follow the<br />
                <span className="bg-gradient-to-r from-green-400 to-emerald-300 bg-clip-text text-transparent">
                  smart money.<BlinkingCursor />
                </span>
              </h1>

              <p className="text-[#9999aa] text-lg leading-relaxed mb-10 max-w-md">
                Sportsbooks ban sharp bettors. Polymarket can't. We track the wallets that move the market and alert you the moment they act.
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
            Sharp money can't be limited on Polymarket. SharpBet surfaces it the moment it moves.
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-6">
          {[
            {
              num: '01',
              title: 'We watch the whales',
              body: 'Polymarket is fully on-chain. Every trade is public. We track wallets that consistently beat the market and alert you the moment they make a significant move.',
            },
            {
              num: '02',
              title: 'We score the signal',
              body: 'Not all whale trades are equal. We weight each signal by wallet win rate, trade size, and market divergence to surface the ones that actually matter.',
            },
            {
              num: '03',
              title: 'You act with conviction',
              body: 'You see who moved, how much, and their track record. The whale signal is the conviction. You decide what to do with it.',
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
                Prediction markets like Polymarket are open smart contracts. Anyone can trade any size. The sharpest bettors in the world — people with real informational edges — can't be limited, so they trade freely. The price reflects that.
              </p>
              <p className="text-[#6b6b80] leading-relaxed">
                SharpBet reads those footprints in real time. When a proven wallet bets big, that trade is the signal. No sportsbook comparison required.
              </p>
            </div>
            <div className="space-y-3">
              {[
                { emoji: '🐋', label: 'Whale signal feed', sub: 'Every $1,000+ sports trade on Polymarket, live' },
                { emoji: '👤', label: 'Wallet profiles', sub: 'Full on-chain trade history for any wallet' },
                { emoji: '📊', label: 'Wallet track record', sub: 'Win rate, volume, and ROI for every whale' },
                { emoji: '⚡', label: 'Instant Discord alerts', sub: 'Signal fires the moment a whale moves' },
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
            <h2 className="text-2xl font-semibold mb-3">The only market where insiders can't be limited</h2>
            <p className="text-[#6b6b80] max-w-xl mx-auto text-sm">
              When sharp money can't be shut out, the price tells the truth. That is the entire thesis.
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
                  Polymarket is a smart contract on a public blockchain. There are no accounts to limit, no managers to call, no restrictions on size. Anyone with an edge can express it fully. The sharpest bettors in the world trade right alongside everyone else.
                </p>
              </div>
              <div className="border-l-2 border-yellow-500/30 pl-5">
                <h3 className="font-semibold text-[#e8e8f0] mb-2">The result: the price is already sharp</h3>
                <p className="text-sm text-[#6b6b80] leading-relaxed">
                  Because nothing filters out informed traders, the Polymarket price is already the most accurate price available. A $40K bet from a wallet with a strong track record is not noise. It is a statement. You don&apos;t need a sportsbook line to validate it.
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
                  body: 'A wallet with a strong track record buys $40K on Team A at 61%. On-chain, public, verifiable. No one can stop them.',
                },
                {
                  step: '02',
                  title: 'The track record matters',
                  body: 'This wallet has hit 68% of its last 50 trades. That is not luck. When they move size, it means something.',
                },
                {
                  step: '03',
                  title: 'You act with conviction',
                  body: 'SharpBet fires the alert the moment it happens. You have the wallet history, the size, the market. The signal speaks for itself.',
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
                body: 'Every $1,000+ sports trade on Polymarket surfaces in real time. Side, size, wallet, implied probability, and Discord alert.',
                live: true,
              },
              {
                tag: 'LIVE NOW',
                icon: '👤',
                title: 'Wallet profiles',
                body: 'Click any whale pseudonym to see their full on-chain trade history, volume, buy/sell ratio, and top markets traded.',
                live: true,
              },
              {
                tag: 'LIVE NOW',
                icon: '📊',
                title: 'Wallet track record',
                body: 'Every whale comes with their on-chain history. Win rate, total volume, buy/sell ratio. Know who is actually sharp before you act.',
                live: true,
              },
              {
                tag: 'COMING SOON',
                icon: '🏆',
                title: 'Wallet leaderboard',
                body: 'Every whale wallet ranked by ROI, win rate, and total volume. See who is actually sharp before you follow their trades.',
                live: false,
              },
              {
                tag: 'COMING SOON',
                icon: '🎯',
                title: 'Signal strength score',
                body: 'A single 1-10 score per signal combining wallet accuracy, trade size, and market divergence. Know which signals are worth acting on.',
                live: false,
              },
              {
                tag: 'COMING SOON',
                icon: '🔔',
                title: 'Follow a wallet',
                body: 'Subscribe to any specific wallet. Get a Discord alert the instant they make a move, filtered to your minimum trade size.',
                live: false,
              },
              {
                tag: 'COMING SOON',
                icon: '📈',
                title: 'Market movers',
                body: 'When a Polymarket price moves 5%+ in under an hour, something happened. Surface these fast-moving markets before the public notices.',
                live: false,
              },
              {
                tag: 'COMING SOON',
                icon: '🧠',
                title: 'Smart money consensus',
                body: 'When three or more independent whale wallets pile into the same side within a few hours, surface it as a high-conviction play.',
                live: false,
              },
              {
                tag: 'COMING SOON',
                icon: '⚖️',
                title: 'Kalshi cross-reference',
                body: 'When Polymarket and Kalshi price the same event differently, that gap is itself a signal. Two markets, one edge.',
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
              a: 'A whale signal is a trade of $1,000 or more placed on a sports market on Polymarket. We set the threshold at $1K because it filters out casual noise while still capturing meaningful conviction. Below that level, trades are too small to distinguish informed bettors from recreational activity.',
            },
            {
              q: 'Why is a Polymarket whale trade a signal?',
              a: 'Because Polymarket cannot limit sharp bettors. On a sportsbook, if you win consistently they cut your limits and eventually ban you. On Polymarket there are no accounts and no limits. Informed traders can express their full conviction. When a wallet with a proven track record bets big, that trade is the sharpest price available anywhere.',
            },
            {
              q: 'How accurate are whale wallets?',
              a: 'It varies by wallet. Some are directional bettors with strong track records, others are market makers or hedgers. That\'s why we\'re building wallet ROI and win-rate tracking — so you can see the history before you follow a trade.',
            },
            {
              q: 'How do Discord alerts work?',
              a: 'Pro users paste a Discord webhook URL into their settings. The moment a whale signal or edge is detected, SharpBet posts a rich embed directly to their Discord channel with the wallet, market, size, and implied probability.',
            },
            {
              q: 'Is this only for sports?',
              a: 'Right now yes — we filter for sports markets specifically. Longer term we plan to cover all Polymarket categories including politics, economics, and entertainment as the platform expands.',
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
            The sharpest money in the world<br />
            <span className="text-green-400">trades in the open.</span>
          </h2>
          <p className="text-[#9999aa] mb-8 max-w-md mx-auto">
            On-chain, public, verifiable. SharpBet reads it in real time so you can act before anyone else does.
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
