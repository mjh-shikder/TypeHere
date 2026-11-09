import type { Metadata } from 'next';
import LoginPanel from '@/components/auth/LoginPanel';
import JsonLd from '@/components/seo/JsonLd';
import {
  LOGIN_DESCRIPTION,
  LOGIN_TITLE,
  SITE_NAME,
  buildBreadcrumbSchema,
  buildOpenGraph,
  buildTwitterCard,
} from '@/lib/seo';

const FULL_TITLE = `${LOGIN_TITLE} | ${SITE_NAME}`;

export const metadata: Metadata = {
  title: LOGIN_TITLE,
  description: LOGIN_DESCRIPTION,
  alternates: {
    canonical: '/login',
  },
  robots: {
    index: false,
    follow: false,
  },
  openGraph: buildOpenGraph({
    title: FULL_TITLE,
    description: LOGIN_DESCRIPTION,
    path: '/login',
  }),
  twitter: buildTwitterCard({
    title: FULL_TITLE,
    description: LOGIN_DESCRIPTION,
  }),
};

export default function LoginPage() {
  return (
    <section
      aria-label="Sign in to TypeHere"
      className="flex items-center justify-center min-h-[calc(100vh-12rem)] px-4"
    >
      <JsonLd
        data={buildBreadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Sign In', path: '/login' },
        ])}
      />
      <LoginPanel />
    </section>
  );
}
