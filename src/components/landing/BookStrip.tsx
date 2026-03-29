import Image from 'next/image'

const BOOKS = [
  { name: 'DraftKings',  domain: 'draftkings.com',  color: '#53d337' },
  { name: 'FanDuel',     domain: 'fanduel.com',     color: '#1493ff' },
  { name: 'BetMGM',      domain: 'betmgm.com',      color: '#c8a96e' },
  { name: 'Caesars',     domain: 'caesars.com',      color: '#b8973a' },
  { name: 'PointsBet',   domain: 'pointsbet.com',   color: '#ff3b3b' },
  { name: 'WynnBET',     domain: 'wynnbet.com',     color: '#c9a84c' },
  { name: 'Barstool',    domain: 'barstoolsports.com', color: '#e8e8f0' },
  { name: 'BetOnline',   domain: 'betonline.ag',    color: '#00c46e' },
  { name: 'Bovada',      domain: 'bovada.lv',       color: '#f5a623' },
  { name: 'MyBookie',    domain: 'mybookie.ag',     color: '#7b68ee' },
  { name: 'BetRivers',   domain: 'betrivers.com',   color: '#00b4d8' },
  { name: 'Hard Rock',   domain: 'hardrock.bet',    color: '#e8222a' },
]

export default function BookStrip() {
  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14 border-t border-[#2a2a32]">
      <p className="text-center text-xs text-[#4a4a55] uppercase tracking-widest font-mono mb-10">
        Books we watch · 24 / 7
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        {BOOKS.map(book => (
          <div
            key={book.name}
            className="flex items-center gap-2.5 px-3.5 py-2 rounded-lg border border-[#1e1e24] bg-[#0d0d10] hover:border-[#2a2a32] transition-all hover:scale-105 group"
          >
            <div
              className="w-6 h-6 rounded-md overflow-hidden flex items-center justify-center shrink-0 bg-[#1a1a1f]"
              style={{ boxShadow: `0 0 8px ${book.color}22` }}
            >
              <Image
                src={`https://www.google.com/s2/favicons?domain=${book.domain}&sz=64`}
                alt={book.name}
                width={20}
                height={20}
                className="w-5 h-5 object-contain"
                unoptimized
              />
            </div>
            <span className="text-sm font-medium text-[#6b6b80] group-hover:text-[#9999aa] transition-colors">
              {book.name}
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}
