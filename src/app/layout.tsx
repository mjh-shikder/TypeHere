// =============================================================================
// TypeHere — Root Layout
// =============================================================================

import type { Metadata } from 'next';
import { JetBrains_Mono, Fira_Code, Roboto_Mono, Geist_Mono } from 'next/font/google';
import './globals.css';
import LiquidBackdrop from '@/components/layout/LiquidBackdrop';
import FloatingNavbar from '@/components/layout/FloatingNavbar';
import GuestSignUpNudge from '@/components/layout/GuestSignUpNudge';
import AppProviders from '@/components/providers/AppProviders';

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

const firaCode = Fira_Code({
  subsets: ['latin'],
  variable: '--font-fira-code',
  display: 'swap',
});

const robotoMono = Roboto_Mono({
  subsets: ['latin'],
  variable: '--font-roboto-mono',
  display: 'swap',
});

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://type.mjhshikder.com'),
  applicationName: 'TypeHere',
  title: {
    default: 'TypeHere — Free Typing Practice',
    template: '%s | TypeHere',
  },
  description:
    'Practice typing for free with 1, 3, and 5-minute tests. Improve your speed, accuracy, and stamina with detailed stats, replays, and leaderboards.',
  keywords: [
    'free typing practice',
    'typing test',
    'typing speed test',
    'typing accuracy',
    'WPM test',
    'typing stamina',
    'online typing practice',
  ],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://type.mjhshikder.com',
    siteName: 'TypeHere',
    title: 'TypeHere — Free Typing Practice',
    description:
      'Build typing speed, accuracy, and stamina with free timed tests, detailed analytics, replays, and global leaderboards.',
    images: [
      {
        url: 'https://i.ibb.co.com/WWtP92jL/type-Here.png',
        alt: 'TypeHere — free typing practice',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TypeHere — Free Typing Practice',
    description:
      'Build typing speed, accuracy, and stamina with free timed tests, detailed analytics, replays, and global leaderboards.',
    images: [
      {
        url: 'https://i.ibb.co.com/WWtP92jL/type-Here.png',
        alt: 'TypeHere — free typing practice',
      },
    ],
  },
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
      <body className="antialiased min-h-screen">
        <AppProviders>
          <LiquidBackdrop />
          <FloatingNavbar />
          <GuestSignUpNudge />
          <main className="relative z-10 pt-28 pb-16">
            {children}
          </main>
        </AppProviders>
      </body>
    </html>
  );
}
