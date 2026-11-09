import { ImageResponse } from 'next/og';

export const size = {
  width: 48,
  height: 48,
};
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #07090e 0%, #111827 100%)',
          borderRadius: '12px',
          border: '2px solid #f59e0b',
          color: '#f59e0b',
          fontSize: '26px',
          fontWeight: 800,
          fontFamily: 'sans-serif',
        }}
      >
        T
      </div>
    ),
    {
      ...size,
    }
  );
}
