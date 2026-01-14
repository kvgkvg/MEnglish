import { LearningProgress } from "@/types";

/**
 * Calculate next review date from existing progress data (no DB call)
 */
export function calculateNextReviewDate(
  progressList: Array<LearningProgress | null>
): Date | null {
  const studiedProgress = progressList.filter((p): p is LearningProgress => p !== null);

  if (studiedProgress.length === 0) {
    return new Date(); // No words studied yet, due now
  }

  const nextReviewDates = studiedProgress
    .map((p) => new Date(p.next_review_date))
    .sort((a, b) => a.getTime() - b.getTime());

  return nextReviewDates[0] || new Date();
}
