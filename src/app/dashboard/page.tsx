import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Nav from '@/components/ui/Nav'
import ArbDashboard from '@/components/dashboard/ArbDashboard'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/signin?redirectTo=/dashboard')

  const { data: profile } = await supabase
    .from('users')
    .select('is_premium')
    .eq('id', user.id)
    .single()

  const isPremium = profile?.is_premium ?? false

  return (
    <div className="min-h-screen">
      <Nav user={user} isPremium={isPremium} />
      <ArbDashboard isPremium={isPremium} />
    </div>
  )
}
