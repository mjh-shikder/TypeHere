// =============================================================================
// TypeHere — Profile Page (Universal: Guest & Authenticated)
// =============================================================================

import ProfileDashboard from '@/components/profile/ProfileDashboard';
import { User } from 'lucide-react';

export const metadata = {
  title: 'Profile — TypeHere',
  description: 'Your typing stats, personal bests, and test history.',
};

export default function ProfilePage() {
  return (
    <div className="max-w-4xl mx-auto px-4">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="flex items-center justify-center gap-3 mb-3">
          <User className="w-8 h-8" style={{ color: 'var(--accent-primary)' }} />
          <h1 className="text-3xl font-bold" style={{ color: 'var(--text-untyped)' }}>
            Your Profile
          </h1>
        </div>
        <p className="text-sm" style={{ color: 'var(--text-typed)' }}>
          Personal bests, statistics, and test history
        </p>
      </div>

      {/* Profile Dashboard */}
      <ProfileDashboard />
    </div>
  );
}
