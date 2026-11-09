// =============================================================================
// TypeHere — Crawlable Informational Content for Home Page (SSR)
// =============================================================================

import Link from 'next/link';
import { Flame, Gauge, Ghost, Keyboard, Trophy, User } from 'lucide-react';
import { FAQ_ITEMS } from '@/lib/seo';

export default function HomeSeoContent() {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 mt-14 space-y-10">
      {/* How TypeHere Works */}
      <section aria-labelledby="how-it-works-heading" className="space-y-4">
        <div className="space-y-1">
          <h2
            id="how-it-works-heading"
            className="text-xl font-bold tracking-tight"
            style={{ color: 'var(--text-untyped)' }}
          >
            How the TypeHere Typing Speed Test Works
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: '#94a3b8' }}>
            Start typing directly in the arena above for distraction-free online typing practice—no sign-up needed to measure words per minute (WPM), accuracy, and consistency.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <article className="glass-panel rounded-2xl p-5 space-y-2">
            <div className="flex items-center gap-2">
              <Gauge className="w-4 h-4 shrink-0" style={{ color: 'var(--accent-primary)' }} aria-hidden="true" />
              <h3 className="text-sm font-semibold" style={{ color: 'var(--text-untyped)' }}>
                1, 3 &amp; 5-Minute WPM Modes
              </h3>
            </div>
            <p className="text-xs leading-relaxed" style={{ color: '#94a3b8' }}>
              Test pure sprint velocity in a 1-minute WPM test or challenge typing endurance across 3-minute and 5-minute runs using curated 1,000 or 5,000 English word banks.
            </p>
          </article>

          <article className="glass-panel rounded-2xl p-5 space-y-2">
            <div className="flex items-center gap-2">
              <Ghost className="w-4 h-4 shrink-0" style={{ color: 'var(--accent-primary)' }} aria-hidden="true" />
              <h3 className="text-sm font-semibold" style={{ color: 'var(--text-untyped)' }}>
                Ghost Personal Best Pacer
              </h3>
            </div>
            <p className="text-xs leading-relaxed" style={{ color: '#94a3b8' }}>
              Toggle Ghost PB after setting a record to race a live secondary caret moving at your best historical pace for that test duration.
            </p>
          </article>

          <article className="glass-panel rounded-2xl p-5 space-y-2">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 shrink-0" style={{ color: 'var(--accent-primary)' }} aria-hidden="true" />
              <h3 className="text-sm font-semibold" style={{ color: 'var(--text-untyped)' }}>
                Keystroke &amp; Error Analytics
              </h3>
            </div>
            <p className="text-xs leading-relaxed" style={{ color: '#94a3b8' }}>
              Inspect second-by-second WPM charts, active typing time, character breakdowns, and most mistyped keys immediately after each typing test finishes.
            </p>
          </article>
        </div>
      </section>

      {/* Tips to Improve Typing Speed */}
      <section aria-labelledby="tips-heading" className="glass-panel rounded-2xl p-6 space-y-4">
        <h2
          id="tips-heading"
          className="text-xl font-bold tracking-tight"
          style={{ color: 'var(--text-untyped)' }}
        >
          Tips to Improve Typing Speed and Accuracy
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-sm">
          <div className="space-y-1.5">
            <h3 className="font-semibold" style={{ color: 'var(--accent-primary)' }}>
              1. Master Accuracy Before Pushing Raw Speed
            </h3>
            <p className="text-xs leading-relaxed" style={{ color: '#94a3b8' }}>
              Keep your accuracy above 95% during daily free online typing practice. Fewer backspaces eliminate rhythmic pauses and raise sustained net WPM naturally.
            </p>
          </div>
          <div className="space-y-1.5">
            <h3 className="font-semibold" style={{ color: 'var(--accent-primary)' }}>
              2. Read One Word Ahead of Your Cursor
            </h3>
            <p className="text-xs leading-relaxed" style={{ color: '#94a3b8' }}>
              Train your eyes to scan the upcoming word while your fingers complete the current one. Smooth look-ahead prevents hesitation between spacebar transitions.
            </p>
          </div>
          <div className="space-y-1.5">
            <h3 className="font-semibold" style={{ color: 'var(--accent-primary)' }}>
              3. Fix Whole Words with Ctrl + Backspace
            </h3>
            <p className="text-xs leading-relaxed" style={{ color: '#94a3b8' }}>
              When multiple letters go wrong mid-word, clear the entire word in one stroke with Ctrl + Backspace instead of tapping single backspace repeatedly.
            </p>
          </div>
          <div className="space-y-1.5">
            <h3 className="font-semibold" style={{ color: 'var(--accent-primary)' }}>
              4. Train Endurance With Longer Word Banks
            </h3>
            <p className="text-xs leading-relaxed" style={{ color: '#94a3b8' }}>
              Alternate 1-minute bursts with 3-minute and 5-minute sessions or switch to the 5,000-word bank in settings so unfamiliar letter combinations stay fluent.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section matching FAQPage JSON-LD */}
      <section aria-labelledby="faq-heading" className="space-y-4">
        <h2
          id="faq-heading"
          className="text-xl font-bold tracking-tight"
          style={{ color: 'var(--text-untyped)' }}
        >
          Frequently Asked Questions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {FAQ_ITEMS.map((item) => (
            <article key={item.question} className="glass-panel rounded-2xl p-5 space-y-2">
              <h3 className="text-sm font-semibold" style={{ color: 'var(--text-untyped)' }}>
                {item.question}
              </h3>
              <p className="text-xs leading-relaxed" style={{ color: '#94a3b8' }}>
                {item.answer}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* Descriptive Internal Links */}
      <nav
        aria-label="Explore TypeHere sections"
        className="glass-panel rounded-2xl px-6 py-5 flex flex-wrap items-center justify-between gap-4"
      >
        <p className="text-xs" style={{ color: '#94a3b8' }}>
          Ready to compare your WPM score or review recent sessions?
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <a
            href="#typing-arena"
            className="glass-pill px-4 py-2 text-xs font-medium inline-flex items-center gap-2"
            style={{ color: 'var(--accent-primary)' }}
          >
            <Keyboard className="w-3.5 h-3.5" aria-hidden="true" />
            Focus Typing Arena
          </a>
          <Link
            href="/leaderboard"
            className="glass-pill px-4 py-2 text-xs font-medium inline-flex items-center gap-2"
            style={{ color: 'var(--text-untyped)' }}
          >
            <Trophy className="w-3.5 h-3.5" aria-hidden="true" />
            Global WPM Leaderboard
          </Link>
          <Link
            href="/profile"
            className="glass-pill px-4 py-2 text-xs font-medium inline-flex items-center gap-2"
            style={{ color: 'var(--text-untyped)' }}
          >
            <User className="w-3.5 h-3.5" aria-hidden="true" />
            Personal Bests &amp; History
          </Link>
        </div>
      </nav>
    </div>
  );
}
