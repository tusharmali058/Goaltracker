import prisma from "@/lib/prisma";

export const SCORING_RULES = {
  SAME_DAY: 1.0,
  LATE_1_DAY: 0.9,
  LATE_2_DAYS: 0.85,
  LATE_3_DAYS: 0.8,
  LATE_4_PLUS: 0.75,
};

export function getLateMultiplier(originalDate: Date, completionDate: Date): number {
  const diffTime = Math.abs(completionDate.getTime() - originalDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays <= 0) return SCORING_RULES.SAME_DAY;
  if (diffDays === 1) return SCORING_RULES.LATE_1_DAY;
  if (diffDays === 2) return SCORING_RULES.LATE_2_DAYS;
  if (diffDays === 3) return SCORING_RULES.LATE_3_DAYS;
  return SCORING_RULES.LATE_4_PLUS;
}

export function calculateDailyScore(completedWeights: number, totalWeights: number): number {
  if (totalWeights === 0) return 0;
  return (completedWeights / totalWeights) * 100; // max 100 points
}

export function calculateWeeklyDeduction(remainingWeight: number, totalPlannedWeight: number): number {
  if (totalPlannedWeight === 0) return 0;
  
  const incompleteRatio = remainingWeight / totalPlannedWeight;
  // Non-linear penalty: higher percentage of incomplete work = harsher penalty
  // Example: 10% incomplete = 5% deduction, 50% incomplete = 50% deduction, 100% incomplete = 100% deduction
  return (incompleteRatio * incompleteRatio) * 100;
}
