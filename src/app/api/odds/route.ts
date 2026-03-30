import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export const revalidate = 60

export async function GET() {
  try {
    const supabase = await createServiceClient()
    const { data, error } = await supabase
      .from('odds_snapshot')
      .select('data, updated_at')
      .eq('sport', 'basketball_nba')
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'No odds data available yet. Worker is fetching...' }, { status: 404 })
    }

    return NextResponse.json(data.data)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
