import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export const revalidate = 30

export async function GET() {
  try {
    const supabase = await createServiceClient()
    const { data } = await supabase
      .from('arbs')
      .select('id, event_name, market, book_a, book_b, odds_a, odds_b, profit_margin, created_at')
      .order('created_at', { ascending: false })
      .limit(20)

    return NextResponse.json(data ?? [])
  } catch {
    return NextResponse.json([])
  }
}
