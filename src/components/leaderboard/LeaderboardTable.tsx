'use client';

import { Fragment, useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import type {
  TestDuration,
  LeaderboardTimeframe,
  LeaderboardEntry,
  LocalTestSummary,
  TestTelemetry,
} from '@/types/typing';
import { formatNumber } from '@/lib/utils';
import { getPersonalBest } from '@/lib/local-storage';
import GhostReplayModal from '@/components/typing/GhostReplayModal';
import { Trophy, Clock, Flame, Play } from 'lucide-react';

const DURATION_OPTIONS: { value: TestDuration; label: string }[] = [
  { value: 60, label: '1 min' },
  { value: 180, label: '3 min' },
  { value: 300, label: '5 min' },
];

const TIMEFRAME_OPTIONS: { value: LeaderboardTimeframe; label: string; icon: React.ReactNode }[] = [
  { value: 'allTime', label: 'All Time', icon: <Trophy className="w-3.5 h-3.5" /> },
  { value: 'weekly', label: 'Weekly', icon: <Clock className="w-3.5 h-3.5" /> },
  { value: 'daily', label: 'Daily', icon: <Flame className="w-3.5 h-3.5" /> },
];

/**
 * LeaderboardTable — Global rankings display
 * Filterable by duration (1m/3m/5m) and timeframe (All-Time/Weekly/Daily)
 */
export default function LeaderboardTable() {
  const { status } = useSession();
  const [duration, setDuration] = useState<TestDuration>(60);
  const [timeframe, setTimeframe] = useState<LeaderboardTimeframe>('allTime');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [replayOpen, setReplayOpen] = useState(false);
  const [replayTelemetry, setReplayTelemetry] = useState<TestTelemetry | null>(null);
  const [replayError, setReplayError] = useState<string | null>(null);
  const [guestPb, setGuestPb] = useState<LocalTestSummary | null>(null);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const limit = 50;

  useEffect(() => {
    setPage(1);
  }, [duration, timeframe]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/leaderboard?duration=${duration}&timeframe=${timeframe}&page=${page}&limit=${limit}`
        );
        if (res.ok) {
          const data = await res.json();
          setEntries(data.entries || []);
          setTotalCount(data.totalCount || 0);
        }
      } catch {
        // Silently fail — show empty state
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [duration, timeframe, page]);

  useEffect(() => {
    if (status === 'authenticated') {
      setGuestPb(null);
      return;
    }
    setGuestPb(getPersonalBest(duration));
  }, [duration, status]);

  const guestRank = useMemo(() => {
    if (!guestPb) return null;
    let rank = 1;
    for (const entry of entries) {
      if (
        entry.wpm > guestPb.wpm ||
        (entry.wpm === guestPb.wpm && entry.accuracy > guestPb.accuracy)
      ) {
        rank += 1;
      } else {
        break;
      }
    }
    return rank;
  }, [entries, guestPb]);

  const openReplay = async (testId: string) => {
    setReplayError(null);
    try {
      const res = await fetch(`/api/replay/${testId}`);
      if (!res.ok) {
        setReplayError('Replay is not available for this run.');
        return;
      }
      const data = await res.json();
      if (!data.telemetry) {
        setReplayError('This run has no keystroke replay (guest-synced tests are summary-only).');
        return;
      }
      setReplayTelemetry(data.telemetry as TestTelemetry);
      setReplayOpen(true);
    } catch {
      setReplayError('Failed to load replay.');
    }
  };

  const getRankStyle = (rank: number) => {
    if (rank === 1) return { color: '#ffd700' }; // Gold
    if (rank === 2) return { color: '#c0c0c0' }; // Silver
    if (rank === 3) return { color: '#cd7f32' }; // Bronze
    return { color: 'var(--text-typed)' };
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Duration Filter */}
        <div className="flex items-center gap-1 glass-panel rounded-full p-1">
          {DURATION_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setDuration(opt.value)}
              className="glass-pill px-4 py-2 text-sm font-medium"
              data-active={duration === opt.value}
              style={{
                color: duration === opt.value ? 'var(--accent-primary)' : 'var(--text-typed)',
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Timeframe Filter */}
        <div className="flex items-center gap-1 glass-panel rounded-full p-1">
          {TIMEFRAME_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setTimeframe(opt.value)}
              className="glass-pill px-4 py-2 text-sm font-medium flex items-center gap-1.5"
              data-active={timeframe === opt.value}
              style={{
                color: timeframe === opt.value ? 'var(--accent-primary)' : 'var(--text-typed)',
              }}
            >
              {opt.icon}
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="glass-panel rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
              <th className="text-left text-xs font-medium px-6 py-4" style={{ color: 'var(--text-typed)' }}>#</th>
              <th className="text-left text-xs font-medium px-6 py-4" style={{ color: 'var(--text-typed)' }}>User</th>
              <th className="text-right text-xs font-medium px-6 py-4" style={{ color: 'var(--text-typed)' }}>WPM</th>
              <th className="text-right text-xs font-medium px-6 py-4 hidden sm:table-cell" style={{ color: 'var(--text-typed)' }}>Accuracy</th>
              <th className="text-right text-xs font-medium px-6 py-4 hidden md:table-cell" style={{ color: 'var(--text-typed)' }}>Consistency</th>
              <th className="text-right text-xs font-medium px-6 py-4" style={{ color: 'var(--text-typed)' }}>Replay</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              // Loading skeleton
              Array.from({ length: 10 }).map((_, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                  <td className="px-6 py-4">
                    <div className="w-6 h-4 rounded bg-white/5 animate-pulse" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="w-32 h-4 rounded bg-white/5 animate-pulse" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="w-12 h-4 rounded bg-white/5 animate-pulse ml-auto" />
                  </td>
                  <td className="px-6 py-4 hidden sm:table-cell">
                    <div className="w-16 h-4 rounded bg-white/5 animate-pulse ml-auto" />
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    <div className="w-16 h-4 rounded bg-white/5 animate-pulse ml-auto" />
                  </td>
                </tr>
              ))
            ) : entries.length === 0 && !guestPb ? (
              <tr>
                <td colSpan={6} className="px-6 py-16 text-center">
                  <p className="text-sm" style={{ color: 'var(--text-typed)' }}>
                    No results yet. Be the first to set a record!
                  </p>
                </td>
              </tr>
            ) : (
              <>
                {entries.map((entry) => (
                  <Fragment key={entry.testId}>
                    {guestPb && guestRank === entry.rank && (
                      <GuestComparisonRow
                        rank={guestRank}
                        wpm={guestPb.wpm}
                        accuracy={guestPb.accuracy}
                        consistency={guestPb.consistency}
                      />
                    )}
                    <tr
                      className="hover:bg-white/[0.02] transition-colors"
                      style={{ borderBottom: '1px solid var(--glass-border)' }}
                    >
                      <td className="px-6 py-4 text-sm font-bold tabular-nums" style={getRankStyle(entry.rank)}>
                        {entry.rank}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {entry.image && (
                            <img
                              src={entry.image}
                              alt=""
                              className="w-7 h-7 rounded-full"
                            />
                          )}
                          <Link
                            href={`/u/${entry.username}`}
                            className="text-sm font-medium hover:underline"
                            style={{ color: 'var(--text-untyped)' }}
                          >
                            {entry.username}
                          </Link>
                        </div>
                      </td>
                      <td
                        className="px-6 py-4 text-right text-sm font-bold tabular-nums"
                        style={{ color: 'var(--accent-primary)' }}
                      >
                        {Math.round(entry.wpm)}
                      </td>
                      <td
                        className="px-6 py-4 text-right text-sm tabular-nums hidden sm:table-cell"
                        style={{ color: 'var(--text-untyped)' }}
                      >
                        {formatNumber(entry.accuracy)}%
                      </td>
                      <td
                        className="px-6 py-4 text-right text-sm tabular-nums hidden md:table-cell"
                        style={{ color: 'var(--text-typed)' }}
                      >
                        {formatNumber(entry.consistency)}%
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => void openReplay(entry.testId)}
                          className="glass-pill p-2"
                          aria-label={`Watch replay for ${entry.username}`}
                        >
                          <Play className="w-3.5 h-3.5" style={{ color: 'var(--text-untyped)' }} />
                        </button>
                      </td>
                    </tr>
                  </Fragment>
                ))}
                {guestPb && guestRank !== null && (entries.length === 0 || guestRank > entries.length) && (
                  <GuestComparisonRow
                    rank={guestRank}
                    wpm={guestPb.wpm}
                    accuracy={guestPb.accuracy}
                    consistency={guestPb.consistency}
                    belowFold={entries.length > 0 && guestRank > entries.length}
                  />
                )}
              </>
            )}
          </tbody>
        </table>
      </div>

      {totalCount > limit && (
        <div className="flex items-center justify-center gap-3">
          <button
            className="glass-pill px-4 py-2 text-sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            style={{ color: 'var(--text-untyped)', opacity: page <= 1 ? 0.4 : 1 }}
          >
            Previous
          </button>
          <span className="text-xs" style={{ color: 'var(--text-typed)' }}>
            Page {page} of {Math.max(1, Math.ceil(totalCount / limit))}
          </span>
          <button
            className="glass-pill px-4 py-2 text-sm"
            disabled={page >= Math.ceil(totalCount / limit)}
            onClick={() => setPage((p) => p + 1)}
            style={{
              color: 'var(--text-untyped)',
              opacity: page >= Math.ceil(totalCount / limit) ? 0.4 : 1,
            }}
          >
            Next
          </button>
        </div>
      )}

      {replayError && (
        <p className="text-sm text-center" style={{ color: 'var(--text-error)' }}>
          {replayError}
        </p>
      )}

      {guestPb && status !== 'authenticated' && (
        <p className="text-sm text-center" style={{ color: 'var(--text-typed)' }}>
          Sign in to claim your highlighted personal-best rank on the global board.
        </p>
      )}

      <GhostReplayModal
        isOpen={replayOpen}
        onClose={() => setReplayOpen(false)}
        telemetryOverride={replayTelemetry}
      />
    </div>
  );
}

function GuestComparisonRow({
  rank,
  wpm,
  accuracy,
  consistency,
  belowFold = false,
}: {
  rank: number;
  wpm: number;
  accuracy: number;
  consistency: number;
  belowFold?: boolean;
}) {
  return (
    <tr
      style={{
        borderBottom: '1px solid var(--glass-border)',
        background: 'rgba(var(--accent-primary-rgb), 0.08)',
      }}
    >
      <td className="px-6 py-4 text-sm font-bold tabular-nums" style={{ color: 'var(--accent-primary)' }}>
        {belowFold ? `${rank}+` : rank}
      </td>
      <td className="px-6 py-4">
        <Link href="/login" className="text-sm font-medium" style={{ color: 'var(--accent-primary)' }}>
          You (guest PB) — sign in to claim
        </Link>
      </td>
      <td className="px-6 py-4 text-right text-sm font-bold tabular-nums" style={{ color: 'var(--accent-primary)' }}>
        {Math.round(wpm)}
      </td>
      <td className="px-6 py-4 text-right text-sm tabular-nums hidden sm:table-cell" style={{ color: 'var(--text-untyped)' }}>
        {formatNumber(accuracy)}%
      </td>
      <td className="px-6 py-4 text-right text-sm tabular-nums hidden md:table-cell" style={{ color: 'var(--text-typed)' }}>
        {formatNumber(consistency)}%
      </td>
      <td />
    </tr>
  );
}
