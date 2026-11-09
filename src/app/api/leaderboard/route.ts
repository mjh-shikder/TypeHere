// =============================================================================
// TypeHere — Leaderboard API Route
// GET /api/leaderboard?duration=60&timeframe=allTime&page=1&limit=20
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { leaderboardQuerySchema } from '@/lib/validations';

const GHOST_USERNAME = '__ghost__';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const parsed = leaderboardQuerySchema.safeParse({
    duration: searchParams.get('duration') ? Number(searchParams.get('duration')) : 60,
    timeframe: searchParams.get('timeframe') || 'allTime',
    page: searchParams.get('page') ? Number(searchParams.get('page')) : 1,
    limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : 20,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid query parameters', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { duration, timeframe, page, limit } = parsed.data;
  const guestIdParam = searchParams.get('guestId');
  const guestId = guestIdParam && /^ghostuser_\d{4}$/.test(guestIdParam) ? guestIdParam : null;

  let dateFilter = {};
  const now = new Date();
  if (timeframe === 'weekly') {
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    dateFilter = { createdAt: { gte: weekAgo } };
  } else if (timeframe === 'daily') {
    const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    dateFilter = { createdAt: { gte: dayAgo } };
  }

  try {
    const session = await auth().catch(() => null);

    // Fetch verified results (lightweight select, excluding heavy JSON columns), sorted by rawWpm desc
    const results = await prisma.testResult.findMany({
      where: {
        duration,
        isVerified: true,
        ...dateFilter,
      },
      orderBy: [
        { rawWpm: 'desc' },
        { accuracy: 'desc' },
      ],
      select: {
        id: true,
        userId: true,
        guestName: true,
        wpm: true,
        rawWpm: true,
        accuracy: true,
        consistency: true,
        createdAt: true,
        user: {
          select: {
            username: true,
            image: true,
          },
        },
      },
    });

    // Deduplicate:
    // - Real users: one best entry per userId
    // - Ghost user: one best entry per guestName
    const seenUsers = new Set<string>();
    const seenGuests = new Set<string>();
    const deduped = results.filter((r) => {
      if (r.user.username === GHOST_USERNAME) {
        // Ghost entry — deduplicate by guestName
        const key = r.guestName ?? r.id;
        if (seenGuests.has(key)) return false;
        seenGuests.add(key);
        return true;
      } else {
        // Real user entry — deduplicate by userId
        if (seenUsers.has(r.userId)) return false;
        seenUsers.add(r.userId);
        return true;
      }
    });

    // Find current viewer's rank (authenticated user or matching guest identity)
    const myIndex = deduped.findIndex((r) => {
      const isGuestRow = r.user.username === GHOST_USERNAME;
      if (session?.user?.id) {
        return !isGuestRow && r.userId === session.user.id;
      }
      if (guestId) {
        return isGuestRow && r.guestName === guestId;
      }
      return false;
    });

    // Paginate
    const totalCount = deduped.length;
    const startIndex = (page - 1) * limit;
    const paged = deduped.slice(startIndex, startIndex + limit);

    const entries = paged.map((r, i) => ({
      rank: startIndex + i + 1,
      userId: r.userId,
      username: r.user.username === GHOST_USERNAME
        ? (r.guestName ?? 'ghostuser')
        : (r.user.username ?? 'anonymous'),
      image: r.user.username === GHOST_USERNAME ? null : r.user.image,
      wpm: r.wpm,
      rawWpm: r.rawWpm,
      accuracy: r.accuracy,
      consistency: r.consistency,
      testId: r.id,
      createdAt: r.createdAt.toISOString(),
      isGuest: r.user.username === GHOST_USERNAME,
    }));

    return NextResponse.json(
      {
        entries,
        totalCount,
        page,
        limit,
        myRank: myIndex >= 0 ? myIndex + 1 : null,
      },
      {
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    );
  } catch (error) {
    console.error('Leaderboard query failed:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    );
  }
}
