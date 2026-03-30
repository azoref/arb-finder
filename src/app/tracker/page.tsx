import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Nav from '@/components/ui/Nav'
import BetTracker from '@/components/tracker/BetTracker'

export const dynamic = 'force-dynamic'

export default async function TrackerPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/signin')

  const { data: profile } = await supabase
    .from('users')
    .select('is_premium')
    .eq('id', user.id)
    .single()

  return (
    <div className="min-h-screen">
      <Nav user={user} isPremium={profile?.is_premium ?? false} />
      <BetTracker />
    </div>
  )
}
