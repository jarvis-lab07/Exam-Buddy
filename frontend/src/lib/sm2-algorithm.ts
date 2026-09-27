/**
 * Scientific Spaced Repetition SuperMemo-2 (SM-2) Algorithm
 * 
 * Grades:
 * 0: Again (Complete blackout)
 * 1: Hard (Incorrect response; correct remembered upon seeing)
 * 2: Good (Correct response with effort)
 * 3: Easy (Perfect recall)
 */

export interface SM2State {
  repetition: number;
  interval: number; // in days
  easeFactor: number;
  nextReviewAt: string;
}

export function calculateSM2(
  grade: number, // 0, 1, 2, or 3
  previousState?: Partial<SM2State>
): SM2State {
  let repetition = previousState?.repetition ?? 0;
  let interval = previousState?.interval ?? 1;
  let easeFactor = previousState?.easeFactor ?? 2.5;

  // Convert 4-point rating (0-3) to 6-point SM-2 scale (0-5)
  // 0: Again -> 0
  // 1: Hard -> 2
  // 2: Good -> 4
  // 3: Easy -> 5
  const sm2GradeMap: Record<number, number> = { 0: 0, 1: 2, 2: 4, 3: 5 };
  const q = sm2GradeMap[grade] ?? 3;

  if (q >= 3) {
    if (repetition === 0) {
      interval = 1;
    } else if (repetition === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
    repetition += 1;
  } else {
    repetition = 0;
    interval = 1;
  }

  // Update ease factor: EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  easeFactor = easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
  if (easeFactor < 1.3) easeFactor = 1.3;

  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + interval);

  return {
    repetition,
    interval,
    easeFactor: Number(easeFactor.toFixed(2)),
    nextReviewAt: nextReviewDate.toISOString(),
  };
}
