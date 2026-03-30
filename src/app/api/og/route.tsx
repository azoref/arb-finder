import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          background: '#080808',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '64px',
          fontFamily: 'monospace',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Grid lines background */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'linear-gradient(rgba(74,222,128,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(74,222,128,0.03) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />

        {/* Green glow top-right */}
        <div
          style={{
            position: 'absolute',
            top: '-120px',
            right: '-120px',
            width: '500px',
            height: '500px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(74,222,128,0.12) 0%, transparent 70%)',
          }}
        />

        {/* Top bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#e8e8f0', fontSize: '32px', fontWeight: 700, letterSpacing: '-1px' }}>
              SHARP
            </span>
            <span style={{ color: '#4ade80', fontSize: '32px', fontWeight: 700, letterSpacing: '-1px' }}>
              Bet
            </span>
          </div>
          {/* Status pill */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(74,222,128,0.08)',
              border: '1px solid rgba(74,222,128,0.2)',
              borderRadius: '999px',
              padding: '8px 20px',
            }}
          >
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#4ade80' }} />
            <span style={{ color: '#4ade80', fontSize: '14px', letterSpacing: '2px' }}>SIGNALS LIVE</span>
          </div>
        </div>

        {/* Main headline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ color: '#4a4a55', fontSize: '14px', letterSpacing: '3px' }}>
              SMART MONEY INTELLIGENCE
            </span>
            <span style={{ color: '#e8e8f0', fontSize: '72px', fontWeight: 700, lineHeight: 1, letterSpacing: '-2px' }}>
              Follow the
            </span>
            <span style={{ color: '#4ade80', fontSize: '72px', fontWeight: 700, lineHeight: 1, letterSpacing: '-2px' }}>
              smart money.
            </span>
          </div>
          <p style={{ color: '#6b6b80', fontSize: '22px', maxWidth: '640px', lineHeight: 1.5, margin: 0 }}>
            Whale signals from Polymarket. Arbitrage across 12+ sportsbooks. Alerts before the lines move.
          </p>
        </div>

        {/* Bottom bar: whale signal + arb ticker */}
        <div
          style={{
            display: 'flex',
            gap: '24px',
            borderTop: '1px solid #1a1a1f',
            paddingTop: '24px',
          }}
        >
          {[
            { label: 'WHALE SIGNAL', value: 'Chiefs ML · $42K', color: '#4ade80' },
            { label: 'POLY PRICE', value: '67% implied', color: '#e8e8f0' },
            { label: 'BOOK PRICE', value: 'DraftKings +145', color: '#e8e8f0' },
            { label: 'EDGE', value: '+21pt divergence', color: '#4ade80' },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ color: '#4a4a55', fontSize: '11px', letterSpacing: '2px' }}>{label}</span>
              <span style={{ color, fontSize: '16px', fontWeight: 600 }}>{value}</span>
            </div>
          ))}
          <div style={{ marginLeft: 'auto', display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-end' }}>
            <span style={{ color: '#4a4a55', fontSize: '11px', letterSpacing: '2px' }}>URL</span>
            <span style={{ color: '#6b6b80', fontSize: '16px' }}>getsharpbet.com</span>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
