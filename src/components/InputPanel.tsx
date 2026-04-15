'use client';

import { useCallback } from 'react';
import type { CalculatorInputs, ContributionFrequency, ContributionTiming, CompoundingFrequency } from '@/lib/calculator';

interface Props {
  inputs: CalculatorInputs;
  onChange: (inputs: CalculatorInputs) => void;
}

function Tooltip({ text }: { text: string }) {
  return (
    <span className="tooltip-container ml-1.5 cursor-help">
      <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-300 text-xs font-bold">?</span>
      <span className="tooltip-text">{text}</span>
    </span>
  );
}

function Label({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
      {children}
    </label>
  );
}

function CurrencyInput({
  id,
  value,
  onChange,
  min = 0,
  placeholder = '0',
}: {
  id: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  placeholder?: string;
}) {
  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 font-medium">$</span>
      <input
        id={id}
        type="number"
        min={min}
        value={value === 0 ? '' : value}
        placeholder={placeholder}
        onChange={e => onChange(parseFloat(e.target.value) || 0)}
        className="w-full pl-7 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent text-sm"
      />
    </div>
  );
}

function PercentInput({
  id,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 0.1,
}: {
  id: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
}) {
  return (
    <div className="relative">
      <input
        id={id}
        type="number"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(parseFloat(e.target.value) || 0)}
        className="w-full pr-8 pl-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent text-sm"
      />
      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">%</span>
    </div>
  );
}

function SelectInput<T extends string>({
  id,
  value,
  onChange,
  options,
}: {
  id: string;
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <select
      id={id}
      value={value}
      onChange={e => onChange(e.target.value as T)}
      className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent text-sm"
    >
      {options.map(o => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}

export default function InputPanel({ inputs, onChange }: Props) {
  const update = useCallback(<K extends keyof CalculatorInputs>(key: K, value: CalculatorInputs[K]) => {
    onChange({ ...inputs, [key]: value });
  }, [inputs, onChange]);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-5 space-y-5">
      <h2 className="text-base font-semibold text-[#1e3a5f] dark:text-blue-300 border-b border-gray-100 dark:border-gray-800 pb-3">
        📊 Calculator Inputs
      </h2>

      {/* Initial Investment */}
      <div>
        <Label htmlFor="initial">Initial Investment</Label>
        <CurrencyInput
          id="initial"
          value={inputs.initialInvestment}
          onChange={v => update('initialInvestment', v)}
          placeholder="10,000"
        />
      </div>

      {/* Regular Contribution */}
      <div>
        <Label htmlFor="contribution">Regular Contribution</Label>
        <CurrencyInput
          id="contribution"
          value={inputs.regularContribution}
          onChange={v => update('regularContribution', v)}
          placeholder="500"
        />
      </div>

      {/* Contribution Frequency */}
      <div>
        <Label htmlFor="contribFreq">Contribution Frequency</Label>
        <SelectInput
          id="contribFreq"
          value={inputs.contributionFrequency}
          onChange={v => update('contributionFrequency', v as ContributionFrequency)}
          options={[
            { value: 'monthly', label: 'Monthly' },
            { value: 'quarterly', label: 'Quarterly' },
            { value: 'annually', label: 'Annually' },
          ]}
        />
      </div>

      {/* Contribution Timing */}
      <div>
        <Label htmlFor="contribTiming">
          Contribution Timing
          <Tooltip text="Beginning of period: your contribution earns interest for the entire period. End of period: contribution earns interest starting next period. Beginning typically yields slightly higher returns." />
        </Label>
        <div className="flex rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600">
          {([
            { value: 'beginning', label: '📅 Beginning of Period' },
            { value: 'end', label: '🔚 End of Period' },
          ] as { value: ContributionTiming; label: string }[]).map(opt => (
            <button
              key={opt.value}
              onClick={() => update('contributionTiming', opt.value)}
              className={`flex-1 px-3 py-2.5 text-xs font-medium transition-colors ${
                inputs.contributionTiming === opt.value
                  ? 'bg-[#1e3a5f] text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Annual Rate */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <Label htmlFor="rate">Annual Interest Rate</Label>
          <span className="text-sm font-semibold text-[#1e3a5f] dark:text-blue-300">{inputs.annualRate}%</span>
        </div>
        <input
          id="rate"
          type="range"
          min={0}
          max={30}
          step={0.1}
          value={inputs.annualRate}
          onChange={e => update('annualRate', parseFloat(e.target.value))}
          className="w-full mb-2"
        />
        <PercentInput
          id="rate-num"
          value={inputs.annualRate}
          onChange={v => update('annualRate', Math.min(100, Math.max(0, v)))}
          min={0}
          max={100}
        />
      </div>

      {/* Compounding Frequency */}
      <div>
        <Label htmlFor="compoundFreq">Compounding Frequency</Label>
        <SelectInput
          id="compoundFreq"
          value={inputs.compoundingFrequency}
          onChange={v => update('compoundingFrequency', v as CompoundingFrequency)}
          options={[
            { value: 'daily', label: 'Daily (365×/year)' },
            { value: 'monthly', label: 'Monthly (12×/year)' },
            { value: 'quarterly', label: 'Quarterly (4×/year)' },
            { value: 'annually', label: 'Annually (1×/year)' },
          ]}
        />
      </div>

      {/* Investment Period */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <Label htmlFor="years">Investment Period</Label>
          <span className="text-sm font-semibold text-[#1e3a5f] dark:text-blue-300">{inputs.years} yrs</span>
        </div>
        <input
          id="years"
          type="range"
          min={1}
          max={50}
          step={1}
          value={inputs.years}
          onChange={e => update('years', parseInt(e.target.value))}
          className="w-full mb-2"
        />
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={1}
            max={100}
            value={inputs.years}
            onChange={e => update('years', Math.min(100, Math.max(1, parseInt(e.target.value) || 1)))}
            className="w-20 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] text-sm"
          />
          <span className="text-sm text-gray-500 dark:text-gray-400">years</span>
        </div>
      </div>

      {/* Inflation Adjustment */}
      <div className="rounded-lg bg-gray-50 dark:bg-gray-800/50 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <div
              onClick={() => update('inflationAdjustment', !inputs.inflationAdjustment)}
              className={`relative w-10 h-5.5 rounded-full transition-colors cursor-pointer ${
                inputs.inflationAdjustment ? 'bg-[#16a34a]' : 'bg-gray-300 dark:bg-gray-600'
              }`}
              style={{ height: '22px', width: '40px' }}
            >
              <div
                className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                  inputs.inflationAdjustment ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Inflation-Adjust Contributions
              <Tooltip text="Increases your contribution amount each year by the inflation rate. Models how you'd maintain purchasing power of your contributions over time." />
            </span>
          </label>
        </div>

        {inputs.inflationAdjustment && (
          <div>
            <Label htmlFor="inflationRate">Annual Inflation Rate</Label>
            <PercentInput
              id="inflationRate"
              value={inputs.inflationRate}
              onChange={v => update('inflationRate', v)}
              min={0}
              max={20}
              step={0.1}
            />
          </div>
        )}
      </div>

      {/* Annual Withdrawal */}
      <div>
        <Label htmlFor="withdrawal">
          Annual Withdrawal (optional)
          <Tooltip text="Simulates withdrawing a fixed amount each year — useful for modeling retirement income. Applied at the start of each year after year 1." />
        </Label>
        <CurrencyInput
          id="withdrawal"
          value={inputs.annualWithdrawal}
          onChange={v => update('annualWithdrawal', v)}
          placeholder="0 (no withdrawal)"
        />
      </div>
    </div>
  );
}
