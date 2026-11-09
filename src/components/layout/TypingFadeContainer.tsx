'use client';

import { useTypingStore } from '@/store/useTypingStore';

interface TypingFadeContainerProps {
  children: React.ReactNode;
  className?: string;
}

export default function TypingFadeContainer({
  children,
  className = '',
}: TypingFadeContainerProps) {
  const phase = useTypingStore((s) => s.phase);
  const isTyping = phase === 'typing';

  return (
    <div
      className={`fade-on-typing transition-opacity duration-400 ${
        isTyping ? 'opacity-0 pointer-events-none' : 'opacity-100'
      } ${className}`.trim()}
    >
      {children}
    </div>
  );
}
