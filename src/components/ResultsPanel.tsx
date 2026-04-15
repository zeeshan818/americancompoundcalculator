'use client';

import { useState } from 'react';
import type { CalculatorInputs, CalculationResult } from '@/lib/calculator';
import { formatCurrency, frequencyLabel, contributionFrequencyLabel, timeToDouble, effectiveAnnualRate, compoundingPeriodsPerYear } from '@/lib/calculator';
import GrowthChart from './GrowthChart';
import YearlyTable from './YearlyTable';

interface Props {
  inputs: CalculatorInputs;
  result: CalculationResult;
}

function SummaryCard({
  label,
  value,
  sub,
  accent = false,
  highlight = false,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
  highlight?: boolean;
}) {
  return (
    <div className={`rounded-xl p-4 border ${
      highlight
        ? 'bg-[#1e3a5f] border-[#1e3a5f] text-white'
        : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800'
    }`}>
      <p className={`text-xs font-medium uppercase tracking-wide mb-1 ${
        highlight ? 'text-blue-200' : 'text-gray-500 dark:text-gray-400'
      }`}>
        {label}
      </p>
      <p className={`text-xl font-bold ${
        highlight ? 'text-white' : accent ? 'text-[#16a34a] dark:text-green-400' : 'text-gray-900 dark:text-gray-100'
      }`}>
        {value}
      </p>
      {sub && (
        <p className={`text-xs mt-0.5 ${highlight ? 'text-blue-200' : 'text-gray-500 dark:text-gray-400'}`}>
          {sub}
        </p>
      )}
    </div>
  );
}

export default function ResultsPanel({ inputs, result }: Props) {
  const [showTable, setShowTable] = useState(false);

  const ratio = result.totalContributions > 0
    ? (result.totalInterest / result.totalContributions).toFixed(2)
    : '0.00';

  const timingLabel = inputs.contributionTiming === 'beginning' ? 'beginning' : 'end';
  const contribFreqLabel = contributionFrequencyLabel(inputs.contributionFrequency);
  const compoundFreqLabel = frequencyLabel(inputs.compoundingFrequency);

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div>
        <h2 className="text-base font-semibold text-[#1e3a5f] dark:text-blue-300 mb-3">📈 Results</h2>
        <div className="grid grid-cols-2 gap-3">
          <SummaryCard
            label="Final Balance"
            value={formatCurrency(result.finalBalance)}
            sub={`After ${inputs.years} years`}
            highlight
          />
          <SummaryCard
            label="Total Interest Earned"
            value={formatCurrency(result.totalInterest)}
            accent
          />
          <SummaryCard
            label="Total Contributions"
            value={formatCurrency(result.totalContributions)}
          />
          <SummaryCard
            label="Interest / Contribution Ratio"
            value={`${ratio}×`}
            sub="Interest earned per $1 contributed"
            accent={parseFloat(ratio) > 1}
          />
          {(() => {
            const ttd = timeToDouble(inputs.annualRate);
            const ttdDisplay = ttd.years > 0 || ttd.months > 0
              ? `~${ttd.years} yr${ttd.years !== 1 ? 's' : ''}${ttd.months > 0 ? `, ${ttd.months} mo` : ''}`
              : 'N/A';
            return (
              <SummaryCard
                label="⏱️ Time to Double"
                value={ttdDisplay}
                sub="Based on the Rule of 72 — a quick estimate of how long it takes for your investment to double."
              />
            );
          })()}
          {inputs.compoundingFrequency !== 'annually' && (() => {
            const n = compoundingPeriodsPerYear(inputs.compoundingFrequency);
            const apy = effectiveAnnualRate(inputs.annualRate, n);
            return (
              <SummaryCard
                label="📊 Effective Annual Rate (APY)"
                value={`${apy.toFixed(2)}%`}
                sub={`Your nominal ${inputs.annualRate}% compounded ${inputs.compoundingFrequency} yields an effective rate of ${apy.toFixed(2)}%`}
                accent
              />
            );
          })()}
        </div>
      </div>

      {/* Transparency Panel */}
      <div className="rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-4">
        <h2 className="text-sm font-semibold text-amber-800 dark:text-amber-300 mb-2 flex items-center gap-1.5">
          🔍 Calculation Assumptions
          <span className="text-xs font-normal text-amber-600 dark:text-amber-400">(what other calculators hide)</span>
        </h2>
        <ul className="space-y-1.5 text-xs text-amber-900 dark:text-amber-200">
          <li>
            <span className="font-medium">Contributions made at:</span> {timingLabel} of each {contribFreqLabel}
          </li>
          <li>
            <span className="font-medium">Interest compounded:</span> {compoundFreqLabel}
          </li>
          <li>
            <span className="font-medium">Inflation adjustment:</span>{' '}
            {inputs.inflationAdjustment
              ? `On — contributions increase ${inputs.inflationRate}%/year`
              : 'Off — fixed contribution amount'}
          </li>
          {inputs.annualWithdrawal > 0 && (
            <li>
              <span className="font-medium">Annual withdrawal:</span> {formatCurrency(inputs.annualWithdrawal)}/year
            </li>
          )}
          <li className="pt-1 border-t border-amber-200 dark:border-amber-700 font-mono text-amber-700 dark:text-amber-300 break-all">
            <span className="font-medium not-italic">Formula:</span> {result.formulaString}
          </li>
        </ul>
      </div>

      {/* Growth Chart */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
        <h2 className="text-sm font-semibold text-[#1e3a5f] dark:text-blue-300 mb-3">📉 Growth Over Time</h2>
        <GrowthChart yearlyData={result.yearlyData} />
      </div>

      {/* Year-by-Year Table */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <button
          onClick={() => setShowTable(prev => !prev)}
          className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-[#1e3a5f] dark:text-blue-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          <span>📋 Year-by-Year Breakdown</span>
          <span className="text-gray-400">{showTable ? '▲ Collapse' : '▼ Expand'}</span>
        </button>
        {showTable && <YearlyTable yearlyData={result.yearlyData} />}
      </div>
    </div>
  );
}
