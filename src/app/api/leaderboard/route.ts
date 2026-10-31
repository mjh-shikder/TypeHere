// =============================================================================
// TypeHere — Leaderboard API Route
// GET /api/leaderboard?duration=60&timeframe=allTime&page=1&limit=50
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { leaderboardQuerySchema } from '@/lib/validations';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  // Parse and validate query parameters
  const parsed = leaderboardQuerySchema.safeParse({
    duration: searchParams.get('duration') ? Number(searchParams.get('duration')) : 60,
    timeframe: searchParams.get('timeframe') || 'allTime',
    page: searchParams.get('page') ? Number(searchParams.get('page')) : 1,
    limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : 50,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid query parameters', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { duration, timeframe, page, limit } = parsed.data;

  // Build date filter
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
    // Get the best result per user for this duration
    // Using raw query for deduplication (best WPM per user)
    const results = await prisma.testResult.findMany({
      where: {
        duration,
        isVerified: true,
        ...dateFilter,
      },
      orderBy: [
        { wpm: 'desc' },
        { accuracy: 'desc' },
      ],
      include: {
        user: {
          select: {
            username: true,
            image: true,
          },
        },
      },
      take: limit * 3, // Fetch extra for deduplication
    });

    // Deduplicate: one best entry per user
    const seenUsers = new Set<string>();
    const deduped = results.filter((r) => {
      if (seenUsers.has(r.userId)) return false;
      seenUsers.add(r.userId);
      return true;
    });

    // Paginate
    const totalCount = deduped.length;
    const startIndex = (page - 1) * limit;
    const paged = deduped.slice(startIndex, startIndex + limit);

    const entries = paged.map((r, i) => ({
      rank: startIndex + i + 1,
      userId: r.userId,
      username: r.user.username || 'anonymous',
      image: r.user.image,
      wpm: r.wpm,
      rawWpm: r.rawWpm,
      accuracy: r.accuracy,
      consistency: r.consistency,
      testId: r.id,
      createdAt: r.createdAt.toISOString(),
    }));

    return NextResponse.json({
      entries,
      totalCount,
      page,
      limit,
    });
  } catch (error) {
    console.error('Leaderboard query failed:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    );
  }
}
