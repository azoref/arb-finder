import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PUT(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { webhook_url } = await req.json()

    // Basic Discord webhook URL validation
    if (webhook_url && !webhook_url.startsWith('https://discord.com/api/webhooks/')) {
      return NextResponse.json({ error: 'Invalid Discord webhook URL' }, { status: 400 })
    }

    await supabase
      .from('users')
      .update({ discord_webhook_url: webhook_url || null })
      .eq('id', user.id)

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await supabase
      .from('users')
      .update({ discord_webhook_url: null })
      .eq('id', user.id)

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
