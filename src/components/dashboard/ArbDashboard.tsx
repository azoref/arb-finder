'use client'

import { useState } from 'react'
import SignalsTab from './SignalsTab'
import FollowingTab from './FollowingTab'
import Link from 'next/link'

type Tab = 'signals' | 'following'

interface ArbDashboardProps {
  isPremium: boolean
  isLoggedIn?: boolean
}

export default function ArbDashboard({ isPremium, isLoggedIn = true }: ArbDashboardProps) {
  const [tab, setTab] = useState<Tab>('signals')

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">Dashboard</h1>
          <p className="text-[#6b6b80] text-sm mt-0.5">Live whale activity across all Polymarket categories</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-[#2a2a32]">
        <button
          onClick={() => setTab('signals')}
          className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
            tab === 'signals'
              ? 'border-green-500 text-green-400'
              : 'border-transparent text-[#6b6b80] hover:text-[#e8e8f0]'
          }`}
        >
          🐋 All Signals
        </button>

        {isLoggedIn && (
          isPremium ? (
            <button
              onClick={() => setTab('following')}
              className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
                tab === 'following'
                  ? 'border-violet-500 text-violet-400'
                  : 'border-transparent text-[#6b6b80] hover:text-[#e8e8f0]'
              }`}
            >
              ★ Following
            </button>
          ) : (
            <Link
              href="/pricing"
              className="px-4 py-2 text-sm font-medium border-b-2 border-transparent text-[#3a3a45] hover:text-[#6b6b80] transition-colors -mb-px flex items-center gap-1.5"
            >
              ★ Following
              <span className="text-[9px] font-mono px-1 py-0.5 rounded bg-violet-500/10 text-violet-400 border border-violet-500/20">PRO</span>
            </Link>
          )
        )}
      </div>

      {tab === 'signals' && <SignalsTab isPremium={isPremium} />}
      {tab === 'following' && isPremium && <FollowingTab />}
    </div>
  )
}
