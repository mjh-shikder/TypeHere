// =============================================================================
// TypeHere — Anti-Cheat & Integrity Guard
// Server-side validation for leaderboard submissions
// =============================================================================

import type { TestTelemetry, SubmitTestDTO } from '@/types/typing';
import { calculateNetWPM, calculateRawWPM, calculateAccuracy } from '@/lib/metrics';

export interface AntiCheatResult {
  isValid: boolean;
  reason?: string;
}

/**
 * Maximum allowed WPM (world record is ~280 WPM, we set ceiling at 320)
 */
const MAX_WPM = 320;

/**
 * Minimum standard deviation of inter-keystroke intervals (ms)
 * Bot/macro inputs typically have < 5ms std dev
 */
const MIN_INTERVAL_STD_DEV = 5;

/**
 * WPM tolerance for recomputation verification (% difference allowed)
 */
const WPM_TOLERANCE_PERCENT = 5;

/**
 * Run all anti-cheat checks on a submitted test
 */
export function validateTestSubmission(data: SubmitTestDTO): AntiCheatResult {
  // 1. WPM ceiling check
  if (data.wpm > MAX_WPM) {
    return { isValid: false, reason: `WPM ${data.wpm} exceeds maximum allowed ${MAX_WPM}` };
  }

  if (data.rawWpm > MAX_WPM) {
    return { isValid: false, reason: `Raw WPM ${data.rawWpm} exceeds maximum allowed ${MAX_WPM}` };
  }

  // 2. Telemetry integrity check
  const telemetryResult = validateTelemetry(data.telemetry);
  if (!telemetryResult.isValid) {
    return telemetryResult;
  }

  // 3. Cadence analysis (check for bot-like intervals)
  const cadenceResult = validateCadence(data.telemetry);
  if (!cadenceResult.isValid) {
    return cadenceResult;
  }

  // 4. Metric verification (recompute and compare)
  const verificationResult = verifyMetrics(data);
  if (!verificationResult.isValid) {
    return verificationResult;
  }

  return { isValid: true };
}

/**
 * Validate that telemetry data is structurally sound
 */
function validateTelemetry(telemetry: TestTelemetry): AntiCheatResult {
  if (!telemetry || !telemetry.events || telemetry.events.length === 0) {
    return { isValid: false, reason: 'Missing or empty telemetry events' };
  }

  if (telemetry.version !== 1) {
    return { isValid: false, reason: 'Invalid telemetry version' };
  }

  if (![60, 180, 300].includes(telemetry.duration)) {
    return { isValid: false, reason: 'Invalid test duration in telemetry' };
  }

  // Check that events are chronologically ordered
  for (let i = 1; i < telemetry.events.length; i++) {
    if (telemetry.events[i].t < telemetry.events[i - 1].t) {
      return { isValid: false, reason: 'Telemetry events are not chronologically ordered' };
    }
  }

  // Check that the last event timestamp is within the test duration (+500ms tolerance)
  const lastEventTime = telemetry.events[telemetry.events.length - 1].t;
  const maxTime = telemetry.duration * 1000 + 500;
  if (lastEventTime > maxTime) {
    return { isValid: false, reason: 'Telemetry events exceed test duration' };
  }

  return { isValid: true };
}

/**
 * Analyze keystroke cadence for bot-like patterns
 */
function validateCadence(telemetry: TestTelemetry): AntiCheatResult {
  const events = telemetry.events;
  if (events.length < 10) {
    return { isValid: true }; // Not enough data for meaningful analysis
  }

  // Calculate inter-keystroke intervals
  const intervals: number[] = [];
  for (let i = 1; i < events.length; i++) {
    const interval = events[i].t - events[i - 1].t;
    if (interval >= 0 && interval < 5000) {
      intervals.push(interval);
    }
  }

  if (intervals.length < 5) {
    return { isValid: true };
  }

  // Check for zero-latency intervals (exact 0ms between keystrokes)
  const zeroIntervals = intervals.filter(i => i === 0).length;
  const zeroRatio = zeroIntervals / intervals.length;
  if (zeroRatio > 0.3) {
    return { isValid: false, reason: 'Excessive zero-latency keystrokes detected (possible bot/macro)' };
  }

  // Calculate standard deviation
  const mean = intervals.reduce((sum, val) => sum + val, 0) / intervals.length;
  const variance = intervals.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / intervals.length;
  const stdDev = Math.sqrt(variance);

  if (stdDev < MIN_INTERVAL_STD_DEV && mean < 50) {
    return {
      isValid: false,
      reason: `Keystroke intervals too uniform (σ=${stdDev.toFixed(1)}ms, μ=${mean.toFixed(1)}ms) — possible bot/macro`,
    };
  }

  return { isValid: true };
}

/**
 * Recompute metrics from telemetry and verify they match submitted values
 */
function verifyMetrics(data: SubmitTestDTO): AntiCheatResult {
  const { telemetry } = data;
  const durationSeconds = telemetry.duration;

  // Count correct and total characters from events
  let correctChars = 0;
  let totalChars = 0;

  for (const event of telemetry.events) {
    if (event.k === 'Backspace' || event.k === 'ClearWord') continue;
    totalChars++;
    if (event.k !== 'Space' && event.c) {
      correctChars++;
    }
  }

  // Recompute WPM
  const recomputedWPM = calculateNetWPM(correctChars, durationSeconds);
  const wpmDiff = Math.abs(data.wpm - recomputedWPM);
  const wpmTolerance = (data.wpm * WPM_TOLERANCE_PERCENT) / 100;

  if (wpmDiff > Math.max(wpmTolerance, 5)) {
    return {
      isValid: false,
      reason: `WPM mismatch: submitted ${data.wpm}, recomputed ${recomputedWPM} (diff: ${wpmDiff.toFixed(1)})`,
    };
  }

  // Recompute accuracy
  const recomputedAccuracy = calculateAccuracy(correctChars, totalChars);
  const accuracyDiff = Math.abs(data.accuracy - recomputedAccuracy);

  if (accuracyDiff > 3) {
    return {
      isValid: false,
      reason: `Accuracy mismatch: submitted ${data.accuracy}%, recomputed ${recomputedAccuracy}% (diff: ${accuracyDiff.toFixed(1)}%)`,
    };
  }

  return { isValid: true };
}
