import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Nav from '@/components/ui/Nav'
import ArbCounter from '@/components/landing/ArbCounter'

export const dynamic = 'force-dynamic'

export default async function LandingPage() {
  let user = null
  let profile = null

  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    try {
      const supabase = createClient()
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

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-green-500/30 bg-green-500/5 text-green-400 text-xs font-mono mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          LIVE · NBA ARBITRAGE
        </div>

        <h1 className="text-5xl sm:text-6xl font-bold tracking-tight leading-tight mb-6">
          Guaranteed profit<br />
          <span className="text-green-400">on every bet.</span>
        </h1>

        <p className="text-lg text-[#9999aa] max-w-2xl mx-auto mb-10">
          ArbFinder scans every major US sportsbook in real time and surfaces cross-book arbitrage
          opportunities before they close. No edge needed — just math.
        </p>

        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link
            href="/auth/signup"
            className="px-6 py-3 bg-green-600 hover:bg-green-500 rounded-lg text-base font-semibold transition-colors"
          >
            Start for free
          </Link>
          <Link
            href="/calculator"
            className="px-6 py-3 border border-[#2a2a32] hover:border-[#3a3a45] rounded-lg text-base font-medium text-[#9999aa] hover:text-[#e8e8f0] transition-colors"
          >
            Try the calculator
          </Link>
        </div>

        <ArbCounter />
      </section>

      {/* How it works */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-[#2a2a32]">
        <h2 className="text-2xl font-semibold text-center mb-12">How arbitrage betting works</h2>
        <div className="grid sm:grid-cols-3 gap-8">
          {[
            {
              num: '01',
              title: 'Different books, different odds',
              body: 'Sportsbooks set their own lines. Sometimes their disagreement on a game creates a mathematical edge.',
            },
            {
              num: '02',
              title: 'Implied probabilities sum < 100%',
              body: 'When the implied probability of all outcomes across books adds up to less than 100%, an arb exists.',
            },
            {
              num: '03',
              title: 'Bet all sides, profit guaranteed',
              body: 'Place the optimal stakes on every outcome across the right books. No matter what happens, you profit.',
            },
          ].map(({ num, title, body }) => (
            <div key={num} className="bg-[#111114] border border-[#2a2a32] rounded-lg p-5">
              <div className="font-mono text-2xl text-green-500/40 font-bold mb-3">{num}</div>
              <h3 className="font-semibold mb-2">{title}</h3>
              <p className="text-sm text-[#9999aa] leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-[#2a2a32]">
        <h2 className="text-2xl font-semibold text-center mb-12">Pricing</h2>
        <div className="grid sm:grid-cols-2 gap-6">
          {/* Free */}
          <div className="bg-[#111114] border border-[#2a2a32] rounded-lg p-6 space-y-4">
            <div>
              <h3 className="font-semibold text-lg">Free</h3>
              <p className="text-3xl font-bold mt-1">$0</p>
            </div>
            <ul className="space-y-2 text-sm text-[#9999aa]">
              {[
                'Up to 5 arbs visible',
                '5-minute data delay',
                'Book names hidden',
                'Arb calculator',
              ].map(f => (
                <li key={f} className="flex items-center gap-2">
                  <span className="text-[#3a3a45]">✓</span> {f}
                </li>
              ))}
            </ul>
            <Link href="/auth/signup" className="block text-center py-2 border border-[#2a2a32] rounded-md text-sm font-medium hover:bg-[#1a1a1f] transition-colors">
              Get started
            </Link>
          </div>

          {/* Premium */}
          <div className="bg-[#111114] border border-green-500/30 rounded-lg p-6 space-y-4 relative overflow-hidden">
            <div className="absolute top-3 right-3">
              <span className="px-2 py-0.5 rounded text-xs font-mono font-medium bg-green-500/10 text-green-400 border border-green-500/20">
                PREMIUM
              </span>
            </div>
            <div>
              <h3 className="font-semibold text-lg">Premium</h3>
              <p className="text-3xl font-bold mt-1 text-green-400">$29<span className="text-base font-normal text-[#9999aa]">/mo</span></p>
            </div>
            <ul className="space-y-2 text-sm text-[#9999aa]">
              {[
                'Real-time arbs (no delay)',
                'All book names revealed',
                'Unlimited arbs',
                'Telegram alerts on new arbs',
                'Custom bankroll calculator',
                'Filter by book / margin',
              ].map(f => (
                <li key={f} className="flex items-center gap-2">
                  <span className="text-green-400">✓</span> {f}
                </li>
              ))}
            </ul>
            <Link href="/auth/signup" className="block text-center py-2 bg-green-600 hover:bg-green-500 rounded-md text-sm font-medium text-white transition-colors">
              Start free, upgrade anytime
            </Link>
          </div>
        </div>
      </section>

      {/* Disclaimer + Footer */}
      <footer className="border-t border-[#2a2a32] py-8 mt-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center text-xs text-[#4a4a55] space-y-2">
          <p>
            For informational purposes only. Not financial advice. Check your local laws regarding sports betting.
            Arbitrage opportunities are time-sensitive and not guaranteed to remain available.
          </p>
          <p>© {new Date().getFullYear()} ArbFinder</p>
        </div>
      </footer>
    </div>
  )
}
