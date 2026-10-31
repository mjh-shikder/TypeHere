# AGENTS.md — AI Coding Agent Directives & Architectural Rules

You are an autonomous Staff Full-Stack Engineer building **TypeHere**, a high-performance typing speed and stamina platform with a Liquid Glass design system. Always read `REQUIREMENTS.md` alongside this file before writing or modifying code.

---

## 1. Critical Tech Stack & Version Guardrails

### 1.1 Next.js 16+ & React 19 Conventions
- **Async Dynamic APIs:** In Next.js 15/16 App Router, `params`, `searchParams`, `cookies()`, and `headers()` are **asynchronous Promises**. Always await them:
  ```typescript
  // CORRECT
  export default async function ProfilePage({
    params,
  }: {
    params: Promise<{ username: string }>;
  }) {
    const { username } = await params;
    // ...
  }
  ```
- **Server Actions vs. Client State:** Keep all real-time typing logic strictly on the client (`"use client"`). Only invoke Server Actions when a test finishes, when syncing guest tests, or when saving user preferences.
- **Strict TypeScript:** Never use `any`. Define shared Zod schemas and TypeScript interfaces in `src/types/typing.ts` and `src/lib/validations.ts`.

### 1.2 Prisma & Database Rules
- Instantiate a singleton `PrismaClient` in `src/lib/prisma.ts` to prevent connection exhaustion during HMR.
- All primary keys use `@id @default(uuid())`.
- On initial OAuth sign-in (`src/lib/auth.ts` in the `events.createUser` or `callbacks.signIn` hook), automatically generate a unique URL-safe `username` if one does not exist (e.g., slugified name/email prefix + 4 random hex chars).

---

## 2. Zero-Latency Typing Engine Architecture (<16ms Budget)

Typing apps fail if React re-renders 200+ word DOM nodes on every keystroke. You **MUST** follow these rules in `src/components/typing/` and `src/store/useTypingStore.ts`:

1. **Memoized Word Components:**
   - Wrap each word item in `React.memo(WordItem, (prev, next) => ...)`.
   - When the user types a character in word $i$, **only word $i$** (and word $i-1$ when transitioning across a space) may re-render. Completed and upcoming words must remain untouched in the DOM.
2. **Smooth Hardware-Accelerated Caret:**
   - Do **not** render the caret inside character spans.
   - Render a single floating caret element positioned via `transform: translate3d(${x}px, ${y}px, 0)` measured from the active character's `offsetLeft` and `offsetTop` relative to the words container.
3. **3-Line Viewport Scrolling:**
   - Display words inside a fixed-height 3-line container (`overflow-hidden`).
   - When the active word moves from line 2 to line 3 (detected via `offsetTop`), increment a line offset state or shift the inner container upward by one line height so the active typing line always remains centered on the middle row.
4. **Infinite Word Buffer:**
   - Generate 150 words initially. When `activeWordIndex > words.length - 50`, append 100 more words seamlessly in Zustand.
5. **Hidden Input Focus & Anti-Cheat:**
   - Use a single hidden `<input>` (`opacity-0 pointer-events-none fixed`) or global `window` keydown listener that captures keystrokes when the arena is active.
   - Explicitly block `onPaste`, `onDrop`, and `autoComplete` on the input.

---

## 3. Storage Strategy: Memory vs. `localStorage` vs. PostgreSQL

Follow this exact data separation so browser `localStorage` never hits the 5MB quota limit:

| Data Payload | Zustand (In-Memory) | Browser `localStorage` (Guest) | PostgreSQL (`TestResult`) |
| :--- | :--- | :--- | :--- |
| **Performance Scores** (`wpm`, `rawWpm`, `accuracy`, `consistency`) | Yes | Yes | Yes |
| **Character Counts** (`total`, `correct`, `wrong`, `extra`, `missed`) | Yes | Yes | Yes |
| **Per-Second Chart Data** (`timeline: PerSecondStat[]`, 60–300 items) | Yes | Yes | Yes |
| **Mistyped Keys Map** (`mistypedKeys: Record<string, number>`) | Yes | Yes | Yes |
| **Raw Keystroke Array** (`events: KeystrokeEvent[]`, up to 2,500 items) | **Yes** (for immediate post-test replay) | **NO (Never save to `localStorage`)** | **Yes** (for authenticated verified runs) |

- **Immediate Post-Test Ghost Replay:** Always reads from the active Zustand `lastCompletedTelemetry` in memory so both Guests and Logged-in users can watch their replay immediately after finishing a test.
- **Ghost Runner Pace (Racing against PB during a test):** Interpolates the ghost caret position using `timeline: PerSecondStat[]` (`charIndex` per second), which is lightweight and available in both `localStorage` and PostgreSQL.

---

## 4. Liquid Glass Design System & CSS Theme Tokens

Define these exact CSS variables in `src/app/globals.css` under `[data-theme="..."]` on the `<html>` element so switching themes is instantaneous without page reload:

```css
:root,
[data-theme="obsidian"] {
  --bg-canvas: #07090e;
  --orb-primary: rgba(245, 158, 11, 0.14);
  --orb-secondary: rgba(217, 119, 6, 0.08);
  --glass-surface: rgba(15, 23, 42, 0.45);
  --glass-border: rgba(255, 255, 255, 0.10);
  --glass-highlight: rgba(255, 255, 255, 0.16);
  --accent-primary: #f59e0b;
  --accent-glow: rgba(245, 158, 11, 0.45);
  --text-untyped: #f8fafc;
  --text-typed: #64748b;
  --text-error: #e15b64;
  --text-error-bg: rgba(225, 91, 100, 0.14);
}

[data-theme="cyber-frost"] {
  --bg-canvas: #050814;
  --orb-primary: rgba(6, 182, 212, 0.16);
  --orb-secondary: rgba(217, 70, 239, 0.12);
  --glass-surface: rgba(10, 18, 38, 0.50);
  --glass-border: rgba(34, 211, 238, 0.16);
  --glass-highlight: rgba(103, 232, 249, 0.22);
  --accent-primary: #06b6d4;
  --accent-glow: rgba(6, 182, 212, 0.50);
  --text-untyped: #ecfeff;
  --text-typed: #64748b;
  --text-error: #f43f5e;
  --text-error-bg: rgba(244, 63, 94, 0.16);
}

[data-theme="aurora"] {
  --bg-canvas: #040d0a;
  --orb-primary: rgba(16, 185, 129, 0.15);
  --orb-secondary: rgba(20, 184, 166, 0.10);
  --glass-surface: rgba(6, 24, 19, 0.48);
  --glass-border: rgba(52, 211, 153, 0.14);
  --glass-highlight: rgba(110, 231, 183, 0.20);
  --accent-primary: #10b981;
  --accent-glow: rgba(16, 185, 129, 0.45);
  --text-untyped: #ecfdf5;
  --text-typed: #52796f;
  --text-error: #fb7185;
  --text-error-bg: rgba(251, 113, 133, 0.15);
}

[data-theme="moonlight-opal"] {
  --bg-canvas: #090a10;
  --orb-primary: rgba(167, 139, 250, 0.15);
  --orb-secondary: rgba(96, 165, 250, 0.10);
  --glass-surface: rgba(24, 24, 38, 0.48);
  --glass-border: rgba(255, 255, 255, 0.12);
  --glass-highlight: rgba(196, 181, 253, 0.22);
  --accent-primary: #a78bfa;
  --accent-glow: rgba(167, 139, 250, 0.45);
  --text-untyped: #f5f3ff;
  --text-typed: #6b7280;
  --text-error: #f87171;
  --text-error-bg: rgba(248, 113, 113, 0.15);
}

[data-theme="solarized-liquid"] {
  --bg-canvas: #0c0906;
  --orb-primary: rgba(249, 115, 22, 0.14);
  --orb-secondary: rgba(234, 179, 8, 0.08);
  --glass-surface: rgba(28, 19, 13, 0.50);
  --glass-border: rgba(251, 146, 60, 0.14);
  --glass-highlight: rgba(253, 186, 116, 0.18);
  --accent-primary: #f97316;
  --accent-glow: rgba(249, 115, 22, 0.45);
  --text-untyped: #fff7ed;
  --text-typed: #78716c;
  --text-error: #ef4444;
  --text-error-bg: rgba(239, 68, 68, 0.15);
}

[data-theme="crystal-clear"] {
  --bg-canvas: #050505;
  --orb-primary: rgba(255, 255, 255, 0.07);
  --orb-secondary: rgba(148, 163, 184, 0.05);
  --glass-surface: rgba(255, 255, 255, 0.04);
  --glass-border: rgba(255, 255, 255, 0.14);
  --glass-highlight: rgba(255, 255, 255, 0.25);
  --accent-primary: #ffffff;
  --accent-glow: rgba(255, 255, 255, 0.40);
  --text-untyped: #ffffff;
  --text-typed: #52525b;
  --text-error: #e15b64;
  --text-error-bg: rgba(225, 91, 100, 0.15);
}
```

### Reusable Glass Utility Classes
Create utility classes in `globals.css`:
- `.glass-panel`: `backdrop-blur-xl bg-[var(--glass-surface)] border border-[var(--glass-border)] shadow-[inset_0_1px_1px_0_var(--glass-highlight),0_20px_40px_-15px_rgba(0,0,0,0.5)]`
- `.glass-pill`: `backdrop-blur-lg bg-[var(--glass-surface)] border border-[var(--glass-border)] rounded-full transition-all duration-200`

---

## 5. Recommended Directory Structure

```text
src/
├── app/
│   ├── actions/
│   │   ├── test-actions.ts       # submitTestResultAction, syncGuestTestsAction
│   │   └── user-actions.ts       # updateUserSettingsAction
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts
│   │   ├── leaderboard/route.ts
│   │   ├── replay/[testId]/route.ts
│   │   └── users/[username]/stats/route.ts
│   ├── leaderboard/page.tsx
│   ├── profile/page.tsx          # Universal profile (hydrates from localStorage or DB)
│   ├── u/[username]/page.tsx     # Public user profile
│   ├── layout.tsx
│   ├── page.tsx                  # Main Typing Arena + Post-Test View
│   └── globals.css
├── components/
│   ├── layout/
│   │   ├── LiquidBackdrop.tsx    # Ambient drifting orbs (dampens during active typing)
│   │   ├── FloatingNavbar.tsx    # Fades out during active typing
│   │   └── GuestSignUpNudge.tsx  # 48-hour rate-limited toast nudge
│   ├── typing/
│   │   ├── TypingArena.tsx       # Main container, timer, mode pills (1m default, 3m, 5m)
│   │   ├── WordStream.tsx        # 3-line viewport + memoized WordItem components
│   │   ├── SmoothCaret.tsx       # Hardware-accelerated user & ghost carets
│   │   ├── PostTestSummary.tsx   # Headline stats + Recharts performance graph
│   │   └── GhostReplayModal.tsx  # Interactive playback modal (1x, 1.5x, 2x, scrub)
│   ├── leaderboard/
│   │   └── LeaderboardTable.tsx
│   └── profile/
│       └── ProfileDashboard.tsx
├── lib/
│   ├── auth.ts                   # Auth.js v5 configuration + auto-username generation
│   ├── prisma.ts                 # Prisma singleton
│   ├── anti-cheat.ts             # Server-side cadence & WPM verification
│   ├── local-storage.ts          # Guest stats CRUD + 48h nudge timestamp logic
│   ├── metrics.ts                # WPM, Raw WPM, Accuracy, Consistency formulas
│   └── words.ts                  # Top 1000 & 5000 English word banks + generator
├── store/
│   └── useTypingStore.ts         # Zustand store for typing engine, timer, and settings
└── types/
    └── typing.ts                 # Shared TypeScript interfaces
```

---

## 6. Step-by-Step Build Order for the AI Agent

Execute the build in these sequential phases and verify TypeScript compilation (`tsc --noEmit`) at the end of each phase:

1. **Phase 1 — Foundation & Theme Engine:**
   - Set up `globals.css` with all 6 Liquid Glass themes, `src/types/typing.ts`, `src/lib/words.ts`, `src/lib/metrics.ts`, and `src/lib/local-storage.ts`.
   - Build `LiquidBackdrop.tsx` and `FloatingNavbar.tsx` with theme switching and distraction-free opacity transitions.
2. **Phase 2 — Core Zero-Latency Typing Engine:**
   - Implement `useTypingStore.ts` with 1m (default), 3m, and 5m modes, dynamic word replenishment, per-second `PerSecondStat` ticker, and in-memory `KeystrokeEvent` recording.
   - Build `TypingArena.tsx`, `WordStream.tsx`, and `SmoothCaret.tsx` enforcing the color rules (solid untyped, muted gray typed, gray+red errors) and backspace rules.
3. **Phase 3 — Post-Test Analytics & Ghost Replay:**
   - Build `PostTestSummary.tsx` with Recharts second-by-second dual-line graph (Net WPM, Raw WPM, Error scatter dots) and mistyped key badges.
   - Build `GhostReplayModal.tsx` for interactive playback and enable the live Ghost Pace caret in `TypingArena.tsx`.
4. **Phase 4 — Database, Auth.js v5 & Guest Sync:**
   - Configure `prisma/schema.prisma`, `src/lib/prisma.ts`, and `src/lib/auth.ts`.
   - Implement `submitTestResultAction`, `syncGuestTestsAction`, `updateUserSettingsAction`, and `src/lib/anti-cheat.ts`.
   - Wire up `GuestSignUpNudge.tsx` (throttled to once per 48 hours when `localStorage` has saved runs) and automatic guest-to-DB sync on login.
5. **Phase 5 — Universal Profile & Global Leaderboard:**
   - Build `/profile` (works seamlessly for both Guests via `localStorage` and Logged-in users via DB) and `/leaderboard` (filtered by 1m/3m/5m and Daily/Weekly/All-Time).