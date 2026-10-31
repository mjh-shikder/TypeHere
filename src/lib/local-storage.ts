// =============================================================================
// TypeHere — localStorage Management for Guest Users
// =============================================================================

import type { LocalTestSummary, TestDuration, UserSettings, GlassTheme, MonospaceFont, FontSize, CursorStyle, WordBankSize } from '@/types/typing';

const STORAGE_KEY = 'typehere_guest_stats_v1';
const SETTINGS_KEY = 'typehere_settings_v1';
const NUDGE_KEY = 'typehere_nudge_last_shown';
const PB_KEY_PREFIX = 'typehere_pb_';
const MAX_STORED_TESTS = 100;

// --- Nudge Throttling (48-hour rate limit) ---

const NUDGE_INTERVAL_MS = 48 * 60 * 60 * 1000; // 48 hours

/**
 * Check if the sign-up nudge should be shown
 * Returns true if 48+ hours have passed since last showing
 */
export function shouldShowNudge(): boolean {
  if (typeof window === 'undefined') return false;
  
  const lastShown = localStorage.getItem(NUDGE_KEY);
  if (!lastShown) return true;
  
  const elapsed = Date.now() - parseInt(lastShown, 10);
  return elapsed >= NUDGE_INTERVAL_MS;
}

/**
 * Mark the nudge as shown (resets the 48-hour timer)
 */
export function markNudgeShown(): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(NUDGE_KEY, Date.now().toString());
}

// --- Test Results Storage ---

/**
 * Get all stored test summaries from localStorage
 */
export function getStoredTests(): LocalTestSummary[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as LocalTestSummary[];
  } catch {
    return [];
  }
}

/**
 * Save a test summary to localStorage
 * Maintains the most recent MAX_STORED_TESTS entries
 */
export function saveTestResult(test: LocalTestSummary): void {
  if (typeof window === 'undefined') return;
  
  const tests = getStoredTests();
  tests.unshift(test); // Add to beginning (most recent first)
  
  // Keep only the most recent 100
  const trimmed = tests.slice(0, MAX_STORED_TESTS);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  
  // Update personal best if applicable
  updatePersonalBest(test);
}

/**
 * Get unsynced tests (for guest-to-DB migration)
 */
export function getUnsyncedTests(): LocalTestSummary[] {
  return getStoredTests().filter(t => !t.syncedToDb);
}

/**
 * Mark tests as synced after successful DB migration
 */
export function markTestsSynced(testIds: string[]): void {
  if (typeof window === 'undefined') return;
  
  const tests = getStoredTests();
  const idSet = new Set(testIds);
  
  for (const test of tests) {
    if (idSet.has(test.id)) {
      test.syncedToDb = true;
    }
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tests));
}

/**
 * Check if localStorage has any saved test data
 */
export function hasStoredProgress(): boolean {
  return getStoredTests().length > 0;
}

// --- Personal Best Management ---

/**
 * Get personal best for a specific duration
 */
export function getPersonalBest(duration: TestDuration): LocalTestSummary | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const raw = localStorage.getItem(`${PB_KEY_PREFIX}${duration}`);
    if (!raw) return null;
    return JSON.parse(raw) as LocalTestSummary;
  } catch {
    return null;
  }
}

/**
 * Get all personal bests (60s, 180s, 300s)
 */
export function getAllPersonalBests(): Record<TestDuration, LocalTestSummary | null> {
  return {
    60: getPersonalBest(60),
    180: getPersonalBest(180),
    300: getPersonalBest(300),
  };
}

/**
 * Update personal best if the new test beats the current PB
 */
function updatePersonalBest(test: LocalTestSummary): void {
  const currentPB = getPersonalBest(test.duration);
  
  if (!currentPB || test.wpm > currentPB.wpm) {
    localStorage.setItem(`${PB_KEY_PREFIX}${test.duration}`, JSON.stringify(test));
  }
}

// --- User Settings (Guest Persistence) ---

const DEFAULT_SETTINGS: UserSettings = {
  theme: 'obsidian' as GlassTheme,
  fontFamily: 'JetBrains Mono' as MonospaceFont,
  fontSize: 'medium' as FontSize,
  cursorStyle: 'line' as CursorStyle,
  wordBankSize: 1000 as WordBankSize,
};

/**
 * Get user settings from localStorage (or defaults)
 */
export function getStoredSettings(): UserSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

/**
 * Save user settings to localStorage
 */
export function saveSettings(settings: Partial<UserSettings>): void {
  if (typeof window === 'undefined') return;
  
  const current = getStoredSettings();
  const merged = { ...current, ...settings };
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(merged));
}
