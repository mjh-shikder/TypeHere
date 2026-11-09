'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useTypingStore } from '@/store/useTypingStore';
import { formatNumber, formatDuration } from '@/lib/utils';
import { calculateActiveTypingSeconds } from '@/lib/metrics';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Scatter,
  ComposedChart,
} from 'recharts';
import { RotateCcw, Share2, Check } from 'lucide-react';
import { toast } from 'sonner';

async function copyTextToClipboard(text: string): Promise<boolean> {
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fall back to execCommand below when Clipboard API is restricted
    }
  }

  if (typeof document === 'undefined') return false;
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.top = '-9999px';
  textarea.style.left = '-9999px';
  document.body.appendChild(textarea);
  textarea.select();
  try {
    return document.execCommand('copy');
  } catch {
    return false;
  } finally {
    document.body.removeChild(textarea);
  }
}

/**
 * PostTestSummary — Displayed after test completion
 * Shows headline metrics, interactive Recharts performance graph,
 * mistyped key badges, and action buttons.
 */
export default function PostTestSummary() {
  const summary = useTypingStore((s) => s.lastCompletedSummary);
  const telemetry = useTypingStore((s) => s.lastCompletedTelemetry);
  const resetTest = useTypingStore((s) => s.resetTest);
  const timeline = useTypingStore((s) => s.perSecondTimeline);
  const tabPressedRef = useRef(false);
  const copiedTimeoutRef = useRef<number | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    return () => {
      if (copiedTimeoutRef.current !== null) {
        window.clearTimeout(copiedTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        resetTest();
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
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [resetTest]);

  const chartData = useMemo(() => {
    return timeline.map((point) => ({
      second: point.second,
      wpm: Math.round(point.rawWpm),
      errors: point.errors > 0 ? point.rawWpm : null,
    }));
  }, [timeline]);

  const topMistyped = useMemo(() => {
    if (!summary) return [];
    return Object.entries(summary.mistypedKeys)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);
  }, [summary]);

  if (!summary) return null;

  const activeSeconds = telemetry ? calculateActiveTypingSeconds(telemetry.events) : 0;

  const handleShare = async () => {
    const text = `TypeHere Result 🎯\n` +
      `WPM: ${formatNumber(summary.rawWpm, 0)} | Accuracy: ${formatNumber(summary.accuracy)}%\n` +
      `Duration: ${formatDuration(summary.duration)}\n` +
      `Characters: ${summary.charactersCorrect}✓ / ${summary.charactersWrong}✗ / ${summary.charactersExtra}+ / ${summary.charactersMissed}⊘`;

    const didCopy = await copyTextToClipboard(text);
    if (didCopy) {
      setCopied(true);
      if (copiedTimeoutRef.current !== null) {
        window.clearTimeout(copiedTimeoutRef.current);
      }
      copiedTimeoutRef.current = window.setTimeout(() => {
        setCopied(false);
      }, 2500);
      toast.success('Result copied to clipboard!');
    } else {
      toast.error('Could not copy result to clipboard.');
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 space-y-8">
      {/* Headline Metrics */}
      <div className="glass-panel rounded-2xl p-8">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
          {/* Primary: WPM */}
          <div className="col-span-2 md:col-span-1 text-center md:text-left">
            <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-typed)' }}>
              WPM
            </p>
            <p
              className="text-6xl font-bold tabular-nums"
              style={{ color: 'var(--accent-primary)' }}
            >
              {Math.round(summary.rawWpm)}
            </p>
          </div>

          {/* Primary: Accuracy */}
          <div className="text-center md:text-left">
            <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-typed)' }}>
              Accuracy
            </p>
            <p
              className="text-4xl font-bold tabular-nums"
              style={{ color: 'var(--text-untyped)' }}
            >
              {formatNumber(summary.accuracy)}%
            </p>
          </div>

          {/* Correct Characters */}
          <div className="text-center md:text-left">
            <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-typed)' }}>
              Correct Characters
            </p>
            <p
              className="text-4xl font-bold tabular-nums"
              style={{ color: '#4ade80' }}
            >
              {summary.charactersCorrect}
            </p>
          </div>

        </div>

        {/* Character Breakdown */}
        <div className="flex items-center justify-center gap-6 mt-6 pt-6" style={{ borderTop: '1px solid var(--glass-border)' }}>
          <div className="flex items-center gap-1.5">
            <span className="text-xs" style={{ color: 'var(--text-typed)' }}>Incorrect</span>
            <span className="text-sm font-semibold" style={{ color: 'var(--text-error)' }}>
              {summary.charactersWrong}
            </span>
          </div>
          <div className="text-xs" style={{ color: 'var(--glass-border)' }}>/</div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs" style={{ color: 'var(--text-typed)' }}>Extra</span>
            <span className="text-sm font-semibold" style={{ color: 'var(--text-error)' }}>
              {summary.charactersExtra}
            </span>
          </div>
          <div className="text-xs" style={{ color: 'var(--glass-border)' }}>/</div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs" style={{ color: 'var(--text-typed)' }}>Missed</span>
            <span className="text-sm font-semibold" style={{ color: 'var(--text-typed)' }}>
              {summary.charactersMissed}
            </span>
          </div>
          <div className="text-xs" style={{ color: 'var(--glass-border)' }}>|</div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs" style={{ color: 'var(--text-typed)' }}>Elapsed</span>
            <span className="text-sm font-semibold" style={{ color: 'var(--text-untyped)' }}>
              {formatDuration(summary.duration)}
            </span>
          </div>
          <div className="text-xs" style={{ color: 'var(--glass-border)' }}>|</div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs" style={{ color: 'var(--text-typed)' }}>Active</span>
            <span className="text-sm font-semibold" style={{ color: 'var(--text-untyped)' }}>
              {formatDuration(Math.max(1, Math.round(activeSeconds)))}
            </span>
          </div>
        </div>
      </div>

      {/* Performance Chart */}
      <div className="glass-panel rounded-2xl p-6">
        <h3
          className="text-sm font-medium mb-4"
          style={{ color: 'var(--text-typed)' }}
        >
          Performance Over Time
        </h3>
        <div className="w-full" style={{ height: '280px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.05)"
                vertical={false}
              />
              <XAxis
                dataKey="second"
                tick={{ fill: 'var(--text-typed)', fontSize: 11 }}
                axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                tickLine={false}
                label={{ value: 'Seconds', position: 'insideBottom', offset: -5, fill: 'var(--text-typed)', fontSize: 11 }}
              />
              <YAxis
                tick={{ fill: 'var(--text-typed)', fontSize: 11 }}
                axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                tickLine={false}
                label={{ value: 'WPM', angle: -90, position: 'insideLeft', fill: 'var(--text-typed)', fontSize: 11 }}
              />
              <Tooltip
                contentStyle={{
                  background: 'rgba(15, 23, 42, 0.9)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  backdropFilter: 'blur(20px)',
                  color: 'var(--text-untyped)',
                  fontSize: '12px',
                }}
                labelFormatter={(value) => `Second ${value}`}
              />
              {/* WPM Line */}
              <Line
                type="monotone"
                dataKey="wpm"
                stroke="var(--accent-primary)"
                strokeWidth={2}
                dot={false}
                name="WPM"
              />
              {/* Error Markers */}
              <Scatter
                dataKey="errors"
                fill="var(--text-error)"
                name="Errors"
                shape="circle"
                legendType="none"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Mistyped Keys */}
      {topMistyped.length > 0 && (
        <div className="glass-panel rounded-2xl p-6">
          <h3
            className="text-sm font-medium mb-4"
            style={{ color: 'var(--text-typed)' }}
          >
            Most Mistyped
          </h3>
          <div className="flex flex-wrap gap-2">
            {topMistyped.map(([key, count]) => (
              <div
                key={key}
                className="glass-pill px-3 py-1.5 flex items-center gap-2 text-sm"
              >
                <span className="font-mono" style={{ color: 'var(--text-error)' }}>
                  {key}
                </span>
                <span className="text-xs" style={{ color: 'var(--text-typed)' }}>
                  ×{count}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={resetTest}
          className="glass-pill px-6 py-3 flex items-center gap-2 font-medium"
          style={{ color: 'var(--accent-primary)' }}
        >
          <RotateCcw className="w-4 h-4" />
          Next Test
        </button>
        <button
          type="button"
          onClick={() => void handleShare()}
          data-active={copied}
          className="glass-pill px-6 py-3 flex items-center gap-2 font-medium cursor-pointer"
          style={{ color: copied ? 'var(--accent-primary)' : 'var(--text-typed)' }}
        >
          {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
          {copied ? 'Copied!' : 'Share'}
        </button>
      </div>

      {/* Reset Hint */}
      <div className="flex justify-center">
        <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-typed)' }}>
          <kbd className="glass-pill px-2 py-0.5 text-[10px]">Tab</kbd>
          <span>+</span>
          <kbd className="glass-pill px-2 py-0.5 text-[10px]">Enter</kbd>
          <span>— next test</span>
        </div>
      </div>
    </div>
  );
}
