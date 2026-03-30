import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export const revalidate = 30

export async function GET() {
  try {
    const supabase = await createServiceClient()
    const since = new Date()
    since.setHours(0, 0, 0, 0)

    const [todayResult, allTimeResult, whaleCountResult, whaleVolumeResult] = await Promise.all([
      supabase
        .from('arbs')
        .select('profit_margin, book_a, book_b')
        .gte('created_at', since.toISOString()),
      supabase
        .from('arbs')
        .select('profit_margin'),
      supabase
        .from('whale_signals')
        .select('*', { count: 'exact', head: true }),
      supabase
        .from('whale_signals')
        .select('usd_size'),
    ])

    const todayArbs = todayResult.data ?? []
    const allArbs = allTimeResult.data ?? []

    const allTimeAvgMargin = allArbs.length > 0
      ? allArbs.reduce((sum, a) => sum + a.profit_margin, 0) / allArbs.length
      : 0

    const totalProfit = allArbs.reduce((sum, a) => sum + (1000 * a.profit_margin / 100), 0)
    const books = new Set(todayArbs.flatMap(a => [a.book_a, a.book_b]))

    const whaleSignalCount = whaleCountResult.count ?? 0
    const whaleVolume = (whaleVolumeResult.data ?? [])
      .reduce((sum, row) => sum + (row.usd_size ?? 0), 0)

    return NextResponse.json({
      today: todayArbs.length,
      avgMargin: parseFloat(allTimeAvgMargin.toFixed(2)),
      booksMonitored: Math.max(books.size, 12),
      allTime: allArbs.length,
      totalProfit: parseFloat(totalProfit.toFixed(2)),
      whaleSignalCount,
      whaleVolume: parseFloat(whaleVolume.toFixed(0)),
    })
  } catch {
    return NextResponse.json({ today: 0, avgMargin: 0, booksMonitored: 12, allTime: 0 })
  }
}
