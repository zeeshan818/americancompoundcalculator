'use client';

import type { YearlyData } from '@/lib/calculator';
import { formatCurrency } from '@/lib/calculator';

interface Props {
  yearlyData: YearlyData[];
}

export default function YearlyTable({ yearlyData }: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-gray-50 dark:bg-gray-800 border-y border-gray-200 dark:border-gray-700">
            <th className="px-3 py-2.5 text-left font-semibold text-gray-600 dark:text-gray-300">Year</th>
            <th className="px-3 py-2.5 text-right font-semibold text-gray-600 dark:text-gray-300">Contributions</th>
            <th className="px-3 py-2.5 text-right font-semibold text-gray-600 dark:text-gray-300">Interest</th>
            {yearlyData.some(d => d.yearWithdrawal > 0) && (
              <th className="px-3 py-2.5 text-right font-semibold text-gray-600 dark:text-gray-300">Withdrawal</th>
            )}
            <th className="px-3 py-2.5 text-right font-semibold text-gray-600 dark:text-gray-300">Balance</th>
          </tr>
        </thead>
        <tbody>
          {yearlyData.map((row, idx) => (
            <tr
              key={row.year}
              className={`border-b border-gray-100 dark:border-gray-800 ${
                idx % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50/50 dark:bg-gray-800/30'
              }`}
            >
              <td className="px-3 py-2 font-medium text-gray-700 dark:text-gray-300">{row.year}</td>
              <td className="px-3 py-2 text-right text-gray-600 dark:text-gray-400">
                {formatCurrency(row.yearContributions)}
              </td>
              <td className="px-3 py-2 text-right text-[#16a34a] dark:text-green-400 font-medium">
                {formatCurrency(row.yearInterest)}
              </td>
              {yearlyData.some(d => d.yearWithdrawal > 0) && (
                <td className="px-3 py-2 text-right text-red-500 dark:text-red-400">
                  {row.yearWithdrawal > 0 ? `-${formatCurrency(row.yearWithdrawal)}` : '—'}
                </td>
              )}
              <td className="px-3 py-2 text-right font-semibold text-[#1e3a5f] dark:text-blue-300">
                {formatCurrency(row.balance)}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="bg-gray-100 dark:bg-gray-800 border-t-2 border-gray-300 dark:border-gray-600">
            <td className="px-3 py-2.5 font-semibold text-gray-700 dark:text-gray-200">Total</td>
            <td className="px-3 py-2.5 text-right font-semibold text-gray-700 dark:text-gray-200">
              {formatCurrency(yearlyData[yearlyData.length - 1]?.totalContributions ?? 0)}
            </td>
            <td className="px-3 py-2.5 text-right font-semibold text-[#16a34a] dark:text-green-400">
              {formatCurrency(yearlyData[yearlyData.length - 1]?.totalInterest ?? 0)}
            </td>
            {yearlyData.some(d => d.yearWithdrawal > 0) && (
              <td className="px-3 py-2.5 text-right font-semibold text-red-500">
                -{formatCurrency(yearlyData.reduce((sum, d) => sum + d.yearWithdrawal, 0))}
              </td>
            )}
            <td className="px-3 py-2.5 text-right font-bold text-[#1e3a5f] dark:text-blue-300">
              {formatCurrency(yearlyData[yearlyData.length - 1]?.balance ?? 0)}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
