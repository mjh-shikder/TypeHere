'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useTypingStore } from '@/store/useTypingStore';
import type { TestTelemetry, ReplaySpeed } from '@/types/typing';
import { X, Play, Pause, RotateCcw } from 'lucide-react';

interface GhostReplayModalProps {
  isOpen: boolean;
  onClose: () => void;
  telemetryOverride?: TestTelemetry | null;
}

const SPEED_OPTIONS: ReplaySpeed[] = [1, 1.5, 2];

/**
 * GhostReplayModal — Interactive character-by-character replay of a typing test
 * Supports play/pause, speed toggles, and timeline scrubbing
 */
export default function GhostReplayModal({
  isOpen,
  onClose,
  telemetryOverride,
}: GhostReplayModalProps) {
  const storeTelemetry = useTypingStore((s) => s.lastCompletedTelemetry);
  const telemetry = telemetryOverride === undefined ? storeTelemetry : telemetryOverride;
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [speed, setSpeed] = useState<ReplaySpeed>(1);
  const [typedText, setTypedText] = useState('');
  const animFrameRef = useRef<number | null>(null);
  const lastFrameTime = useRef<number>(0);

  // Build the expected text from words
  const fullText = telemetry ? telemetry.words.join(' ') : '';

  // Process events up to currentTime
  const processEvents = useCallback(
    (time: number) => {
      if (!telemetry) return;

      let text = '';
      const activeEvents = telemetry.events.filter((e) => e.t <= time);

      for (const event of activeEvents) {
        if (event.k === 'Backspace') {
          text = text.slice(0, -1);
        } else if (event.k === 'ClearWord') {
          // Find last space and clear to it
          const lastSpace = text.lastIndexOf(' ');
          text = lastSpace >= 0 ? text.slice(0, lastSpace + 1) : '';
        } else if (event.k === 'Space') {
          text += ' ';
        } else if (event.k.length === 1) {
          text += event.k;
        }
      }

      setTypedText(text);
    },
    [telemetry]
  );

  // Animation loop
  useEffect(() => {
    if (!isPlaying || !telemetry) return;

    const maxTime = telemetry.duration * 1000;

    const animate = (timestamp: number) => {
      if (!lastFrameTime.current) {
        lastFrameTime.current = timestamp;
      }

      const delta = (timestamp - lastFrameTime.current) * speed;
      lastFrameTime.current = timestamp;

      setCurrentTime((prev) => {
        const next = prev + delta;
        if (next >= maxTime) {
          setIsPlaying(false);
          return maxTime;
        }
        return next;
      });

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
      lastFrameTime.current = 0;
    };
  }, [isPlaying, speed, telemetry]);

  // Process events when currentTime changes
  useEffect(() => {
    processEvents(currentTime);
  }, [currentTime, processEvents]);

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setCurrentTime(0);
      setIsPlaying(false);
      setTypedText('');
      setSpeed(1);
    }
  }, [isOpen]);

  if (!isOpen || !telemetry) return null;

  const maxTime = telemetry.duration * 1000;
  const progress = (currentTime / maxTime) * 100;

  const handleScrub = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = (parseFloat(e.target.value) / 100) * maxTime;
    setCurrentTime(time);
    lastFrameTime.current = 0;
  };

  const handlePlayPause = () => {
    if (currentTime >= maxTime) {
      setCurrentTime(0);
      lastFrameTime.current = 0;
    }
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setCurrentTime(0);
    setIsPlaying(false);
    setTypedText('');
    lastFrameTime.current = 0;
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative glass-panel rounded-2xl p-8 max-w-3xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold" style={{ color: 'var(--text-untyped)' }}>
            Ghost Replay
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" style={{ color: 'var(--text-typed)' }} />
          </button>
        </div>

        {/* Replay Text Display */}
        <div
          className="glass-panel rounded-xl p-6 mb-6 font-mono text-lg leading-relaxed overflow-hidden"
          style={{ minHeight: '120px' }}
        >
          {fullText.split('').map((char, i) => {
            const isTyped = i < typedText.length;
            const isCorrect = isTyped && typedText[i] === char;
            const isIncorrect = isTyped && typedText[i] !== char;

            return (
              <span
                key={i}
                className={
                  isCorrect ? 'char-typed' :
                  isIncorrect ? 'char-error' :
                  'char-untyped'
                }
              >
                {char}
              </span>
            );
          })}
        </div>

        {/* Timeline Scrubber */}
        <div className="mb-4">
          <input
            type="range"
            min="0"
            max="100"
            step="0.1"
            value={progress}
            onChange={handleScrub}
            className="w-full h-1 rounded-full appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, var(--accent-primary) ${progress}%, rgba(255,255,255,0.1) ${progress}%)`,
            }}
          />
          <div className="flex justify-between text-xs mt-1" style={{ color: 'var(--text-typed)' }}>
            <span>{(currentTime / 1000).toFixed(1)}s</span>
            <span>{telemetry.duration}s</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          {/* Reset */}
          <button
            onClick={handleReset}
            className="glass-pill p-2"
            aria-label="Reset"
          >
            <RotateCcw className="w-4 h-4" style={{ color: 'var(--text-typed)' }} />
          </button>

          {/* Play/Pause */}
          <button
            onClick={handlePlayPause}
            className="glass-pill p-3"
            style={{ color: 'var(--accent-primary)' }}
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5" />
            ) : (
              <Play className="w-5 h-5" />
            )}
          </button>

          {/* Speed Toggles */}
          <div className="flex items-center gap-1">
            {SPEED_OPTIONS.map((s) => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className="glass-pill px-3 py-1.5 text-xs font-medium"
                data-active={speed === s}
                style={{
                  color: speed === s ? 'var(--accent-primary)' : 'var(--text-typed)',
                }}
              >
                {s}×
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
