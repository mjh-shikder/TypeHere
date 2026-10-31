// =============================================================================
// TypeHere — Server Actions: Test Submission & Guest Sync
// =============================================================================

'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { submitTestSchema, syncGuestTestsSchema } from '@/lib/validations';
import { validateTestSubmission } from '@/lib/anti-cheat';
import type { SubmitTestDTO, LocalTestSummary } from '@/types/typing';

/**
 * Submit a completed typing test result
 * Requires an authenticated session (guests save to localStorage only)
 */
export async function submitTestResultAction(data: SubmitTestDTO) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: 'Authentication required' };
  }

  // Validate input
  const parsed = submitTestSchema.safeParse(data);
  if (!parsed.success) {
    return { error: 'Invalid test data', details: parsed.error.flatten() };
  }

  const validated = parsed.data;

  // Run anti-cheat checks
  const antiCheatResult = validateTestSubmission(validated);

  // Create the test result
  try {
    const result = await prisma.testResult.create({
      data: {
        userId: session.user.id,
        duration: validated.duration,
        wpm: validated.wpm,
        rawWpm: validated.rawWpm,
        accuracy: validated.accuracy,
        consistency: validated.consistency,
        charactersTotal: validated.charactersTotal,
        charactersCorrect: validated.charactersCorrect,
        charactersWrong: validated.charactersWrong,
        charactersExtra: validated.charactersExtra,
        charactersMissed: validated.charactersMissed,
        timeline: validated.timeline,
        mistypedKeys: validated.mistypedKeys,
        telemetry: validated.telemetry,
        isVerified: antiCheatResult.isValid,
        flaggedReason: antiCheatResult.reason || null,
      },
    });

    revalidatePath('/leaderboard');
    revalidatePath('/profile');

    return { success: true, testId: result.id, isVerified: antiCheatResult.isValid };
  } catch (error) {
    console.error('Failed to save test result:', error);
    return { error: 'Failed to save test result' };
  }
}

/**
 * Sync guest test summaries to the authenticated user's account
 * Called after sign-in when unlinked localStorage tests exist
 */
export async function syncGuestTestsAction(tests: LocalTestSummary[]) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: 'Authentication required' };
  }

  // Validate input (max 50 tests per sync)
  const parsed = syncGuestTestsSchema.safeParse({ tests });
  if (!parsed.success) {
    return { error: 'Invalid sync data', details: parsed.error.flatten() };
  }

  const validatedTests = parsed.data.tests;

  try {
    // Check for duplicates by matching id
    const existingIds = await prisma.testResult.findMany({
      where: {
        userId: session.user.id,
        id: { in: validatedTests.map((t) => t.id) },
      },
      select: { id: true },
    });

    const existingIdSet = new Set(existingIds.map((e) => e.id));
    const newTests = validatedTests.filter((t) => !existingIdSet.has(t.id));

    if (newTests.length === 0) {
      return { success: true, synced: 0 };
    }

    // Batch insert
    await prisma.testResult.createMany({
      data: newTests.map((t) => ({
        id: t.id,
        userId: session.user.id,
        duration: t.duration,
        wpm: t.wpm,
        rawWpm: t.rawWpm,
        accuracy: t.accuracy,
        consistency: t.consistency,
        charactersTotal: t.charactersTotal,
        charactersCorrect: t.charactersCorrect,
        charactersWrong: t.charactersWrong,
        charactersExtra: t.charactersExtra,
        charactersMissed: t.charactersMissed,
        timeline: t.timeline,
        mistypedKeys: t.mistypedKeys,
        isVerified: false,
        createdAt: new Date(t.createdAt),
      })),
    });

    revalidatePath('/leaderboard');
    revalidatePath('/profile');

    return { success: true, synced: newTests.length, syncedIds: newTests.map((t) => t.id) };
  } catch (error) {
    console.error('Failed to sync guest tests:', error);
    return { error: 'Failed to sync guest tests' };
  }
}
