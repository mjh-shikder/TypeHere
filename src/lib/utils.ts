// =============================================================================
// TypeHere — Utility Functions
// =============================================================================

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind CSS class names with conflict resolution
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Generate a UUID v4
 */
export function generateId(): string {
  return crypto.randomUUID();
}

/**
 * Generate a URL-safe username from a name or email
 * e.g., "Alex Johnson" -> "alex_9f2a", "user@email.com" -> "user_3b1c"
 */
export function generateUsername(nameOrEmail: string): string {
  // Extract the base (name or email prefix)
  let base = nameOrEmail.includes('@')
    ? nameOrEmail.split('@')[0]
    : nameOrEmail;

  // Slugify: lowercase, replace spaces with underscores, remove non-alphanumeric
  base = base
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '')
    .slice(0, 20);

  // If base is empty after sanitization, use a fallback
  if (!base) base = 'typist';

  // Add 4-character random hex suffix
  const suffix = Math.random().toString(16).slice(2, 6);

  return `${base}_${suffix}`;
}

/**
 * Format a duration in seconds to a human-readable string
 */
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (secs === 0) return `${mins}m`;
  return `${mins}m ${secs}s`;
}

/**
 * Clamp a number between a min and max value
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Format a number to a fixed number of decimal places
 */
export function formatNumber(value: number, decimals: number = 1): string {
  return value.toFixed(decimals);
}
