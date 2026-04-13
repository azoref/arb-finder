import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('bets')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { sport, event, market, selection, book, odds, stake, notes, is_arb } = body

  const { data, error } = await supabase
    .from('bets')
    .insert({
      user_id: user.id,
      sport: sport || 'Other',
      event,
      market: market || selection || '',
      selection: selection || '',
      book: book || 'Polymarket',
      odds: parseFloat(odds),
      stake: parseFloat(stake),
      notes: notes || null,
      is_arb: is_arb || false,
      result: 'pending',
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
