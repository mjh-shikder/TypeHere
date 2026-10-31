'use client';

import { useEffect, useRef } from 'react';
import { SessionProvider, useSession } from 'next-auth/react';
import { submitTestResultAction, syncGuestTestsAction } from '@/app/actions/test-actions';
import {
  getStoredSettings,
  getUnsyncedTests,
  markTestsSynced,
} from '@/lib/local-storage';
import { useTypingStore } from '@/store/useTypingStore';

function AuthRuntime() {
  const { data: session, status } = useSession();
  const hydrateSettings = useTypingStore((s) => s.hydrateSettings);
  const phase = useTypingStore((s) => s.phase);
  const summary = useTypingStore((s) => s.lastCompletedSummary);
  const telemetry = useTypingStore((s) => s.lastCompletedTelemetry);
  const submittedIdRef = useRef<string | null>(null);
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

  useEffect(() => {
    if (status !== 'authenticated' || syncedOnceRef.current) return;

    const unsynced = getUnsyncedTests().slice(0, 50);
    if (unsynced.length === 0) {
      syncedOnceRef.current = true;
      return;
    }

    syncedOnceRef.current = true;
    void syncGuestTestsAction(unsynced).then((result) => {
      if (result.success && result.syncedIds) {
        markTestsSynced(result.syncedIds);
      } else {
        syncedOnceRef.current = false;
      }
    });
  }, [status]);

  useEffect(() => {
    if (status !== 'authenticated' || phase !== 'finished' || !summary || !telemetry) {
      return;
    }
    if (submittedIdRef.current === summary.id) return;

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
    }).then((result) => {
      if (result.success) {
        markTestsSynced([summary.id]);
      } else {
        submittedIdRef.current = null;
      }
    });
  }, [status, phase, summary, telemetry]);

  return null;
}

export default function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AuthRuntime />
      {children}
    </SessionProvider>
  );
}
