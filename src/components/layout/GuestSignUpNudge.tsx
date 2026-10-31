'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { signIn, useSession } from 'next-auth/react';
import { shouldShowNudge, markNudgeShown, hasStoredProgress } from '@/lib/local-storage';

export default function GuestSignUpNudge() {
  const { status } = useSession();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (status === 'authenticated') {
      setVisible(false);
      return;
    }
    if (status !== 'unauthenticated') return;

    if (hasStoredProgress() && shouldShowNudge()) {
      const timer = setTimeout(() => setVisible(true), 2000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  const handleDismiss = () => {
    markNudgeShown();
    setVisible(false);
  };

  const handleGoogleSignIn = () => {
    markNudgeShown();
    void signIn('google', { callbackUrl: '/' });
  };

  if (!visible || status === 'authenticated') return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="glass-panel rounded-2xl p-4 max-w-sm flex items-start gap-3">
        <div className="flex-1">
          <p className="text-sm font-medium" style={{ color: 'var(--text-untyped)' }}>
            Want to save your progress across devices? Sign up.
          </p>
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleGoogleSignIn}
              className="glass-pill px-4 py-1.5 text-xs font-semibold"
              style={{ color: 'var(--accent-primary)' }}
            >
              Sign up with Google
            </button>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="p-1 rounded-lg hover:bg-white/10 transition-colors"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" style={{ color: 'var(--text-typed)' }} />
        </button>
      </div>
    </div>
  );
}
