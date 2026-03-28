import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export const revalidate = 30

export async function GET() {
  try {
    const supabase = await createServiceClient()
    const since = new Date()
    since.setHours(0, 0, 0, 0)

    const [todayResult, todayMarginResult, allTimeResult] = await Promise.all([
      supabase
        .from('arbs')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', since.toISOString()),
      supabase
        .from('arbs')
        .select('profit_margin, book_a, book_b')
        .gte('created_at', since.toISOString()),
      supabase
        .from('arbs')
        .select('profit_margin'),
    ])

    const todayArbs = todayMarginResult.data ?? []
    const avgMargin = todayArbs.length > 0
      ? todayArbs.reduce((sum, a) => sum + a.profit_margin, 0) / todayArbs.length
      : 0

    const books = new Set(todayArbs.flatMap(a => [a.book_a, a.book_b]))

    // Hypothetical profit: $1,000 bankroll on every arb ever found
    const allArbs = allTimeResult.data ?? []
    const totalProfit = allArbs.reduce((sum, a) => sum + (1000 * a.profit_margin / 100), 0)

    return NextResponse.json({
      today: todayResult.count ?? 0,
      avgMargin: parseFloat(avgMargin.toFixed(2)),
      booksMonitored: Math.max(books.size, 12),
      allTime: allArbs.length,
      totalProfit: parseFloat(totalProfit.toFixed(2)),
    })
  } catch {
    return NextResponse.json({ today: 0, avgMargin: 0, booksMonitored: 12, allTime: 0 })
  }
}
