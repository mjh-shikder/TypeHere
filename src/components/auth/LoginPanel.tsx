'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
import { Keyboard } from 'lucide-react';

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4" aria-hidden="true">
      <path
        fill="currentColor"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="currentColor"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="currentColor"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="currentColor"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

export default function LoginPanel() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated') {
      router.replace('/');
    }
  }, [status, router]);

  return (
    <div className="glass-panel rounded-2xl p-8 w-full max-w-md">
      <div className="flex items-center justify-center gap-2 mb-2">
        <Keyboard className="w-6 h-6" style={{ color: 'var(--accent-primary)' }} />
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-untyped)' }}>
          Sign in to TypeHere
        </h1>
      </div>
      <p className="text-sm text-center mb-8" style={{ color: 'var(--text-typed)' }}>
        Save tests across devices, claim a leaderboard spot, and keep full ghost replays.
      </p>

      <div className="space-y-3">
        <button
          onClick={() => signIn('google', { callbackUrl: '/' })}
          className="glass-pill w-full px-4 py-3 flex items-center justify-center gap-2 font-medium"
          style={{ color: 'var(--text-untyped)' }}
        >
          <GoogleIcon />
          Continue with Google
        </button>
        <button
          onClick={() => signIn('github', { callbackUrl: '/' })}
          className="glass-pill w-full px-4 py-3 flex items-center justify-center gap-2 font-medium"
          style={{ color: 'var(--text-untyped)' }}
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4" aria-hidden="true" fill="currentColor">
            <path d="M12 .3a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2.2c-3.3.7-4-1.6-4-1.6-.5-1.4-1.3-1.8-1.3-1.8-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1.1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.5-1.3-5.5-6a4.6 4.6 0 0 1 1.2-3.2 4.3 4.3 0 0 1 .1-3.2s1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2a4.3 4.3 0 0 1 .1 3.2 4.6 4.6 0 0 1 1.2 3.2c0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0 0 12 .3z" />
          </svg>
          Continue with GitHub
        </button>
      </div>
    </div>
  );
}
