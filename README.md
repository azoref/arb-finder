# ArbFinder

Real-time Polymarket whale tracker. Win rate leaderboards, live $10K+ trade signals, wallet profiles, and follow alerts for the wallets that never lose.

## Stack

- **Frontend/API**: Next.js 14 App Router + Tailwind CSS → Vercel
- **Worker**: Standalone Node.js process → Railway/Render
- **Database**: Supabase (Postgres + Auth + RLS)
- **Payments**: Stripe Checkout + Customer Portal
- **Odds**: The-Odds-API (`/v4/sports/{sport}/odds`)
- **Alerts**: Telegram via node-telegram-bot-api

## Setup

### 1. Install dependencies

```bash
npm install          # Next.js app
cd worker && npm install
```

### 2. Environment variables

Copy `.env.local.example` to `.env.local` and fill in all values:

```
ODDS_API_KEY=           # the-odds-api.com
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_ID=
TELEGRAM_BOT_TOKEN=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Supabase database

Run the migration in Supabase SQL Editor:

```bash
# Paste contents of supabase/migrations/001_initial_schema.sql
# into Supabase Dashboard → SQL Editor → Run
```

In Supabase Auth settings, enable:
- Email/password auth
- Google OAuth (add your Google OAuth credentials)
- Set Site URL to your domain
- Add `http://localhost:3000/auth/callback` to Redirect URLs

### 4. Stripe setup

1. Create a Product "Premium" with a monthly recurring price
2. Copy the Price ID to `STRIPE_PRICE_ID`
3. For local dev, use Stripe CLI to forward webhooks:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```
4. Set up Billing Portal at stripe.com/dashboard → Customer portal

### 5. Telegram Bot

1. Message @BotFather on Telegram → `/newbot`
2. Copy the token to `TELEGRAM_BOT_TOKEN`
3. Update the bot username in `worker/telegram.js` (search for `@ArbFinderBot`)

### 6. Run locally

```bash
# Terminal 1: Next.js dev server
npm run dev

# Terminal 2: Odds polling worker
cd worker && node index.js
```

## Deployment

### Vercel (frontend + API)

```bash
vercel deploy
```

Set all env vars in Vercel dashboard. Add your Vercel domain to Supabase Auth redirect URLs.

### Railway/Render (worker)

1. Create a new service pointing to the `worker/` directory
2. Set start command: `node index.js`
3. Add all env vars
4. Worker runs continuously — no serverless cold starts

### Poll interval

Default: 60s. The-Odds-API free tier = 500 requests/month.

| Interval | Requests/month |
|----------|---------------|
| 60s | ~43,800 ⚠️ (upgrade API) |
| 5min | ~8,760 ⚠️ (upgrade API) |
| 30min | ~1,460 ✓ (free tier ok) |

Set `POLL_INTERVAL_MS=300000` for 5-minute polling on free API tier.

## Architecture

```
The-Odds-API
     │ poll every N seconds
     ▼
worker/index.js ──► arb detection ──► Supabase (arbs table)
     │                                      │
     └──► Telegram alerts (premium users)   │
                                            ▼
                                    Next.js dashboard
                                    (polls Supabase every 30s)
```

## Adding a new sport

In `worker/odds.js`, add to the `SPORTS` array:
```js
const SPORTS = [
  'basketball_nba',
  'americanfootball_nfl',  // add here
]
```

In `src/lib/config.ts`, add to `SPORTS_CONFIG`.

That's it — no other changes needed.
