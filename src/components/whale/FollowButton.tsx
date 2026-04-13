'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Props {
  wallet: string
  isPremium: boolean
  isLoggedIn: boolean
}

export default function FollowButton({ wallet, isPremium, isLoggedIn }: Props) {
  const [following, setFollowing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [working, setWorking] = useState(false)

  useEffect(() => {
    if (!isLoggedIn || !isPremium) { setLoading(false); return }
    fetch(`/api/follow?wallet=${wallet}`)
      .then(r => r.json())
      .then(d => setFollowing(d.following ?? false))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [wallet, isLoggedIn, isPremium])

  async function toggle() {
    setWorking(true)
    try {
      const res = await fetch('/api/follow', {
        method: following ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet }),
      })
      if (res.ok) setFollowing(f => !f)
    } catch {}
    setWorking(false)
  }

  if (!isLoggedIn) {
    return (
      <Link
        href="/auth/signin"
        className="shrink-0 px-4 py-2 rounded-lg border border-violet-500/30 bg-violet-500/10 text-violet-400 text-sm font-semibold hover:bg-violet-500/20 transition-colors"
      >
        Follow wallet
      </Link>
    )
  }

  if (!isPremium) {
    return (
      <Link
        href="/pricing"
        className="shrink-0 px-4 py-2 rounded-lg border border-violet-500/30 bg-violet-500/10 text-violet-400 text-sm font-semibold hover:bg-violet-500/20 transition-colors"
      >
        Follow wallet (Pro)
      </Link>
    )
  }

  if (loading) {
    return (
      <div className="shrink-0 px-4 py-2 rounded-lg bg-[#1a1a1f] text-[#4a4a55] text-sm font-semibold">
        ...
      </div>
    )
  }

  return (
    <button
      onClick={toggle}
      disabled={working}
      className={`shrink-0 px-4 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 ${
        following
          ? 'bg-violet-600/20 border border-violet-500/40 text-violet-400 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30'
          : 'bg-violet-600 hover:bg-violet-500 text-white'
      }`}
    >
      {working ? '...' : following ? 'Following' : 'Follow wallet'}
    </button>
  )
}
