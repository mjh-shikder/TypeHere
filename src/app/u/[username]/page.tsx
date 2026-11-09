// =============================================================================
// TypeHere — Public User Profile Page
// =============================================================================

import { Suspense, cache } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import { formatNumber, formatDuration } from '@/lib/utils';
import { Trophy, Clock, Target, Zap, Keyboard } from 'lucide-react';
import UserAvatar from '@/components/profile/UserAvatar';
import JsonLd from '@/components/seo/JsonLd';
import {
  SITE_NAME,
  SITE_URL,
  buildBreadcrumbSchema,
  buildOpenGraph,
  buildPublicProfileDescription,
  buildPublicProfileTitle,
  buildTwitterCard,
} from '@/lib/seo';

const getPublicProfileUser = cache(async (rawUsername: string) => {
  if (!rawUsername || rawUsername === '__ghost__') {
    return null;
  }

  try {
    return await prisma.user.findUnique({
      where: { username: rawUsername },
      select: {
        username: true,
        name: true,
        image: true,
        bio: true,
        createdAt: true,
      },
    });
  } catch {
    return null;
  }
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;

  if (username === '__ghost__') {
    notFound();
  }

  const user = await getPublicProfileUser(username);
  if (!user || !user.username) {
    notFound();
  }

  const title = buildPublicProfileTitle(user.username, user.name);
  const fullTitle = `${title} | ${SITE_NAME}`;
  const description = buildPublicProfileDescription(user.username, user.name);
  const path = `/u/${encodeURIComponent(user.username)}`;

  return {
    title,
    description,
    alternates: {
      canonical: path,
    },
    openGraph: buildOpenGraph({
      title: fullTitle,
      description,
      path,
      type: 'profile',
      username: user.username,
    }),
    twitter: buildTwitterCard({
      title: fullTitle,
      description,
    }),
  };
}

async function PublicProfileContent({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;

  if (username === '__ghost__') {
    notFound();
  }

  const user = await getPublicProfileUser(username);
  if (!user || !user.username) {
    notFound();
  }

  const safeUsername = user.username;
  const profilePath = `/u/${encodeURIComponent(safeUsername)}`;

  // Get personal bests
  const personalBests = await Promise.all(
    [60, 180, 300].map(async (duration) => {
      const best = await prisma.testResult.findFirst({
        where: { user: { username: safeUsername }, duration, isVerified: true },
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
    where: { user: { username: safeUsername } },
    _count: true,
    _sum: { duration: true },
    _avg: { rawWpm: true, accuracy: true },
  });

  // Recent tests
  const recentTests = await prisma.testResult.findMany({
    where: { user: { username: safeUsername } },
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

  const profileSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'ProfilePage',
        dateCreated: user.createdAt.toISOString(),
        url: `${SITE_URL}${profilePath}`,
        mainEntity: {
          '@type': 'Person',
          name: user.name || safeUsername,
          alternateName: safeUsername,
          url: `${SITE_URL}${profilePath}`,
          ...(user.bio ? { description: user.bio } : {}),
        },
      },
      buildBreadcrumbSchema([
        { name: 'Home', path: '/' },
        { name: 'Leaderboard', path: '/leaderboard' },
        { name: `@${safeUsername}`, path: profilePath },
      ]),
    ],
  };

  return (
    <div className="max-w-4xl mx-auto px-4 space-y-8">
      <JsonLd data={profileSchema} />

      {/* User Header */}
      <header className="glass-panel rounded-2xl p-8 text-center">
        <UserAvatar
          src={user.image ? `/api/users/${encodeURIComponent(safeUsername)}/avatar` : null}
          name={user.name || safeUsername}
          size={80}
          className="w-20 h-20 mx-auto mb-4"
        />
        <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-untyped)' }}>
          {user.name || safeUsername}
        </h1>
        <p className="text-sm mb-2" style={{ color: 'var(--accent-primary)' }}>
          @{safeUsername}
        </p>
        {user.bio && (
          <p className="text-sm max-w-md mx-auto" style={{ color: '#94a3b8' }}>
            {user.bio}
          </p>
        )}
        <p className="text-xs mt-3" style={{ color: '#94a3b8' }}>
          Joined {new Date(user.createdAt).toLocaleDateString()}
        </p>
      </header>

      {/* Personal Bests */}
      <section aria-labelledby="public-pb-heading">
        <h2 id="public-pb-heading" className="sr-only">
          Personal Best WPM Scores
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {personalBests.map(({ duration, best }) => (
            <div key={duration} className="glass-panel rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-3">
                <Trophy className="w-4 h-4" style={{ color: 'var(--accent-primary)' }} aria-hidden="true" />
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
      </section>

      {/* Aggregate Stats */}
      <section aria-labelledby="public-stats-heading">
        <h2 id="public-stats-heading" className="sr-only">
          Typing Summary Statistics
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-panel rounded-xl p-4 text-center">
            <Zap className="w-4 h-4 mx-auto mb-2" style={{ color: 'var(--accent-primary)' }} aria-hidden="true" />
            <p className="text-2xl font-bold" style={{ color: 'var(--text-untyped)' }}>
              {aggregates._count}
            </p>
            <p className="text-xs" style={{ color: 'var(--text-typed)' }}>Tests</p>
          </div>
          <div className="glass-panel rounded-xl p-4 text-center">
            <Clock className="w-4 h-4 mx-auto mb-2" style={{ color: 'var(--accent-primary)' }} aria-hidden="true" />
            <p className="text-2xl font-bold" style={{ color: 'var(--text-untyped)' }}>
              {formatDuration(aggregates._sum.duration || 0)}
            </p>
            <p className="text-xs" style={{ color: 'var(--text-typed)' }}>Time Typing</p>
          </div>
          <div className="glass-panel rounded-xl p-4 text-center">
            <Target className="w-4 h-4 mx-auto mb-2" style={{ color: 'var(--accent-primary)' }} aria-hidden="true" />
            <p className="text-2xl font-bold" style={{ color: 'var(--text-untyped)' }}>
              {Math.round(aggregates._avg.rawWpm || 0)}
            </p>
            <p className="text-xs" style={{ color: 'var(--text-typed)' }}>Avg WPM</p>
          </div>
          <div className="glass-panel rounded-xl p-4 text-center">
            <Target className="w-4 h-4 mx-auto mb-2" style={{ color: 'var(--accent-primary)' }} aria-hidden="true" />
            <p className="text-2xl font-bold" style={{ color: 'var(--text-untyped)' }}>
              {formatNumber(aggregates._avg.accuracy || 0)}%
            </p>
            <p className="text-xs" style={{ color: 'var(--text-typed)' }}>Avg Accuracy</p>
          </div>
        </div>
      </section>

      {/* Recent Tests */}
      {recentTests.length > 0 && (
        <section aria-labelledby="public-recent-heading" className="glass-panel rounded-2xl overflow-hidden">
          <div className="px-6 py-4" style={{ borderBottom: '1px solid var(--glass-border)' }}>
            <h2 id="public-recent-heading" className="text-sm font-medium" style={{ color: 'var(--text-typed)' }}>
              Recent Tests
            </h2>
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
        </section>
      )}

      {/* Descriptive Internal Navigation */}
      <nav aria-label="Related typing pages" className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <Link
          href="/"
          className="glass-pill px-4 py-2 text-xs font-medium inline-flex items-center gap-2"
          style={{ color: 'var(--accent-primary)' }}
        >
          <Keyboard className="w-3.5 h-3.5" aria-hidden="true" />
          Try the Free Typing Speed Test
        </Link>
        <Link
          href="/leaderboard"
          className="glass-pill px-4 py-2 text-xs font-medium inline-flex items-center gap-2"
          style={{ color: 'var(--text-untyped)' }}
        >
          <Trophy className="w-3.5 h-3.5" aria-hidden="true" />
          View Global WPM Rankings
        </Link>
      </nav>
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
            <p style={{ color: '#94a3b8' }}>Loading profile...</p>
          </div>
        </div>
      }
    >
      <PublicProfileContent params={params} />
    </Suspense>
  );
}
