// =============================================================================
// TypeHere — Zustand Typing Engine Store
// Core state management for the real-time typing engine, timer, settings,
// per-second timeline recording, and in-memory keystroke telemetry.
// =============================================================================

'use client';

import { create } from 'zustand';
import type {
  TestDuration,
  CursorStyle,
  FontSize,
  GlassTheme,
  MonospaceFont,
  WordBankSize,
  WordState,
  TypedCharacter,
  PerSecondStat,
  KeystrokeEvent,
  TestTelemetry,
  LocalTestSummary,
} from '@/types/typing';
import { getInitialWords, getReplenishmentWords } from '@/lib/words';
import { calculateNetWPM, calculateRawWPM, calculateAccuracy, calculateConsistency } from '@/lib/metrics';
import { generateId } from '@/lib/utils';
import { saveSettings, saveTestResult } from '@/lib/local-storage';
import type { UserSettings } from '@/types/typing';

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export type TestPhase = 'idle' | 'typing' | 'finished';

export interface TypingState {
  // --- Test Configuration ---
  duration: TestDuration;
  wordBankSize: WordBankSize;

  // --- Test Phase ---
  phase: TestPhase;
  timeRemaining: number;
  timerIntervalId: ReturnType<typeof setInterval> | null;
  testStartTime: number | null;

  // --- Word Stream ---
  words: WordState[];
  rawWords: string[];
  activeWordIndex: number;
  activeCharIndex: number;

  // --- Telemetry (in-memory only) ---
  keystrokeEvents: KeystrokeEvent[];
  perSecondTimeline: PerSecondStat[];
  lastSecondRecorded: number;

  // --- Running Counters ---
  correctChars: number;
  incorrectChars: number;
  extraChars: number;
  missedChars: number;
  totalCharsTyped: number;
  mistypedKeys: Record<string, number>;

  // --- Per-Second Tracking ---
  errorsThisSecond: number;

  // --- Completed Test Telemetry & Summary ---
  lastCompletedTelemetry: TestTelemetry | null;
  lastCompletedSummary: LocalTestSummary | null;

  // --- Settings ---
  theme: GlassTheme;
  fontFamily: MonospaceFont;
  fontSize: FontSize;
  cursorStyle: CursorStyle;

  // --- Ghost Pace ---
  ghostTimeline: PerSecondStat[] | null;
  showGhost: boolean;

  // --- Actions ---
  setDuration: (duration: TestDuration) => void;
  setWordBankSize: (size: WordBankSize) => void;
  setTheme: (theme: GlassTheme) => void;
  setFontFamily: (font: MonospaceFont) => void;
  setFontSize: (size: FontSize) => void;
  setCursorStyle: (style: CursorStyle) => void;
  setGhostTimeline: (timeline: PerSecondStat[] | null) => void;
  setShowGhost: (show: boolean) => void;
  hydrateSettings: (settings: Partial<UserSettings>) => void;

  startTest: () => void;
  handleKeyPress: (key: string) => void;
  resetTest: () => void;
  finishTest: () => void;
  tick: () => void;
}

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

function createWordState(word: string): WordState {
  return {
    original: word,
    characters: word.split('').map((ch) => ({
      expected: ch,
      typed: null,
      status: 'untyped' as const,
    })),
    extraCharacters: [],
    isCompleted: false,
    isCorrect: false,
  };
}

// -----------------------------------------------------------------------------
// Store
// -----------------------------------------------------------------------------

export const useTypingStore = create<TypingState>((set, get) => ({
  // --- Defaults ---
  duration: 60,
  wordBankSize: 1000,
  phase: 'idle',
  timeRemaining: 60,
  timerIntervalId: null,
  testStartTime: null,

  words: [],
  rawWords: [],
  activeWordIndex: 0,
  activeCharIndex: 0,

  keystrokeEvents: [],
  perSecondTimeline: [],
  lastSecondRecorded: 0,

  correctChars: 0,
  incorrectChars: 0,
  extraChars: 0,
  missedChars: 0,
  totalCharsTyped: 0,
  mistypedKeys: {},
  errorsThisSecond: 0,

  lastCompletedTelemetry: null,
  lastCompletedSummary: null,

  theme: 'obsidian',
  fontFamily: 'JetBrains Mono',
  fontSize: 'medium',
  cursorStyle: 'line',

  ghostTimeline: null,
  showGhost: false,

  // --- Settings Actions ---
  setDuration: (duration) => {
    const state = get();
    if (state.phase !== 'idle') return;
    set({ duration, timeRemaining: duration });
    // Re-generate words on duration change
    const rawWords = getInitialWords(state.wordBankSize);
    set({
      words: rawWords.map(createWordState),
      rawWords,
      activeWordIndex: 0,
      activeCharIndex: 0,
    });
  },

  setWordBankSize: (size) => {
    saveSettings({ wordBankSize: size });
    const state = get();
    if (state.phase === 'idle') {
      const rawWords = getInitialWords(size);
      set({
        wordBankSize: size,
        words: rawWords.map(createWordState),
        rawWords,
        activeWordIndex: 0,
        activeCharIndex: 0,
      });
      return;
    }
    set({ wordBankSize: size });
  },
  setTheme: (theme) => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme);
    }
    saveSettings({ theme });
    set({ theme });
  },
  setFontFamily: (font) => {
    saveSettings({ fontFamily: font });
    set({ fontFamily: font });
  },
  setFontSize: (size) => {
    saveSettings({ fontSize: size });
    set({ fontSize: size });
  },
  setCursorStyle: (style) => {
    saveSettings({ cursorStyle: style });
    set({ cursorStyle: style });
  },
  setGhostTimeline: (timeline) => set({ ghostTimeline: timeline }),
  setShowGhost: (show) => set({ showGhost: show }),
  hydrateSettings: (settings) => {
    const patch: Partial<TypingState> = {};
    if (settings.theme) {
      if (typeof document !== 'undefined') {
        document.documentElement.setAttribute('data-theme', settings.theme);
      }
      patch.theme = settings.theme;
    }
    if (settings.fontFamily) patch.fontFamily = settings.fontFamily;
    if (settings.fontSize) patch.fontSize = settings.fontSize;
    if (settings.cursorStyle) patch.cursorStyle = settings.cursorStyle;
    if (settings.wordBankSize) patch.wordBankSize = settings.wordBankSize;
    if (Object.keys(patch).length > 0) {
      set(patch);
    }
  },

  // --- Start Test ---
  startTest: () => {
    const state = get();
    if (state.phase === 'typing') return;

    const rawWords =
      state.rawWords.length > 0 ? state.rawWords : getInitialWords(state.wordBankSize);
    const words =
      state.words.length > 0 ? state.words : rawWords.map(createWordState);

    set({
      phase: 'typing',
      testStartTime: performance.now(),
      timeRemaining: state.duration,
      words,
      rawWords,
      activeWordIndex: 0,
      activeCharIndex: 0,
      keystrokeEvents: [],
      perSecondTimeline: [],
      lastSecondRecorded: 0,
      correctChars: 0,
      incorrectChars: 0,
      extraChars: 0,
      missedChars: 0,
      totalCharsTyped: 0,
      mistypedKeys: {},
      errorsThisSecond: 0,
    });

    // Start the timer
    const intervalId = setInterval(() => {
      get().tick();
    }, 1000);
    set({ timerIntervalId: intervalId });
  },

  // --- Timer Tick ---
  tick: () => {
    const state = get();
    if (state.phase !== 'typing') return;

    const elapsed = state.testStartTime
      ? (performance.now() - state.testStartTime) / 1000
      : 0;
    const newTimeRemaining = Math.max(0, state.duration - Math.floor(elapsed));

    // Record per-second stats
    const currentSecond = Math.floor(elapsed);
    if (currentSecond > state.lastSecondRecorded && currentSecond <= state.duration) {
      const minutes = currentSecond / 60;
      const wpm = minutes > 0 ? Math.round(((state.correctChars / 5) / minutes) * 100) / 100 : 0;
      const rawWpm = minutes > 0 ? Math.round(((state.totalCharsTyped / 5) / minutes) * 100) / 100 : 0;

      const newStat: PerSecondStat = {
        second: currentSecond,
        wpm,
        rawWpm,
        errors: state.errorsThisSecond,
        charIndex: state.correctChars,
      };

      set({
        perSecondTimeline: [...state.perSecondTimeline, newStat],
        lastSecondRecorded: currentSecond,
        errorsThisSecond: 0,
      });
    }

    set({ timeRemaining: newTimeRemaining });

    if (newTimeRemaining <= 0) {
      get().finishTest();
    }
  },

  // --- Handle Key Press ---
  handleKeyPress: (key: string) => {
    const state = get();

    // Start test on first keypress if idle
    if (state.phase === 'idle') {
      if (key.length === 1) {
        get().startTest();
        get().handleKeyPress(key);
      }
      return;
    }

    if (state.phase !== 'typing') return;

    const now = performance.now();
    const offset = state.testStartTime ? now - state.testStartTime : 0;
    const { activeWordIndex, activeCharIndex, words, rawWords } = state;
    const currentWord = words[activeWordIndex];
    if (!currentWord) return;

    // --- Space: Advance to next word ---
    if (key === ' ' || key === 'Space') {
      // Must have typed at least 1 character
      if (activeCharIndex === 0 && currentWord.extraCharacters.length === 0) return;

      // Record keystroke
      const newEvents = [...state.keystrokeEvents, { t: Math.round(offset), k: 'Space', c: true }];

      // Count missed characters (untyped characters in current word)
      let missed = 0;
      for (let i = activeCharIndex; i < currentWord.characters.length; i++) {
        if (currentWord.characters[i].status === 'untyped') {
          missed++;
        }
      }

      // Mark word as completed
      const newWords = [...words];
      const isCorrect = currentWord.extraCharacters.length === 0 &&
        currentWord.characters.every((ch) => ch.status === 'correct');
      newWords[activeWordIndex] = {
        ...currentWord,
        isCompleted: true,
        isCorrect,
      };

      const newActiveWordIndex = activeWordIndex + 1;

      // Dynamic word replenishment
      let updatedRawWords = rawWords;
      let updatedWords = newWords;
      if (newActiveWordIndex > rawWords.length - 50) {
        const moreRaw = getReplenishmentWords(state.wordBankSize);
        updatedRawWords = [...rawWords, ...moreRaw];
        updatedWords = [...newWords, ...moreRaw.map(createWordState)];
      }

      set({
        words: updatedWords,
        rawWords: updatedRawWords,
        activeWordIndex: newActiveWordIndex,
        activeCharIndex: 0,
        keystrokeEvents: newEvents,
        missedChars: state.missedChars + missed,
        totalCharsTyped: state.totalCharsTyped + 1,
      });
      return;
    }

    // --- Backspace ---
    if (key === 'Backspace') {
      const newEvents = [...state.keystrokeEvents, { t: Math.round(offset), k: 'Backspace', c: true }];

      // If we have extra characters, remove the last one
      if (currentWord.extraCharacters.length > 0) {
        const newWords = [...words];
        newWords[activeWordIndex] = {
          ...currentWord,
          extraCharacters: currentWord.extraCharacters.slice(0, -1),
        };
        set({
          words: newWords,
          keystrokeEvents: newEvents,
          extraChars: state.extraChars - 1,
          totalCharsTyped: Math.max(0, state.totalCharsTyped - 1),
        });
        return;
      }

      // If at beginning of word, try to go back to previous word (only if it has errors)
      if (activeCharIndex === 0) {
        if (activeWordIndex > 0) {
          const prevWord = words[activeWordIndex - 1];
          if (prevWord.isCompleted && !prevWord.isCorrect) {
            // Move back to previous word
            const newWords = [...words];
            newWords[activeWordIndex - 1] = {
              ...prevWord,
              isCompleted: false,
            };
            // Find the last typed character position
            let lastTypedIndex = prevWord.characters.length;
            for (let i = prevWord.characters.length - 1; i >= 0; i--) {
              if (prevWord.characters[i].status !== 'untyped') {
                lastTypedIndex = i + 1;
                break;
              }
            }
            // If there are extra chars, position after them
            if (prevWord.extraCharacters.length > 0) {
              lastTypedIndex = prevWord.characters.length;
            }
            set({
              words: newWords,
              activeWordIndex: activeWordIndex - 1,
              activeCharIndex: lastTypedIndex,
              keystrokeEvents: newEvents,
            });
          }
        }
        return;
      }

      // Normal backspace within current word
      const newCharIndex = activeCharIndex - 1;
      const newWords = [...words];
      const char = currentWord.characters[newCharIndex];
      const wasCorrect = char.status === 'correct';

      newWords[activeWordIndex] = {
        ...currentWord,
        characters: currentWord.characters.map((ch, i) =>
          i === newCharIndex
            ? { ...ch, typed: null, status: 'untyped' as const }
            : ch
        ),
      };

      set({
        words: newWords,
        activeCharIndex: newCharIndex,
        keystrokeEvents: newEvents,
        correctChars: wasCorrect ? state.correctChars - 1 : state.correctChars,
        incorrectChars: !wasCorrect ? state.incorrectChars - 1 : state.incorrectChars,
        totalCharsTyped: Math.max(0, state.totalCharsTyped - 1),
      });
      return;
    }

    // --- Ctrl+Backspace / Alt+Backspace: Clear current word ---
    if (key === 'ClearWord') {
      const newEvents = [...state.keystrokeEvents, { t: Math.round(offset), k: 'ClearWord', c: true }];

      // Count chars being cleared
      let clearedCorrect = 0;
      let clearedIncorrect = 0;
      for (let i = 0; i < activeCharIndex; i++) {
        if (currentWord.characters[i].status === 'correct') clearedCorrect++;
        else if (currentWord.characters[i].status === 'incorrect') clearedIncorrect++;
      }

      const newWords = [...words];
      newWords[activeWordIndex] = {
        ...currentWord,
        characters: currentWord.characters.map((ch) => ({
          ...ch,
          typed: null,
          status: 'untyped' as const,
        })),
        extraCharacters: [],
      };

      set({
        words: newWords,
        activeCharIndex: 0,
        keystrokeEvents: newEvents,
        correctChars: state.correctChars - clearedCorrect,
        incorrectChars: state.incorrectChars - clearedIncorrect,
        extraChars: state.extraChars - currentWord.extraCharacters.length,
        totalCharsTyped: state.totalCharsTyped - activeCharIndex - currentWord.extraCharacters.length,
      });
      return;
    }

    // --- Regular character input ---
    if (key.length === 1) {
      const isCorrect = activeCharIndex < currentWord.original.length &&
        key === currentWord.original[activeCharIndex];

      const newEvents = [...state.keystrokeEvents, {
        t: Math.round(offset),
        k: key,
        c: isCorrect,
      }];

      const newWords = [...words];

      // Typing beyond word length → extra characters (max 10)
      if (activeCharIndex >= currentWord.original.length) {
        if (currentWord.extraCharacters.length >= 10) return; // Cap at 10

        const extraChar: TypedCharacter = {
          expected: '',
          typed: key,
          status: 'extra',
        };

        newWords[activeWordIndex] = {
          ...currentWord,
          extraCharacters: [...currentWord.extraCharacters, extraChar],
        };

        const newMistyped = { ...state.mistypedKeys };
        newMistyped[`→${key}`] = (newMistyped[`→${key}`] || 0) + 1;

        set({
          words: newWords,
          keystrokeEvents: newEvents,
          extraChars: state.extraChars + 1,
          totalCharsTyped: state.totalCharsTyped + 1,
          errorsThisSecond: state.errorsThisSecond + 1,
          mistypedKeys: newMistyped,
        });
        return;
      }

      // Normal character within word bounds
      newWords[activeWordIndex] = {
        ...currentWord,
        characters: currentWord.characters.map((ch, i) =>
          i === activeCharIndex
            ? { ...ch, typed: key, status: isCorrect ? ('correct' as const) : ('incorrect' as const) }
            : ch
        ),
      };

      const newMistyped = { ...state.mistypedKeys };
      if (!isCorrect) {
        const expectedChar = currentWord.original[activeCharIndex];
        const mistypeKey = `${expectedChar}→${key}`;
        newMistyped[mistypeKey] = (newMistyped[mistypeKey] || 0) + 1;
      }

      set({
        words: newWords,
        activeCharIndex: activeCharIndex + 1,
        keystrokeEvents: newEvents,
        correctChars: isCorrect ? state.correctChars + 1 : state.correctChars,
        incorrectChars: !isCorrect ? state.incorrectChars + 1 : state.incorrectChars,
        totalCharsTyped: state.totalCharsTyped + 1,
        errorsThisSecond: !isCorrect ? state.errorsThisSecond + 1 : state.errorsThisSecond,
        mistypedKeys: newMistyped,
      });
    }
  },

  // --- Finish Test ---
  finishTest: () => {
    const state = get();
    if (state.phase !== 'typing') return;

    // Clear the timer
    if (state.timerIntervalId) {
      clearInterval(state.timerIntervalId);
    }

    // Record final second if needed
    const elapsed = state.testStartTime
      ? (performance.now() - state.testStartTime) / 1000
      : state.duration;
    const finalSecond = Math.min(Math.floor(elapsed), state.duration);
    let finalTimeline = [...state.perSecondTimeline];

    if (finalSecond > state.lastSecondRecorded) {
      const minutes = finalSecond / 60;
      const wpm = minutes > 0 ? Math.round(((state.correctChars / 5) / minutes) * 100) / 100 : 0;
      const rawWpm = minutes > 0 ? Math.round(((state.totalCharsTyped / 5) / minutes) * 100) / 100 : 0;

      finalTimeline.push({
        second: finalSecond,
        wpm,
        rawWpm,
        errors: state.errorsThisSecond,
        charIndex: state.correctChars,
      });
    }

    // Calculate final metrics
    const finalWPM = calculateNetWPM(state.correctChars, state.duration);
    const finalRawWPM = calculateRawWPM(state.totalCharsTyped, state.duration);
    const finalAccuracy = calculateAccuracy(state.correctChars, state.totalCharsTyped);
    const finalConsistency = calculateConsistency(state.keystrokeEvents);

    // Build telemetry (in-memory only — never stored in localStorage)
    const telemetry: TestTelemetry = {
      version: 1,
      duration: state.duration,
      words: state.rawWords.slice(0, state.activeWordIndex + 1),
      events: state.keystrokeEvents,
    };

    // Build lightweight summary (for localStorage and display)
    const summary: LocalTestSummary = {
      id: generateId(),
      duration: state.duration,
      wpm: finalWPM,
      rawWpm: finalRawWPM,
      accuracy: finalAccuracy,
      consistency: finalConsistency,
      charactersTotal: state.totalCharsTyped,
      charactersCorrect: state.correctChars,
      charactersWrong: state.incorrectChars,
      charactersExtra: state.extraChars,
      charactersMissed: state.missedChars,
      timeline: finalTimeline,
      mistypedKeys: state.mistypedKeys,
      createdAt: new Date().toISOString(),
    };

    // Save to localStorage (guest storage)
    saveTestResult(summary);

    set({
      phase: 'finished',
      timerIntervalId: null,
      timeRemaining: 0,
      perSecondTimeline: finalTimeline,
      lastCompletedTelemetry: telemetry,
      lastCompletedSummary: summary,
    });
  },

  // --- Reset Test ---
  resetTest: () => {
    const state = get();

    // Clear timer if running
    if (state.timerIntervalId) {
      clearInterval(state.timerIntervalId);
    }

    const rawWords = getInitialWords(state.wordBankSize);

    set({
      phase: 'idle',
      timeRemaining: state.duration,
      timerIntervalId: null,
      testStartTime: null,
      words: rawWords.map(createWordState),
      rawWords,
      activeWordIndex: 0,
      activeCharIndex: 0,
      keystrokeEvents: [],
      perSecondTimeline: [],
      lastSecondRecorded: 0,
      correctChars: 0,
      incorrectChars: 0,
      extraChars: 0,
      missedChars: 0,
      totalCharsTyped: 0,
      mistypedKeys: {},
      errorsThisSecond: 0,
    });
  },
}));
