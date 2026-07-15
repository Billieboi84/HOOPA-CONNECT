# Hoopa Connect

This branch is the migration track for a modern React frontend. The current static site in `main` stays usable while this branch evolves into the Next.js app.

## Migration target

- React 19
- Next.js 15
- TypeScript
- Tailwind CSS
- shadcn/ui-style component primitives
- Framer Motion
- Supabase authentication, database, storage, and realtime

## What is on this branch

- A Next.js app shell with dark mode and floating navigation
- Modern glass-style cards and responsive layouts
- Supabase server-client helpers
- Typed data access for the existing `directory_entries` and `job_listings` tables
- Initial auth, profile, directory, jobs, and marketplace routes

## Local setup

Install dependencies and run the Next app once the environment is ready:

```bash
npm install
npm run dev
```

## Environment

Copy `.env.example` to `.env.local` and fill in the Supabase values before connecting live auth or data.
