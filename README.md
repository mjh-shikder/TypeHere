<div align="center">

# TypeHere ⌨️

### Find your flow. Build your speed.

An open-source typing practice app for improving **speed, accuracy, and stamina**.
Jump into a test as a guest, explore your results, and sign in when you want to
sync your progress or climb the leaderboards.

<a href="https://your-live-url-here.example.com">
  <img src="https://img.shields.io/badge/%E2%96%B6%20LIVE%20APP-Open%20TypeHere-f59e0b?style=for-the-badge" alt="Open the TypeHere live app">
</a>

<br>

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-149eca?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-4169e1?logo=postgresql)

</div>

> **Live app link:** Replace `https://type.mjhshikder.com/` in this
> README with your deployment URL when it is available.

## ✨ Features

| Practice | Review | Compete |
| --- | --- | --- |
| **1, 3, or 5-minute** typing tests | Net/raw WPM, accuracy, and consistency | Daily, weekly, and all-time leaderboards |
| Guest mode with browser-saved personal bests | Per-second performance chart | Public profiles and account history |
| Themes, fonts, cursor, and word-bank settings | Keystroke replay and personal-best ghost pace | Google sign-in and guest progress sync |

## 🧰 Tech stack

| Area | Technologies |
| --- | --- |
| App | Next.js 16 App Router, React 19, TypeScript |
| UI | Tailwind CSS 4, Radix UI, Framer Motion |
| State & charts | Zustand, Recharts |
| Auth & data | Auth.js, PostgreSQL, Prisma |

## 🚀 Getting started

### Prerequisites

- Node.js 20.9 or later and npm
- A PostgreSQL database
- OAuth app credentials for whichever sign-in providers you want to enable

### Install

```bash
npm ci
```

Copy the included environment template, then update `.env` with your local
database URL and OAuth credentials. Keep this file private; never commit OAuth
client secrets or `AUTH_SECRET`.

```bash
cp .env.example .env
```

The template contains:

```dotenv
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?schema=public"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
AUTH_SECRET="replace-with-a-generated-secret"

# Configure Google OAuth to enable sign-in.
AUTH_GOOGLE_ID=""
AUTH_GOOGLE_SECRET=""
```

Generate a secret locally, for example:

```bash
openssl rand -base64 32
```

`AUTH_URL` is optional for local development: the auth configuration uses
`NEXT_PUBLIC_APP_URL` when `AUTH_URL` is not set. In production, set the app URL
to your deployed origin and configure the same environment variables in your
hosting provider.

### Configure OAuth

Create a Google OAuth client in the Google Cloud Console and register this
callback URL:

`http://localhost:3000/api/auth/callback/google`

For Google, also add `http://localhost:3000` as an authorized JavaScript origin.
When deploying, add the corresponding callback URL and origin for your
production domain.

### Set up the database

Apply the migrations in the repository to your PostgreSQL database:

```bash
npx prisma migrate deploy
```

Prisma Client is generated during install. If you need to regenerate it manually:

```bash
npx prisma generate
```

### Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## 📜 Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Next.js development server |
| `npm run build` | Create a production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint |
| `npx prisma migrate deploy` | Apply committed database migrations |
| `npx prisma generate` | Generate Prisma Client |

## 🗂️ Project structure

```text
src/
  app/                 Pages, server actions, and API route handlers
  components/          Typing, authentication, profile, and layout UI
  lib/                 Auth, database, metrics, validation, and word-bank logic
  store/               Zustand typing-test state
  types/               Shared TypeScript types
prisma/
  migrations/          PostgreSQL schema migrations
  schema.prisma        Database models
```

### Useful routes

- `/` — typing arena
- `/login` — Google sign-in
- `/profile` — personal stats and settings
- `/leaderboard` — public rankings
- `/u/[username]` — public user profile

## 💾 Data notes

Guest test summaries and personal bests are stored in the browser's
`localStorage`; they are not automatically available on other devices. Signing
in enables account-backed progress and leaderboard submissions. Guest summaries
can be synced to an account, but guest-synced tests do not include the full
keystroke telemetry required for replay.

## 🤝 Contributing

Contributions and issue reports are welcome. Before opening a pull request, run
the relevant checks:

```bash
npm run lint
npm run build
```

## 📄 License

TypeHere is intended to be free and open source, but this repository does not
currently include a `LICENSE` file. Add a license before redistributing the
project so its reuse terms are clear.

For more background on the product goals and technical design, see the
[product requirements document](./product_requirements_document.md).
