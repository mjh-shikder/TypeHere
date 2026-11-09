// =============================================================================
// TypeHere — Profile Page (Universal: Guest & Authenticated)
// =============================================================================

import type { Metadata } from 'next';
import ProfileDashboard from '@/components/profile/ProfileDashboard';
import JsonLd from '@/components/seo/JsonLd';
import { User } from 'lucide-react';
import {
  PROFILE_DESCRIPTION,
  PROFILE_TITLE,
  SITE_NAME,
  buildBreadcrumbSchema,
  buildOpenGraph,
  buildTwitterCard,
} from '@/lib/seo';

const FULL_TITLE = `${PROFILE_TITLE} | ${SITE_NAME}`;

export const metadata: Metadata = {
  title: PROFILE_TITLE,
  description: PROFILE_DESCRIPTION,
  alternates: {
    canonical: '/profile',
  },
  robots: {
    index: false,
    follow: false,
  },
  openGraph: buildOpenGraph({
    title: FULL_TITLE,
    description: PROFILE_DESCRIPTION,
    path: '/profile',
  }),
  twitter: buildTwitterCard({
    title: FULL_TITLE,
    description: PROFILE_DESCRIPTION,
  }),
};

export default function ProfilePage() {
  return (
    <section aria-labelledby="profile-heading" className="max-w-4xl mx-auto px-4">
      <JsonLd
        data={buildBreadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Typing Profile', path: '/profile' },
        ])}
      />

      {/* Header */}
      <header className="text-center mb-10">
        <div className="flex items-center justify-center gap-3 mb-3">
          <User className="w-8 h-8" style={{ color: 'var(--accent-primary)' }} aria-hidden="true" />
          <h1 id="profile-heading" className="text-3xl font-bold" style={{ color: 'var(--text-untyped)' }}>
            Your Profile
          </h1>
        </div>
        <p className="text-sm" style={{ color: '#94a3b8' }}>
          Personal best WPM scores, accuracy statistics, and recent typing test history
        </p>
      </header>

      {/* Profile Dashboard */}
      <ProfileDashboard />
    </section>
  );
}
