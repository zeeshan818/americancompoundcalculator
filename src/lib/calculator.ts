export type ContributionFrequency = 'monthly' | 'quarterly' | 'annually';
export type ContributionTiming = 'beginning' | 'end';
export type CompoundingFrequency = 'daily' | 'monthly' | 'quarterly' | 'annually';

export interface CalculatorInputs {
  initialInvestment: number;
  regularContribution: number;
  contributionFrequency: ContributionFrequency;
  contributionTiming: ContributionTiming;
  annualRate: number; // as percentage, e.g. 7 for 7%
  compoundingFrequency: CompoundingFrequency;
  years: number;
  inflationAdjustment: boolean;
  inflationRate: number; // as percentage
  annualWithdrawal: number;
}

export interface YearlyData {
  year: number;
  balance: number;
  totalContributions: number;
  totalInterest: number;
  yearContributions: number;
  yearInterest: number;
  yearWithdrawal: number;
}

export interface CalculationResult {
  finalBalance: number;
  totalContributions: number;
  totalInterest: number;
  yearlyData: YearlyData[];
  formulaString: string;
}

// Number of compounding periods per year
function compoundingPeriodsPerYear(freq: CompoundingFrequency): number {
  switch (freq) {
    case 'daily': return 365;
    case 'monthly': return 12;
    case 'quarterly': return 4;
    case 'annually': return 1;
  }
}

// Number of contribution periods per year
function contributionPeriodsPerYear(freq: ContributionFrequency): number {
  switch (freq) {
    case 'monthly': return 12;
    case 'quarterly': return 4;
    case 'annually': return 1;
  }
}

function frequencyLabel(freq: CompoundingFrequency): string {
  switch (freq) {
    case 'daily': return 'daily (365×/yr)';
    case 'monthly': return 'monthly (12×/yr)';
    case 'quarterly': return 'quarterly (4×/yr)';
    case 'annually': return 'annually (1×/yr)';
  }
}

function contributionFrequencyLabel(freq: ContributionFrequency): string {
  switch (freq) {
    case 'monthly': return 'month';
    case 'quarterly': return 'quarter';
    case 'annually': return 'year';
  }
}

export function buildFormulaString(inputs: CalculatorInputs): string {
  const { annualRate, compoundingFrequency, contributionTiming, contributionFrequency } = inputs;
  const n = compoundingPeriodsPerYear(compoundingFrequency);
  const r = annualRate / 100;
  const timingNote = contributionTiming === 'beginning' ? '× (1 + r/n)^(n/m) [beginning-of-period]' : '[end-of-period]';
  return `A = P(1 + ${(r/n).toFixed(6)})^(nt) + PMT × [((1 + ${(r/n).toFixed(6)})^(nt) – 1) / ${(r/n).toFixed(6)}] ${timingNote}`;
}

/**
 * Clean period-by-period simulation.
 * Runs at monthly granularity (sufficient for all supported frequencies).
 */
export function calculateClean(inputs: CalculatorInputs): CalculationResult {
  const {
    initialInvestment,
    regularContribution,
    contributionFrequency,
    contributionTiming,
    annualRate,
    compoundingFrequency,
    years,
    inflationAdjustment,
    inflationRate,
    annualWithdrawal,
  } = inputs;

  const r = annualRate / 100;
  const n = compoundingPeriodsPerYear(compoundingFrequency);
  const m = contributionPeriodsPerYear(contributionFrequency);
  
  // We simulate at monthly steps (12 per year)
  // This cleanly handles monthly, quarterly, annual contributions and daily/monthly/quarterly/annual compounding
  const stepsPerYear = 12; // monthly steps
  const totalSteps = years * stepsPerYear;
  
  // Compounding: how many times does compounding happen per monthly step?
  // daily: ~30.4 times per month, monthly: 1, quarterly: 0.33, annually: 0.083
  // We apply compounding interest per step using: (1 + r/n)^(n/12) - 1
  const compoundFactorPerStep = Math.pow(1 + r / n, n / stepsPerYear) - 1;
  
  // Contribution: every how many steps?
  // monthly: every 1 step, quarterly: every 3 steps, annually: every 12 steps
  const contributionEveryNSteps = stepsPerYear / m; // 1, 3, or 12

  let balance = initialInvestment;
  let totalContributions = initialInvestment;
  let totalInterest = 0;
  const yearlyData: YearlyData[] = [];

  let currentContribution = regularContribution;
  let yearContributions = 0;
  let yearInterest = 0;

  for (let step = 0; step < totalSteps; step++) {
    const stepInYear = step % stepsPerYear; // 0-11
    
    // At start of new year (except year 0 which is the initial investment)
    if (step > 0 && stepInYear === 0) {
      const year = Math.floor(step / stepsPerYear);

      // Apply annual withdrawal at start of year
      let yearWithdrawal = 0;
      if (annualWithdrawal > 0) {
        yearWithdrawal = Math.min(annualWithdrawal, balance);
        balance = Math.max(0, balance - annualWithdrawal);
      }

      yearlyData.push({
        year,
        balance: parseFloat(balance.toFixed(2)),
        totalContributions: parseFloat(totalContributions.toFixed(2)),
        totalInterest: parseFloat(totalInterest.toFixed(2)),
        yearContributions: parseFloat(yearContributions.toFixed(2)),
        yearInterest: parseFloat(yearInterest.toFixed(2)),
        yearWithdrawal: parseFloat(yearWithdrawal.toFixed(2)),
      });

      // Inflate contribution for new year
      if (inflationAdjustment && inflationRate > 0) {
        currentContribution *= (1 + inflationRate / 100);
      }

      yearContributions = 0;
      yearInterest = 0;
    }

    // Is this a contribution step?
    const isContributionStep = stepInYear % contributionEveryNSteps === 0;

    if (isContributionStep && contributionTiming === 'beginning') {
      balance += currentContribution;
      totalContributions += currentContribution;
      yearContributions += currentContribution;
    }

    // Apply compounding interest for this step
    const interest = balance * compoundFactorPerStep;
    balance += interest;
    totalInterest += interest;
    yearInterest += interest;

    if (isContributionStep && contributionTiming === 'end') {
      balance += currentContribution;
      totalContributions += currentContribution;
      yearContributions += currentContribution;
    }
  }

  // Final year data
  const finalYear = years;
  let finalWithdrawal = 0;
  if (annualWithdrawal > 0) {
    finalWithdrawal = Math.min(annualWithdrawal, balance);
    balance = Math.max(0, balance - annualWithdrawal);
  }
  yearlyData.push({
    year: finalYear,
    balance: parseFloat(balance.toFixed(2)),
    totalContributions: parseFloat(totalContributions.toFixed(2)),
    totalInterest: parseFloat(totalInterest.toFixed(2)),
    yearContributions: parseFloat(yearContributions.toFixed(2)),
    yearInterest: parseFloat(yearInterest.toFixed(2)),
    yearWithdrawal: parseFloat(finalWithdrawal.toFixed(2)),
  });

  const formulaString = buildFormulaString(inputs);

  return {
    finalBalance: parseFloat(balance.toFixed(2)),
    totalContributions: parseFloat(totalContributions.toFixed(2)),
    totalInterest: parseFloat(totalInterest.toFixed(2)),
    yearlyData,
    formulaString,
  };
}

export function exportToCSV(yearlyData: YearlyData[], filename = 'compound-interest.csv'): void {
  const headers = ['Year', 'Year Contributions', 'Year Interest', 'Year Withdrawal', 'Total Contributions', 'Total Interest', 'Balance'];
  const rows = yearlyData.map(d => [
    d.year,
    d.yearContributions.toFixed(2),
    d.yearInterest.toFixed(2),
    d.yearWithdrawal.toFixed(2),
    d.totalContributions.toFixed(2),
    d.totalInterest.toFixed(2),
    d.balance.toFixed(2),
  ]);

  const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatCurrencyFull(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export const timeToDouble = (annualRate: number): { years: number; months: number } => {
  if (annualRate <= 0) return { years: 0, months: 0 };
  const yearsExact = 72 / annualRate;
  const years = Math.floor(yearsExact);
  const months = Math.round((yearsExact - years) * 12);
  return { years, months };
};

export const effectiveAnnualRate = (nominalRate: number, compoundingPerYear: number): number => {
  if (compoundingPerYear <= 0 || nominalRate <= 0) return 0;
  return ((1 + nominalRate / 100 / compoundingPerYear) ** compoundingPerYear - 1) * 100;
};

export { frequencyLabel, contributionFrequencyLabel, compoundingPeriodsPerYear, contributionPeriodsPerYear };
