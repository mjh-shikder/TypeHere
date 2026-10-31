'use client';

import { useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useTypingStore } from '@/store/useTypingStore';
import { getPersonalBest } from '@/lib/local-storage';
import { interpolateGhostCharIndex } from '@/lib/metrics';
import WordStream from './WordStream';
import SmoothCaret from './SmoothCaret';
import PostTestSummary from './PostTestSummary';
import type { PerSecondStat, TestDuration } from '@/types/typing';

const DURATION_OPTIONS: { value: TestDuration; label: string }[] = [
  { value: 60, label: '1m' },
  { value: 180, label: '3m' },
  { value: 300, label: '5m' },
];

/**
 * TypingArena — Main typing test container
 * Contains mode pills, timer, word stream, hidden input, and post-test view
 */
export default function TypingArena() {
  const phase = useTypingStore((s) => s.phase);
  const duration = useTypingStore((s) => s.duration);
  const timeRemaining = useTypingStore((s) => s.timeRemaining);
  const setDuration = useTypingStore((s) => s.setDuration);
  const handleKeyPress = useTypingStore((s) => s.handleKeyPress);
  const resetTest = useTypingStore((s) => s.resetTest);
  const showGhost = useTypingStore((s) => s.showGhost);
  const ghostTimeline = useTypingStore((s) => s.ghostTimeline);
  const setShowGhost = useTypingStore((s) => s.setShowGhost);
  const setGhostTimeline = useTypingStore((s) => s.setGhostTimeline);
  const testStartTime = useTypingStore((s) => s.testStartTime);
  const { data: session } = useSession();

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const tabPressedRef = useRef(false);
  const [ghostCharIndex, setGhostCharIndex] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (useTypingStore.getState().words.length === 0) {
      resetTest();
    }
    setReady(true);
    inputRef.current?.focus();
  }, [resetTest]);

  useEffect(() => {
    if (phase !== 'idle' && phase !== 'finished') return;

    const localPb = getPersonalBest(duration);
    if (localPb?.timeline?.length) {
      setGhostTimeline(localPb.timeline);
    } else {
      setGhostTimeline(null);
    }

    const username = session?.user?.username;
    if (!username) return;

    void fetch(`/api/users/${username}/stats`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        const match = data?.personalBests?.find(
          (pb: { duration: number; timeline?: PerSecondStat[] }) => pb.duration === duration
        );
        if (Array.isArray(match?.timeline) && match.timeline.length > 0) {
          setGhostTimeline(match.timeline);
        }
      })
      .catch(() => {
        /* keep local PB */
      });
  }, [duration, phase, session?.user?.username, setGhostTimeline]);

  useEffect(() => {
    if (!showGhost || !ghostTimeline || phase !== 'typing' || !testStartTime) {
      setGhostCharIndex(0);
      return;
    }

    const tickGhost = () => {
      const elapsed = (performance.now() - testStartTime) / 1000;
      setGhostCharIndex(interpolateGhostCharIndex(ghostTimeline, elapsed));
    };

    tickGhost();
    const id = window.setInterval(tickGhost, 100);
    return () => window.clearInterval(id);
  }, [showGhost, ghostTimeline, phase, testStartTime]);

  useEffect(() => {
    const handleClick = () => {
      inputRef.current?.focus();
    };

    const handleGlobalKeydown = (e: KeyboardEvent) => {
      const target = e.target;
      if (target instanceof HTMLTextAreaElement) return;
      if (
        target instanceof HTMLInputElement &&
        target !== inputRef.current &&
        target.type !== 'hidden'
      ) {
        return;
      }

      if (e.key === 'Escape') {
        e.preventDefault();
        resetTest();
        inputRef.current?.focus();
        return;
      }

      if (e.key === 'Tab') {
        e.preventDefault();
        tabPressedRef.current = true;
        window.setTimeout(() => {
          tabPressedRef.current = false;
        }, 500);
        return;
      }

      if (e.key === 'Enter' && tabPressedRef.current) {
        e.preventDefault();
        resetTest();
        tabPressedRef.current = false;
        inputRef.current?.focus();
        return;
      }

      if (phase === 'finished') return;

      inputRef.current?.focus();

      if (e.ctrlKey && (e.key === 'v' || e.key === 'V')) {
        e.preventDefault();
        return;
      }

      if (e.key === 'Backspace' && (e.ctrlKey || e.altKey)) {
        e.preventDefault();
        handleKeyPress('ClearWord');
        return;
      }

      if (e.key === 'Backspace') {
        e.preventDefault();
        handleKeyPress('Backspace');
        return;
      }

      if (e.key === ' ') {
        e.preventDefault();
        handleKeyPress(' ');
        return;
      }

      if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        handleKeyPress(e.key);
      }
    };

    document.addEventListener('click', handleClick);
    document.addEventListener('keydown', handleGlobalKeydown);

    return () => {
      document.removeEventListener('click', handleClick);
      document.removeEventListener('keydown', handleGlobalKeydown);
    };
  }, [phase, resetTest, handleKeyPress]);

  // Format time remaining
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // If test is finished, show PostTestSummary
  if (phase === 'finished') {
    return <PostTestSummary />;
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4">
      {/* Mode Pills & Timer */}
      <div className="flex items-center justify-center gap-4 mb-12">
        {/* Duration Selector Pills */}
        <div className="flex items-center gap-1 glass-panel rounded-full p-1">
          {DURATION_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setDuration(opt.value)}
              className="glass-pill px-5 py-2 text-sm font-medium transition-all"
              data-active={duration === opt.value}
              disabled={phase === 'typing'}
              style={{
                color: duration === opt.value ? 'var(--accent-primary)' : 'var(--text-typed)',
                cursor: phase === 'typing' ? 'not-allowed' : 'pointer',
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
        {ghostTimeline && (
          <button
            onClick={() => setShowGhost(!showGhost)}
            className="glass-pill px-4 py-2 text-sm font-medium"
            data-active={showGhost}
            style={{ color: showGhost ? 'var(--accent-primary)' : 'var(--text-typed)' }}
          >
            Ghost PB
          </button>
        )}

        {/* Timer Display */}
        {phase === 'typing' && (
          <div
            className="text-3xl font-mono font-bold tabular-nums"
            style={{ color: 'var(--accent-primary)' }}
          >
            {formatTime(timeRemaining)}
          </div>
        )}
      </div>

      {/* Typing Arena */}
      <div
        ref={containerRef}
        className={`relative typing-arena glass-panel rounded-2xl p-8 ${
          phase === 'typing' ? 'typing-active' : ''
        }`}
      >
        {showGhost && ghostTimeline && (
          <SmoothCaret
            containerRef={containerRef}
            isGhost
            ghostCharIndex={ghostCharIndex}
          />
        )}
        <SmoothCaret containerRef={containerRef} />

        {ready && <WordStream />}

        {/* Hidden Input */}
        <input
          ref={inputRef}
          className="opacity-0 absolute w-0 h-0 pointer-events-none"
          onPaste={(e) => e.preventDefault()}
          onDrop={(e) => e.preventDefault()}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          tabIndex={0}
          aria-label="Typing input"
        />
      </div>

      {phase === 'idle' && (
        <p className="text-center mt-4 text-sm" style={{ color: 'var(--text-typed)' }}>
          Start typing to begin the test...
        </p>
      )}

      {/* Reset Hint */}
      <div className="flex justify-center mt-6">
        <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-typed)' }}>
          <kbd className="glass-pill px-2 py-0.5 text-[10px]">Tab</kbd>
          <span>+</span>
          <kbd className="glass-pill px-2 py-0.5 text-[10px]">Enter</kbd>
          <span className="mx-1">or</span>
          <kbd className="glass-pill px-2 py-0.5 text-[10px]">Esc</kbd>
          <span>— restart test</span>
        </div>
      </div>
    </div>
  );
}
