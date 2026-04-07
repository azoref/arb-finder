import { NextResponse } from 'next/server'
import { inferCategory, CAT_COLORS, CAT_SHORT } from '@/lib/categories'

export const revalidate = 900 // 15 minutes

interface NewsItem {
  title: string
  url: string
  source: string
  publishedAt: string
  category: string
  categoryColor: string
  categoryShort: string
}

const FEEDS = [
  { url: 'https://feeds.reuters.com/reuters/topNews',           source: 'Reuters'    },
  { url: 'https://feeds.bbci.co.uk/news/world/rss.xml',        source: 'BBC'        },
  { url: 'https://www.politico.com/rss/politicopicks.xml',      source: 'Politico'   },
  { url: 'https://www.coindesk.com/arc/outboundfeeds/rss/',     source: 'CoinDesk'  },
  { url: 'https://cointelegraph.com/rss',                       source: 'CoinTelegraph' },
  { url: 'https://www.espn.com/espn/rss/news',                  source: 'ESPN'       },
]

function extractText(xml: string, tag: string): string {
  const cdataMatch = new RegExp(`<${tag}><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>`, 'i').exec(xml)
  if (cdataMatch) return cdataMatch[1].trim()
  const plainMatch = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i').exec(xml)
  return plainMatch ? plainMatch[1].replace(/<[^>]+>/g, '').trim() : ''
}

function parseRSS(xml: string, source: string): NewsItem[] {
  const items: NewsItem[] = []
  const itemRegex = /<item[\s>]([\s\S]*?)<\/item>/g
  let match: RegExpExecArray | null

  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1]
    const title = extractText(block, 'title')
    if (!title || title.length < 10) continue

    // Extract URL — try multiple formats
    let url = ''

    // Standard RSS <link>url</link>
    const rssLink = /<link>([^<\s][^<]*)<\/link>/i.exec(block)
    if (rssLink?.[1]?.startsWith('http')) url = rssLink[1].trim()

    // Atom <link href="url" .../>
    if (!url) {
      const atomHref = /<link[^>]+href=["']([^"']+)["'][^>]*\/?>/i.exec(block)
      if (atomHref?.[1]?.startsWith('http')) url = atomHref[1].trim()
    }

    // Feedburner override
    if (!url) {
      const fb = /<feedburner:origLink>([^<]+)<\/feedburner:origLink>/i.exec(block)
      if (fb?.[1]?.startsWith('http')) url = fb[1].trim()
    }

    // GUID with isPermaLink="true"
    if (!url) {
      const pg = /<guid[^>]*isPermaLink="true"[^>]*>([^<]+)<\/guid>/i.exec(block)
      if (pg?.[1]?.startsWith('http')) url = pg[1].trim()
    }

    // Any GUID that looks like a URL
    if (!url) {
      const ag = /<guid[^>]*>([^<]+)<\/guid>/i.exec(block)
      if (ag?.[1]?.startsWith('http')) url = ag[1].trim()
    }

    if (!url) continue // skip items with no resolvable URL

    const pubDateStr = extractText(block, 'pubDate')
    let publishedAt = new Date().toISOString()
    if (pubDateStr) {
      try { publishedAt = new Date(pubDateStr).toISOString() } catch { /* skip */ }
    }

    const cat = inferCategory(title)
    items.push({
      title,
      url,
      source,
      publishedAt,
      category: cat,
      categoryColor: CAT_COLORS[cat],
      categoryShort: CAT_SHORT[cat],
    })
  }

  return items.slice(0, 12)
}

async function fetchFeed(feedUrl: string, source: string): Promise<NewsItem[]> {
  try {
    const res = await fetch(feedUrl, {
      headers: { 'User-Agent': 'SharpBet/1.0 (prediction market intelligence)' },
      signal: AbortSignal.timeout(6000),
    })
    if (!res.ok) return []
    const xml = await res.text()
    return parseRSS(xml, source)
  } catch {
    return []
  }
}

export async function GET() {
  try {
    const results = await Promise.allSettled(
      FEEDS.map(f => fetchFeed(f.url, f.source))
    )

    const allItems: NewsItem[] = []
    for (const r of results) {
      if (r.status === 'fulfilled') allItems.push(...r.value)
    }

    // Sort by publishedAt desc, dedupe by title similarity
    allItems.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())

    // Simple dedup: skip if first 60 chars of title matches a previous item
    const seen = new Set<string>()
    const deduped = allItems.filter(item => {
      const key = item.title.slice(0, 60).toLowerCase()
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })

    return NextResponse.json({
      items: deduped.slice(0, 40),
      fetchedAt: new Date().toISOString(),
    })
  } catch (err: any) {
    return NextResponse.json({ items: [], error: err.message }, { status: 500 })
  }
}
