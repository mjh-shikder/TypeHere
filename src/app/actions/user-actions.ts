// =============================================================================
// TypeHere — Server Actions: User Settings
// =============================================================================

'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { userSettingsSchema } from '@/lib/validations';
import type { UserSettingsDTO } from '@/types/typing';

/**
 * Update the authenticated user's settings and profile
 */
export async function updateUserSettingsAction(settings: UserSettingsDTO) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: 'Authentication required' };
  }

  // Validate input
  const parsed = userSettingsSchema.safeParse(settings);
  if (!parsed.success) {
    return { error: 'Invalid settings', details: parsed.error.flatten() };
  }

  const validated = parsed.data;

  let currentUsername: string | null = null;

  // If username is being changed, check uniqueness
  if (validated.username) {
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { username: true },
    });
    currentUsername = currentUser?.username ?? null;

    const existing = await prisma.user.findUnique({
      where: { username: validated.username },
    });

    if (existing && existing.id !== session.user.id) {
      return { error: 'Username already taken' };
    }
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...(validated.theme && { theme: validated.theme }),
        ...(validated.fontFamily && { fontFamily: validated.fontFamily }),
        ...(validated.fontSize && { fontSize: validated.fontSize }),
        ...(validated.cursorStyle && { cursorStyle: validated.cursorStyle }),
        ...(validated.wordBankSize && { wordBankSize: validated.wordBankSize }),
        ...(validated.username && { username: validated.username }),
        ...(validated.bio !== undefined && { bio: validated.bio }),
      },
      select: { username: true },
    });

    revalidatePath('/profile');
    if (currentUsername && currentUsername !== updatedUser.username) {
      revalidatePath(`/u/${currentUsername}`);
    }
    if (updatedUser.username) {
      revalidatePath(`/u/${updatedUser.username}`);
    }
    return { success: true, username: updatedUser.username };
  } catch (error) {
    console.error('Failed to update settings:', error);
    return { error: 'Failed to update settings' };
  }
}
