import type { Metadata } from 'next'
import './globals.css'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://getsharpbet.com'

export const metadata: Metadata = {
  title: 'SharpBet — Real-Time NBA Arbitrage Alerts',
  description: 'SharpBet scans 12+ US sportsbooks around the clock and sends a Telegram alert the moment a guaranteed profit opportunity appears. No math, no monitoring — just profit.',
  metadataBase: new URL(APP_URL),
  openGraph: {
    title: 'SharpBet — Real-Time NBA Arbitrage Alerts',
    description: 'Guaranteed profit opportunities delivered straight to your Telegram. SharpBet watches every major US sportsbook so you don\'t have to.',
    url: APP_URL,
    siteName: 'SharpBet',
    images: [
      {
        url: '/api/og',
        width: 1200,
        height: 630,
        alt: 'SharpBet — Real-Time NBA Arbitrage',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SharpBet — Real-Time NBA Arbitrage Alerts',
    description: 'Guaranteed profit opportunities delivered straight to your Telegram.',
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
