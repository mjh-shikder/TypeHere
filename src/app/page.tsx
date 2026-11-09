// =============================================================================
// TypeHere — Home Page (Main Typing Arena)
// =============================================================================

import type { Metadata } from 'next';
import TypingArena from '@/components/typing/TypingArena';
import HomeSeoContent from '@/components/home/HomeSeoContent';
import TypingFadeContainer from '@/components/layout/TypingFadeContainer';
import JsonLd from '@/components/seo/JsonLd';
import {
  HOME_DESCRIPTION,
  HOME_TITLE,
  buildHomePageSchemas,
  buildOpenGraph,
  buildTwitterCard,
} from '@/lib/seo';

export const metadata: Metadata = {
  title: {
    absolute: HOME_TITLE,
  },
  description: HOME_DESCRIPTION,
  alternates: {
    canonical: '/',
  },
  openGraph: buildOpenGraph({
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    path: '/',
  }),
  twitter: buildTwitterCard({
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
  }),
};

export default function HomePage() {
  return (
    <>
      <JsonLd data={buildHomePageSchemas()} />
      <section
        id="typing-arena"
        aria-labelledby="home-heading"
        className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)]"
      >
        <TypingFadeContainer className="text-center px-4 mb-6">
          <h1
            id="home-heading"
            className="text-2xl sm:text-3xl font-bold tracking-tight"
            style={{ color: 'var(--text-untyped)' }}
          >
            Free Online Typing Test &amp; WPM Speed Practice
          </h1>
          <p className="text-sm mt-2 max-w-xl mx-auto" style={{ color: '#94a3b8' }}>
            Measure words per minute, accuracy, and consistency across 1, 3, and 5-minute tests with live Ghost Personal Best pacing.
          </p>
        </TypingFadeContainer>
        <TypingArena />
      </section>

      <TypingFadeContainer>
        <HomeSeoContent />
      </TypingFadeContainer>
    </>
  );
}
