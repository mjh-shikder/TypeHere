// =============================================================================
// TypeHere — Leaderboard Page
// =============================================================================

import LeaderboardTable from '@/components/leaderboard/LeaderboardTable';
import { Trophy } from 'lucide-react';

export const metadata = {
  title: 'Leaderboard — TypeHere',
  description: 'Global typing speed rankings for 1-minute, 3-minute, and 5-minute tests.',
};

export default function LeaderboardPage() {
  return (
    <div className="max-w-4xl mx-auto px-4">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="flex items-center justify-center gap-3 mb-3">
          <Trophy className="w-8 h-8" style={{ color: 'var(--accent-primary)' }} />
          <h1 className="text-3xl font-bold" style={{ color: 'var(--text-untyped)' }}>
            Global Leaderboard
          </h1>
        </div>
        <p className="text-sm" style={{ color: 'var(--text-typed)' }}>
          Top verified typists worldwide — ranked by Net WPM
        </p>
      </div>

      {/* Leaderboard Table */}
      <LeaderboardTable />
    </div>
  );
}
