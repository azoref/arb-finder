'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function SignUpPage() {
  const router = useRouter()
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }
    setDone(true)
  }

  async function handleGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="text-4xl mb-4">✉️</div>
          <h1 className="text-xl font-semibold mb-2">Check your email</h1>
          <p className="text-[#6b6b80] text-sm">
            We sent a confirmation link to <span className="text-[#e8e8f0]">{email}</span>.
            Click it to activate your account.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <span className="text-green-500 font-mono font-bold text-xl">SHARP</span>
            <span className="text-[#e8e8f0] font-semibold text-xl">Bet</span>
          </Link>
          <h1 className="text-2xl font-semibold">Create account</h1>
          <p className="text-[#6b6b80] text-sm mt-1">Free tier · no credit card required</p>
        </div>

        <div className="bg-[#111114] border border-[#2a2a32] rounded-lg p-6 space-y-4">
          <button
            onClick={handleGoogle}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-[#2a2a32] rounded-md text-sm font-medium hover:bg-[#1a1a1f] transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#2a2a32]" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-[#111114] text-[#6b6b80]">or</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs text-[#9999aa] mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 bg-[#1a1a1f] border border-[#2a2a32] rounded-md text-sm focus:outline-none focus:border-green-600 transition-colors"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-xs text-[#9999aa] mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-3 py-2 bg-[#1a1a1f] border border-[#2a2a32] rounded-md text-sm focus:outline-none focus:border-green-600 transition-colors"
                placeholder="At least 6 characters"
              />
            </div>

            {error && <p className="text-red-400 text-xs">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-green-600 hover:bg-green-500 disabled:opacity-50 rounded-md text-sm font-medium transition-colors"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-[#6b6b80] mt-4">
          Already have an account?{' '}
          <Link href="/auth/signin" className="text-green-400 hover:text-green-300 transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
