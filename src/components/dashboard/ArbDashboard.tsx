'use client'

import SignalsTab from './SignalsTab'

interface ArbDashboardProps {
  isPremium: boolean
}

export default function ArbDashboard({ isPremium }: ArbDashboardProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold">Dashboard</h1>
        <p className="text-[#6b6b80] text-sm mt-0.5">Live whale activity across all Polymarket categories</p>
      </div>
      <SignalsTab isPremium={isPremium} />
    </div>
  )
}
