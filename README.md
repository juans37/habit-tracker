# Habit & time-block tracker

Personal daily-routine tracker organized as an ordered sequence of "anchored blocks" (deep
work, gym, study, etc.) rather than fixed clock times or a generic to-do list. Built for
speed — meant to be opened several times a day, not to manage projects or priorities.

See [`CLAUDE.md`](./CLAUDE.md) for the full product spec and design decisions.

## Stack

- [Next.js](https://nextjs.org) (App Router) + TypeScript
- [Supabase](https://supabase.com) (Postgres + Auth)
- Tailwind CSS
- Deployed on [Vercel](https://vercel.com)

## Getting started

```bash
npm install
cp .env.local.example .env.local   # fill in your Supabase project URL + anon key
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).
