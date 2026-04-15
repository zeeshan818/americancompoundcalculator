'use client';

import type { SavedScenario } from './Calculator';
import { formatCurrency } from '@/lib/calculator';

interface Props {
  scenarios: SavedScenario[];
  currentResult: { finalBalance: number };
}

function ScenarioCard({ scenario }: { scenario: SavedScenario }) {
  const { inputs, result, label } = scenario;
  const ratio = result.totalContributions > 0
    ? (result.totalInterest / result.totalContributions).toFixed(2)
    : '0.00';

  return (
    <div className="flex-1 min-w-[200px] rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-hidden">
      <div className="bg-[#1e3a5f] px-4 py-2.5">
        <h3 className="text-sm font-bold text-white">{label}</h3>
      </div>
      <div className="p-4 space-y-2.5">
        <Row label="Initial Investment" value={formatCurrency(inputs.initialInvestment)} />
        <Row label="Contribution" value={`${formatCurrency(inputs.regularContribution)}/${inputs.contributionFrequency === 'monthly' ? 'mo' : inputs.contributionFrequency === 'quarterly' ? 'qtr' : 'yr'}`} />
        <Row label="Rate" value={`${inputs.annualRate}%`} />
        <Row label="Period" value={`${inputs.years} years`} />
        <Row label="Compounding" value={inputs.compoundingFrequency} />
        <Row label="Timing" value={inputs.contributionTiming} />
        <div className="pt-2 border-t border-gray-100 dark:border-gray-800 space-y-2">
          <Row label="Total Contributions" value={formatCurrency(result.totalContributions)} />
          <Row label="Total Interest" value={formatCurrency(result.totalInterest)} accent />
          <Row label="Ratio" value={`${ratio}×`} />
          <div className="flex justify-between items-baseline pt-1 border-t border-gray-100 dark:border-gray-800">
            <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">Final Balance</span>
            <span className="text-base font-bold text-[#1e3a5f] dark:text-blue-300">
              {formatCurrency(result.finalBalance)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex justify-between items-baseline gap-2">
      <span className="text-xs text-gray-500 dark:text-gray-400">{label}</span>
      <span className={`text-xs font-medium ${accent ? 'text-[#16a34a] dark:text-green-400' : 'text-gray-800 dark:text-gray-200'}`}>
        {value}
      </span>
    </div>
  );
}

export default function ScenarioComparison({ scenarios: sc }: Props) {

  if (sc.length < 2) return null;

  const a = sc[0];
  const b = sc[1];
  const diff = b.result.finalBalance - a.result.finalBalance;
  const pct = a.result.finalBalance > 0 ? ((diff / a.result.finalBalance) * 100).toFixed(1) : '0';
  const isPositive = diff >= 0;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
      <h2 className="text-base font-semibold text-[#1e3a5f] dark:text-blue-300 mb-4">⚖️ Scenario Comparison</h2>

      <div className="flex flex-wrap gap-4">
        {sc.map(scenario => (
          <ScenarioCard key={scenario.label} scenario={scenario} />
        ))}
      </div>

      {/* Diff summary between first two scenarios */}
      {sc.length >= 2 && (
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            Scenario B vs. Scenario A final balance:
          </p>
          <span className={`inline-block py-2 px-6 rounded-full text-sm font-bold ${
            isPositive
              ? 'bg-green-100 dark:bg-green-900/30 text-[#16a34a] dark:text-green-400'
              : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
          }`}>
            {isPositive ? '+' : ''}{formatCurrency(diff)} ({isPositive ? '+' : ''}{pct}%)
          </span>
        </div>
      )}
    </div>
  );
}
