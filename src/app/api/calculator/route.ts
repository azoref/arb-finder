import { NextRequest, NextResponse } from 'next/server'
import { calculateArb } from '@/lib/arb'

export async function POST(req: NextRequest) {
  const { oddsA, oddsB, bankroll, format } = await req.json()

  if (!oddsA || !oddsB || !bankroll) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const result = calculateArb(
    parseFloat(oddsA),
    parseFloat(oddsB),
    parseFloat(bankroll),
    format ?? 'american'
  )

  return NextResponse.json(result)
}
