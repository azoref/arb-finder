import type { Metadata } from 'next'
import './globals.css'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://getsharpbet.com'

export const metadata: Metadata = {
  title: 'SharpBet — Follow the Smart Money',
  description: 'SharpBet tracks whale activity on Polymarket, surfaces arbitrage across 12+ sportsbooks, and alerts you the moment an edge appears. Follow the smart money.',
  metadataBase: new URL(APP_URL),
  verification: {
    google: 'N6Vln7FN8HorEoPhzTcVrGMGZW9BxQuDjgaCJaqxn2Y',
  },
  openGraph: {
    title: 'SharpBet — Follow the Smart Money',
    description: 'Whale signals from Polymarket. Arbitrage across 12+ sportsbooks. Alerts straight to you before the lines move.',
    url: APP_URL,
    siteName: 'SharpBet',
    images: [
      {
        url: '/api/og',
        width: 1200,
        height: 630,
        alt: 'SharpBet — Follow the Smart Money',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SharpBet — Follow the Smart Money',
    description: 'Whale signals from Polymarket. Arbitrage across 12+ sportsbooks. Never miss an edge.',
    images: ['/api/og'],
  },
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
