// =============================================================================
// TypeHere — Auth.js v5 Configuration
// OAuth provider: Google
// Auto-username generation on first sign-in
// =============================================================================

import NextAuth, { type Session } from 'next-auth';
import { randomUUID } from 'node:crypto';

if (!process.env.AUTH_URL && process.env.NEXT_PUBLIC_APP_URL) {
  process.env.AUTH_URL = process.env.NEXT_PUBLIC_APP_URL;
}
import Google from 'next-auth/providers/google';
import { PrismaAdapter } from '@auth/prisma-adapter';
import prisma from '@/lib/prisma';
import { generateUsername } from '@/lib/utils';

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  trustHost: true,
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  ],
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        // Fetch additional user fields
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: {
            username: true,
            theme: true,
            fontFamily: true,
            fontSize: true,
            cursorStyle: true,
            wordBankSize: true,
          },
        });
        if (dbUser) {
          session.user.username = dbUser.username;
          session.user.theme = dbUser.theme as Session['user']['theme'];
          session.user.fontFamily = dbUser.fontFamily as Session['user']['fontFamily'];
          session.user.fontSize = dbUser.fontSize as Session['user']['fontSize'];
          session.user.cursorStyle = dbUser.cursorStyle as Session['user']['cursorStyle'];
          session.user.wordBankSize = dbUser.wordBankSize as Session['user']['wordBankSize'];
        }
      }
      return session;
    },
  },
  events: {
    async createUser({ user }) {
      if (!user.id) return;

      const baseInput = user.name || user.email || 'typist';
      const baseUsername = generateUsername(baseInput);

      for (let attempt = 0; attempt < 10; attempt++) {
        const username =
          attempt === 0
            ? baseUsername
            : `${baseUsername.slice(0, 19)}_${randomUUID().replaceAll('-', '').slice(0, 4)}`;

        try {
          await prisma.user.update({
            where: { id: user.id },
            data: { username },
          });
          return;
        } catch (error) {
          if (
            typeof error !== 'object' ||
            error === null ||
            !('code' in error) ||
            error.code !== 'P2002'
          ) {
            throw error;
          }
        }
      }

      throw new Error(`Could not assign a unique username to user ${user.id}`);
    },
  },
});
