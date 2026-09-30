# Level Up

Personal habit tracker organized as an ordered daily sequence of habits (deep work, gym,
study, etc.), each with a weekly goal (e.g. gym 3 times a week), rather than fixed clock
times or a generic to-do list. The streak is counted in weeks. Built for speed — meant to
be opened several times a day, not to manage projects or priorities.

## Features

- **Today**: your habits in order, tap to check them off. The next pending habit is marked,
  few-times-a-week habits show "x/N this week", and past days can be viewed and edited
  (to catch up on a forgotten habit or log days before you signed up).
- **Weekly streak**: a week (Mon–Sun) counts when you hit 70% of your weekly goals.
- **Habits**: create, edit name and times per week, drag to reorder, soft delete.
- **Stats**: current and best streak, 5-week heatmap, completion per habit, milestones.
- **Auth**: email/password, magic link, Google and GitHub.
- Installable as a PWA.

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

Database migrations live in `supabase/migrations/` and are run by hand, in order, in the
Supabase SQL Editor — before pushing code that depends on them.

Open [http://localhost:3000](http://localhost:3000).
