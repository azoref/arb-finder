import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export const revalidate = 30

export async function GET() {
  try {
    const supabase = await createServiceClient()
    const since = new Date()
    since.setHours(0, 0, 0, 0)

    const [whaleCountResult, whaleVolumeResult, whaleWalletsResult, whaleMarketsResult] = await Promise.all([
      supabase
        .from('whale_signals')
        .select('*', { count: 'exact', head: true })
        .gte('usd_size', 10000),
      supabase
        .from('whale_signals')
        .select('usd_size')
        .gte('usd_size', 10000),
      supabase
        .from('whale_signals')
        .select('wallet')
        .gte('usd_size', 10000),
      supabase
        .from('whale_signals')
        .select('slug')
        .gte('usd_size', 10000),
    ])

    const whaleSignalCount = whaleCountResult.count ?? 0
    const whaleVolume = (whaleVolumeResult.data ?? [])
      .reduce((sum, row) => sum + (row.usd_size ?? 0), 0)
    const walletsTracked = new Set((whaleWalletsResult.data ?? []).map(r => r.wallet)).size
    const marketsMonitored = new Set((whaleMarketsResult.data ?? []).map(r => r.slug)).size

    return NextResponse.json({
      today: 0,
      avgMargin: 0,
      booksMonitored: 12,
      allTime: 0,
      totalProfit: 0,
      whaleSignalCount,
      whaleVolume: parseFloat(whaleVolume.toFixed(0)),
      walletsTracked,
      marketsMonitored,
    })
  } catch {
    return NextResponse.json({ today: 0, avgMargin: 0, booksMonitored: 12, allTime: 0 })
  }
}
