'use client';

import { Fragment, useState, useEffect } from 'react';
import Link from 'next/link';
import type {
  TestDuration,
  LeaderboardTimeframe,
  LeaderboardEntry,
} from '@/types/typing';
import { formatNumber } from '@/lib/utils';
import UserAvatar from '@/components/profile/UserAvatar';
import { Trophy, Clock, Flame } from 'lucide-react';

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
  const [duration, setDuration] = useState<TestDuration>(60);
  const [timeframe, setTimeframe] = useState<LeaderboardTimeframe>('allTime');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
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
              <th className="w-14 sm:w-16 text-left text-xs font-medium px-4 sm:px-6 py-4" style={{ color: 'var(--text-typed)' }}>#</th>
              <th className="text-left text-xs font-medium px-4 sm:px-6 py-4" style={{ color: 'var(--text-typed)' }}>User</th>
              <th className="w-24 sm:w-32 text-right text-xs font-medium px-4 sm:px-6 py-4" style={{ color: 'var(--text-typed)' }}>WPM</th>
              <th className="w-24 sm:w-32 text-right text-xs font-medium px-4 sm:px-6 py-4 hidden sm:table-cell" style={{ color: 'var(--text-typed)' }}>Accuracy</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 10 }).map((_, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                  <td className="w-14 sm:w-16 px-4 sm:px-6 py-4">
                    <div className="w-6 h-4 rounded bg-white/5 animate-pulse" />
                  </td>
                  <td className="px-4 sm:px-6 py-4">
                    <div className="w-32 h-4 rounded bg-white/5 animate-pulse" />
                  </td>
                  <td className="w-24 sm:w-32 px-4 sm:px-6 py-4">
                    <div className="w-12 h-4 rounded bg-white/5 animate-pulse ml-auto" />
                  </td>
                  <td className="w-24 sm:w-32 px-4 sm:px-6 py-4 hidden sm:table-cell">
                    <div className="w-16 h-4 rounded bg-white/5 animate-pulse ml-auto" />
                  </td>
                </tr>
              ))
            ) : entries.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 sm:px-6 py-16 text-center">
                  <p className="text-sm" style={{ color: 'var(--text-typed)' }}>
                    No results yet. Be the first to set a record!
                  </p>
                </td>
              </tr>
            ) : (
              <>
                {entries.map((entry) => (
                  <Fragment key={entry.testId}>
                    <tr
                      className="hover:bg-white/[0.02] transition-colors"
                      style={{ borderBottom: '1px solid var(--glass-border)' }}
                    >
                      <td className="w-14 sm:w-16 px-4 sm:px-6 py-4 text-sm font-bold tabular-nums" style={getRankStyle(entry.rank)}>
                        {entry.rank}
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        {entry.isGuest ? (
                          <div className="flex items-center gap-2">
                            <span className="text-base" aria-hidden>👻</span>
                            <span
                              className="text-sm font-medium"
                              style={{ color: 'var(--text-typed)' }}
                            >
                              {entry.username}
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-3">
                            <UserAvatar
                              src={
                                entry.image
                                  ? `/api/users/${encodeURIComponent(entry.username)}/avatar`
                                  : null
                              }
                              name={entry.username}
                              className="w-7 h-7"
                            />
                            <Link
                              href={`/u/${entry.username}`}
                              className="text-sm font-medium hover:underline truncate max-w-[140px] sm:max-w-none"
                              style={{ color: 'var(--text-untyped)' }}
                            >
                              {entry.username}
                            </Link>
                          </div>
                        )}
                      </td>
                      <td
                        className="w-24 sm:w-32 px-4 sm:px-6 py-4 text-right text-sm font-bold tabular-nums"
                        style={{ color: entry.isGuest ? 'var(--text-untyped)' : 'var(--accent-primary)' }}
                      >
                        {Math.round(entry.rawWpm)}
                      </td>
                      <td
                        className="w-24 sm:w-32 px-4 sm:px-6 py-4 text-right text-sm tabular-nums hidden sm:table-cell"
                        style={{ color: 'var(--text-untyped)' }}
                      >
                        {formatNumber(entry.accuracy)}%
                      </td>
                    </tr>
                  </Fragment>
                ))}
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
    </div>
  );
}
