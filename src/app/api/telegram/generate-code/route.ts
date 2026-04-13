import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { randomBytes } from 'crypto'

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const code = randomBytes(4).toString('hex').toUpperCase() // e.g. "A1B2C3D4"

  const serviceClient = await createServiceClient()
  // Expire any existing unused codes for this user
  await serviceClient
    .from('telegram_link_codes')
    .update({ used: true })
    .eq('user_id', user.id)
    .eq('used', false)

  const { data, error } = await serviceClient
    .from('telegram_link_codes')
    .insert({ user_id: user.id, code })
    .select('code, expires_at')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data)
}
