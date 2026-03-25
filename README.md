# Civ VI League — Competitive Civilization VI Platform

A full-stack competitive league website for Civilization VI built with
Next.js 14, Prisma ORM, SQLite/PostgreSQL, NextAuth, and Tailwind CSS.

---

## Quick Start (5 minutes)

### Prerequisites
- **Node.js 18+** — https://nodejs.org
- **npm** (comes with Node)

### 1. Clone & Install

```bash
git clone <your-repo-url> civ6-league
cd civ6-league
npm install
```

### 2. Set Up Database

```bash
# Generate Prisma client
npx prisma generate

# Create database + tables
npx prisma db push

# Seed with sample data (16 players, 10 matches, 4 announcements)
node prisma/seed.mjs
```

### 3. Run Development Server

```bash
npm run dev
```

Open **http://localhost:3000** — your league is live!

### One-Line Setup (alternative)

```bash
npm run setup    # install + generate + push + seed
npm run dev
```

---

## Project Structure

```
civ6-league/
├── app/                          # Next.js App Router pages
│   ├── layout.js                 # Root layout (nav, footer, providers)
│   ├── page.js                   # Homepage (server component)
│   ├── globals.css               # Global styles + Tailwind
│   ├── leaderboard/
│   │   ├── page.js               # Server: fetch players
│   │   └── LeaderboardClient.js  # Client: filters, interactive table
│   ├── matches/
│   │   ├── page.js               # Server: fetch matches
│   │   └── MatchesClient.js      # Client: filter tabs, match cards
│   ├── league/
│   │   ├── page.js               # Server: fetch standings
│   │   └── LeagueClient.js       # Client: division browser
│   ├── player/[id]/
│   │   └── page.js               # Dynamic player profile
│   ├── rules/
│   │   ├── page.js               # Server: rules data
│   │   └── RulesClient.js        # Client: accordion
│   ├── join/
│   │   └── page.js               # Registration + Discord OAuth
│   ├── admin/
│   │   └── page.js               # Admin panel (CRUD)
│   └── api/                      # API Routes
│       ├── auth/[...nextauth]/   # NextAuth endpoints
│       ├── players/route.js      # GET list, POST create
│       ├── matches/route.js      # GET list, POST create/submit result
│       ├── seasons/route.js      # GET list, POST create
│       └── standings/route.js    # GET division standings
├── components/
│   ├── Nav.js                    # Navigation bar
│   ├── Footer.js                 # Footer
│   └── AuthProvider.js           # NextAuth session provider
├── lib/
│   ├── db.js                     # Prisma client singleton
│   ├── auth.js                   # NextAuth config
│   ├── elo.js                    # ELO calculation engine
│   └── constants.js              # Divisions, rules, civs
├── prisma/
│   ├── schema.prisma             # Database schema
│   └── seed.mjs                  # Seed script
├── .env                          # Environment variables (local)
├── .env.example                  # Template for env vars
├── package.json
├── tailwind.config.js
├── next.config.js
└── jsconfig.json
```

---

## Core Features

### Pages
| Route | Description |
|---|---|
| `/` | Homepage — hero, active season, top players, recent matches, news |
| `/leaderboard` | Full ranked table with division/season filters |
| `/matches` | Match list with status tabs (All/Completed/Scheduled/Pending) |
| `/league` | Season timeline + division standings browser |
| `/player/[id]` | Player profile — stats, badges, match history with ELO changes |
| `/rules` | Expandable accordion with 8 rule sections |
| `/join` | Registration form + Discord OAuth sign-in |
| `/admin` | Player management, match recording with ELO preview, season CRUD |

### API Routes
| Endpoint | Method | Description |
|---|---|---|
| `/api/players` | GET | List players (filterable by division) |
| `/api/players` | POST | Register new player |
| `/api/matches` | GET | List matches (filterable by status, season) |
| `/api/matches` | POST | Create match OR submit result (auto-calculates ELO) |
| `/api/seasons` | GET | List all seasons |
| `/api/seasons` | POST | Create new season |
| `/api/standings` | GET | Division standings |
| `/api/auth/*` | * | NextAuth (Discord OAuth + credentials) |

### ELO System
- Modified ELO with K-factor 32 (new players < 30 games) / 16 (established)
- Auto-calculates on match result submission
- Updates player division based on new rating
- Tracks win/loss streaks
- Records before/after ELO on each match

---

## Database Models

```
Player:    id, username, email, eloRating, division, wins, losses, draws, streak, favCiv, isAdmin
Match:     id, player1Id, player2Id, result, status, map, player1Civ, player2Civ, replayUrl, seasonId, elo changes
Season:    id, name, startDate, endDate, isActive
Badge:     id, name, icon, playerId
Announcement: id, title, content, isPinned
```

---

## Deployment to Production

### Option A: Vercel + Neon PostgreSQL (Recommended, Free Tier)

#### 1. Set Up PostgreSQL

Sign up at **https://neon.tech** (free tier: 500MB).

Create a database, copy the connection string.

#### 2. Update Prisma Schema

In `prisma/schema.prisma`, change:
```prisma
datasource db {
  provider = "postgresql"       // ← Change from "sqlite"
  url      = env("DATABASE_URL")
}
```

#### 3. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USER/civ6-league.git
git push -u origin main
```

#### 4. Deploy on Vercel

1. Go to **https://vercel.com/new**
2. Import your GitHub repo
3. Add environment variables:
   ```
   DATABASE_URL=postgresql://user:pass@host/db?sslmode=require
   NEXTAUTH_SECRET=<generate: openssl rand -base64 32>
   NEXTAUTH_URL=https://your-app.vercel.app
   ```
4. Click **Deploy**

#### 5. Initialize Production Database

```bash
# From your local machine, with production DATABASE_URL:
DATABASE_URL="your-neon-url" npx prisma db push
DATABASE_URL="your-neon-url" node prisma/seed.mjs
```

Or use Vercel CLI:
```bash
npx vercel env pull .env.production.local
npx prisma db push
node prisma/seed.mjs
```

### Option B: Railway (One-Click)

1. Go to **https://railway.app**
2. New Project → Deploy from GitHub
3. Add a PostgreSQL plugin
4. Set env vars (Railway auto-sets `DATABASE_URL`)
5. Add build command: `npx prisma generate && npx prisma db push && next build`

### Option C: VPS / Self-Hosted

```bash
# On your server (Ubuntu/Debian):
sudo apt update && sudo apt install -y nodejs npm postgresql

# Clone and build
git clone <repo> && cd civ6-league
cp .env.example .env
# Edit .env with your PostgreSQL URL

npm install
npx prisma generate
npx prisma db push
node prisma/seed.mjs
npm run build
npm start         # Runs on port 3000

# Use nginx as reverse proxy + Let's Encrypt for HTTPS
```

---

## Discord OAuth Setup

1. Go to **https://discord.com/developers/applications**
2. Create New Application → name it "Civ VI League"
3. Go to **OAuth2** → copy Client ID and Client Secret
4. Add redirect URL: `https://your-domain.com/api/auth/callback/discord`
5. Add to `.env`:
   ```
   DISCORD_CLIENT_ID=your_client_id
   DISCORD_CLIENT_SECRET=your_client_secret
   ```

Players can now sign in with Discord — accounts auto-create on first login.

---

## Customization

### Change Division Thresholds
Edit `lib/constants.js` → `DIVISIONS` array. Adjust `min`/`max` values.

### Add New Civilizations
Edit `lib/constants.js` → `CIVILIZATIONS` array.

### Modify ELO K-Factor
Edit `lib/elo.js` → change the K-factor logic in `calculateElo()`.

### Change Map Pool
Edit `lib/constants.js` → `MAP_POOL` array.

### Custom Domain
In Vercel: Settings → Domains → Add your domain.
Update `NEXTAUTH_URL` in env vars.

---

## Development Commands

```bash
npm run dev          # Start dev server (http://localhost:3000)
npm run build        # Production build
npm run start        # Start production server
npm run db:generate  # Regenerate Prisma client
npm run db:push      # Push schema changes to database
npm run db:seed      # Run seed script
npm run db:reset     # Wipe DB + re-seed
npm run db:studio    # Open Prisma Studio (visual DB editor)
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS + custom CSS variables |
| Database | SQLite (dev) / PostgreSQL (prod) |
| ORM | Prisma 5 |
| Auth | NextAuth.js (Discord + Credentials) |
| Fonts | Cinzel, Barlow, Barlow Condensed, JetBrains Mono |
| Hosting | Vercel / Railway / any Node host |

---

## License

MIT — use freely for your league.
