'use client';

import { useTypingStore } from '@/store/useTypingStore';

/**
 * LiquidBackdrop — Ambient drifting liquid glass orbs (Canvas Level 0)
 * Slowly animating gradient orbs that dampen during active typing
 */
export default function LiquidBackdrop() {
  const phase = useTypingStore((s) => s.phase);
  const isTyping = phase === 'typing';

  return (
    <div
      className="fixed inset-0 overflow-hidden pointer-events-none z-0"
      aria-hidden="true"
    >
      {/* Primary orb — large, upper-left */}
      <div
        className={`liquid-orb liquid-orb-primary animate-float-slow ${
          isTyping ? 'opacity-30' : 'opacity-100'
        }`}
        style={{
          width: '600px',
          height: '600px',
          top: '-10%',
          left: '-5%',
          transition: 'opacity 600ms ease',
          animationPlayState: isTyping ? 'paused' : 'running',
        }}
      />

      {/* Secondary orb — medium, lower-right */}
      <div
        className={`liquid-orb liquid-orb-secondary animate-float-slower ${
          isTyping ? 'opacity-20' : 'opacity-100'
        }`}
        style={{
          width: '500px',
          height: '500px',
          bottom: '-15%',
          right: '-10%',
          transition: 'opacity 600ms ease',
          animationPlayState: isTyping ? 'paused' : 'running',
        }}
      />

      {/* Tertiary orb — small accent, center-right */}
      <div
        className={`liquid-orb liquid-orb-primary animate-float-slower ${
          isTyping ? 'opacity-10' : 'opacity-70'
        }`}
        style={{
          width: '300px',
          height: '300px',
          top: '40%',
          right: '20%',
          transition: 'opacity 600ms ease',
          animationPlayState: isTyping ? 'paused' : 'running',
        }}
      />

      {/* Fourth orb — bottom-left accent */}
      <div
        className={`liquid-orb liquid-orb-secondary animate-float-slow ${
          isTyping ? 'opacity-10' : 'opacity-60'
        }`}
        style={{
          width: '350px',
          height: '350px',
          bottom: '10%',
          left: '15%',
          transition: 'opacity 600ms ease',
          animationPlayState: isTyping ? 'paused' : 'running',
        }}
      />
    </div>
  );
}
