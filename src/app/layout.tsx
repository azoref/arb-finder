import type { Metadata } from 'next'
import './globals.css'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://getsharpbet.com'

export const metadata: Metadata = {
  title: 'SharpBet — Prediction Market Intelligence',
  description: 'SharpBet is the intelligence layer for prediction markets. Track whale wallets on Polymarket, follow proven traders, and act on edges before the market catches up.',
  metadataBase: new URL(APP_URL),
  verification: {
    google: 'N6Vln7FN8HorEoPhzTcVrGMGZW9BxQuDjgaCJaqxn2Y',
  },
  openGraph: {
    title: 'SharpBet — Prediction Market Intelligence',
    description: 'Whale signals, wallet profiles, and divergence scores from Polymarket. Follow the smart money before the lines move.',
    url: APP_URL,
    siteName: 'SharpBet',
    images: [
      {
        url: '/api/og',
        width: 1200,
        height: 630,
        alt: 'SharpBet — Prediction Market Intelligence',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SharpBet — Prediction Market Intelligence',
    description: 'Track whale wallets on Polymarket. Follow proven traders. Act before the market catches up.',
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
