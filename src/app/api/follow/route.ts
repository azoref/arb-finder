import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/follow?wallet=0x... — check if following (or list all if no wallet param)
export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const wallet = req.nextUrl.searchParams.get('wallet')

  if (wallet) {
    const { data } = await supabase
      .from('followed_wallets')
      .select('id')
      .eq('user_id', user.id)
      .eq('wallet', wallet)
      .maybeSingle()
    return NextResponse.json({ following: !!data })
  }

  const { data } = await supabase
    .from('followed_wallets')
    .select('wallet, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return NextResponse.json(data ?? [])
}

// POST /api/follow — follow a wallet (Pro only)
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('users')
    .select('is_premium')
    .eq('id', user.id)
    .single()

  if (!profile?.is_premium) {
    return NextResponse.json({ error: 'Pro subscription required' }, { status: 403 })
  }

  const { wallet } = await req.json()
  if (!wallet || wallet.length < 10) {
    return NextResponse.json({ error: 'Invalid wallet' }, { status: 400 })
  }

  const { error } = await supabase
    .from('followed_wallets')
    .upsert({ user_id: user.id, wallet }, { onConflict: 'user_id,wallet', ignoreDuplicates: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

// DELETE /api/follow — unfollow a wallet
export async function DELETE(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { wallet } = await req.json()
  if (!wallet) return NextResponse.json({ error: 'Invalid wallet' }, { status: 400 })

  const { error } = await supabase
    .from('followed_wallets')
    .delete()
    .eq('user_id', user.id)
    .eq('wallet', wallet)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
