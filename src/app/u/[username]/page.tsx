// =============================================================================
// TypeHere — Public User Profile Page
// =============================================================================

import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import { formatNumber, formatDuration } from '@/lib/utils';
import { Trophy, Clock, Target, Zap } from 'lucide-react';
import UserAvatar from '@/components/profile/UserAvatar';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  return {
    title: `${username} — TypeHere`,
    description: `View ${username}'s typing speed stats on TypeHere.`,
  };
}

async function PublicProfileContent({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;

  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      username: true,
      name: true,
      image: true,
      bio: true,
      createdAt: true,
    },
  });

  if (!user) {
    notFound();
  }

  // Get personal bests
  const personalBests = await Promise.all(
    [60, 180, 300].map(async (duration) => {
      const best = await prisma.testResult.findFirst({
        where: { user: { username }, duration, isVerified: true },
        orderBy: { rawWpm: 'desc' },
        select: {
          wpm: true,
          rawWpm: true,
          accuracy: true,
          consistency: true,
        },
      });
      return { duration, best };
    })
  );

  // Aggregate stats
  const aggregates = await prisma.testResult.aggregate({
    where: { user: { username } },
    _count: true,
    _sum: { duration: true },
    _avg: { rawWpm: true, accuracy: true },
  });

  // Recent tests
  const recentTests = await prisma.testResult.findMany({
    where: { user: { username } },
    orderBy: { createdAt: 'desc' },
    take: 10,
    select: {
      id: true,
      duration: true,
      rawWpm: true,
      accuracy: true,
      createdAt: true,
    },
  });

  return (
    <div className="max-w-4xl mx-auto px-4 space-y-8">
      {/* User Header */}
      <div className="glass-panel rounded-2xl p-8 text-center">
        <UserAvatar
          src={user.image ? `/api/users/${encodeURIComponent(user.username ?? '')}/avatar` : null}
          name={user.name || user.username || 'User'}
          className="w-20 h-20 mx-auto mb-4"
        />
        <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-untyped)' }}>
          {user.name || user.username}
        </h1>
        <p className="text-sm mb-2" style={{ color: 'var(--accent-primary)' }}>
          @{user.username}
        </p>
        {user.bio && (
          <p className="text-sm max-w-md mx-auto" style={{ color: 'var(--text-typed)' }}>
            {user.bio}
          </p>
        )}
        <p className="text-xs mt-3" style={{ color: 'var(--text-typed)' }}>
          Joined {new Date(user.createdAt).toLocaleDateString()}
        </p>
      </div>

      {/* Personal Bests */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {personalBests.map(({ duration, best }) => (
          <div key={duration} className="glass-panel rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-3">
              <Trophy className="w-4 h-4" style={{ color: 'var(--accent-primary)' }} />
              <span className="text-sm font-medium" style={{ color: 'var(--text-typed)' }}>
                PB — {formatDuration(duration)}
              </span>
            </div>
            {best ? (
              <>
                <p
                  className="text-4xl font-bold tabular-nums mb-1"
                  style={{ color: 'var(--accent-primary)' }}
                >
                  {Math.round(best.rawWpm)}{' '}
                  <span className="text-lg font-normal" style={{ color: 'var(--text-typed)' }}>
                    wpm
                  </span>
                </p>
                <p className="text-sm" style={{ color: 'var(--text-typed)' }}>
                  {formatNumber(best.accuracy)}% accuracy
                </p>
              </>
            ) : (
              <p className="text-sm" style={{ color: 'var(--text-typed)' }}>No tests yet</p>
            )}
          </div>
        ))}
      </div>

      {/* Aggregate Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-panel rounded-xl p-4 text-center">
          <Zap className="w-4 h-4 mx-auto mb-2" style={{ color: 'var(--accent-primary)' }} />
          <p className="text-2xl font-bold" style={{ color: 'var(--text-untyped)' }}>
            {aggregates._count}
          </p>
          <p className="text-xs" style={{ color: 'var(--text-typed)' }}>Tests</p>
        </div>
        <div className="glass-panel rounded-xl p-4 text-center">
          <Clock className="w-4 h-4 mx-auto mb-2" style={{ color: 'var(--accent-primary)' }} />
          <p className="text-2xl font-bold" style={{ color: 'var(--text-untyped)' }}>
            {formatDuration(aggregates._sum.duration || 0)}
          </p>
          <p className="text-xs" style={{ color: 'var(--text-typed)' }}>Time Typing</p>
        </div>
        <div className="glass-panel rounded-xl p-4 text-center">
          <Target className="w-4 h-4 mx-auto mb-2" style={{ color: 'var(--accent-primary)' }} />
          <p className="text-2xl font-bold" style={{ color: 'var(--text-untyped)' }}>
            {Math.round(aggregates._avg.rawWpm || 0)}
          </p>
          <p className="text-xs" style={{ color: 'var(--text-typed)' }}>Avg WPM</p>
        </div>
        <div className="glass-panel rounded-xl p-4 text-center">
          <Target className="w-4 h-4 mx-auto mb-2" style={{ color: 'var(--accent-primary)' }} />
          <p className="text-2xl font-bold" style={{ color: 'var(--text-untyped)' }}>
            {formatNumber(aggregates._avg.accuracy || 0)}%
          </p>
          <p className="text-xs" style={{ color: 'var(--text-typed)' }}>Avg Accuracy</p>
        </div>
      </div>

      {/* Recent Tests */}
      {recentTests.length > 0 && (
        <div className="glass-panel rounded-2xl overflow-hidden">
          <div className="px-6 py-4" style={{ borderBottom: '1px solid var(--glass-border)' }}>
            <h3 className="text-sm font-medium" style={{ color: 'var(--text-typed)' }}>
              Recent Tests
            </h3>
          </div>
          {recentTests.map((test) => (
            <div
              key={test.id}
              className="flex items-center justify-between px-6 py-3 hover:bg-white/[0.02] transition-colors"
              style={{ borderBottom: '1px solid var(--glass-border)' }}
            >
              <div className="flex items-center gap-4">
                <span
                  className="text-lg font-bold tabular-nums"
                  style={{ color: 'var(--accent-primary)' }}
                >
                  {Math.round(test.rawWpm)}
                </span>
                <span className="text-xs" style={{ color: 'var(--text-typed)' }}>wpm</span>
              </div>
              <div className="flex items-center gap-6 text-sm">
                <span style={{ color: 'var(--text-untyped)' }}>
                  {formatNumber(test.accuracy)}%
                </span>
                <span className="glass-pill px-2 py-0.5 text-xs" style={{ color: 'var(--text-typed)' }}>
                  {formatDuration(test.duration)}
                </span>
                <span className="text-xs" style={{ color: 'var(--text-typed)' }}>
                  {new Date(test.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function PublicProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="max-w-4xl mx-auto px-4">
          <div className="glass-panel rounded-2xl p-8 text-center" role="status">
            <p style={{ color: 'var(--text-typed)' }}>Loading profile...</p>
          </div>
        </div>
      }
    >
      <PublicProfileContent params={params} />
    </Suspense>
  );
}
