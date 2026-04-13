import Link from 'next/link'
import Nav from '@/components/ui/Nav'
import DemoDashboard from '@/components/dashboard/DemoDashboard'

export default function DemoPage() {
  return (
    <div className="min-h-screen">
      <Nav user={null} isPremium={false} />

      {/* Demo banner */}
      <div className="bg-green-600/10 border-b border-green-500/20 px-4 py-2.5 flex items-center justify-center gap-4">
        <div className="flex items-center gap-2 text-sm text-green-400">
          <span className="font-mono font-semibold">DEMO MODE</span>
          <span className="text-green-400/50">·</span>
          <span className="text-[#9999aa]">You&apos;re viewing sample data. Sign up to see live whale signals across all Polymarket categories.</span>
        </div>
        <Link
          href="/auth/signup"
          className="shrink-0 px-3 py-1 rounded bg-green-600 hover:bg-green-500 text-white text-xs font-semibold transition-colors"
        >
          Get started free →
        </Link>
      </div>

      <DemoDashboard />
    </div>
  )
}
