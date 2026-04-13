import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Nav from '@/components/ui/Nav'
import SettingsClient from '@/components/dashboard/SettingsClient'

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/signin?redirectTo=/settings')

  const [{ data: profile }, { data: prefs }] = await Promise.all([
    supabase.from('users').select('*').eq('id', user.id).single(),
    supabase.from('alert_preferences').select('*').eq('user_id', user.id).single(),
  ])

  return (
    <div className="min-h-screen">
      <Nav user={user} isPremium={profile?.is_premium} />
      <SettingsClient profile={profile} prefs={prefs} />
    </div>
  )
}
