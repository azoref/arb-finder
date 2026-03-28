import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ArbFinder — Real-Time NBA Arbitrage Opportunities',
  description: 'Find cross-sportsbook arbitrage opportunities for NBA games in real time. Guaranteed profit on every bet.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#0a0a0b] text-[#e8e8f0] antialiased">
        {children}
      </body>
    </html>
  )
}
