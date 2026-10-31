# TypeHere — Product Requirements Document (PRD) & Technical Specification

**Project Name:** TypeHere  
**Type:** Full-Stack Typing Speed & Stamina Platform  
**Target URL/Scope:** Web Application (Desktop-first, Responsive)  
**Version:** 1.1.0  
**Status:** Approved Specification  

---

## 1. Executive Summary

**TypeHere** is a modern, high-performance full-stack typing speed and stamina platform crafted with an immersive **liquid glass / transparent glassmorphic** design language, built to test and enhance typing speed, precision, and endurance. 

Unlike conventional typing tests limited to 15 to 30 second sprints, TypeHere specializes in endurance and rhythm with **1-minute (default), 3-minute, and 5-minute** testing modes. The application captures keystroke telemetry to deliver **rich post-test analytics**, **ghost replay playback** (allowing users to watch their runs or race against their personal bests), and **global leaderboards**. All progress and stats are accessible to everyone—persisted via a lightweight `localStorage` summary schema for guest typists and automatically synced to PostgreSQL upon signing in.

TypeHere prioritizes a frictionless user experience: users can start typing immediately without signing up (Guest Mode), with seamless data migration when authenticating via Google (NextAuth / Auth.js v5).

---

## 2. Tech Stack & Architecture

### 2.1 Core Technologies
| Component | Technology | Rationale |
| :--- | :--- | :--- |
| **Framework** | **Next.js 16+ (App Router)** | Hybrid SSR/SSG for SEO, React 19 Server Actions for mutations, Route Handlers. |
| **Language** | **TypeScript (Strict Mode)** | Full end-to-end type safety across client, database schema, and server actions. |
| **Styling & UI** | **Tailwind CSS + shadcn/ui + Radix UI + Liquid Glass System** | Fast utility-first styling with accessible primitives, multi-layered frosted glassmorphism, specular highlights, and fluid gradients. |
| **Icons & Animations** | **Lucide React + Framer Motion** | Clean modern iconography and smooth caret/layout transitions. |
| **State Management** | **Zustand** | Ultra-lightweight client state for the real-time typing engine and settings. |
| **Database** | **PostgreSQL (Neon / Supabase / Docker)** | Relational database ideal for structured test results, time-series metrics, and leaderboards. |
| **ORM** | **Prisma ORM** | Type-safe queries, automated migrations, and schema modeling. |
| **Authentication** | **Auth.js v5 (NextAuth)** | Google OAuth + Guest account sync support. |
| **Data Visualization** | **Recharts** | Interactive charts for WPM progression, error spikes, and burst speeds over time. |

### 2.2 System Architecture Diagram
```
+-----------------------------------------------------------------------------------+
|                                  Client Browser                                   |
|                                                                                   |
|  +--------------------+  +----------------------+  +---------------------------+  |
|  |  Typing Engine     |  |   Analytics View     |  |    Ghost Replay Player    |  |
|  |  (Zustand State)   |  |   (Recharts Engine)  |  |   (In-Memory / DB Fetch)  |  |
|  +---------+----------+  +----------+-----------+  +-------------+-------------+  |
|            |                        |                            |                |
+------------|------------------------|----------------------------|----------------+
             |                        |                            |
       Server Actions / Route Handlers (Next.js 16 App Router)
             |                        |                            |
+------------v------------------------v----------------------------v----------------+
|  Validation & Anti-Cheat Logic                                                    |
|  - Cadence sanity checks                                                          |
|  - Keystroke entropy analysis                                                     |
|  - WPM/Accuracy verification                                                      |
+-------------------------------------+---------------------------------------------+
                                      |
                      Prisma ORM (Data Access Layer)
                                      |
+-------------------------------------v---------------------------------------------+
|                          PostgreSQL Database                                      |
|  [Users] <---> [TestResults] (Summary + Per-Second Timeline + Telemetry JSON)     |
+-----------------------------------------------------------------------------------+
```

---

## 3. Core Features & Functional Requirements

### 3.1 The Typing Engine

#### 3.1.1 Time-Based Modes
The platform supports three distinct endurance tiers:
- **1 Minute (60s) — [Default]:** Standard benchmark sprint; auto-selected on initial page load.
- **3 Minutes (180s):** Stamina test focusing on pacing, sustained rhythm, and error recovery.
- **5 Minutes (300s):** Marathon endurance test challenging cognitive focus and muscle fatigue.

#### 3.1.2 Word Generation & Layout
- Curated word bank consisting of the top 1,000 most common English words (expandable to 5,000 in settings).
- **Dynamic Word Stream Replenishment:** Initial test mount generates a batch of 150 words. Whenever the user's active word index comes within 50 words of the end of the current buffer, the engine dynamically appends another 100 randomized words so fast typists never run out of words during 3-minute or 5-minute tests.
- Randomized word streams presented in a 3-line viewport with smooth line-scroll transitions when completing the middle line.
- Unobtrusive hardware-accelerated caret (`transform: translate3d`) with selectable cursor styles:
  - Line (blinking or smooth-slide)
  - Block (smooth fade)
  - Underline

#### 3.1.3 Real-Time Visual Feedback & Typing Rules
- **Color Feedback Rules During Typing:**
  - **Untyped / Upcoming characters:** Solid, high-contrast primary text color (clear and crisp readability).
  - **Typed characters:** Turns into a subtle **muted gray tone** once typed, gently fading completed text so focus remains on the current word.
  - **Typing mistakes / errors:** Rendered in a distinctive **gray + red tone** (soft muted red mixed with slate gray), clearly highlighting errors without eye-strain or visual clutter.
  - **Extra characters (over-typing):** Rendered in the same gray + red tone with slight opacity (capped at 10 extra characters per word to prevent layout overflow).
- **Correction Rules:**
  - Standard Backspace: Deletes the previous character within the active word. If the caret is at index $0$ of the active word, pressing Backspace moves the caret back into the previous word **only if** the previous word contains an error. Properly typed completed words are locked.
  - `Ctrl + Backspace` / `Alt + Backspace`: Clears the current active word immediately.
  - Moving forward: Pressing `Space` confirms the current word (requiring at least 1 character typed in the active word) and advances the caret to the next word. Any untyped characters remaining in the skipped word are counted as `charactersMissed`.
- **Quick Controls & Keyboard Shortcuts:**
  - `Tab + Enter` or `Esc`: Instant test restart with a fresh word stream.
  - Auto-focus typing input on any alphanumeric keypress (distraction-free, hidden `<input>`).

#### 3.1.4 Metrics & Calculation Formulas
- **Net WPM (Words Per Minute):**
  $$\text{WPM} = \frac{\text{Total Correct Characters} / 5}{\text{Elapsed Time (Minutes)}}$$
- **Raw WPM:**
  $$\text{Raw WPM} = \frac{\text{Total Characters Typed} / 5}{\text{Elapsed Time (Minutes)}}$$
- **Accuracy (%):**
  $$\text{Accuracy} = \left( \frac{\text{Correct Characters Typed}}{\text{Total Characters Typed}} \right) \times 100$$
- **Consistency (%):**
  Calculated from the coefficient of variation of per-second WPM or keystroke intervals ($\sigma$ is standard deviation, $\mu$ is mean, clamped between $0$ and $100$):
  $$\text{Consistency} = \max\left(0, 100 \times \left(1 - \frac{\sigma_{\text{intervals}}}{\mu_{\text{intervals}}}\right)\right)$$

---

### 3.2 Ghost Replay, Per-Second Timeline & Telemetry System

#### 3.2.1 Telemetry & Timeline Data Structures
To keep browser storage lightweight while supporting rich analytics and replays, test data is separated into **Summary + Per-Second Timeline** (persisted everywhere) and **Raw Keystroke Telemetry** (held in memory for active session replay and uploaded to PostgreSQL for authenticated users):

```typescript
// 1. Lightweight Per-Second Snapshot (Saved in localStorage & DB)
export interface PerSecondStat {
  second: number;   // 1..60, 1..180, or 1..300
  wpm: number;      // Cumulative or windowed Net WPM at this second
  rawWpm: number;   // Raw WPM at this second
  errors: number;   // Number of errors committed during this specific second
  charIndex: number;// Total character index reached at this second (powers Ghost Pace cursor)
}

// 2. Full Keystroke Event (Kept in Zustand memory for immediate replay & DB for logged-in runs)
export interface KeystrokeEvent {
  t: number;        // Offset in milliseconds from test start
  k: string;        // Key pressed or action ('Backspace', 'Space', 'ClearWord')
  c: boolean;       // Was the keystroke correct?
}

export interface TestTelemetry {
  version: 1;
  duration: 60 | 180 | 300;
  words: string[];
  events: KeystrokeEvent[];
}
```

#### 3.2.2 Ghost Replay Player & Ghost Pace Runner
- **Interactive Playback:**
  - Immediately after finishing any test (Guest or Logged-in), users can watch a character-by-character replay from the in-memory Zustand buffer.
  - Logged-in users and leaderboard viewers can also stream full keystroke replays from the database (`GET /api/replay/[testId]`).
  - Visual controls: Play, Pause, Scrub timeline, Speed toggles ($1\times$, $1.5\times$, $2\times$).
- **Ghost Runner (Race Against Personal Best):**
  - Option to enable a secondary "Ghost Cursor" during a live test.
  - Powered by the lightweight `PerSecondStat.charIndex` array from the user's Personal Best (works offline in `localStorage` for guests and in DB for logged-in users without needing 2,500 raw keystrokes).

---

### 3.3 Post-Test Analytics & Visual Charts

Immediately upon test completion, the user is presented with a detailed post-test summary:

1. **Headline Metrics:**
   - Big Primary Stat: Final Net WPM & Accuracy percentage.
   - Secondary Stats: Raw WPM, Consistency (%), Test Duration ($60\text{s} / 180\text{s} / 300\text{s}$).
   - Character counts breakdown: `Correct / Incorrect / Extra / Missed`.
   - Time breakdown: Total elapsed time vs. active typing time.

2. **Interactive Performance Chart (Recharts):**
   - Powered by the `timeline: PerSecondStat[]` array.
   - **Primary Curve (Line):** Net WPM plotted second-by-second.
   - **Secondary Curve (Dashed Line):** Raw WPM plotted second-by-second.
   - **Error Overlay (Scatter / Red Markers):** Marks the exact seconds where `errors > 0`.
   - Tooltip displaying: Second, Net WPM, Raw WPM, Errors in that second.

3. **Error & Cadence Insights:**
   - Top mistyped keys / character combinations (`mistypedKeys: Record<string, number>`, saved in summary stats).

4. **Action Bar:**
   - `Next Test` button (hotkey `Tab + Enter`).
   - `Watch Replay` button.
   - `Share Result` (copies formatted stats to clipboard).

---

### 3.4 Leaderboard & Universal Profiles

#### 3.4.1 Global Leaderboard
- **Global Rankings:** Top verified authenticated typists worldwide, deduplicated so each user holds at most **one best entry per duration and timeframe**, ranked by Net WPM (descending), then Accuracy (descending).
- **Guest Visibility:** Guest users can browse all leaderboards and see a highlighted virtual comparison row showing where their local Personal Best would rank, with a prompt to sign in to claim their spot.
- **Filters:**
  - Duration: 1 Minute (Default) | 3 Minutes | 5 Minutes.
  - Time Range: All-Time | Weekly | Daily.

#### 3.4.2 Anti-Cheat & Integrity Guard
To maintain competitive integrity on leaderboards:
- **Clipboard Block:** Paste operations (`onPaste`), drag-and-drop text, and browser autofill into the typing field are completely disabled.
- **Keystroke Cadence Analysis:** Server validates that inter-keystroke delays follow a natural human distribution (rejecting synthetic/bot intervals with $0\text{ms}$ latency, standard deviation $< 5\text{ms}$, or WPM $> 320$).
- **Metric Verification:** Server recomputes WPM and accuracy from the submitted telemetry before marking `isVerified = true`.

#### 3.4.3 Universal Profiles & Lightweight `localStorage` Schema
TypeHere provides a full profile and analytics dashboard to both guests and logged-in users:
- **Equal Access:** Personal Best (PB) badges for 1m, 3m, and 5m tests, cumulative stats (total tests completed, total time spent typing, average accuracy, average WPM), and recent test history log with performance charts are accessible to everyone.
- **Guest `localStorage` Architecture (No Raw Keystroke Bloat):**
  - Instead of storing 2,500+ raw keystrokes per test in `localStorage`, guest storage (`typehere_guest_stats_v1`) stores only the **performance scores and UI display details**:
    ```typescript
    export interface LocalTestSummary {
      id: string;                 // UUID
      duration: 60 | 180 | 300;
      wpm: number;
      rawWpm: number;
      accuracy: number;
      consistency: number;
      charactersTotal: number;
      charactersCorrect: number;
      charactersWrong: number;
      charactersExtra: number;
      charactersMissed: number;
      timeline: PerSecondStat[];  // 60-300 lightweight points for Recharts & Ghost Pace
      mistypedKeys: Record<string, number>; // Top missed keys for UI display
      createdAt: string;          // ISO Date
    }
    ```
  - Keeps the most recent 100 test summaries plus all-time Personal Bests for 60s, 180s, and 300s, keeping total `localStorage` usage well under $300\text{KB}$.
- **Gentle Sign-Up Nudge (Rate-Limited Toast):**
  - Trigger Condition: When the app loads, if saved progress exists in `localStorage` AND the user is not authenticated.
  - Toast Message: *"Want to save your progress across devices? Sign up."* (with a quick Google sign-in action button).
  - Frequency Throttling: A timestamp (`typehere_nudge_last_shown`) ensures the nudge appears at most once every 48 hours.

---

### 3.5 Liquid Glass & Glassmorphic Visual Design System

TypeHere features an immersive **Liquid Glass & Transparent Glassmorphism** design language across every view.

#### 3.5.1 Glass Materials & Surface Architecture
1. **Ambient Liquid Backdrop (Canvas Level 0):**
   - Deep chromatic base (`#07090e` / `#0a0d14`).
   - Slowly drifting fluid mesh gradients / liquid light orbs using hardware-accelerated CSS radial gradients.
   - **Motion Dampening:** When active typing begins, background animations pause/dim and floating UI chrome fades to $0\%$ opacity for zero distraction.
2. **Frosted Glass Cards & Panels (Surface Level 1):**
   - Backdrop blur: `backdrop-blur-xl` (`20px`).
   - Translucent surface tint with hairline specular borders (`1px solid rgba(255, 255, 255, 0.10)`) and subtle inner top highlight (`inset 0 1px 1px 0 rgba(255, 255, 255, 0.12)`).
3. **Floating Liquid Glass Pills & Controls (Interactive Level 2):**
   - Mode selectors (1m, 3m, 5m), navigation bar, and action buttons float as sleek translucent capsules (`rounded-full`).
4. **Transparent Typing Arena:**
   - High legibility guarantee with custom text contrast calibration and smooth glowing caret matching the active theme's accent color.

#### 3.5.2 Glass Color Themes (Dynamic CSS Variables)
Users can toggle between six curated liquid glass color themes without page reloads:
- **Obsidian Glass (Default Dark):** Deep onyx glass with warm amber/gold liquid reflections.
- **Cyber Frost:** Deep midnight-blue frosted glass with cyan and magenta neon refractions.
- **Aurora Borealis:** Dark emerald base with iridescent teal and aurora-green ambient light leaks.
- **Moonlight Opal:** Smoked silver glass with ethereal violet/ice-blue highlights.
- **Solarized Liquid:** Warm sepia-infused glass with deep bronze and tangerine accents.
- **Crystal Clear:** High-transparency pure monochrome dark glass with crisp white accents.

#### 3.5.3 Typography & Readability Controls
- **Monospace Fonts:** JetBrains Mono (default), Fira Code, Roboto Mono, Geist Mono.
- **Size & Layout Scale:** Small (`1.25rem`), Medium (`1.5rem`, default), Large (`1.875rem`).

---

### 3.6 Authentication & Guest Migration Flow

1. **Guest Mode (Default):**
   - No login required to type, change themes, or view personal analytics.
2. **Account Creation & Automatic Username Generation:**
   - One-click sign-in with Google via Auth.js v5.
   - **Auto-Username Rule:** On first sign-in, if `user.username` is null, the server automatically generates a unique URL-safe username from the OAuth profile name or email prefix plus a 4-character random alphanumeric suffix (e.g., `alex_9f2a`), allowing the user to customize it later in settings.
3. **Seamless Guest Migration:**
   - Upon sign-in, the client detects unlinked `LocalTestSummary[]` items in `localStorage`, syncs them to the user's PostgreSQL account via `syncGuestTestsAction`, and marks them as synced so they are never duplicated.

---

## 4. Database Schema (Prisma Data Model)

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

// ----------------------------------------------------
// NextAuth Standard Models
// ----------------------------------------------------
model Account {
  id                String  @id @default(uuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(uuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}

// ----------------------------------------------------
// User Profile & Preferences
// ----------------------------------------------------
model User {
  id            String       @id @default(uuid())
  name          String?
  email         String?      @unique
  emailVerified DateTime?
  image         String?
  username      String?      @unique
  bio           String?      @db.VarChar(160)
  
  // Persisted UI & Typing Preferences
  theme         String       @default("obsidian")
  fontFamily    String       @default("JetBrains Mono")
  fontSize      String       @default("medium") // "small" | "medium" | "large"
  cursorStyle   String       @default("line")   // "line" | "block" | "underline"
  wordBankSize  Int          @default(1000)     // 1000 | 5000

  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt

  accounts      Account[]
  sessions      Session[]
  testResults   TestResult[]

  @@index([username])
}

// ----------------------------------------------------
// Typing Test Results & Telemetry
// ----------------------------------------------------
model TestResult {
  id                String   @id @default(uuid())
  userId            String
  user              User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  duration          Int      // 60, 180, or 300 seconds
  wpm               Float    // Net WPM
  rawWpm            Float    // Raw WPM
  accuracy          Float    // Percentage (0.00 - 100.00)
  consistency       Float    // Percentage (0.00 - 100.00)
  
  charactersTotal   Int
  charactersCorrect Int
  charactersWrong   Int
  charactersExtra   Int
  charactersMissed  Int      @default(0)
  
  // Lightweight per-second array for fast chart & Ghost Pace rendering
  timeline          Json     // PerSecondStat[]
  
  // Mistyped character map for analytics
  mistypedKeys      Json?    // Record<string, number>

  // Full Replay Telemetry (Nullable for migrated guest tests)
  telemetry         Json?    // TestTelemetry

  // Verification & Anti-cheat
  isVerified        Boolean  @default(true)
  flaggedReason     String?

  createdAt         DateTime @default(now())

  @@index([userId, duration])
  @@index([duration, isVerified, wpm(sort: Desc)])
  @@index([createdAt])
}
```

---

## 5. API & Server Actions Specifications

### 5.1 Server Actions (`src/app/actions/`)
- `submitTestResultAction(data: SubmitTestDTO)`:
  - Requires active authenticated session (guests save locally to `localStorage`).
  - Validates telemetry integrity, recomputes WPM/accuracy, and runs cadence anti-cheat checks.
  - Inserts row into `TestResult` and revalidates leaderboard caches.
- `syncGuestTestsAction(tests: LocalTestSummary[])`:
  - Called automatically after sign-in when unlinked guest summaries exist in `localStorage`.
  - Validates summary metrics and batch-inserts up to 50 historical guest runs into `TestResult` (with `telemetry: null` and `isVerified: false` so historical unverified local runs populate user stats without polluting the verified Global Leaderboard).
- `updateUserSettingsAction(settings: UserSettingsDTO)`:
  - Updates `theme`, `fontFamily`, `fontSize`, `cursorStyle`, `wordBankSize`, `username`, and `bio`.

### 5.2 API Route Handlers (`src/app/api/`)
- `GET /api/leaderboard`:
  - Query parameters: `duration` (`60` [default] | `180` | `300`), `timeframe` (`allTime` | `weekly` | `daily`), `page`, `limit`.
  - Returns paginated, deduplicated rank list of verified runs with user avatars, usernames, WPM, accuracy,consistency, and `testId` for replay viewing.
- `GET /api/replay/[testId]`:
  - Returns the `telemetry` and `timeline` JSON for a specific test result to power the Ghost Replay Player.
- `GET /api/users/[username]/stats`:
  - Returns user personal bests across 1m/3m/5m, cumulative typing time, average accuracy, and recent test history.

---

## 6. Non-Functional Requirements & Performance Targets

1. **Input Latency:**
   - Keystroke-to-render latency must remain strictly under **$16\text{ms}$** (consistent $60\text{--}120\text{ FPS}$).
   - Typing input must never re-render the entire word list or parent layout on every keystroke. Active word and caret position updates must be isolated.
2. **Storage Footprint:**
   - Guest `localStorage` must only store `LocalTestSummary` objects (scores, character counts, per-second chart points, and mistyped keys) and must never store raw 2,500-keystroke telemetry arrays.
3. **Accessibility & Keyboard First:**
   - Complete keyboard navigability (`Tab + Enter` or `Esc` for instant reset).

---

## 7. Acceptance Criteria

- [ ] Users can start typing on the homepage immediately without requiring authentication.
- [ ] Exactly 3 time-based test modes (1 min, 3 min, 5 min) are supported, with **1 minute set as the active default** on page load.
- [ ] Live typing is smooth with zero lag; untyped text renders in a **solid crisp color**, typed characters shift to a **muted gray**, and typing mistakes are highlighted in a **gray + red tone**.
- [ ] Backspacing works within the current word and allows backspacing into the previous word only if the previous word had an error.
- [ ] Glassmorphic aesthetic is applied throughout: floating translucent pills, frosted glass panels (`backdrop-blur-xl`), hairline specular borders, and ambient liquid mesh glow.
- [ ] During active typing, background liquid motion and UI chrome gracefully fade out for distraction-free focus.
- [ ] Guest progress is stored in `localStorage` using the lightweight `LocalTestSummary` schema (excluding raw keystroke arrays) and hydrates the Profile and Post-Test charts seamlessly.
- [ ] On app load, if saved progress is found in `localStorage` without an active session, a rate-limited toast prompts: *"Want to save your progress across devices? Sign up."* (at most once every 48 hours).
- [ ] After each test, an interactive Recharts graph displays Net WPM, Raw WPM, and error markers second-by-second.
- [ ] Users can watch a full ghost replay of their completed run immediately after finishing a test.
- [ ] Users can log in with Google, get an auto-generated unique `username`, and have their local guest test summaries merged into their database profile.
- [ ] Global leaderboard displays verified, deduplicated rankings for 1 min, 3 min, and 5 min modes.