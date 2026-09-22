/** Waste Recruiters–style flat contingent fees by annual compensation band. */
export function computeContingentFee(annualSalary: number): number {
  if (annualSalary < 50_000) return 7_500;
  if (annualSalary < 75_000) return 10_000;
  if (annualSalary < 100_000) return 15_000;
  if (annualSalary < 125_000) return 20_000;
  if (annualSalary < 150_000) return 25_000;
  return 25_000;
}

export function salaryMidpoint(min: number | null, max: number | null): number {
  if (min != null && max != null) return (min + max) / 2;
  if (min != null) return min;
  if (max != null) return max;
  return 65_000;
}
