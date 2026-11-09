// =============================================================================
// TypeHere — Root Layout
// =============================================================================

import type { Metadata, Viewport } from 'next';
import { JetBrains_Mono, Fira_Code, Roboto_Mono, Geist_Mono } from 'next/font/google';
import './globals.css';
import LiquidBackdrop from '@/components/layout/LiquidBackdrop';
import FloatingNavbar from '@/components/layout/FloatingNavbar';
import GuestSignUpNudge from '@/components/layout/GuestSignUpNudge';
import SiteFooter from '@/components/layout/SiteFooter';
import TypingFadeContainer from '@/components/layout/TypingFadeContainer';
import AppProviders from '@/components/providers/AppProviders';
import JsonLd from '@/components/seo/JsonLd';
import {
  AUTHOR_GITHUB_URL,
  AUTHOR_NAME,
  CORE_KEYWORDS,
  HOME_DESCRIPTION,
  HOME_TITLE,
  SITE_NAME,
  SITE_URL,
  buildOpenGraph,
  buildTwitterCard,
  buildWebSiteAndPersonSchema,
} from '@/lib/seo';

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
  preload: true,
});

const firaCode = Fira_Code({
  subsets: ['latin'],
  variable: '--font-fira-code',
  display: 'swap',
  preload: false,
});

const robotoMono = Roboto_Mono({
  subsets: ['latin'],
  variable: '--font-roboto-mono',
  display: 'swap',
  preload: false,
});

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
  display: 'swap',
  preload: false,
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#07090e',
  colorScheme: 'dark',
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: SITE_NAME,
  title: {
    default: HOME_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: HOME_DESCRIPTION,
  keywords: CORE_KEYWORDS,
  authors: [{ name: AUTHOR_NAME, url: AUTHOR_GITHUB_URL }],
  creator: AUTHOR_NAME,
  publisher: SITE_NAME,
  category: 'education',
  openGraph: buildOpenGraph({
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    path: '/',
  }),
  twitter: buildTwitterCard({
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
  }),
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-theme="obsidian"
      className={`${jetbrainsMono.variable} ${firaCode.variable} ${robotoMono.variable} ${geistMono.variable}`}
    >
      <body className="antialiased min-h-screen flex flex-col">
        <a href="#main-content" className="skip-to-content">
          Skip to main content
        </a>
        <JsonLd data={buildWebSiteAndPersonSchema()} />
        <AppProviders>
          <LiquidBackdrop />
          <FloatingNavbar />
          <GuestSignUpNudge />
          <main id="main-content" tabIndex={-1} className="relative z-10 flex-1 pt-28 pb-10 outline-none">
            {children}
          </main>
          <TypingFadeContainer>
            <SiteFooter />
          </TypingFadeContainer>
        </AppProviders>
      </body>
    </html>
  );
}
