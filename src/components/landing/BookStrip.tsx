import Image from 'next/image'
import Link from 'next/link'

const BOOKS = [
  { name: 'DraftKings',  domain: 'draftkings.com',     color: '#53d337' },
  { name: 'FanDuel',     domain: 'fanduel.com',        color: '#1493ff' },
  { name: 'BetMGM',      domain: 'betmgm.com',         color: '#c8a96e' },
  { name: 'Caesars',     domain: 'sportsbook.caesars.com', color: '#b8973a' },
  { name: 'Fanatics',    domain: 'sportsbook.fanatics.com', color: '#e8222a' },
  { name: 'WynnBET',     domain: 'wynnbet.com',        color: '#c9a84c' },
  { name: 'ESPN BET',    domain: 'espnbet.com',        color: '#e8222a' },
  { name: 'BetOnline',   domain: 'betonline.ag',       color: '#00c46e' },
  { name: 'Bovada',      domain: 'bovada.lv',          color: '#f5a623' },
  { name: 'MyBookie',    domain: 'mybookie.ag',        color: '#7b68ee' },
  { name: 'BetRivers',   domain: 'betrivers.com',      color: '#00b4d8' },
  { name: 'Hard Rock',   domain: 'hardrock.bet',       color: '#e8222a' },
]

export default function BookStrip() {
  return (
    <section className="border-t border-[#2a2a32] bg-[#080808]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <p className="text-center text-xs text-[#4a4a55] uppercase tracking-widest font-mono mb-12">
          Sportsbooks we monitor · 24 / 7
        </p>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
          {BOOKS.map(book => (
            <Link
              key={book.name}
              href={`https://${book.domain}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-3 p-4 rounded-xl border border-[#1a1a1f] bg-[#0d0d10] hover:border-[#2a2a32] transition-all hover:scale-105 group"
              style={{ boxShadow: `inset 0 0 20px ${book.color}08` }}
            >
              {/* Logo */}
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center bg-[#111114]"
                style={{ boxShadow: `0 0 16px ${book.color}30` }}
              >
                <Image
                  src={`https://www.google.com/s2/favicons?domain=${book.domain}&sz=64`}
                  alt={book.name}
                  width={32}
                  height={32}
                  className="w-8 h-8 object-contain"
                  unoptimized
                />
              </div>
              {/* Name */}
              <span
                className="text-xs font-medium text-center leading-tight text-[#6b6b80] group-hover:text-[#9999aa] transition-colors"
              >
                {book.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
