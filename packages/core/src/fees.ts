/** Flat contingent fees matching Waste Recruiters published rates:
 * https://wasterecruiters.com/rates/
 * Pay only when a referred seeker starts · 90-day replacement · net 30.
 */

export type FeeBand = {
  /** Inclusive lower bound of annual compensation */
  minInclusive: number;
  /** Exclusive upper bound; null = open-ended */
  maxExclusive: number | null;
  fee_usd: number | null;
  label: string;
  negotiable?: boolean;
};

export const WASTE_RECRUITERS_FEE_BANDS: FeeBand[] = [
  { minInclusive: 0, maxExclusive: 50_000, fee_usd: 7_500, label: "under $50,000" },
  { minInclusive: 50_000, maxExclusive: 75_000, fee_usd: 10_000, label: "$50,000 – $74,999" },
  { minInclusive: 75_000, maxExclusive: 100_000, fee_usd: 15_000, label: "$75,000 – $99,999" },
  { minInclusive: 100_000, maxExclusive: 125_000, fee_usd: 20_000, label: "$100,000 – $124,999" },
  { minInclusive: 125_000, maxExclusive: 150_000, fee_usd: 25_000, label: "$125,000 – $149,999" },
  {
    minInclusive: 150_000,
    maxExclusive: null,
    fee_usd: null,
    label: "$150,000+",
    negotiable: true,
  },
];

export type ContingentFeeQuote = {
  contingent_fee_usd: number | null;
  negotiable: boolean;
  band_label: string;
  source: "waste_recruiters_rates";
  source_url: string;
  guarantee_days: 90;
  saas_usd: 0;
};

export function quoteContingentFee(annualSalary: number): ContingentFeeQuote {
  const band =
    WASTE_RECRUITERS_FEE_BANDS.find(
      (b) =>
        annualSalary >= b.minInclusive &&
        (b.maxExclusive == null || annualSalary < b.maxExclusive),
    ) ?? WASTE_RECRUITERS_FEE_BANDS[WASTE_RECRUITERS_FEE_BANDS.length - 1];

  return {
    contingent_fee_usd: band.fee_usd,
    negotiable: Boolean(band.negotiable),
    band_label: band.label,
    source: "waste_recruiters_rates",
    source_url: "https://wasterecruiters.com/rates/",
    guarantee_days: 90,
    saas_usd: 0,
  };
}

/** @deprecated Prefer quoteContingentFee — returns numeric fee or 25000 fallback for negotiable band in legacy callers */
export function computeContingentFee(annualSalary: number): number {
  const q = quoteContingentFee(annualSalary);
  if (q.contingent_fee_usd != null) return q.contingent_fee_usd;
  return 25_000; // display floor when negotiable; UI/MCP should surface negotiable flag
}

export function salaryMidpoint(min: number | null, max: number | null): number {
  if (min != null && max != null) return (min + max) / 2;
  if (min != null) return min;
  if (max != null) return max;
  return 65_000;
}
