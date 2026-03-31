'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'

interface NavProps {
  user: User | null
  isPremium?: boolean
}

export default function Nav({ user, isPremium }: NavProps) {
  const router = useRouter()
  const supabase = createClient()

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <nav className="border-b border-[#2a2a32] bg-[#0a0a0b]/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-green-500 font-mono font-bold text-lg">SHARP</span>
              <span className="text-[#e8e8f0] font-semibold">Bet</span>
            </Link>
            <div className="hidden sm:flex items-center gap-6">
              {user && (
                <Link href="/dashboard" className="text-sm text-[#9999aa] hover:text-[#e8e8f0] transition-colors">
                  Dashboard
                </Link>
              )}
              <Link href="/leaderboard" className="text-sm text-[#9999aa] hover:text-[#e8e8f0] transition-colors">
                Leaderboard
              </Link>
              <Link href="/movers" className="text-sm text-[#9999aa] hover:text-[#e8e8f0] transition-colors">
                Movers
              </Link>
              {user && (
                <Link href="/tracker" className="text-sm text-[#9999aa] hover:text-[#e8e8f0] transition-colors">
                  Journal
                </Link>
              )}
              <Link href="/pricing" className="text-sm text-[#9999aa] hover:text-[#e8e8f0] transition-colors">
                Pricing
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                {isPremium && (
                  <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono font-medium bg-green-500/10 text-green-400 border border-green-500/20">
                    PRO
                  </span>
                )}
                <Link
                  href="/settings"
                  className="text-sm text-[#9999aa] hover:text-[#e8e8f0] transition-colors"
                >
                  Settings
                </Link>
                <button
                  onClick={signOut}
                  className="text-sm text-[#9999aa] hover:text-[#e8e8f0] transition-colors"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/signin"
                  className="text-sm text-[#9999aa] hover:text-[#e8e8f0] transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  href="/auth/signup"
                  className="text-sm px-3 py-1.5 rounded bg-green-600 hover:bg-green-500 text-white font-medium transition-colors"
                >
                  Get started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
