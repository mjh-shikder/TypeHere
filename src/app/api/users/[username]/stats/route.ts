// =============================================================================
// TypeHere — User Stats API Route
// GET /api/users/[username]/stats
// Returns personal bests, cumulative stats, and recent test history
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params;

  if (!username) {
    return NextResponse.json({ error: 'Missing username' }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        name: true,
        image: true,
        bio: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get personal bests for each duration
    const personalBests = await Promise.all(
      [60, 180, 300].map(async (duration) => {
        const best = await prisma.testResult.findFirst({
          where: { userId: user.id, duration, isVerified: true },
          orderBy: { rawWpm: 'desc' },
          select: {
            wpm: true,
            rawWpm: true,
            accuracy: true,
            consistency: true,
            timeline: true,
            createdAt: true,
          },
        });
        return { duration, ...best };
      })
    );

    // Aggregate stats
    const aggregates = await prisma.testResult.aggregate({
      where: { userId: user.id },
      _count: true,
      _sum: { duration: true },
      _avg: { rawWpm: true, accuracy: true },
    });

    // Recent tests (last 20)
    const recentTests = await prisma.testResult.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: {
        id: true,
        duration: true,
        wpm: true,
        rawWpm: true,
        accuracy: true,
        consistency: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      user: {
        username: user.username,
        name: user.name,
        image: user.image,
        bio: user.bio,
        joinedAt: user.createdAt.toISOString(),
      },
      personalBests,
      stats: {
        totalTests: aggregates._count,
        totalTime: aggregates._sum.duration || 0,
        avgWpm: aggregates._avg.rawWpm || 0,
        avgAccuracy: aggregates._avg.accuracy || 0,
      },
      recentTests: recentTests.map((t) => ({
        id: t.id,
        duration: t.duration,
        wpm: t.wpm,
        rawWpm: t.rawWpm,
        accuracy: t.accuracy,
        consistency: t.consistency,
        createdAt: t.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error('User stats query failed:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user stats' },
      { status: 500 }
    );
  }
}
