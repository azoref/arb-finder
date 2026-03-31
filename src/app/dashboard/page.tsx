import { createClient } from '@/lib/supabase/server'
import Nav from '@/components/ui/Nav'
import ArbDashboard from '@/components/dashboard/ArbDashboard'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = user
    ? await supabase.from('users').select('is_premium').eq('id', user.id).single()
    : { data: null }

  const isPremium = profile?.is_premium ?? false

  return (
    <div className="min-h-screen">
      <Nav user={user} isPremium={isPremium} />

      {!user && (
        <div className="sticky top-14 z-40 bg-[#0d0d10]/95 backdrop-blur-sm border-b border-[#2a2a32]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-4">
            <p className="text-sm text-[#9999aa]">
              You&apos;re viewing live whale signals. <span className="text-white font-medium">Sign up free</span> to get Discord alerts, follow wallets, and track your trades.
            </p>
            <div className="flex items-center gap-2 shrink-0">
              <Link href="/auth/signin" className="text-sm text-[#9999aa] hover:text-white transition-colors">
                Sign in
              </Link>
              <Link href="/auth/signup" className="text-sm px-3 py-1.5 rounded bg-green-600 hover:bg-green-500 text-white font-medium transition-colors">
                Sign up free
              </Link>
            </div>
          </div>
        </div>
      )}

      <ArbDashboard isPremium={isPremium} isLoggedIn={!!user} />
    </div>
  )
}
