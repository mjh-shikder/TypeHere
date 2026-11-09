// =============================================================================
// TypeHere — Semantic Site Footer
// =============================================================================

import Link from 'next/link';
import { Keyboard, Trophy, User } from 'lucide-react';
import { AUTHOR_GITHUB_URL, AUTHOR_NAME, REPO_URL } from '@/lib/seo';

export default function SiteFooter() {
  return (
    <footer
      aria-label="Site footer"
      className="relative z-10 max-w-4xl mx-auto px-4 pb-10 pt-4"
    >
      <div
        className="glass-panel rounded-2xl px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs"
        style={{ color: '#94a3b8' }}
      >
        <div className="flex flex-col sm:flex-row items-center gap-2 text-center sm:text-left">
          <span className="font-semibold" style={{ color: 'var(--text-untyped)' }}>
            TypeHere
          </span>
          <span className="hidden sm:inline" aria-hidden="true">
            ·
          </span>
          <span>Free online typing speed test, WPM practice, and ghost pace racing.</span>
        </div>

        <nav aria-label="Footer navigation" className="flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 hover:underline transition-colors"
            style={{ color: 'var(--text-untyped)' }}
          >
            <Keyboard className="w-3.5 h-3.5" style={{ color: 'var(--accent-primary)' }} aria-hidden="true" />
            Typing Test
          </Link>
          <Link
            href="/leaderboard"
            className="inline-flex items-center gap-1.5 hover:underline transition-colors"
            style={{ color: 'var(--text-untyped)' }}
          >
            <Trophy className="w-3.5 h-3.5" style={{ color: 'var(--accent-primary)' }} aria-hidden="true" />
            WPM Leaderboard
          </Link>
          <Link
            href="/profile"
            className="inline-flex items-center gap-1.5 hover:underline transition-colors"
            style={{ color: 'var(--text-untyped)' }}
          >
            <User className="w-3.5 h-3.5" style={{ color: 'var(--accent-primary)' }} aria-hidden="true" />
            Your Stats
          </Link>
          <a
            href={REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline transition-colors"
            style={{ color: '#94a3b8' }}
          >
            Open Source ·{' '}
            <span className="sr-only">TypeHere GitHub repository by </span>
            {AUTHOR_NAME}
          </a>
        </nav>
      </div>
      <p className="sr-only">
        Built by <a href={AUTHOR_GITHUB_URL}>{AUTHOR_NAME}</a>.
      </p>
    </footer>
  );
}
