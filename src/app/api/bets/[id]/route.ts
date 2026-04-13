import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

function calcProfit(odds: number, stake: number, result: string): number | null {
  if (result === 'pending') return null
  if (result === 'push') return 0
  if (result === 'loss') return -stake
  // win: odds stored as entry price in cents (e.g. 65 = 65¢)
  // profit = stake * (100 - price) / price
  return parseFloat((stake * (100 - odds) / odds).toFixed(2))
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const { result } = body

  // Fetch existing bet to get odds/stake
  const { data: existing } = await supabase
    .from('bets')
    .select('odds, stake')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const profit = calcProfit(existing.odds, existing.stake, result)

  const { data, error } = await supabase
    .from('bets')
    .update({ result, profit })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  const { error } = await supabase
    .from('bets')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
