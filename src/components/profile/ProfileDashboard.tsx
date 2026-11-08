'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import type { LocalTestSummary, TestDuration } from '@/types/typing';
import { getStoredTests, getAllPersonalBests } from '@/lib/local-storage';
import { formatNumber, formatDuration } from '@/lib/utils';
import { updateUserSettingsAction } from '@/app/actions/user-actions';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Trophy, Clock, Target, Zap } from 'lucide-react';

/**
 * ProfileDashboard — Universal profile page
 * Works for both Guest (localStorage) and authenticated (DB) users
 */
export default function ProfileDashboard() {
  const { data: session, status, update } = useSession();
  const [tests, setTests] = useState<LocalTestSummary[]>([]);
  const [personalBests, setPersonalBests] = useState<Record<TestDuration, LocalTestSummary | null>>({
    60: null,
    180: null,
    300: null,
  });
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [settingsMessage, setSettingsMessage] = useState<string | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    setTests(getStoredTests());
    setPersonalBests(getAllPersonalBests());
  }, []);

  useEffect(() => {
    if (session?.user?.username) {
      setUsername(session.user.username);
    }
  }, [session]);

  useEffect(() => {
    const usernameKey = session?.user?.username;
    if (status !== 'authenticated' || !usernameKey) return;

    void fetch(`/api/users/${usernameKey}/stats`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data) return;
        if (typeof data.user?.bio === 'string') {
          setBio(data.user.bio);
        }

        const nextPBs: Record<TestDuration, LocalTestSummary | null> = {
          60: null,
          180: null,
          300: null,
        };
        for (const pb of data.personalBests ?? []) {
          if (pb?.rawWpm && (pb.duration === 60 || pb.duration === 180 || pb.duration === 300)) {
            nextPBs[pb.duration as TestDuration] = {
              id: `${pb.duration}-pb`,
              duration: pb.duration,
              wpm: pb.rawWpm,
              rawWpm: pb.rawWpm ?? 0,
              accuracy: pb.accuracy ?? 0,
              consistency: pb.consistency ?? 0,
              charactersTotal: 0,
              charactersCorrect: 0,
              charactersWrong: 0,
              charactersExtra: 0,
              charactersMissed: 0,
              timeline: Array.isArray(pb.timeline) ? pb.timeline : [],
              mistypedKeys: {},
              createdAt: pb.createdAt ?? new Date().toISOString(),
            };
          }
        }
        setPersonalBests(nextPBs);

        if (Array.isArray(data.recentTests)) {
          setTests(
            data.recentTests.map((test: {
              id: string;
              duration: TestDuration;
              wpm: number;
              rawWpm: number;
              accuracy: number;
              consistency: number;
              createdAt: string;
            }) => ({
              id: test.id,
              duration: test.duration,
              wpm: test.wpm,
              rawWpm: test.rawWpm,
              accuracy: test.accuracy,
              consistency: test.consistency,
              charactersTotal: 0,
              charactersCorrect: 0,
              charactersWrong: 0,
              charactersExtra: 0,
              charactersMissed: 0,
              timeline: [],
              mistypedKeys: {},
              createdAt: test.createdAt,
            }))
          );
        }
      });
  }, [status, session?.user?.username]);

  // Aggregate stats
  const stats = useMemo(() => {
    if (tests.length === 0) return null;

    const totalTests = tests.length;
    const totalTime = tests.reduce((sum, t) => sum + t.duration, 0);
    const avgWpm = tests.reduce((sum, t) => sum + t.rawWpm, 0) / totalTests;
    const avgAccuracy = tests.reduce((sum, t) => sum + t.accuracy, 0) / totalTests;

    return { totalTests, totalTime, avgWpm, avgAccuracy };
  }, [tests]);

  // WPM trend chart data (last 20 tests, reversed to show chronological order)
  const trendData = useMemo(() => {
    return tests
      .slice(0, 20)
      .reverse()
      .map((t, i) => ({
        test: i + 1,
        wpm: Math.round(t.rawWpm),
        accuracy: Math.round(t.accuracy),
      }));
  }, [tests]);

  const pbDurations: TestDuration[] = [60, 180, 300];

  const handleSaveProfile = async () => {
    setSettingsMessage(null);
    setSavingProfile(true);
    try {
      const result = await updateUserSettingsAction({
        username: username || undefined,
        bio,
      });
      if (result.error) {
        setSettingsMessage(result.error);
        return;
      }

      if (result.username) setUsername(result.username);
      await update();
      setSettingsMessage('Profile saved.');
    } catch (error) {
      console.error('Failed to save profile settings:', error);
      setSettingsMessage('Could not save your profile. Please try again.');
    } finally {
      setSavingProfile(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      {status === 'authenticated' && (
        <div className="glass-panel rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-medium" style={{ color: 'var(--text-typed)' }}>
            Account settings
          </h3>
          <label className="block">
            <span className="text-xs" style={{ color: 'var(--text-typed)' }}>Username</span>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase())}
              className="glass-input w-full mt-1 px-3 py-2 text-sm"
              maxLength={24}
            />
          </label>
          <p className="text-xs" style={{ color: 'var(--text-typed)' }}>
            Your public profile address uses this name. Use 3–24 lowercase letters, numbers, or underscores.
          </p>
          <label className="block">
            <span className="text-xs" style={{ color: 'var(--text-typed)' }}>Bio</span>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="glass-input w-full mt-1 px-3 py-2 text-sm min-h-[80px]"
              maxLength={160}
            />
          </label>
          <button
            onClick={() => void handleSaveProfile()}
            disabled={savingProfile}
            className="glass-pill px-4 py-2 text-sm"
            style={{ color: 'var(--accent-primary)' }}
          >
            {savingProfile ? 'Saving...' : 'Save profile'}
          </button>
          {username && (
            <Link
              href={`/u/${encodeURIComponent(username)}`}
              className="glass-pill inline-flex px-4 py-2 text-sm"
              style={{ color: 'var(--text-untyped)' }}
            >
              View public profile
            </Link>
          )}
          {settingsMessage && (
            <p className="text-xs" style={{ color: 'var(--text-typed)' }}>
              {settingsMessage}
            </p>
          )}
        </div>
      )}

      {/* Personal Bests */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {pbDurations.map((dur) => {
          const pb = personalBests[dur];
          return (
            <div key={dur} className="glass-panel rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-3">
                <Trophy className="w-4 h-4" style={{ color: 'var(--accent-primary)' }} />
                <span className="text-sm font-medium" style={{ color: 'var(--text-typed)' }}>
                  Personal Best — {formatDuration(dur)}
                </span>
              </div>
              {pb ? (
                <div>
                  <p
                    className="text-4xl font-bold tabular-nums mb-1"
                    style={{ color: 'var(--accent-primary)' }}
                  >
                    {Math.round(pb.rawWpm)} <span className="text-lg font-normal" style={{ color: 'var(--text-typed)' }}>wpm</span>
                  </p>
                  <p className="text-sm" style={{ color: 'var(--text-typed)' }}>
                    {formatNumber(pb.accuracy)}% accuracy
                  </p>
                </div>
              ) : (
                <p className="text-sm" style={{ color: 'var(--text-typed)' }}>
                  No tests yet
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Aggregate Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-panel rounded-xl p-4 text-center">
            <Zap className="w-4 h-4 mx-auto mb-2" style={{ color: 'var(--accent-primary)' }} />
            <p className="text-2xl font-bold tabular-nums" style={{ color: 'var(--text-untyped)' }}>
              {stats.totalTests}
            </p>
            <p className="text-xs" style={{ color: 'var(--text-typed)' }}>Tests Completed</p>
          </div>
          <div className="glass-panel rounded-xl p-4 text-center">
            <Clock className="w-4 h-4 mx-auto mb-2" style={{ color: 'var(--accent-primary)' }} />
            <p className="text-2xl font-bold tabular-nums" style={{ color: 'var(--text-untyped)' }}>
              {formatDuration(stats.totalTime)}
            </p>
            <p className="text-xs" style={{ color: 'var(--text-typed)' }}>Total Time</p>
          </div>
          <div className="glass-panel rounded-xl p-4 text-center">
            <Target className="w-4 h-4 mx-auto mb-2" style={{ color: 'var(--accent-primary)' }} />
            <p className="text-2xl font-bold tabular-nums" style={{ color: 'var(--text-untyped)' }}>
              {Math.round(stats.avgWpm)}
            </p>
            <p className="text-xs" style={{ color: 'var(--text-typed)' }}>Avg WPM</p>
          </div>
          <div className="glass-panel rounded-xl p-4 text-center">
            <Target className="w-4 h-4 mx-auto mb-2" style={{ color: 'var(--accent-primary)' }} />
            <p className="text-2xl font-bold tabular-nums" style={{ color: 'var(--text-untyped)' }}>
              {formatNumber(stats.avgAccuracy)}%
            </p>
            <p className="text-xs" style={{ color: 'var(--text-typed)' }}>Avg Accuracy</p>
          </div>
        </div>
      )}

      {/* WPM Trend Chart */}
      {trendData.length > 1 && (
        <div className="glass-panel rounded-2xl p-6">
          <h3 className="text-sm font-medium mb-4" style={{ color: 'var(--text-typed)' }}>
            WPM Trend (Last 20 Tests)
          </h3>
          <div className="w-full" style={{ height: '220px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis
                  dataKey="test"
                  tick={{ fill: 'var(--text-typed)', fontSize: 11 }}
                  axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: 'var(--text-typed)', fontSize: 11 }}
                  axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                  tickLine={false}
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
                />
                <Line
                  type="monotone"
                  dataKey="wpm"
                  stroke="var(--accent-primary)"
                  strokeWidth={2}
                  dot={{ fill: 'var(--accent-primary)', r: 3 }}
                  name="WPM"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Recent Tests */}
      {tests.length > 0 && (
        <div className="glass-panel rounded-2xl overflow-hidden">
          <div className="px-6 py-4" style={{ borderBottom: '1px solid var(--glass-border)' }}>
            <h3 className="text-sm font-medium" style={{ color: 'var(--text-typed)' }}>
              Recent Tests
            </h3>
          </div>
          <div className="divide-y" style={{ borderColor: 'var(--glass-border)' }}>
            {tests.slice(0, 15).map((test) => (
              <div
                key={test.id}
                className="flex items-center justify-between px-6 py-3 hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex items-center gap-4">
                  <span
                    className="text-lg font-bold tabular-nums"
                    style={{ color: 'var(--accent-primary)' }}
                  >
                    {Math.round(test.rawWpm)}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--text-typed)' }}>
                    wpm
                  </span>
                </div>
                <div className="flex items-center gap-6 text-sm">
                  <span style={{ color: 'var(--text-untyped)' }}>
                    {formatNumber(test.accuracy)}%
                  </span>
                  <span className="glass-pill px-2 py-0.5 text-xs" style={{ color: 'var(--text-typed)' }}>
                    {formatDuration(test.duration)}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--text-typed)' }}>
                    {new Date(test.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {tests.length === 0 && (
        <div className="glass-panel rounded-2xl p-16 text-center">
          <p className="text-lg font-medium mb-2" style={{ color: 'var(--text-untyped)' }}>
            No tests yet
          </p>
          <p className="text-sm" style={{ color: 'var(--text-typed)' }}>
            Complete a typing test to see your stats here.
          </p>
        </div>
      )}
    </div>
  );
}
