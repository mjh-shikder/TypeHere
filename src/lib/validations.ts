// =============================================================================
// TypeHere — Zod Validation Schemas
// =============================================================================

import { z } from 'zod';

// --- Shared Enums & Base Types ---

export const testDurationSchema = z.union([z.literal(60), z.literal(180), z.literal(300)]);
export const glassThemeSchema = z.enum([
  'obsidian', 'cyber-frost', 'aurora', 'moonlight-opal', 'solarized-liquid', 'crystal-clear'
]);
export const cursorStyleSchema = z.enum(['line', 'block', 'underline']);
export const fontSizeSchema = z.enum(['small', 'medium', 'large']);
export const monospaceFontSchema = z.enum(['JetBrains Mono', 'Fira Code', 'Roboto Mono', 'Geist Mono']);
export const wordBankSizeSchema = z.union([z.literal(1000), z.literal(5000)]);

// --- Telemetry Schemas ---

export const perSecondStatSchema = z.object({
  second: z.number().int().min(1).max(300),
  wpm: z.number().min(0),
  rawWpm: z.number().min(0),
  errors: z.number().int().min(0),
  charIndex: z.number().int().min(0),
});

export const keystrokeEventSchema = z.object({
  t: z.number().min(0),
  k: z.string().min(1),
  c: z.boolean(),
});

export const testTelemetrySchema = z.object({
  version: z.literal(1),
  duration: testDurationSchema,
  words: z.array(z.string()),
  events: z.array(keystrokeEventSchema),
});

// --- Submit Test DTO Schema ---

export const submitTestSchema = z.object({
  duration: testDurationSchema,
  wpm: z.number().min(0).max(400),
  rawWpm: z.number().min(0).max(400),
  accuracy: z.number().min(0).max(100),
  consistency: z.number().min(0).max(100),
  charactersTotal: z.number().int().min(0),
  charactersCorrect: z.number().int().min(0),
  charactersWrong: z.number().int().min(0),
  charactersExtra: z.number().int().min(0),
  charactersMissed: z.number().int().min(0),
  timeline: z.array(perSecondStatSchema),
  mistypedKeys: z.record(z.string(), z.number()),
  telemetry: testTelemetrySchema,
});

// --- Local Test Summary Schema (for guest sync) ---

export const localTestSummarySchema = z.object({
  id: z.string().uuid(),
  duration: testDurationSchema,
  wpm: z.number().min(0).max(400),
  rawWpm: z.number().min(0).max(400),
  accuracy: z.number().min(0).max(100),
  consistency: z.number().min(0).max(100),
  charactersTotal: z.number().int().min(0),
  charactersCorrect: z.number().int().min(0),
  charactersWrong: z.number().int().min(0),
  charactersExtra: z.number().int().min(0),
  charactersMissed: z.number().int().min(0),
  timeline: z.array(perSecondStatSchema),
  mistypedKeys: z.record(z.string(), z.number()),
  createdAt: z.string().datetime(),
});

export const syncGuestTestsSchema = z.object({
  tests: z.array(localTestSummarySchema).max(50),
});

// --- User Settings Schema ---

export const userSettingsSchema = z.object({
  theme: glassThemeSchema.optional(),
  fontFamily: monospaceFontSchema.optional(),
  fontSize: fontSizeSchema.optional(),
  cursorStyle: cursorStyleSchema.optional(),
  wordBankSize: wordBankSizeSchema.optional(),
  username: z.string().min(3).max(24).regex(/^[a-z0-9_]+$/, {
    message: 'Username must be lowercase alphanumeric with underscores only',
  }).optional(),
  bio: z.string().max(160).optional(),
});

// --- Leaderboard Query Schema ---

export const leaderboardQuerySchema = z.object({
  duration: testDurationSchema.default(60),
  timeframe: z.enum(['allTime', 'weekly', 'daily']).default('allTime'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});
