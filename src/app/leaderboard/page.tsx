// =============================================================================
// TypeHere — Leaderboard Page
// =============================================================================

import type { Metadata } from 'next';
import Link from 'next/link';
import LeaderboardTable from '@/components/leaderboard/LeaderboardTable';
import JsonLd from '@/components/seo/JsonLd';
import { Keyboard, Trophy, User } from 'lucide-react';
import {
  LEADERBOARD_DESCRIPTION,
  LEADERBOARD_TITLE,
  SITE_NAME,
  buildBreadcrumbSchema,
  buildOpenGraph,
  buildTwitterCard,
} from '@/lib/seo';

const FULL_TITLE = `${LEADERBOARD_TITLE} | ${SITE_NAME}`;

export const metadata: Metadata = {
  title: LEADERBOARD_TITLE,
  description: LEADERBOARD_DESCRIPTION,
  alternates: {
    canonical: '/leaderboard',
  },
  openGraph: buildOpenGraph({
    title: FULL_TITLE,
    description: LEADERBOARD_DESCRIPTION,
    path: '/leaderboard',
  }),
  twitter: buildTwitterCard({
    title: FULL_TITLE,
    description: LEADERBOARD_DESCRIPTION,
  }),
};

export default function LeaderboardPage() {
  return (
    <section aria-labelledby="leaderboard-heading" className="max-w-4xl mx-auto px-4 space-y-8">
      <JsonLd
        data={buildBreadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Global WPM Leaderboard', path: '/leaderboard' },
        ])}
      />

      {/* Header */}
      <header className="text-center mb-2">
        <div className="flex items-center justify-center gap-3 mb-3">
          <Trophy className="w-8 h-8" style={{ color: 'var(--accent-primary)' }} aria-hidden="true" />
          <h1 id="leaderboard-heading" className="text-3xl font-bold" style={{ color: 'var(--text-untyped)' }}>
            Global Leaderboard
          </h1>
        </div>
        <p className="text-sm" style={{ color: '#94a3b8' }}>
          Top verified typists and live guest runs worldwide — ranked by WPM across 1, 3, and 5-minute typing speed tests.
        </p>
      </header>

      {/* Leaderboard Table */}
      <LeaderboardTable />

      {/* Descriptive Internal Links */}
      <nav
        aria-label="Related typing practice pages"
        className="glass-panel rounded-2xl px-6 py-4 flex flex-wrap items-center justify-between gap-4"
      >
        <p className="text-xs" style={{ color: '#94a3b8' }}>
          Want to set a faster WPM score or claim your verified rank?
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/"
            className="glass-pill px-4 py-2 text-xs font-medium inline-flex items-center gap-2"
            style={{ color: 'var(--accent-primary)' }}
          >
            <Keyboard className="w-3.5 h-3.5" aria-hidden="true" />
            Take a Free Typing Speed Test
          </Link>
          <Link
            href="/profile"
            className="glass-pill px-4 py-2 text-xs font-medium inline-flex items-center gap-2"
            style={{ color: 'var(--text-untyped)' }}
          >
            <User className="w-3.5 h-3.5" aria-hidden="true" />
            Inspect Personal Typing Stats
          </Link>
        </div>
      </nav>
    </section>
  );
}
