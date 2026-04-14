import Link from 'next/link'
import Nav from '@/components/ui/Nav'
import { createClient } from '@/lib/supabase/server'

export const metadata = {
  title: 'Pricing | SharpBet',
  description: 'Free access to whale signals on Polymarket. Upgrade to SharpBet Pro for $29/month and get the automated paper trading bot that mirrors top-scored wallets automatically.',
}

export const dynamic = 'force-dynamic'

const FREE_FEATURES = [
  { label: 'Live whale signal feed', note: 'real-time' },
  { label: 'Wallet leaderboard and profiles', note: '' },
  { label: 'Market movers', note: '' },
  { label: 'News feed', note: '' },
]

const PRO_FEATURES = [
  { label: 'Automated paper trading bot', note: 'mirrors top wallets automatically', highlight: true },
  { label: 'Live paper portfolio and P&L', note: 'tracks every simulated position', highlight: true },
  { label: 'Full wallet scoring', note: '86M trades analyzed', highlight: true },
  { label: 'Instant Discord alerts', note: 'fires within 60s of on-chain trade', highlight: false },
  { label: 'Priority access to real trading', note: 'when live trading launches', highlight: false },
  { label: 'Signal sorting and filters', note: '', highlight: false },
  { label: 'Early access to new features', note: '', highlight: false },
]

const COMPARISON = [
  { feature: 'Whale signal feed', free: 'Live', pro: 'Live' },
  { feature: 'Wallet profiles', free: true, pro: true },
  { feature: 'Paper trading bot', free: false, pro: true },
  { feature: 'Portfolio and P&L', free: false, pro: true },
  { feature: 'Discord alerts', free: false, pro: true },
  { feature: 'Real trading access', free: false, pro: 'Priority' },
]

const FAQS = [
  {
    q: 'What is the paper trading bot?',
    a: 'When a top-scored wallet makes a significant trade on Polymarket, the SharpBet bot automatically mirrors that position as a simulated trade on your behalf. You see the market, the entry price, and real P&L as the market resolves. No real money involved. It proves the edge before you risk anything.',
  },
  {
    q: 'How does SharpBet find the sharp wallets?',
    a: 'We processed 86 million historical Polymarket trades across 50,000+ markets and scored every wallet on four factors: capital velocity, cross-market divergence, conviction size, and market breadth. The top 200 wallets make up the live watchlist. When they trade, SharpBet trades with them.',
  },
  {
    q: 'When does real money trading go live?',
    a: 'Paper trading launches first so we can prove the system generates consistent returns. Once the track record is established, real automated trading unlocks for Pro users. You set your own position size and risk limits.',
  },
  {
    q: 'Which markets does this cover?',
    a: 'All of Polymarket. Politics, crypto, sports, geopolitics, economics, entertainment. If a top-scored wallet is moving size on any market, SharpBet catches it and mirrors the position.',
  },
  {
    q: 'How do Discord alerts work?',
    a: 'Pro users paste a Discord webhook URL into settings. The moment a high-scored wallet trades, SharpBet posts a rich embed to their channel with the wallet, market, size, entry price, and score. It fires within 60 seconds of the on-chain trade.',
  },
]

export default async function PricingPage() {
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

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-[#1a1a1f]">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/3 w-96 h-64 bg-green-500/6 rounded-full blur-[100px]" />
          <div className="absolute top-10 right-1/3 w-72 h-48 bg-violet-500/5 rounded-full blur-[80px]" />
        </div>
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 py-20 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#2a2a32] bg-[#0d0d10] text-[#4a4a55] text-xs font-mono mb-8">
            PRICING
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-5">
            The bot trades for you.<br />
            <span className="bg-gradient-to-r from-green-400 to-emerald-300 bg-clip-text text-transparent">
              Start on paper.
            </span>
          </h1>
          <p className="text-[#6b6b80] text-lg max-w-xl mx-auto leading-relaxed">
            Free gives you the full signal feed. Pro activates the automated paper trading bot that mirrors top-scored wallets on your behalf, so you can see the returns before risking a dollar.
          </p>
        </div>
      </section>

      {/* Pricing cards */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid sm:grid-cols-2 gap-6">

          {/* Free */}
          <div className="bg-[#0d0d10] border border-[#2a2a32] rounded-2xl p-7 flex flex-col">
            <div className="mb-6">
              <p className="text-xs font-mono text-[#4a4a55] uppercase tracking-widest mb-2">Free</p>
              <div className="flex items-end gap-1.5">
                <p className="text-4xl font-bold text-[#e8e8f0]">$0</p>
              </div>
              <p className="text-xs text-[#4a4a55] mt-1.5">forever, no card required</p>
            </div>

            <ul className="space-y-3 mb-8 flex-1">
              {FREE_FEATURES.map(({ label, note }) => (
                <li key={label} className="flex items-start gap-2.5 text-sm text-[#9999aa]">
                  <span className="text-[#3a3a45] mt-0.5 shrink-0">✓</span>
                  <span>
                    {label}
                    {note && <span className="text-[#4a4a55] text-[11px] ml-1.5">({note})</span>}
                  </span>
                </li>
              ))}
            </ul>

            <Link
              href="/auth/signup"
              className="block text-center py-3 border border-[#2a2a32] rounded-xl text-sm font-medium text-[#9999aa] hover:text-[#e8e8f0] hover:bg-[#1a1a1f] transition-colors"
            >
              Get started free
            </Link>
          </div>

          {/* Pro */}
          <div className="relative bg-[#0a0a10] border border-green-500/30 rounded-2xl p-7 flex flex-col overflow-hidden">
            {/* Glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-transparent pointer-events-none" />

            <div className="relative mb-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-mono text-green-500/70 uppercase tracking-widest">SharpBet Pro</p>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-green-500/10 text-green-400 border border-green-500/20">
                  MOST POPULAR
                </span>
              </div>
              <div className="flex items-end gap-1.5">
                <p className="text-4xl font-bold text-white">$29</p>
                <p className="text-[#6b6b80] mb-1.5 text-sm">/month</p>
              </div>
              <p className="text-xs text-[#4a4a55] mt-1.5">cancel anytime</p>
            </div>

            <ul className="relative space-y-3 mb-8 flex-1">
              {PRO_FEATURES.map(({ label, note, highlight }) => (
                <li key={label} className="flex items-start gap-2.5 text-sm">
                  <span className={`mt-0.5 shrink-0 ${highlight ? 'text-green-400' : 'text-green-600'}`}>✓</span>
                  <span className={highlight ? 'text-[#e8e8f0]' : 'text-[#9999aa]'}>
                    {label}
                    {note && (
                      <span className={`text-[11px] ml-1.5 ${highlight ? 'text-green-500/70' : 'text-[#4a4a55]'}`}>
                        ({note})
                      </span>
                    )}
                  </span>
                </li>
              ))}
            </ul>

            <Link
              href="/auth/signup"
              className="relative block text-center py-3 bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-500 hover:to-emerald-400 rounded-xl text-sm font-semibold text-white transition-all shadow-lg shadow-green-900/20"
            >
              Start free, upgrade anytime
            </Link>
          </div>
        </div>
      </section>

      {/* What makes Pro different */}
      <section className="border-t border-[#1a1a1f] bg-[#080808]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-semibold mb-3">The Pro edge, explained</h2>
            <p className="text-[#6b6b80] text-sm max-w-lg mx-auto">
              Three features that make Pro meaningfully different from Free.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-5">
            {[
              {
                icon: '🤖',
                tag: 'PAPER TRADING BOT',
                title: 'Automated copy trading',
                body: 'When a top-scored wallet makes a move, SharpBet mirrors it as a paper trade automatically. You see the position, the entry price, and real P&L as markets resolve. Zero effort required.',
              },
              {
                icon: '📊',
                tag: 'PORTFOLIO',
                title: 'Live P&L dashboard',
                body: 'Every paper position tracked in real time. Open trades, resolved bets, win rate, and total return. See exactly what the bot is doing and how it is performing.',
              },
              {
                icon: '🔔',
                tag: 'DISCORD ALERTS',
                title: 'Instant trade alerts',
                body: 'The moment a top wallet trades, a rich embed hits your Discord channel. Wallet score, market, size, and entry price. Under 60 seconds from on-chain trade to your phone.',
              },
            ].map(({ icon, tag, title, body }) => (
              <div key={title} className="bg-[#0d0d10] border border-[#2a2a32] rounded-xl p-6 hover:border-green-500/20 transition-colors">
                <div className="text-2xl mb-3">{icon}</div>
                <div className="text-[10px] font-mono text-green-500/50 tracking-widest mb-2">{tag}</div>
                <h3 className="font-semibold text-[#e8e8f0] mb-2">{title}</h3>
                <p className="text-sm text-[#6b6b80] leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature comparison table */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 py-16 border-t border-[#1a1a1f]">
        <h2 className="text-xl font-semibold text-center mb-8">Full feature comparison</h2>
        <div className="rounded-xl border border-[#2a2a32] overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-3 bg-[#0d0d10] border-b border-[#2a2a32]">
            <div className="px-5 py-3 text-xs font-mono text-[#4a4a55] uppercase tracking-widest">Feature</div>
            <div className="px-5 py-3 text-xs font-mono text-[#4a4a55] uppercase tracking-widest text-center">Free</div>
            <div className="px-5 py-3 text-xs font-mono text-green-500/60 uppercase tracking-widest text-center">Pro</div>
          </div>
          {COMPARISON.map(({ feature, free, pro }, i) => (
            <div
              key={feature}
              className={`grid grid-cols-3 border-b border-[#1a1a1f] last:border-0 ${i % 2 === 0 ? 'bg-[#0a0a0d]' : 'bg-[#0d0d10]'}`}
            >
              <div className="px-5 py-3.5 text-sm text-[#9999aa]">{feature}</div>
              <div className="px-5 py-3.5 text-sm text-center">
                {typeof free === 'boolean'
                  ? free
                    ? <span className="text-[#4a4a55]">✓</span>
                    : <span className="text-[#2a2a3a]">—</span>
                  : <span className="text-[#6b7280] text-xs">{free}</span>}
              </div>
              <div className="px-5 py-3.5 text-sm text-center">
                {typeof pro === 'boolean'
                  ? pro
                    ? <span className="text-green-400">✓</span>
                    : <span className="text-[#2a2a3a]">—</span>
                  : <span className="text-green-400 text-xs font-medium">{pro}</span>}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 py-16 border-t border-[#1a1a1f]">
        <h2 className="text-xl font-semibold text-center mb-10">Questions</h2>
        <div className="space-y-3">
          {FAQS.map(({ q, a }) => (
            <details key={q} className="group border border-[#2a2a32] rounded-xl bg-[#0a0a0d]">
              <summary className="flex items-center justify-between px-5 py-4 cursor-pointer text-sm font-medium text-[#e8e8f0] list-none hover:bg-[#0d0d10] rounded-xl transition-colors">
                {q}
                <span className="text-[#4a4a55] group-open:rotate-45 transition-transform ml-4 shrink-0 text-lg leading-none">+</span>
              </summary>
              <p className="px-5 pb-5 text-sm text-[#6b6b80] leading-relaxed border-t border-[#1a1a1f] pt-4">{a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="border-t border-[#2a2a32] bg-[#080808]">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center py-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-green-500/20 bg-green-500/5 text-green-400 text-xs font-mono mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            SIGNALS LIVE
          </div>
          <h2 className="text-3xl font-bold mb-4">
            The sharpest money in the world<br />
            <span className="text-green-400">trades on-chain.</span>
          </h2>
          <p className="text-[#6b6b80] mb-8 max-w-md mx-auto leading-relaxed">
            No account limits. No restrictions. Start free and see the feed. Upgrade when you want to act on it.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link
              href="/auth/signup"
              className="px-8 py-3.5 bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-500 hover:to-emerald-400 rounded-full text-base font-semibold transition-all shadow-lg shadow-green-900/30"
            >
              Get started free
            </Link>
            <Link
              href="/demo"
              className="px-8 py-3.5 border border-[#2a2a32] hover:border-green-500/30 rounded-full text-base font-medium text-[#9999aa] hover:text-[#e8e8f0] transition-all"
            >
              Try demo first →
            </Link>
          </div>
          <p className="text-xs text-[#3a3a45] mt-6">No credit card required · Cancel anytime</p>
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
            <Link href="/demo" className="hover:text-[#6b6b80]">Terminal</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
