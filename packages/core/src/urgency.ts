import type { RoleFamily } from "./schemas";

export type UrgencyInput = {
  sign_on_bonus_usd: number | null;
  days_open: number;
  role_family: RoleFamily;
  hard_to_fill?: boolean;
};

export function computeUrgencyScore(input: UrgencyInput): number {
  let score = 20;
  if (input.sign_on_bonus_usd && input.sign_on_bonus_usd >= 1000) {
    score += Math.min(30, Math.floor(input.sign_on_bonus_usd / 500));
  }
  if (input.days_open > 30) score += 25;
  else if (input.days_open > 14) score += 15;
  if (input.role_family === "driver") score += 10;
  if (input.hard_to_fill) score += 20;
  return Math.min(100, Math.max(0, score));
}
