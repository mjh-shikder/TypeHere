'use client';

import { useEffect, useRef } from 'react';
import { SessionProvider, useSession } from 'next-auth/react';
import { Toaster } from 'sonner';
import { submitTestResultAction, syncGuestTestsAction, submitGuestTestAction } from '@/app/actions/test-actions';
import {
  getStoredSettings,
  getUnsyncedTests,
  markTestsSynced,
  getGuestId,
  getOrCreateGuestId,
  clearGuestId,
} from '@/lib/local-storage';
import { useTypingStore } from '@/store/useTypingStore';

function AuthRuntime() {
  const { data: session, status } = useSession();
  const hydrateSettings = useTypingStore((s) => s.hydrateSettings);
  const phase = useTypingStore((s) => s.phase);
  const summary = useTypingStore((s) => s.lastCompletedSummary);
  const telemetry = useTypingStore((s) => s.lastCompletedTelemetry);
  const setGuestSyncing = useTypingStore((s) => s.setGuestSyncing);
  const bumpGuestSyncVersion = useTypingStore((s) => s.bumpGuestSyncVersion);
  const submittedIdRef = useRef<string | null>(null);
  const guestSubmittedIdRef = useRef<string | null>(null);
  const syncedOnceRef = useRef(false);

  useEffect(() => {
    hydrateSettings(getStoredSettings());
  }, [hydrateSettings]);

  useEffect(() => {
    if (status !== 'authenticated' || !session?.user) return;
    hydrateSettings({
      theme: session.user.theme,
      fontFamily: session.user.fontFamily,
      fontSize: session.user.fontSize,
      cursorStyle: session.user.cursorStyle,
      wordBankSize: session.user.wordBankSize,
    });
  }, [status, session, hydrateSettings]);

  // Sync guest tests to DB on login, then clean up ghost entries
  useEffect(() => {
    if (status !== 'authenticated') {
      syncedOnceRef.current = false;
      return;
    }
    if (syncedOnceRef.current) return;

    const unsynced = getUnsyncedTests().slice(0, 50);
    const guestId = getGuestId();
    syncedOnceRef.current = true;

    if (unsynced.length === 0 && !guestId) {
      return;
    }

    setGuestSyncing(true);
    void syncGuestTestsAction(unsynced, guestId)
      .then((result) => {
        if (result.success) {
          if (result.syncedIds && result.syncedIds.length > 0) {
            markTestsSynced(result.syncedIds);
          }
          clearGuestId();
          setGuestSyncing(false);
          bumpGuestSyncVersion();
        } else {
          syncedOnceRef.current = false;
        }
      })
      .catch(() => {
        syncedOnceRef.current = false;
      })
      .finally(() => {
        setGuestSyncing(false);
      });
  }, [status, setGuestSyncing, bumpGuestSyncVersion]);

  // Submit authenticated test to DB
  useEffect(() => {
    if (status !== 'authenticated' || phase !== 'finished' || !summary || !telemetry) {
      return;
    }
    if (submittedIdRef.current === summary.id || guestSubmittedIdRef.current === summary.id) return;

    submittedIdRef.current = summary.id;
    void submitTestResultAction({
      duration: summary.duration,
      wpm: summary.wpm,
      rawWpm: summary.rawWpm,
      accuracy: summary.accuracy,
      consistency: summary.consistency,
      charactersTotal: summary.charactersTotal,
      charactersCorrect: summary.charactersCorrect,
      charactersWrong: summary.charactersWrong,
      charactersExtra: summary.charactersExtra,
      charactersMissed: summary.charactersMissed,
      timeline: summary.timeline,
      mistypedKeys: summary.mistypedKeys,
      telemetry,
    })
      .then((result) => {
        if (result.success) {
          markTestsSynced([summary.id]);
          bumpGuestSyncVersion();
        } else {
          submittedIdRef.current = null;
        }
      })
      .catch(() => {
        submittedIdRef.current = null;
      });
  }, [status, phase, summary, telemetry, bumpGuestSyncVersion]);

  // Submit guest test to public leaderboard (ghost user in DB)
  useEffect(() => {
    if (status !== 'unauthenticated' || phase !== 'finished' || !summary) {
      return;
    }
    if (guestSubmittedIdRef.current === summary.id) return;

    guestSubmittedIdRef.current = summary.id;
    const guestName = getOrCreateGuestId();

    void submitGuestTestAction({ guestName, summary })
      .then((result) => {
        if (result.success) {
          bumpGuestSyncVersion();
        } else {
          guestSubmittedIdRef.current = null;
        }
      })
      .catch(() => {
        guestSubmittedIdRef.current = null;
      });
  }, [status, phase, summary, bumpGuestSyncVersion]);

  return null;
}

export default function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AuthRuntime />
      {children}
      <Toaster
        position="bottom-center"
        theme="dark"
        toastOptions={{
          style: {
            background: 'rgba(var(--bg-canvas-rgb), 0.88)',
            border: '1px solid var(--glass-border)',
            color: 'var(--text-untyped)',
            backdropFilter: 'blur(16px)',
          },
        }}
      />
    </SessionProvider>
  );
}
