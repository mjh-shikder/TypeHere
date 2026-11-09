'use client';

import { Fragment, useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import type {
  TestDuration,
  LeaderboardTimeframe,
  LeaderboardEntry,
} from '@/types/typing';
import { formatNumber } from '@/lib/utils';
import { getGuestId } from '@/lib/local-storage';
import { useTypingStore } from '@/store/useTypingStore';
import UserAvatar from '@/components/profile/UserAvatar';
import { Trophy, Clock, Flame, ChevronLeft, ChevronRight } from 'lucide-react';

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

function getPageNumbers(currentPage: number, totalPages: number): (number | 'ellipsis')[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages: (number | 'ellipsis')[] = [1];
  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);

  if (start > 2) pages.push('ellipsis');
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }
  if (end < totalPages - 1) pages.push('ellipsis');
  pages.push(totalPages);

  return pages;
}

/**
 * LeaderboardTable — Global rankings display
 * Filterable by duration (1m/3m/5m) and timeframe (All-Time/Weekly/Daily)
 */
export default function LeaderboardTable() {
  const { data: session, status } = useSession();
  const [duration, setDuration] = useState<TestDuration>(60);
  const [timeframe, setTimeframe] = useState<LeaderboardTimeframe>('allTime');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [myRank, setMyRank] = useState<number | null>(null);
  const [guestId, setGuestId] = useState<string | null>(null);
  const isGuestSyncing = useTypingStore((s) => s.isGuestSyncing);
  const guestSyncVersion = useTypingStore((s) => s.guestSyncVersion);
  const limit = 20;

  useEffect(() => {
    setGuestId(getGuestId());
  }, [status, guestSyncVersion]);

  useEffect(() => {
    if (isGuestSyncing) {
      setLoading(true);
      return;
    }

    let cancelled = false;
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        const currentGuestId = getGuestId();
        setGuestId(currentGuestId);

        const params = new URLSearchParams({
          duration: String(duration),
          timeframe,
          page: String(page),
          limit: String(limit),
        });
        if (currentGuestId && status !== 'authenticated') {
          params.set('guestId', currentGuestId);
        }

        const res = await fetch(`/api/leaderboard?${params.toString()}`, {
          cache: 'no-store',
        });
        if (res.ok && !cancelled) {
          const data = await res.json();
          setEntries(data.entries || []);
          setTotalCount(data.totalCount || 0);
          setMyRank(typeof data.myRank === 'number' ? data.myRank : null);
        }
      } catch {
        // Silently fail — show empty state
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void fetchLeaderboard();
    return () => {
      cancelled = true;
    };
  }, [duration, timeframe, page, status, isGuestSyncing, guestSyncVersion]);

  const isOwnEntry = (entry: LeaderboardEntry): boolean => {
    if (status === 'authenticated' && session?.user) {
      if (entry.isGuest) return false;
      if (session.user.id && entry.userId === session.user.id) return true;
      if (session.user.username && entry.username === session.user.username) return true;
      return false;
    }
    return Boolean(entry.isGuest && guestId && entry.username === guestId);
  };

  const totalPages = Math.max(1, Math.ceil(totalCount / limit));
  const myPage = myRank !== null ? Math.ceil(myRank / limit) : null;
  const pageNumbers = getPageNumbers(page, totalPages);
  const startItem = totalCount === 0 ? 0 : (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, totalCount);

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
              onClick={() => {
                setDuration(opt.value);
                setPage(1);
              }}
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
              onClick={() => {
                setTimeframe(opt.value);
                setPage(1);
              }}
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
                {entries.map((entry) => {
                  const isOwn = isOwnEntry(entry);

                  return (
                    <Fragment key={entry.testId}>
                      <tr
                        aria-current={isOwn ? 'true' : undefined}
                        className={isOwn ? 'transition-colors' : 'hover:bg-white/[0.02] transition-colors'}
                        style={
                          isOwn
                            ? {
                                borderBottom: '1px solid rgba(var(--accent-primary-rgb), 0.3)',
                                background: 'rgba(var(--accent-primary-rgb), 0.12)',
                                boxShadow:
                                  'inset 3px 0 0 var(--accent-primary), inset 0 1px 0 rgba(var(--accent-primary-rgb), 0.2), inset 0 -1px 0 rgba(var(--accent-primary-rgb), 0.2)',
                              }
                            : { borderBottom: '1px solid var(--glass-border)' }
                        }
                      >
                        <td className="w-14 sm:w-16 px-4 sm:px-6 py-4 text-sm font-bold tabular-nums" style={getRankStyle(entry.rank)}>
                          {entry.rank}
                        </td>
                        <td className="px-4 sm:px-6 py-4">
                          {entry.isGuest ? (
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="text-base shrink-0" aria-hidden>👻</span>
                              <span
                                className={`text-sm truncate ${isOwn ? 'font-semibold' : 'font-medium'}`}
                                style={{ color: isOwn ? 'var(--text-untyped)' : 'var(--text-typed)' }}
                              >
                                {entry.username}
                              </span>
                              {isOwn && (
                                <span
                                  className="text-[11px] font-semibold px-2 py-0.5 rounded-full shrink-0"
                                  style={{
                                    background: 'rgba(var(--accent-primary-rgb), 0.2)',
                                    color: 'var(--accent-primary)',
                                    border: '1px solid rgba(var(--accent-primary-rgb), 0.35)',
                                  }}
                                >
                                  You
                                </span>
                              )}
                            </div>
                          ) : (
                            <div className="flex items-center gap-3 min-w-0">
                              <UserAvatar
                                src={
                                  entry.image
                                    ? `/api/users/${encodeURIComponent(entry.username)}/avatar`
                                    : null
                                }
                                name={entry.username}
                                className="w-7 h-7 shrink-0"
                              />
                              <Link
                                href={`/u/${entry.username}`}
                                className={`text-sm hover:underline truncate max-w-[140px] sm:max-w-none ${
                                  isOwn ? 'font-semibold' : 'font-medium'
                                }`}
                                style={{ color: 'var(--text-untyped)' }}
                              >
                                {entry.username}
                              </Link>
                              {isOwn && (
                                <span
                                  className="text-[11px] font-semibold px-2 py-0.5 rounded-full shrink-0"
                                  style={{
                                    background: 'rgba(var(--accent-primary-rgb), 0.2)',
                                    color: 'var(--accent-primary)',
                                    border: '1px solid rgba(var(--accent-primary-rgb), 0.35)',
                                  }}
                                >
                                  You
                                </span>
                              )}
                            </div>
                          )}
                        </td>
                        <td
                          className="w-24 sm:w-32 px-4 sm:px-6 py-4 text-right text-sm font-bold tabular-nums"
                          style={{
                            color: isOwn || !entry.isGuest ? 'var(--accent-primary)' : 'var(--text-untyped)',
                          }}
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
                  );
                })}
              </>
            )}
          </tbody>
        </table>
      </div>

      {!loading && totalCount > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 text-xs" style={{ color: 'var(--text-typed)' }}>
            <span>
              Showing <span style={{ color: 'var(--text-untyped)' }}>{startItem}–{endItem}</span> of{' '}
              <span style={{ color: 'var(--text-untyped)' }}>{totalCount}</span>
            </span>
            {myRank !== null && myPage !== null && myPage !== page && (
              <button
                type="button"
                onClick={() => setPage(myPage)}
                className="glass-pill px-3 py-1 text-xs font-medium cursor-pointer"
                style={{ color: 'var(--accent-primary)' }}
              >
                Your rank #{myRank} · Page {myPage}
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              className="glass-pill px-3 py-1.5 text-sm flex items-center gap-1"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              style={{
                color: 'var(--text-untyped)',
                opacity: page <= 1 ? 0.4 : 1,
                cursor: page <= 1 ? 'not-allowed' : 'pointer',
              }}
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Prev</span>
            </button>

            <div className="flex items-center gap-1">
              {pageNumbers.map((item, idx) =>
                item === 'ellipsis' ? (
                  <span
                    key={`ellipsis-${idx}`}
                    className="px-2 text-xs select-none"
                    style={{ color: 'var(--text-typed)' }}
                  >
                    …
                  </span>
                ) : (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setPage(item)}
                    data-active={page === item}
                    className="glass-pill min-w-[2.25rem] px-3 py-1.5 text-xs font-medium tabular-nums cursor-pointer"
                    style={{
                      color: page === item ? 'var(--accent-primary)' : 'var(--text-typed)',
                    }}
                    aria-current={page === item ? 'page' : undefined}
                  >
                    {item}
                  </button>
                )
              )}
            </div>

            <button
              type="button"
              className="glass-pill px-3 py-1.5 text-sm flex items-center gap-1"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              style={{
                color: 'var(--text-untyped)',
                opacity: page >= totalPages ? 0.4 : 1,
                cursor: page >= totalPages ? 'not-allowed' : 'pointer',
              }}
              aria-label="Next page"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
