// =============================================================================
// TypeHere — Replay API Route
// GET /api/replay/[testId]
// Returns telemetry and timeline data for ghost replay playback
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ testId: string }> }
) {
  const { testId } = await params;

  if (!testId) {
    return NextResponse.json({ error: 'Missing testId' }, { status: 400 });
  }

  try {
    const result = await prisma.testResult.findUnique({
      where: { id: testId },
      select: {
        telemetry: true,
        timeline: true,
        duration: true,
        wpm: true,
        rawWpm: true,
        accuracy: true,
        consistency: true,
      },
    });

    if (!result) {
      return NextResponse.json({ error: 'Test not found' }, { status: 404 });
    }

    return NextResponse.json({
      telemetry: result.telemetry,
      timeline: result.timeline,
      duration: result.duration,
      wpm: result.wpm,
      rawWpm: result.rawWpm,
      accuracy: result.accuracy,
      consistency: result.consistency,
    });
  } catch (error) {
    console.error('Replay fetch failed:', error);
    return NextResponse.json(
      { error: 'Failed to fetch replay data' },
      { status: 500 }
    );
  }
}
