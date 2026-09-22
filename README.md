# dock
# Dock Scheduling System

A berth reservation system built for a WHOI-style marine research facility, replacing a manually-checked spreadsheet with a system that prevents double-bookings automatically.

## Stack

- **Next.js (App Router) + TypeScript** — full-stack framework, server components fetch data directly from the database with no separate API layer needed for reads
- **Tailwind CSS** — styling
- **PostgreSQL (hosted on Supabase)** — relational database
- **Prisma** — ORM and schema migrations
- **Deployed on Vercel**

## Data

Bookings were seeded from 23 years of historical spreadsheet data (1997-2019), parsed from a color-coded Excel grid where each booking's date range was encoded as a run of filled cells rather than merged cells or repeated text. The seed script (`prisma/seed.ts`) reconstructs each booking's date range from cell fill state and infers vessel vs. event bookings from name prefixes (F/V, S/V, M/V, R/V, Tug).

## Features

- View all berths and their current/historical bookings
- Create a new booking, with automatic conflict detection: the system checks for overlapping date ranges on the same berth before allowing a booking to be saved
- Vessel and event bookings are visually distinguished

## Running locally

1. `npm install`
2. Set `DATABASE_URL` in `.env` to a Postgres connection string
3. `npx prisma migrate dev`
4. `npx prisma db seed` (optional, loads historical sample data)
5. `npm run dev`
