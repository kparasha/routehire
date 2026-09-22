/** Parse sign-on bonus from job description text. */
export function parseSignOnBonus(text: string): number | null {
  const normalized = text.replace(/,/g, "");
  const dollarMatch = normalized.match(/\$\s*([\d.]+)\s*(?:k|K)?/);
  if (dollarMatch) {
    let n = parseFloat(dollarMatch[1]);
    if (/k/i.test(dollarMatch[0])) n *= 1000;
    return Math.round(n);
  }
  const bonusMatch = normalized.match(/([\d.]+)\s*k?\s*(?:sign[- ]?on|bonus)/i);
  if (bonusMatch) {
    let n = parseFloat(bonusMatch[1]);
    if (/k/i.test(bonusMatch[0])) n *= 1000;
    return Math.round(n);
  }
  return null;
}
