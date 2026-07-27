# The Knight Ryders — Website

Next.js + Supabase rebuild of theknightryders.com, replacing the WordPress site.

## Stack
- **Next.js 16** (App Router, TypeScript)
- **Supabase** — Postgres database + auth (email/password) + file storage
- **Vercel** — hosting / deployment

## Getting started

```bash
npm install
cp .env.local.example .env.local   # then fill in your Supabase project keys
npm run dev
```

Visit http://localhost:3000

## Supabase setup

1. Create a free project at https://supabase.com
2. Go to **Project Settings -> API** and copy:
   - `Project URL` -> `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key -> `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Paste both into `.env.local`
4. In **Authentication -> Providers**, email/password is enabled by default — that's all that's needed for `/login` and `/signup` to work.

## What's implemented so far

- `/` — homepage (hero, milestone section, ride/awards/photo galleries)
- `/login`, `/signup` — Supabase email/password auth
- `/members` — protected route, redirects to `/login` if not signed in
- `proxy.ts` — refreshes the Supabase session cookie on every request

## What's next

- Migrate WordPress users into Supabase's `auth.users` table (via CSV import or a one-off script — ask Claude once you've exported your WordPress user list)
- Build out `/rides/past`, `/rides/upcoming`, `/blog`, `/csr`, `/newsletter`, `/safety`, `/media`, `/user-photos`, `/riders`, `/about` pages
- Move images off WordPress hotlinking into Supabase Storage
- Add a `members` table (profile fields beyond what Supabase Auth stores by default: join date, bike details, ride count, etc.)

## Deploying

1. Push this repo to GitHub
2. Import the repo in Vercel (vercel.com/new)
3. Add the same two environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) in the Vercel project settings
4. Deploy — Vercel auto-builds on every push to `main`
