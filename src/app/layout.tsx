import type { Metadata } from 'next'
import './globals.css'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://getsharpbet.com'

export const metadata: Metadata = {
  title: 'SharpBet · Automated Prediction Market Bot',
  description: 'We scored every wallet on Polymarket across 86 million trades. The top 200 get watched 24/7. Every trade mirrored automatically as a paper position. $29/month.',
  metadataBase: new URL(APP_URL),
  verification: {
    google: 'N6Vln7FN8HorEoPhzTcVrGMGZW9BxQuDjgaCJaqxn2Y',
  },
  openGraph: {
    title: 'SharpBet · We analyzed 86M trades. The bot does the rest.',
    description: 'The top 200 wallets on Polymarket, watched 24/7. Every trade mirrored automatically as a paper position. Start for free, upgrade for $29/month.',
    url: APP_URL,
    siteName: 'SharpBet',
    images: [
      {
        url: '/api/og',
        width: 1200,
        height: 630,
        alt: 'SharpBet · Automated Prediction Market Bot',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SharpBet · We analyzed 86M trades. The bot does the rest.',
    description: 'The top 200 wallets on Polymarket, watched 24/7. Every trade mirrored automatically. Start free.',
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
