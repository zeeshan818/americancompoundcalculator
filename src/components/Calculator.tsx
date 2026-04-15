'use client';

import { useState, useCallback } from 'react';
import { calculateClean, exportToCSV, formatCurrency, type CalculatorInputs, type CalculationResult } from '@/lib/calculator';
import InputPanel from './InputPanel';
import ResultsPanel from './ResultsPanel';
import ScenarioComparison from './ScenarioComparison';

const DEFAULT_INPUTS: CalculatorInputs = {
  initialInvestment: 10000,
  regularContribution: 500,
  contributionFrequency: 'monthly',
  contributionTiming: 'end',
  annualRate: 7,
  compoundingFrequency: 'monthly',
  years: 20,
  inflationAdjustment: false,
  inflationRate: 3,
  annualWithdrawal: 0,
};

export interface SavedScenario {
  label: string;
  inputs: CalculatorInputs;
  result: CalculationResult;
}

export default function Calculator() {
  const [inputs, setInputs] = useState<CalculatorInputs>(DEFAULT_INPUTS);
  const [result, setResult] = useState<CalculationResult>(() => calculateClean(DEFAULT_INPUTS));
  const [scenarios, setScenarios] = useState<SavedScenario[]>([]);
  const [darkMode, setDarkMode] = useState(false);

  const handleInputChange = useCallback((newInputs: CalculatorInputs) => {
    setInputs(newInputs);
    const newResult = calculateClean(newInputs);
    setResult(newResult);
  }, []);

  const handleSaveScenario = useCallback(() => {
    const label = scenarios.length === 0 ? 'Scenario A' : scenarios.length === 1 ? 'Scenario B' : `Scenario ${String.fromCharCode(65 + scenarios.length)}`;
    setScenarios(prev => {
      const next = [...prev, { label, inputs: { ...inputs }, result }];
      return next.slice(-3); // Keep max 3 scenarios
    });
  }, [inputs, result, scenarios.length]);

  const handleClearScenarios = useCallback(() => {
    setScenarios([]);
  }, []);

  const handleExportCSV = useCallback(() => {
    exportToCSV(result.yearlyData);
  }, [result.yearlyData]);

  const toggleDarkMode = () => {
    setDarkMode(prev => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return next;
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#1e3a5f] dark:text-blue-200 leading-tight">
              Compound Interest Calculator
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm md:text-base">
              The most transparent calculator online — see exactly how your money grows.
            </p>
          </div>
          <button
            onClick={toggleDarkMode}
            className="shrink-0 p-2 rounded-lg bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
            aria-label="Toggle dark mode"
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
        </div>
      </header>

      {/* Main layout: inputs left, results right on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 xl:gap-8">
        <div className="lg:sticky lg:top-6 lg:self-start">
          <InputPanel inputs={inputs} onChange={handleInputChange} />

          {/* Action buttons */}
          <div className="flex flex-wrap gap-3 mt-4">
            <button
              onClick={handleSaveScenario}
              disabled={scenarios.length >= 3}
              className="flex-1 min-w-[140px] px-4 py-2.5 bg-[#1e3a5f] text-white rounded-lg font-medium hover:bg-[#162c48] disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
            >
              💾 Save Scenario {scenarios.length === 0 ? 'A' : scenarios.length === 1 ? 'B' : 'C'}
            </button>
            <button
              onClick={handleExportCSV}
              className="flex-1 min-w-[140px] px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm"
            >
              📥 Export CSV
            </button>
            {scenarios.length > 0 && (
              <button
                onClick={handleClearScenarios}
                className="px-4 py-2.5 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-50 dark:hover:bg-red-950 transition-colors text-sm"
              >
                Clear Scenarios
              </button>
            )}
          </div>
        </div>

        <div>
          <ResultsPanel inputs={inputs} result={result} />
        </div>
      </div>

      {/* Scenario Comparison */}
      {scenarios.length >= 2 && (
        <div className="mt-8">
          <ScenarioComparison scenarios={scenarios} currentResult={result} />
        </div>
      )}
    </div>
  );
}
