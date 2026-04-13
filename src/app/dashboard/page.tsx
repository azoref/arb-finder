import { createClient } from '@/lib/supabase/server'
import Nav from '@/components/ui/Nav'
import TerminalDashboard from '@/components/terminal/TerminalDashboard'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = user
    ? await supabase.from('users').select('is_premium').eq('id', user.id).single()
    : { data: null }

  const isPremium = profile?.is_premium ?? false

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Nav user={user} isPremium={isPremium} />
      <TerminalDashboard isPremium={isPremium} isLoggedIn={!!user} />
    </div>
  )
}
