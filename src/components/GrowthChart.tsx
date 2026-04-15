'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { YearlyData } from '@/lib/calculator';
import { formatCurrency } from '@/lib/calculator';

interface Props {
  yearlyData: YearlyData[];
}

function formatYAxis(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value}`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    const contributions = payload.find((p: { dataKey: string }) => p.dataKey === 'totalContributions')?.value ?? 0;
    const interest = payload.find((p: { dataKey: string }) => p.dataKey === 'totalInterest')?.value ?? 0;
    const balance = contributions + interest;
    return (
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-3 shadow-lg text-xs">
        <p className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Year {label}</p>
        <p className="text-gray-600 dark:text-gray-300">
          <span className="inline-block w-3 h-3 rounded-sm mr-1.5" style={{ backgroundColor: '#1e3a5f' }} />
          Contributions: {formatCurrency(contributions)}
        </p>
        <p className="text-[#16a34a] dark:text-green-400">
          <span className="inline-block w-3 h-3 rounded-sm mr-1.5" style={{ backgroundColor: '#16a34a' }} />
          Interest: {formatCurrency(interest)}
        </p>
        <p className="font-semibold text-gray-900 dark:text-gray-100 mt-1 pt-1 border-t border-gray-100 dark:border-gray-700">
          Balance: {formatCurrency(balance)}
        </p>
      </div>
    );
  }
  return null;
}

export default function GrowthChart({ yearlyData }: Props) {
  // Sample data if too many years (every 2nd year for 30+ years)
  const displayData = yearlyData.length > 30
    ? yearlyData.filter((_, i) => i % 2 === 0 || i === yearlyData.length - 1)
    : yearlyData;

  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart
        data={displayData}
        margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
      >
        <defs>
          <linearGradient id="gradContributions" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#1e3a5f" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#1e3a5f" stopOpacity={0.3} />
          </linearGradient>
          <linearGradient id="gradInterest" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#16a34a" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#16a34a" stopOpacity={0.3} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis
          dataKey="year"
          tick={{ fontSize: 11, fill: '#6b7280' }}
          tickLine={false}
          label={{ value: 'Year', position: 'insideBottom', offset: -2, fontSize: 11, fill: '#6b7280' }}
        />
        <YAxis
          tickFormatter={formatYAxis}
          tick={{ fontSize: 10, fill: '#6b7280' }}
          tickLine={false}
          axisLine={false}
          width={60}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }}
          formatter={(value) => value === 'totalContributions' ? 'Contributions' : 'Interest Earned'}
        />
        <Area
          type="monotone"
          dataKey="totalContributions"
          stackId="1"
          stroke="#1e3a5f"
          strokeWidth={2}
          fill="url(#gradContributions)"
          name="totalContributions"
        />
        <Area
          type="monotone"
          dataKey="totalInterest"
          stackId="1"
          stroke="#16a34a"
          strokeWidth={2}
          fill="url(#gradInterest)"
          name="totalInterest"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
