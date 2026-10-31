// =============================================================================
// TypeHere — Metric Calculation Functions
// =============================================================================

import type { PerSecondStat, KeystrokeEvent } from '@/types/typing';

/**
 * Calculate Net WPM (Words Per Minute)
 * WPM = (Total Correct Characters / 5) / Elapsed Time (Minutes)
 */
export function calculateNetWPM(correctChars: number, elapsedSeconds: number): number {
  if (elapsedSeconds <= 0) return 0;
  const minutes = elapsedSeconds / 60;
  return Math.round((correctChars / 5) / minutes * 100) / 100;
}

/**
 * Calculate Raw WPM (Words Per Minute)
 * Raw WPM = (Total Characters Typed / 5) / Elapsed Time (Minutes)
 */
export function calculateRawWPM(totalCharsTyped: number, elapsedSeconds: number): number {
  if (elapsedSeconds <= 0) return 0;
  const minutes = elapsedSeconds / 60;
  return Math.round((totalCharsTyped / 5) / minutes * 100) / 100;
}

/**
 * Calculate Accuracy (%)
 * Accuracy = (Correct Characters Typed / Total Characters Typed) × 100
 */
export function calculateAccuracy(correctChars: number, totalCharsTyped: number): number {
  if (totalCharsTyped <= 0) return 100;
  return Math.round((correctChars / totalCharsTyped) * 10000) / 100;
}

/**
 * Calculate Consistency (%) from keystroke intervals
 * Consistency = max(0, 100 × (1 - σ_intervals / μ_intervals))
 * Where σ is standard deviation and μ is mean of inter-keystroke intervals
 */
export function calculateConsistency(events: KeystrokeEvent[]): number {
  if (events.length < 2) return 100;

  // Calculate inter-keystroke intervals
  const intervals: number[] = [];
  for (let i = 1; i < events.length; i++) {
    const interval = events[i].t - events[i - 1].t;
    // Filter out pause-like intervals (> 2 seconds) as they skew the metric
    if (interval > 0 && interval < 2000) {
      intervals.push(interval);
    }
  }

  if (intervals.length < 2) return 100;

  const mean = intervals.reduce((sum, val) => sum + val, 0) / intervals.length;
  if (mean === 0) return 100;

  const variance = intervals.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / intervals.length;
  const stdDev = Math.sqrt(variance);

  // Coefficient of variation
  const cv = stdDev / mean;

  return Math.max(0, Math.round((100 * (1 - cv)) * 100) / 100);
}

/**
 * Calculate consistency from per-second WPM values
 * Used when raw keystroke events are not available (e.g., localStorage data)
 */
/**
 * Interpolate ghost-pace character index from a PB per-second timeline.
 */
export function interpolateGhostCharIndex(
  timeline: PerSecondStat[],
  elapsedSeconds: number
): number {
  if (timeline.length === 0 || elapsedSeconds <= 0) return 0;

  const sorted = [...timeline].sort((a, b) => a.second - b.second);
  const floorSecond = Math.floor(elapsedSeconds);
  const prev = [...sorted].reverse().find((point) => point.second <= floorSecond) ?? sorted[0];
  const next = sorted.find((point) => point.second > prev.second);

  if (!next) return prev.charIndex;

  const span = next.second - prev.second;
  const frac = span > 0 ? Math.min(1, Math.max(0, (elapsedSeconds - prev.second) / span)) : 0;
  return Math.round(prev.charIndex + (next.charIndex - prev.charIndex) * frac);
}

/**
 * Active typing time in seconds (pauses longer than 2s are excluded).
 */
export function calculateActiveTypingSeconds(events: KeystrokeEvent[]): number {
  if (events.length === 0) return 0;
  if (events.length === 1) return events[0].t / 1000;

  let activeMs = 0;
  for (let i = 1; i < events.length; i++) {
    const gap = events[i].t - events[i - 1].t;
    if (gap > 0 && gap < 2000) {
      activeMs += gap;
    }
  }

  return Math.round((activeMs / 1000) * 100) / 100;
}

export function calculateConsistencyFromTimeline(timeline: PerSecondStat[]): number {
  if (timeline.length < 2) return 100;

  const wpmValues = timeline.map(s => s.wpm).filter(w => w > 0);
  if (wpmValues.length < 2) return 100;

  const mean = wpmValues.reduce((sum, val) => sum + val, 0) / wpmValues.length;
  if (mean === 0) return 100;

  const variance = wpmValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / wpmValues.length;
  const stdDev = Math.sqrt(variance);

  const cv = stdDev / mean;

  return Math.max(0, Math.round((100 * (1 - cv)) * 100) / 100);
}

/**
 * Build the per-second timeline from keystroke events
 */
export function buildTimeline(
  events: KeystrokeEvent[],
  durationSeconds: number,
  totalCorrectChars: number,
  totalCharsTyped: number
): PerSecondStat[] {
  const timeline: PerSecondStat[] = [];
  let cumulativeCorrect = 0;
  let cumulativeTotal = 0;
  let charIndex = 0;

  for (let second = 1; second <= durationSeconds; second++) {
    const secondStart = (second - 1) * 1000;
    const secondEnd = second * 1000;

    // Filter events in this second
    const eventsInSecond = events.filter(e => e.t >= secondStart && e.t < secondEnd);

    let errorsInSecond = 0;

    for (const event of eventsInSecond) {
      if (event.k !== 'Backspace' && event.k !== 'ClearWord') {
        cumulativeTotal++;
        if (event.c) {
          cumulativeCorrect++;
          charIndex++;
        } else {
          errorsInSecond++;
        }
      }
    }

    const minutes = second / 60;
    const wpm = minutes > 0 ? Math.round((cumulativeCorrect / 5) / minutes * 100) / 100 : 0;
    const rawWpm = minutes > 0 ? Math.round((cumulativeTotal / 5) / minutes * 100) / 100 : 0;

    timeline.push({
      second,
      wpm,
      rawWpm,
      errors: errorsInSecond,
      charIndex,
    });
  }

  return timeline;
}
