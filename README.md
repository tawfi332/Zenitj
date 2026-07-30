# Zenitj

Your day, owned. **Zenitj** is a personal productivity companion for Android that
helps you understand and improve how you spend your days:

- ✅ **Habits** — build daily habits and check them off.
- ⏱️ **Time tracking** — log where your time actually goes and see the breakdown.
- 🔥 **Daily score & streak** — a single number each day, blended from your habits
  and how intentionally you tracked your time.
- 🎯 **Goals** — longer-term goals with simple progress tracking.
- ✨ **Future cards** — a visual "who I'm becoming" board to review daily.
- 🔔 **Reminders** — an optional daily nudge to check in.

Built with **Expo (React Native) + TypeScript**, styled with **NativeWind
(Tailwind)**, and backed by **Supabase** (email auth + Postgres with Row Level
Security). The Android **APK is built automatically by GitHub Actions**.

---

## 1. Prerequisites

- Node.js 20+
- A free [Supabase](https://supabase.com) project
- For local testing: the **Expo Go** app on your phone, or an Android emulator

## 2. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com).
2. Open **SQL Editor**, paste the contents of
   [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql), and run it.
   This creates all tables and Row Level Security policies.
3. In **Project Settings → API**, copy your **Project URL** and **anon public key**.
4. (Optional) In **Authentication → Providers → Email**, turn *Confirm email* off
   for quick testing so new sign-ups can log in immediately.

## 3. Configure environment

```bash
cp .env.example .env
```

Fill in your values:

```
EXPO_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
```

> The anon key is meant to ship in client apps — your data is protected by the
> Row Level Security policies in the migration, not by hiding this key.

## 4. Run locally

```bash
npm install   # also generates the app icon/splash via scripts/gen-assets.js
npx expo start
```

Scan the QR code with Expo Go, or press `a` for an Android emulator. Sign up,
create a habit, log some time, and watch your daily score update.

> The app icon, splash, and favicon in `assets/` are **generated** by
> `scripts/gen-assets.js` (run automatically on `npm install`), so they aren't
> committed. Regenerate anytime with `npm run gen-assets`.

---

## 5. Build the APK on GitHub

The workflow at [`.github/workflows/build-apk.yml`](.github/workflows/build-apk.yml)
builds the APK on every push (and on demand).

1. In your repo, go to **Settings → Secrets and variables → Actions** and add:
   - `EXPO_PUBLIC_SUPABASE_URL`
   - `EXPO_PUBLIC_SUPABASE_ANON_KEY`
2. Push to the build branch, or run the **Build Android APK** workflow manually
   from the **Actions** tab (*Run workflow*).
3. When it finishes, open the run and download **`zenitj-apk`** from *Artifacts*.
4. Copy `zenitj.apk` to your Android phone and install it (you'll need to allow
   installing from "unknown sources").

> The APK is a **release-unsigned** build — perfect for personal installs. For
> Google Play distribution you'd add a signing keystore later.

---

## Project structure

```
app/                     # expo-router screens
  (auth)/                #   login / signup
  (tabs)/                #   Today, Habits, Time, Goals, Future
  settings.tsx           #   account, reminders, sign out
src/
  lib/                   # supabase client, types, date + score utils, notifications
  hooks/                 # session + data hooks (habits, time, goals, cards, dashboard)
  components/            # UI primitives + ScoreRing
  theme/                 # color tokens
supabase/migrations/     # database schema + RLS
.github/workflows/       # APK build
```

## How the daily score works

See [`src/lib/score.ts`](src/lib/score.ts). The score (0–100) weights habit
completion (80%) and time logged (20%); with no habits yet it leans entirely on
time tracking so the app still feels rewarding from day one. The streak counts
consecutive days with at least one completed habit or any logged time.
