# retr0 Anime Poll

Anime polling website with an edgy black + neon purple/green identity inspired by your logo.

## Current MVP

- Homepage with logo-driven hero and featured poll spotlight.
- Poll listing page with anime category filters.
- Poll detail page with voting and charted results.
- Email/password login with Supabase Auth.
- Voting allowed only for signed-in users (one vote per poll per identity).
- Supabase-ready backend with local fallback for read-only poll browsing when env vars are missing.

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
- `supabase/seed.sql`

If env values are missing, the app still loads poll browsing data locally, but voting and email/password login require Supabase configuration.

### Enable Email/Password Login

1. In Supabase Dashboard, open Authentication > Providers > Email.
2. Ensure Email provider is enabled.
3. Choose whether to require email confirmations.
4. Keep `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in your `.env` file.

Once configured, users can create an account and sign in with email and password from the auth panel.

## Branding

- Site logo source: `retr0.svg`
- Served logo path in app: `public/retr0.svg`
