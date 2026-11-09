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

function isSaneSummary(t: LocalTestSummary): boolean {
  if (![60, 180, 300].includes(t.duration)) return false;
  if (t.rawWpm > 320 || t.wpm > 320) return false;
  if (t.accuracy < 0 || t.accuracy > 100) return false;
  if (t.rawWpm < 0 || t.wpm < 0) return false;
  return true;
}

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
export async function syncGuestTestsAction(tests: LocalTestSummary[], guestId?: string | null) {
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
      // Clean up ghost leaderboard entries even if nothing to sync
      if (guestId && /^ghostuser_\d{4}$/.test(guestId)) {
        await prisma.testResult.deleteMany({
          where: { guestName: guestId },
        });
      }
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
        isVerified: isSaneSummary(t),
        createdAt: new Date(t.createdAt),
      })),
    });

    // Clean up ghost leaderboard entries for this guest identity
    if (guestId && /^ghostuser_\d{4}$/.test(guestId)) {
      await prisma.testResult.deleteMany({
        where: { guestName: guestId },
      });
    }

    revalidatePath('/leaderboard');
    revalidatePath('/profile');

    return { success: true, synced: newTests.length, syncedIds: newTests.map((t) => t.id) };
  } catch (error) {
    console.error('Failed to sync guest tests:', error);
    return { error: 'Failed to sync guest tests' };
  }
}

/**
 * Submit a completed typing test for a guest user.
 * Runs against the shared ghost User row; guestName identifies the guest identity.
 */
export async function submitGuestTestAction(data: {
  guestName: string;
  summary: LocalTestSummary;
}) {
  const { guestName, summary } = data;

  // Basic validation on guestName
  if (!guestName || !/^ghostuser_\d{4}$/.test(guestName)) {
    return { error: 'Invalid guest identity' };
  }

  // Sanity check the summary
  if (!isSaneSummary(summary)) {
    return { error: 'Test data failed validation' };
  }

  // Ensure the ghost user exists (upsert)
  const ghostUser = await prisma.user.upsert({
    where: { username: '__ghost__' },
    update: {},
    create: {
      id: 'ghost-user-system',
      username: '__ghost__',
      name: 'Ghost',
    },
  });

  try {
    await prisma.testResult.create({
      data: {
        id: summary.id,
        userId: ghostUser.id,
        guestName,
        duration: summary.duration,
        wpm: summary.wpm,
        rawWpm: summary.rawWpm,
        accuracy: summary.accuracy,
        consistency: summary.consistency,
        charactersTotal: summary.charactersTotal,
        charactersCorrect: summary.charactersCorrect,
        charactersWrong: summary.charactersWrong,
        charactersExtra: summary.charactersExtra,
        charactersMissed: summary.charactersMissed,
        timeline: summary.timeline as unknown as import('@prisma/client').Prisma.InputJsonValue,
        mistypedKeys: summary.mistypedKeys as unknown as import('@prisma/client').Prisma.InputJsonValue,
        isVerified: true,
        createdAt: new Date(summary.createdAt),
      },
    });

    revalidatePath('/leaderboard');

    return { success: true };
  } catch (error: unknown) {
    // Duplicate ID — already submitted
    if (typeof error === 'object' && error !== null && 'code' in error && (error as { code: string }).code === 'P2002') {
      return { success: true };
    }
    console.error('Failed to save guest test result:', error);
    return { error: 'Failed to save guest test result' };
  }
}
