import type { Metadata } from 'next';
import LoginPanel from '@/components/auth/LoginPanel';

export const metadata: Metadata = {
  title: 'Sign In — TypeHere',
  description: 'Sign in with Google or GitHub to sync your typing stats across devices.',
};

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-12rem)] px-4">
      <LoginPanel />
    </div>
  );
}
