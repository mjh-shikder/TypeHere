// =============================================================================
// TypeHere — Shared 1200x630 Open Graph / Twitter Card Preview Image Builder
// Note: Uses Satori-compatible flexbox layout only (no CSS grid).
// =============================================================================

import { ImageResponse } from 'next/og';

export const SOCIAL_IMAGE_SIZE = {
  width: 1200,
  height: 630,
};

export function renderSocialPreviewImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, #07090e 0%, #0d1424 55%, #07090e 100%)',
          color: '#f8fafc',
          padding: '56px',
          position: 'relative',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Top bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '14px',
                background: 'rgba(245, 158, 11, 0.16)',
                border: '2px solid rgba(245, 158, 11, 0.55)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#f59e0b',
                fontSize: '26px',
                fontWeight: 700,
              }}
            >
              TH
            </div>
            <span
              style={{
                fontSize: '32px',
                fontWeight: 700,
                letterSpacing: '-0.02em',
                color: '#f8fafc',
              }}
            >
              TypeHere
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '10px 22px',
              borderRadius: '9999px',
              background: 'rgba(245, 158, 11, 0.14)',
              border: '1px solid rgba(245, 158, 11, 0.4)',
              color: '#fbbf24',
              fontSize: '20px',
              fontWeight: 600,
            }}
          >
            type.mjhshikder.com
          </div>
        </div>

        {/* Center glass panel */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: '22px',
            padding: '44px',
            borderRadius: '28px',
            background: 'rgba(15, 23, 42, 0.65)',
            border: '1px solid rgba(255, 255, 255, 0.14)',
          }}
        >
          <div
            style={{
              display: 'flex',
              fontSize: '54px',
              fontWeight: 800,
              lineHeight: 1.15,
              letterSpacing: '-0.03em',
              color: '#f8fafc',
            }}
          >
            Free Online Typing Speed Test
          </div>
          <div
            style={{
              display: 'flex',
              fontSize: '26px',
              lineHeight: 1.45,
              color: '#cbd5e1',
            }}
          >
            Measure WPM and accuracy in 1, 3, and 5-minute tests, race your Ghost Personal Best pacer, and climb the global leaderboard.
          </div>
        </div>

        {/* Bottom feature pills */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          <div
            style={{
              display: 'flex',
              padding: '10px 20px',
              borderRadius: '9999px',
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.14)',
              color: '#f59e0b',
              fontSize: '20px',
              fontWeight: 600,
            }}
          >
            1m · 3m · 5m Timed WPM
          </div>
          <div
            style={{
              display: 'flex',
              padding: '10px 20px',
              borderRadius: '9999px',
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.14)',
              color: '#e2e8f0',
              fontSize: '20px',
              fontWeight: 500,
            }}
          >
            Ghost PB Pacer
          </div>
          <div
            style={{
              display: 'flex',
              padding: '10px 20px',
              borderRadius: '9999px',
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.14)',
              color: '#e2e8f0',
              fontSize: '20px',
              fontWeight: 500,
            }}
          >
            Keystroke Telemetry
          </div>
          <div
            style={{
              display: 'flex',
              padding: '10px 20px',
              borderRadius: '9999px',
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.14)',
              color: '#e2e8f0',
              fontSize: '20px',
              fontWeight: 500,
            }}
          >
            Global Leaderboard
          </div>
        </div>
      </div>
    ),
    {
      ...SOCIAL_IMAGE_SIZE,
    }
  );
}
