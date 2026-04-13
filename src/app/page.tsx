import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Nav from '@/components/ui/Nav'
import ArbTicker from '@/components/landing/ArbTicker'

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

      {/* Hero - full viewport, dark, minimal */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">

        {/* Background glows */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-green-500/5 rounded-full blur-[140px]" />
          <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-emerald-600/4 rounded-full blur-[100px]" />
        </div>

        {/* Subtle grid overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '80px 80px' }} />

        <div className="relative text-center max-w-3xl mx-auto px-6">
          {/* Status pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-green-500/20 bg-green-500/5 text-green-500/70 text-[11px] font-mono tracking-widest mb-12">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            LIVE SYSTEM ACTIVE
          </div>

          {/* Main headline */}
          <h1 className="text-6xl sm:text-7xl lg:text-8xl font-bold tracking-tight leading-[1.05] mb-8 text-white">
            We know who<br />
            <span className="text-green-400">bets first.</span>
          </h1>

          {/* Subtext */}
          <p className="text-[#555566] text-lg leading-relaxed mb-10 max-w-lg mx-auto">
            A closed group of wallets moves before markets react. We found them. SharpBet trades with them automatically.
          </p>

          {/* Data points */}
          <div className="flex items-center justify-center gap-10 mb-14 flex-wrap">
            <div className="text-center">
              <p className="text-2xl font-bold text-white font-mono">86M</p>
              <p className="text-[10px] text-[#3a3a45] tracking-widest uppercase mt-1">Trades analyzed</p>
            </div>
            <div className="w-px h-8 bg-[#2a2a32]" />
            <div className="text-center">
              <p className="text-2xl font-bold text-white font-mono">50K+</p>
              <p className="text-[10px] text-[#3a3a45] tracking-widest uppercase mt-1">Markets tracked</p>
            </div>
            <div className="w-px h-8 bg-[#2a2a32]" />
            <div className="text-center">
              <p className="text-2xl font-bold text-green-400 font-mono">200</p>
              <p className="text-[10px] text-[#3a3a45] tracking-widest uppercase mt-1">Wallets watchlisted</p>
            </div>
            <div className="w-px h-8 bg-[#2a2a32]" />
            <div className="text-center">
              <p className="text-2xl font-bold text-white font-mono">24/7</p>
              <p className="text-[10px] text-[#3a3a45] tracking-widest uppercase mt-1">Automated</p>
            </div>
          </div>

          {/* CTAs */}
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link
              href="/auth/signup"
              className="px-8 py-4 bg-white text-black rounded-full text-sm font-semibold hover:bg-green-400 transition-all duration-300"
            >
              Request access
            </Link>
            <Link
              href="/demo"
              className="px-8 py-4 border border-[#2a2a32] hover:border-[#3a3a45] rounded-full text-sm font-medium text-[#555566] hover:text-[#9999aa] transition-all"
            >
              View live signals
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-[#2a2a35]">
          <div className="w-px h-12 bg-gradient-to-b from-transparent to-[#2a2a35]" />
        </div>
      </section>

      {/* Ticker */}
      <ArbTicker />

      {/* How it works */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-[#2a2a32]">
        <div className="text-center mb-14">
          <h2 className="text-2xl font-semibold mb-3">How it works</h2>
          <p className="text-[#6b6b80] max-w-xl mx-auto">
            Every trade on Polymarket is public and on-chain. We track 86M+ trades to identify the wallets that win. When they bet, SharpBet bets with them.
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-6">
          {[
            {
              num: '01',
              title: 'We find the sharp wallets',
              body: 'Our scoring engine analyzes 86 million historical trades across 50,000+ markets. Capital velocity, conviction size, cross-market accuracy. The top wallets are ranked and watchlisted automatically.',
            },
            {
              num: '02',
              title: 'A top wallet trades',
              body: 'The moment a high-scored wallet places a significant bet, SharpBet detects it on-chain. We check size, market, direction, and whether multiple top wallets are taking the same side.',
            },
            {
              num: '03',
              title: 'SharpBet mirrors the position',
              body: 'A paper trade is placed automatically on your behalf, mirroring the same market and outcome. Start on paper to verify the edge. Flip to real money when you are confident.',
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

      {/* The scoring engine */}
      <section className="border-t border-[#2a2a32] bg-[#080808]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#2a2a32] bg-[#0d0d10] text-[#4a4a55] text-xs font-mono mb-6">
                THE SCORING ENGINE
              </div>
              <h2 className="text-2xl font-semibold mb-4">
                Not all whales are equal.<br />
                <span className="text-green-400">We score every single one.</span>
              </h2>
              <p className="text-[#6b6b80] leading-relaxed mb-6">
                Polymarket has tens of thousands of active wallets. Most are retail noise. A small number are consistently early, consistently right, and consistently large. We built the engine to find them.
              </p>
              <p className="text-[#6b6b80] leading-relaxed">
                86 million trades processed. 28,000+ wallets scored. The top 200 make up our live watchlist. When they trade, SharpBet trades.
              </p>
            </div>
            <div className="space-y-3">
              {[
                {
                  label: 'Capital Velocity',
                  sub: 'How fast does USDC move through this wallet? High velocity means active, confident, and informed.',
                  score: '30%',
                },
                {
                  label: 'Cross-Market Divergence',
                  sub: 'Does this wallet bet before the crowd moves the price? Divergence from market average = early information edge.',
                  score: '30%',
                },
                {
                  label: 'Conviction Size',
                  sub: 'Average trade size signals confidence. Wallets that bet big when they know something stand out clearly.',
                  score: '25%',
                },
                {
                  label: 'Market Breadth',
                  sub: 'Sharp wallets win across many markets, not just one lucky call. Breadth separates skill from variance.',
                  score: '15%',
                },
              ].map(({ label, sub, score }) => (
                <div key={label} className="flex items-start gap-4 p-4 bg-[#0d0d10] border border-[#1e1e24] rounded-lg">
                  <div className="shrink-0 text-right">
                    <p className="font-mono text-green-400 text-sm font-semibold">{score}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#e8e8f0]">{label}</p>
                    <p className="text-xs text-[#6b6b80] mt-0.5 leading-relaxed">{sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Live example */}
      <section className="border-t border-[#2a2a32]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#2a2a32] bg-[#0d0d10] text-[#4a4a55] text-xs font-mono mb-6">
              LIVE EXAMPLE
            </div>
            <h2 className="text-2xl font-semibold mb-3">What a SharpBet signal looks like</h2>
          </div>

          <div className="bg-[#0d0d10] border border-[#2a2a32] rounded-2xl p-6 space-y-5 max-w-2xl mx-auto">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs font-mono text-[#4a4a55] uppercase tracking-widest">Signal detected</span>
            </div>

            {[
              {
                step: '01',
                title: 'Wallet 0x715e... places $340K bet',
                body: 'Score 52.6. 142 historical trades. $1.7M total volume. 7 different markets. Betting YES on a niche geopolitical market that has had zero public activity for weeks.',
              },
              {
                step: '02',
                title: 'SharpBet mirrors the position',
                body: 'Paper trade opened automatically. Same market. Same outcome. $100 paper size. Entry price: 0.31. The position is live before the next block confirms.',
              },
              {
                step: '03',
                title: 'Three days later: market resolves YES',
                body: 'The news breaks. The market closes at 1.00. Paper trade exits at $223. The wallet knew. SharpBet was there.',
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
                All trades on Polygon blockchain · Paper trading available now · Real money trading coming soon
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Roadmap */}
      <section className="border-t border-[#2a2a32] bg-[#080808]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#2a2a32] bg-[#0d0d10] text-[#4a4a55] text-xs font-mono mb-6">
              ROADMAP
            </div>
            <h2 className="text-2xl font-semibold mb-3">From signal to automated trade</h2>
            <p className="text-[#6b6b80] max-w-md mx-auto text-sm">
              Start on paper. Once the edge is proven, go live.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-5">
            {[
              {
                tag: 'LIVE NOW',
                icon: '🐋',
                title: 'Whale signal feed',
                body: 'Every $10K+ trade from tracked wallets in real time. Wallet score, market, size, direction, and signal strength — all in one feed.',
                live: true,
              },
              {
                tag: 'LIVE NOW',
                icon: '🏆',
                title: 'Wallet leaderboard',
                body: 'Top wallets ranked by score. Win rate, volume, markets traded. See who is actually sharp before following them.',
                live: true,
              },
              {
                tag: 'LIVE NOW',
                icon: '👤',
                title: 'Wallet profiles',
                body: 'Full on-chain history for any wallet. Every trade, every market, every outcome. Know the track record before you mirror a position.',
                live: true,
              },
              {
                tag: 'LIVE NOW',
                icon: '📰',
                title: 'Market news feed',
                body: 'Breaking news matched to active markets. See where the smart money is positioned before the story goes mainstream.',
                live: true,
              },
              {
                tag: 'COMING SOON',
                icon: '📄',
                title: 'Paper trading bot',
                body: 'Connect your account. SharpBet automatically mirrors top wallet trades as paper positions. Track your P&L with zero real money at risk.',
                live: false,
              },
              {
                tag: 'COMING SOON',
                icon: '⚡',
                title: 'Automated real trading',
                body: 'Connect your Polymarket API key. Set position sizes and risk limits. SharpBet places real trades automatically when a high-score wallet moves.',
                live: false,
              },
              {
                tag: 'COMING SOON',
                icon: '🧠',
                title: 'Consensus signals',
                body: 'When multiple top wallets pile into the same market within hours, it fires as a maximum-conviction alert. The strongest signal the system can generate.',
                live: false,
              },
              {
                tag: 'COMING SOON',
                icon: '📊',
                title: 'Portfolio dashboard',
                body: 'Live P&L, open positions, trade history, and performance breakdown. See exactly how your copy-trading portfolio is performing.',
                live: false,
              },
              {
                tag: 'COMING SOON',
                icon: '🔔',
                title: 'Custom wallet alerts',
                body: 'Follow specific wallets and get notified the instant they trade. Telegram, Discord, email. Never miss a move from your top picks.',
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
                <h3 className="font-semibold text-[#e8e8f0] mb-2">{title}</h3>
                <p className="text-sm text-[#6b6b80] leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-[#2a2a32]">
        <h2 className="text-2xl font-semibold text-center mb-12">Common questions</h2>
        <div className="space-y-4">
          {[
            {
              q: 'How does SharpBet pick which wallets to follow?',
              a: 'We processed 86 million historical trades across 50,000+ Polymarket markets and scored every wallet on four factors: capital velocity, cross-market divergence, conviction size, and market breadth. The top 200 wallets make up our live watchlist. Scores update as new data comes in.',
            },
            {
              q: 'What is paper trading?',
              a: 'Paper trading means placing simulated trades with no real money. When a top wallet buys a market, SharpBet logs a paper position on your behalf. You see the real P&L you would have made. This lets you verify the edge before putting real money at risk.',
            },
            {
              q: 'Why does a big Polymarket trade actually mean something?',
              a: 'Polymarket is fully permissionless — no accounts to restrict, no size limits, no one to call. Political insiders, crypto funds, and sharp money all bet freely. Every trade is recorded on-chain the moment it happens. A large, confident bet from a wallet with a proven track record is a real signal.',
            },
            {
              q: 'When does real money trading go live?',
              a: 'Paper trading launches first so we can prove the system generates consistent returns. Once the track record is established, real money trading unlocks for verified users. You set your own position size limits and risk parameters.',
            },
            {
              q: 'What markets does this cover?',
              a: 'All of Polymarket — politics, crypto, sports, geopolitics, economics, entertainment. If a top-scored wallet is moving size on any market, SharpBet catches it and mirrors the position.',
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

      {/* Bottom CTA */}
      <section className="border-t border-[#2a2a32] bg-[#080808]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center py-20">
          <h2 className="text-3xl font-bold mb-4">
            The sharpest wallets on Polymarket.<br />
            <span className="text-green-400">Now trading for you.</span>
          </h2>
          <p className="text-[#9999aa] mb-8 max-w-md mx-auto">
            86 million trades analyzed. 200 wallets watchlisted. When they move, SharpBet moves with them. Start on paper. Go live when ready.
          </p>
          <Link
            href="/auth/signup"
            className="inline-block px-8 py-3.5 bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-500 hover:to-emerald-400 rounded-full text-base font-semibold transition-all shadow-lg shadow-green-900/30"
          >
            Start paper trading free
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
