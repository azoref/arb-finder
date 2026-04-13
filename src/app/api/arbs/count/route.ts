import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.json({ count: 0 })
  }
  try {
    const supabase = await createClient()
    const since = new Date()
    since.setHours(0, 0, 0, 0)
    const { count } = await supabase
      .from('arbs')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', since.toISOString())
    return NextResponse.json({ count: count ?? 0 })
  } catch {
    return NextResponse.json({ count: 0 })
  }
}
