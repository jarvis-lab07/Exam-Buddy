/**
 * Competitive Exam Simulation Mode & Negative Marking Engine
 */

export interface ExamSimulationSettings {
  totalQuestions: number;
  durationMinutes: number;
  positiveMarksPerQuestion: number;
  negativeMarkingPenalty: number; // e.g., 0.25, 0.33, or 1.0
  allowReviewLater: boolean;
}

export interface QuestionSpeedMetric {
  questionIndex: number;
  secondsSpent: number;
  status: 'answered' | 'skipped' | 'flagged';
  scoreImpact: number;
}

export interface ExamResultSummary {
  totalAttempted: number;
  correctCount: number;
  incorrectCount: number;
  unattemptedCount: number;
  rawScore: number;
  negativePenaltyScore: number;
  finalScore: number;
  maxScore: number;
  percentage: number;
  avgSecondsPerQuestion: number;
  speedRating: 'Fast & Precise' | 'Steady Pace' | 'Time Crunch';
}

/**
 * Calculates final exam score considering negative marking penalty
 */
export function calculateExamScore(
  answers: { selectedOption: number; correctOption: number; secondsSpent: number }[],
  settings: ExamSimulationSettings
): ExamResultSummary {
  let correctCount = 0;
  let incorrectCount = 0;
  let unattemptedCount = 0;
  let totalSeconds = 0;

  answers.forEach((ans) => {
    totalSeconds += ans.secondsSpent;
    if (ans.selectedOption === -1) {
      unattemptedCount += 1;
    } else if (ans.selectedOption === ans.correctOption) {
      correctCount += 1;
    } else {
      incorrectCount += 1;
    }
  });

  const rawScore = correctCount * settings.positiveMarksPerQuestion;
  const negativePenaltyScore = incorrectCount * settings.negativeMarkingPenalty;
  const finalScore = Math.max(0, rawScore - negativePenaltyScore);
  const maxScore = settings.totalQuestions * settings.positiveMarksPerQuestion;
  const percentage = Math.round((finalScore / maxScore) * 100);

  const attemptedCount = correctCount + incorrectCount;
  const avgSecondsPerQuestion = attemptedCount > 0 ? Math.round(totalSeconds / attemptedCount) : 0;

  let speedRating: 'Fast & Precise' | 'Steady Pace' | 'Time Crunch' = 'Steady Pace';
  const targetSecondsPerQ = (settings.durationMinutes * 60) / settings.totalQuestions;

  if (avgSecondsPerQuestion < targetSecondsPerQ * 0.75) {
    speedRating = 'Fast & Precise';
  } else if (avgSecondsPerQuestion > targetSecondsPerQ * 1.1) {
    speedRating = 'Time Crunch';
  }

  return {
    totalAttempted: attemptedCount,
    correctCount,
    incorrectCount,
    unattemptedCount,
    rawScore,
    negativePenaltyScore,
    finalScore,
    maxScore,
    percentage,
    avgSecondsPerQuestion,
    speedRating,
  };
}
