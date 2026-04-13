import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          background: '#080808',
          border: '1px solid rgba(74,222,128,0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span
          style={{
            color: '#4ade80',
            fontSize: 20,
            fontWeight: 800,
            fontFamily: 'monospace',
            lineHeight: 1,
          }}
        >
          S
        </span>
      </div>
    ),
    { ...size }
  )
}
