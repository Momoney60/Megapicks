# megapicks

## Setup

1. Copy `.env.example` to `.env.local` and fill in:

```
NEXT_PUBLIC_SUPABASE_URL=your-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

2. Run locally:

```
npm i
npm run dev
```

## Data fetching
- `GET /api/games` fetches live NFL games from ESPN with `cache: no-store`.
- `POST /api/games/upsert` fetches and upserts to the `games` table in Supabase.

## Vercel cron
`vercel.json` schedules `POST /api/games/upsert` every 5 minutes. Adjust as needed.