// =============================================================================
// TypeHere — Shared SEO Configuration, Copy & Structured Data Helpers
// =============================================================================

import type { Metadata } from 'next';

export const SITE_URL = 'https://type.mjhshikder.com';
export const SITE_NAME = 'TypeHere';
export const AUTHOR_NAME = 'Md Jubair Hossain';
export const AUTHOR_GITHUB_URL = 'https://github.com/mjh-shikder';
export const REPO_URL = 'https://github.com/mjh-shikder/TypeHere';

export const CORE_KEYWORDS = [
  'typing test',
  'typing speed test',
  'WPM test',
  'free online typing practice',
  'improve typing speed',
  'typing accuracy test',
  'online typing practice',
];

export const HOME_TITLE = 'TypeHere — Free Online Typing Test & WPM Speed Practice';
export const HOME_DESCRIPTION =
  'Take a free online typing speed test on TypeHere. Measure WPM and accuracy in 1, 3, or 5-minute tests, race your ghost pace, and improve typing speed.';

export const LEADERBOARD_TITLE = 'Global WPM Leaderboard & Typing Speed Rankings';
export const LEADERBOARD_DESCRIPTION =
  'Explore the TypeHere global typing test leaderboard. Compare verified WPM scores and accuracy across 1-minute, 3-minute, and 5-minute typing speed tests.';

export const PROFILE_TITLE = 'Typing Profile, Personal Bests & WPM Statistics';
export const PROFILE_DESCRIPTION =
  'Track your personal best WPM scores, accuracy trends, active typing time, and recent typing test history in your TypeHere practice profile dashboard.';

export const LOGIN_TITLE = 'Sign In to Sync Typing Speed Stats & Rankings';
export const LOGIN_DESCRIPTION =
  'Sign in with Google on TypeHere to save your typing speed test history across devices, sync personal bests, and claim your verified leaderboard rank.';

export interface FaqItem {
  question: string;
  answer: string;
}

export const FAQ_ITEMS: FaqItem[] = [
  {
    question: 'How does TypeHere calculate WPM and typing accuracy?',
    answer:
      'Words per minute (WPM) is computed using the standard five-character word formula across your elapsed test duration. Accuracy reflects the ratio of correctly typed characters against total keystrokes, including mistyped, extra, and missed characters.',
  },
  {
    question: 'What typing test durations are available on TypeHere?',
    answer:
      'TypeHere offers three timed WPM test modes: a 1-minute sprint for burst speed, a 3-minute balanced pace test, and a 5-minute stamina session. You can switch between a 1,000-word everyday vocabulary and an extended 5,000-word bank in settings.',
  },
  {
    question: 'What is the Ghost PB pacer cursor?',
    answer:
      'Once you complete a test in any duration mode, TypeHere records your per-second typing rhythm as a Ghost Personal Best (PB). On subsequent runs in that duration, you can toggle the Ghost PB cursor to race live against your own best pace.',
  },
  {
    question: 'Do I need an account to take a typing speed test?',
    answer:
      'No account is required. You can take free online typing practice tests immediately as a guest, save personal bests in your browser, and see your guest scores highlighted on the global leaderboard. Signing in with Google syncs your history across devices.',
  },
  {
    question: 'How can I improve my typing speed and WPM consistency?',
    answer:
      'Prioritize accuracy over raw speed so errors do not cost backspace recovery time, practice keeping your eyes slightly ahead of your active word, maintain steady keystroke rhythm over 3-minute and 5-minute tests, and review your most mistyped key pairs after each run.',
  },
  {
    question: 'Which keyboard shortcuts speed up restarting a test?',
    answer:
      'Press Esc at any point to reset the word stream cleanly, press Tab followed by Enter to start the next test without touching your mouse, and use Ctrl + Backspace (or Alt + Backspace) to clear a mistyped word quickly.',
  },
];

export function buildCanonicalUrl(path: string): string {
  if (!path || path === '/') return SITE_URL;
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

export function buildOpenGraph(options: {
  title: string;
  description: string;
  path: string;
  type?: 'website' | 'profile';
  username?: string;
}): Metadata['openGraph'] {
  const url = buildCanonicalUrl(options.path);
  const base = {
    locale: 'en_US',
    url,
    siteName: SITE_NAME,
    title: options.title,
    description: options.description,
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} — Free Online Typing Test & WPM Speed Practice`,
      },
    ],
  };

  if (options.type === 'profile') {
    return {
      ...base,
      type: 'profile',
      username: options.username,
    };
  }

  return {
    ...base,
    type: 'website',
  };
}

export function buildTwitterCard(options: {
  title: string;
  description: string;
}): Metadata['twitter'] {
  return {
    card: 'summary_large_image',
    title: options.title,
    description: options.description,
    images: [
      {
        url: '/twitter-image',
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} — Free Online Typing Test & WPM Speed Practice`,
      },
    ],
  };
}

export function buildBreadcrumbSchema(
  items: { name: string; path: string }[]
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: buildCanonicalUrl(item.path),
    })),
  };
}

export function buildWebSiteAndPersonSchema(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Person',
        '@id': `${SITE_URL}/#creator`,
        name: AUTHOR_NAME,
        url: AUTHOR_GITHUB_URL,
      },
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        name: SITE_NAME,
        alternateName: 'TypeHere Typing Test',
        url: SITE_URL,
        description: HOME_DESCRIPTION,
        inLanguage: 'en',
        publisher: {
          '@id': `${SITE_URL}/#creator`,
        },
        author: {
          '@id': `${SITE_URL}/#creator`,
        },
        isAccessibleForFree: true,
      },
    ],
  };
}

export function buildHomePageSchemas(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebApplication',
        '@id': `${SITE_URL}/#app`,
        name: SITE_NAME,
        url: SITE_URL,
        description: HOME_DESCRIPTION,
        applicationCategory: 'EducationalApplication',
        applicationSubCategory: 'Typing Speed Test & Practice',
        operatingSystem: 'Any',
        browserRequirements: 'Requires JavaScript',
        inLanguage: 'en',
        isAccessibleForFree: true,
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
        creator: {
          '@id': `${SITE_URL}/#creator`,
        },
        featureList: [
          '1, 3, and 5-minute timed WPM typing speed tests',
          'Real-time Ghost Personal Best pace cursor',
          'Per-second WPM chart and mistyped character analytics',
          'Global and guest typing speed leaderboards',
          '1,000 and 5,000 common English word banks',
          'Six customizable glassmorphic themes, monospace fonts, and cursor styles',
        ],
      },
      {
        '@type': 'FAQPage',
        '@id': `${SITE_URL}/#faq`,
        mainEntity: FAQ_ITEMS.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: item.answer,
          },
        })),
      },
      buildBreadcrumbSchema([{ name: 'Home', path: '/' }]),
    ],
  };
}

export function buildPublicProfileTitle(username: string, displayName?: string | null): string {
  const cleanName = displayName?.trim();
  const baseLabel =
    cleanName && cleanName.toLowerCase() !== username.toLowerCase()
      ? `${cleanName} (@${username})`
      : `@${username}`;

  const suffix = ' — WPM Typing Profile';
  const fallbackSuffix = ' — Typing Stats';
  // Account for " | TypeHere" (+11 chars) in layout template so full <title> stays concise (~50-60 chars)
  const withSuffix = `${baseLabel}${suffix}`;
  if (withSuffix.length <= 49) {
    return withSuffix;
  }

  const withFallback = `@${username}${suffix}`;
  if (withFallback.length <= 49) {
    return withFallback;
  }

  return `@${username}${fallbackSuffix}`;
}

export function buildPublicProfileDescription(username: string, displayName?: string | null): string {
  const label = displayName?.trim() || `@${username}`;
  const candidate = `View ${label}'s verified WPM typing speed records, accuracy personal bests across 1, 3, and 5-minute tests, and recent TypeHere typing results.`;
  if (candidate.length <= 160) {
    return candidate;
  }
  return `View @${username}'s verified WPM typing speed records, accuracy personal bests across 1, 3, and 5-minute tests, and recent TypeHere typing results.`;
}
