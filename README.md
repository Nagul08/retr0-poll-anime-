# retr0 Anime Poll

Anime polling website with an edgy black + neon purple/green identity inspired by your logo.

## Current MVP

- Homepage with logo-driven hero and featured poll spotlight.
- Poll listing page with anime category filters.
- Poll detail page with voting and charted results.
- Guest voting by default (one vote per poll per browser identity).
- Optional username/password account mode (no email) for identity-based voting.
- Supabase-ready backend hooks with local fallback when env vars are missing.

## Tech Stack

- React + Vite
- React Router
- Recharts
- Supabase JS client

## Run Locally

1. Install dependencies:

```bash
npm install
```

2. Start the app:

```bash
npm run dev
```

3. Validate lint/build:

```bash
npm run lint
npm run build
```

## Supabase Setup

1. Copy `.env.example` to `.env` and set:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

2. Run SQL files in your Supabase project SQL editor in this order:

- `supabase/schema.sql`
- `supabase/policies.sql`

If env values are missing, the app uses local browser storage so you can still test full UI flow.
