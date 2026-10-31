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
  title: 'TypeHere — Typing Speed & Stamina Platform',
  description:
    'Test and improve your typing speed, precision, and endurance with 1-minute, 3-minute, and 5-minute modes. Rich analytics, ghost replays, and global leaderboards.',
  keywords: ['typing test', 'typing speed', 'wpm', 'typing practice', 'typing game'],
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
