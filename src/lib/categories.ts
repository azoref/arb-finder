export type Category = 'Politics' | 'Crypto' | 'Sports' | 'Other'

export const CAT_SHORT: Record<Category, string> = {
  Politics: 'POL',
  Crypto:   'CRY',
  Sports:   'SPT',
  Other:    'OTH',
}

export const CAT_COLORS: Record<Category, string> = {
  Politics: '#f59e0b',
  Crypto:   '#06b6d4',
  Sports:   '#22c55e',
  Other:    '#666666',
}

const POLITICS_KW = [
  // US government & elections
  'election','vote','voted','voting','ballot','poll','primary','runoff','inaugur',
  'president','presidential','vice president','vp','candidate','campaign',
  'senate','senator','congress','congressman','congresswoman','house rep','representative',
  'governor','mayor','cabinet','secretary of','speaker','majority leader',
  'republican','democrat','gop','liberal','conservative','partisan','bipartisan',
  'trump','biden','harris','desantis','obama','clinton','pence','pelosi','mcconnell',
  'supreme court','scotus','justice','roe','ruling','verdict','court case',
  'impeach','resign','resign','pardon','executive order','veto','filibuster',
  'approval rating','popularity','favorability',
  // Policy & legislation
  'tariff','trade war','trade deal','sanction','embargo','legislation','bill','law','act ',
  'budget','debt ceiling','deficit','spending','stimulus','tax cut','tax hike',
  'immigration','border','asylum','deportation','visa',
  'nato','g7','g20','un','united nations','world bank','imf','wto',
  // Geopolitics & war
  'war','military','troops','invasion','attack','ceasefire','peace deal','treaty',
  'russia','ukraine','china','taiwan','iran','israel','gaza','hamas','hezbollah',
  'north korea','south korea','pakistan','india','afghanistan','iraq','syria','venezuela',
  'nuclear','missile','drone','airstrike','sanction','diplomat','ambassador','coup',
  'prime minister','chancellor','parliament','monarchy','king','queen','emperor',
  // Economics / macro (geopolitical angle)
  'fed','federal reserve','interest rate','rate cut','rate hike','inflation','cpi','gdp',
  'recession','unemployment','jobs report','fomc','powell','treasury','yellen',
  'oil price','opec','gas price','energy crisis',
]

const CRYPTO_KW = [
  // Coins & tokens
  'bitcoin','btc','ethereum','eth','solana','sol','dogecoin','doge','shiba','shib',
  'ripple','xrp','cardano','ada','polkadot','dot','avalanche','avax','chainlink','link',
  'uniswap','uni','aave','compound','maker','mkr','curve','crv','matic','polygon',
  'arbitrum','optimism','base','sui','aptos','near','cosmos','atom','algo','algorand',
  'litecoin','ltc','bch','bitcoin cash','monero','xmr','zcash','filecoin','fil',
  'pepe','floki','bonk','wif','memecoin','meme coin',
  // Exchanges & companies
  'coinbase','binance','kraken','ftx','bybit','okx','gemini','robinhood crypto',
  'blackrock bitcoin','grayscale','microstrategy','saylor',
  // Concepts
  'crypto','blockchain','defi','nft','web3','dao','protocol','layer 2','l2','l1',
  'stablecoin','usdc','usdt','tether','wrapped','bridge','airdrop','token','wallet',
  'halving','etf bitcoin','spot etf','crypto etf','sec crypto','crypto regulation',
  'hash rate','mining','validator','staking','yield','liquidity','tvl',
]

const SPORTS_KW = [
  // US leagues
  'nba','nfl','nhl','mlb','mls','wnba','ncaa','nascar','pga',
  // International
  'premier league','la liga','serie a','bundesliga','ligue 1','champions league',
  'europa league','fa cup','world cup','euros','euro 2024','copa america',
  'formula 1','f1','moto gp','indycar',
  'wimbledon','us open','french open','australian open','atp','wta','grand slam',
  'ufc','mma','boxing','wbc','wba','ibf',
  'olympic','olympics','paralympic',
  // Generic sports terms
  'basketball','football','soccer','baseball','hockey','tennis','golf','cricket',
  'rugby','volleyball','swimming','athletics','marathon','cycling','skiing',
  'super bowl','world series','stanley cup','nba finals','nba championship',
  'march madness','final four','bowl game','playoff','playoffs','championship',
  'mvp','rookie','draft pick','transfer','signing','trade deadline',
  'coach','manager','head coach','fired','hired coach',
  // Team names (partial — common ones)
  'lakers','celtics','warriors','bulls','heat','knicks','nets','spurs',
  'patriots','chiefs','eagles','cowboys','packers','niners','ravens','bills',
  'yankees','dodgers','red sox','cubs','braves','astros','mets',
  'manchester','arsenal','chelsea','liverpool','barcelona','real madrid','juventus','psg',
  'lebron','curry','durant','mahomes','brady','messi','ronaldo','neymar',
]

export function inferCategory(title: string): Category {
  const t = (title || '').toLowerCase()

  // Check crypto first (avoids "bitcoin etf" matching fed/economics)
  if (CRYPTO_KW.some(kw => t.includes(kw))) return 'Crypto'
  if (SPORTS_KW.some(kw => t.includes(kw))) return 'Sports'
  if (POLITICS_KW.some(kw => t.includes(kw))) return 'Politics'
  return 'Other'
}

export function inferCategoryWithMeta(title: string) {
  const cat = inferCategory(title)
  return { cat, short: CAT_SHORT[cat], color: CAT_COLORS[cat] }
}
