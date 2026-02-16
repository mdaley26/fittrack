# FitTrack – Fitness Tracker Website

A web app for tracking workouts, logging exercises, and viewing progress over time. Built with **Next.js 14**, **Prisma**, **Tailwind CSS**, and **Chart.js**.

## Features

- **User accounts** – Register and log in (email/password, JWT in httpOnly cookie)
- **Workout logging** – Create workouts with date/time, add exercises with sets, reps, weight, duration, and notes
- **Exercise library** – Browse exercises by name, muscle group, and equipment; add custom exercises
- **Progress tracking** – Per-exercise charts (weight over time) on workout detail pages
- **Dashboard** – Stats (workouts this week, total) and recent workouts
- **Profile** – Update name, age, weight, height

## Tech Stack

- **Frontend:** Next.js 14 (App Router), React, Tailwind CSS, Chart.js (react-chartjs-2)
- **Backend:** Next.js API routes, Prisma ORM
- **Database:** SQLite (default for dev); schema is compatible with PostgreSQL (change `provider` and `url` in `prisma/schema.prisma`)
- **Auth:** JWT stored in httpOnly cookie, bcrypt for password hashing

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Setup

1. **Clone and install**

   ```bash
   cd Building
   npm install
   ```

2. **Environment**

   Copy `.env.example` to `.env` (or use the existing `.env` for local dev). Ensure:

   - `DATABASE_URL="file:./dev.db"` for SQLite (default)
   - `JWT_SECRET` set to a long random string in production

3. **Database**

   ```bash
   npx prisma generate
   npx prisma db push
   npm run db:seed
   ```

4. **Run**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000). Sign up, then log workouts and explore the exercise library.

### Scripts

- `npm run dev` – Start dev server
- `npm run build` / `npm start` – Production build and start
- `npm run db:generate` – Generate Prisma client
- `npm run db:push` – Push schema to DB (no migrations with SQLite)
- `npm run db:seed` – Seed exercise database
- `npm run db:studio` – Open Prisma Studio

## Project Structure

- `app/` – Next.js App Router pages and API routes
- `components/` – React components (Nav, WorkoutForm, ProgressChart, etc.)
- `lib/` – DB client, auth helpers, validation schemas
- `prisma/` – Schema and seed

## Database (PostgreSQL for production)

To use PostgreSQL, update `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

Set `DATABASE_URL` to your Postgres connection string, then:

```bash
npx prisma migrate dev --name init
npm run db:seed
```

## Security

- Passwords hashed with bcrypt
- JWT in httpOnly cookie (no client-side token storage)
- Use HTTPS in production
- Set a strong `JWT_SECRET` in production

## Roadmap (from design doc)

- **MVP** ✅ User accounts, add workouts/exercises, view history
- **Phase 2** ✅ Graphs & trend analytics, exercise library with categories
- **Phase 3** (future) Social features, notifications, mobile/PWA, export PDF/CSV
