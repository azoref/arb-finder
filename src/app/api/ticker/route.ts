import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export const revalidate = 60

export async function GET() {
  try {
    const supabase = await createServiceClient()
    const { data } = await supabase
      .from('whale_signals')
      .select('tx_hash, pseudonym, side, outcome, price, usd_size, title, traded_at')
      .gte('usd_size', 10000)
      .order('traded_at', { ascending: false })
      .limit(25)

    return NextResponse.json(data ?? [])
  } catch {
    return NextResponse.json([])
  }
}
