# Deployment Stability

This app runs on Next.js App Router, Prisma 6.19.3, Neon PostgreSQL, and Vercel.

## DB-backed pages

These pages query Prisma during server render and must stay dynamic:

- `/`
- `/leaderboard`
- `/league`
- `/matches`
- `/stats`
- `/rules`
- `/tierlist`
- `/blog`
- `/blog/[id]`
- `/player/[id]`

Do not remove `export const dynamic = "force-dynamic"` from those pages unless the route no longer reads live database data during render.

## DB-backed API routes

- `/api/admin`
- `/api/announcements`
- `/api/blog`
- `/api/matches`
- `/api/players`
- `/api/rules`
- `/api/seasons`
- `/api/standings`
- `/api/sync`
- `/api/tierlists`

## Required Vercel environment variables

- `DATABASE_URL`: Neon PostgreSQL connection string. Use the pooled endpoint for app runtime.
- `NEXTAUTH_SECRET`: stable production secret.
- `NEXTAUTH_URL`: deployed site URL.

## Optional environment variables

- `DISCORD_CLIENT_ID` and `DISCORD_CLIENT_SECRET`: required for Discord sign-in.
- `BOT_SYNC_SECRET`: required for Discord bot sync endpoints.
- `BLOG_PASSWORD`: required for blog/rules editor endpoints.

## Dangerous Commands

These commands mutate the database and should not be run against production unless intentional:

- `npm run db:push`
- `npm run db:seed`
- `npm run db:reset`
- `npm run setup`
- `node prisma/seed.mjs`
- `node seed-rules.mjs`
