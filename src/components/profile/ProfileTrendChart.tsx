'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export interface ProfileTrendPoint {
  test: number;
  wpm: number;
  accuracy: number;
}

export default function ProfileTrendChart({ data }: { data: ProfileTrendPoint[] }) {
  return (
    <div className="w-full" style={{ height: '220px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
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
  );
}
