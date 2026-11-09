import { ImageResponse } from 'next/og';

export const size = {
  width: 180,
  height: 180,
};
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #07090e 0%, #0f172a 100%)',
          borderRadius: '40px',
          border: '6px solid #f59e0b',
          color: '#f59e0b',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            fontSize: '74px',
            fontWeight: 800,
            letterSpacing: '-0.04em',
            color: '#f59e0b',
          }}
        >
          TH
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
