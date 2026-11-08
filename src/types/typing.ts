// =============================================================================
// TypeHere — Shared TypeScript Interfaces & Types
// =============================================================================

/** Supported test duration modes in seconds */
export type TestDuration = 60 | 180 | 300;

/** Cursor display style options */
export type CursorStyle = 'line' | 'block' | 'underline';

/** Font size presets */
export type FontSize = 'small' | 'medium' | 'large';

/** Available glass themes */
export type GlassTheme =
  | 'obsidian'
  | 'cyber-frost'
  | 'aurora'
  | 'moonlight-opal'
  | 'solarized-liquid'
  | 'crystal-clear';

/** Available monospace fonts */
export type MonospaceFont =
  | 'JetBrains Mono'
  | 'Fira Code'
  | 'Roboto Mono'
  | 'Geist Mono';

/** Word bank size options */
export type WordBankSize = 1000 | 5000;

// -----------------------------------------------------------------------------
// Telemetry & Timeline Data Structures
// -----------------------------------------------------------------------------

/** Lightweight per-second snapshot (saved in localStorage & DB) */
export interface PerSecondStat {
  second: number;     // 1..60, 1..180, or 1..300
  wpm: number;        // Cumulative or windowed Net WPM at this second
  rawWpm: number;     // Raw WPM at this second
  errors: number;     // Number of errors committed during this specific second
  charIndex: number;  // Total character index reached (powers Ghost Pace cursor)
}

/** Full keystroke event (kept in Zustand memory & DB for logged-in runs) */
export interface KeystrokeEvent {
  t: number;   // Offset in milliseconds from test start
  k: string;   // Key pressed or action ('Backspace', 'Space', 'ClearWord')
  c: boolean;  // Was the keystroke correct?
}

/** Complete test telemetry payload */
export interface TestTelemetry {
  version: 1;
  duration: TestDuration;
  words: string[];
  events: KeystrokeEvent[];
}

// -----------------------------------------------------------------------------
// localStorage Guest Schema
// -----------------------------------------------------------------------------

/** Lightweight test summary stored in localStorage for guests */
export interface LocalTestSummary {
  id: string;                          // UUID
  duration: TestDuration;
  wpm: number;
  rawWpm: number;
  accuracy: number;
  consistency: number;
  charactersTotal: number;
  charactersCorrect: number;
  charactersWrong: number;
  charactersExtra: number;
  charactersMissed: number;
  timeline: PerSecondStat[];           // 60-300 lightweight points
  mistypedKeys: Record<string, number>;
  createdAt: string;                   // ISO Date string
  syncedToDb?: boolean;               // Flag for guest-to-DB sync
}

// -----------------------------------------------------------------------------
// Character State for Rendering
// -----------------------------------------------------------------------------

/** State of a single character in the typing arena */
export type CharacterStatus = 'untyped' | 'correct' | 'incorrect' | 'extra';

/** Typed character data for rendering */
export interface TypedCharacter {
  expected: string;
  typed: string | null;
  status: CharacterStatus;
}

// -----------------------------------------------------------------------------
// Word State for the Typing Engine
// -----------------------------------------------------------------------------

/** State of a single word in the word stream */
export interface WordState {
  original: string;
  characters: TypedCharacter[];
  extraCharacters: TypedCharacter[];  // Extra characters beyond original word length (max 10)
  isCompleted: boolean;
  isCorrect: boolean;
}

// -----------------------------------------------------------------------------
// User Settings (shared between client & server)
// -----------------------------------------------------------------------------

export interface UserSettings {
  theme: GlassTheme;
  fontFamily: MonospaceFont;
  fontSize: FontSize;
  cursorStyle: CursorStyle;
  wordBankSize: WordBankSize;
  username?: string;
  bio?: string;
}

// -----------------------------------------------------------------------------
// Leaderboard Types
// -----------------------------------------------------------------------------

export type LeaderboardTimeframe = 'allTime' | 'weekly' | 'daily';

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  image: string | null;
  wpm: number;
  rawWpm: number;
  accuracy: number;
  consistency: number;
  testId: string;
  createdAt: string;
}

export interface LeaderboardResponse {
  entries: LeaderboardEntry[];
  totalCount: number;
  page: number;
  limit: number;
}

// -----------------------------------------------------------------------------
// Submit Test DTO
// -----------------------------------------------------------------------------

export interface SubmitTestDTO {
  duration: TestDuration;
  wpm: number;
  rawWpm: number;
  accuracy: number;
  consistency: number;
  charactersTotal: number;
  charactersCorrect: number;
  charactersWrong: number;
  charactersExtra: number;
  charactersMissed: number;
  timeline: PerSecondStat[];
  mistypedKeys: Record<string, number>;
  telemetry: TestTelemetry;
}

// -----------------------------------------------------------------------------
// User Settings DTO
// -----------------------------------------------------------------------------

export interface UserSettingsDTO {
  theme?: GlassTheme;
  fontFamily?: MonospaceFont;
  fontSize?: FontSize;
  cursorStyle?: CursorStyle;
  wordBankSize?: WordBankSize;
  username?: string;
  bio?: string;
}
