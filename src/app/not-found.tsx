import type { Metadata } from 'next';
import Link from 'next/link';
import { Keyboard, Trophy } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Page Not Found (404)',
  description:
    'The page you requested on TypeHere could not be found. Return to the free online typing speed test or explore the global WPM leaderboard.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function NotFound() {
  return (
    <section
      aria-labelledby="not-found-heading"
      className="flex items-center justify-center min-h-[calc(100vh-14rem)] px-4"
    >
      <div className="glass-panel rounded-2xl p-8 sm:p-10 max-w-lg w-full text-center space-y-5">
        <p
          className="text-xs font-semibold uppercase tracking-widest"
          style={{ color: 'var(--accent-primary)' }}
        >
          Error 404
        </p>
        <h1
          id="not-found-heading"
          className="text-3xl font-bold tracking-tight"
          style={{ color: 'var(--text-untyped)' }}
        >
          Page Not Found
        </h1>
        <p className="text-sm leading-relaxed" style={{ color: '#94a3b8' }}>
          The route you tried to open does not exist or may have moved. Jump right back into a timed WPM typing test or browse global rankings below.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            href="/"
            className="glass-pill px-5 py-2.5 text-sm font-medium inline-flex items-center gap-2"
            style={{ color: 'var(--accent-primary)' }}
          >
            <Keyboard className="w-4 h-4" aria-hidden="true" />
            Take a Typing Speed Test
          </Link>
          <Link
            href="/leaderboard"
            className="glass-pill px-5 py-2.5 text-sm font-medium inline-flex items-center gap-2"
            style={{ color: 'var(--text-untyped)' }}
          >
            <Trophy className="w-4 h-4" aria-hidden="true" />
            View Global Leaderboard
          </Link>
        </div>
      </div>
    </section>
  );
}
