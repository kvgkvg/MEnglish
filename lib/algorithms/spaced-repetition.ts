/**
 * Spaced Repetition Algorithm (SM-2 Variant)
 *
 * Memory Score Scale: 0-100
 * - 85-100: Mastered (review every 7 days)
 * - 70-84: Strong (review every 3 days)
 * - 50-69: Learning (review every 1 day)
 * - 0-49: Needs work (review same day)
 *
 * Goal: Keep all words above 85% through regular review
 */

import { LearningProgress } from "@/types";

export interface ReviewResult {
  wasCorrect: boolean;
  difficulty?: number; // 0-1 scale (0 = easy, 1 = hard)
}

export interface UpdatedProgress {
  memoryScore: number;
  nextReviewDate: Date;
  reviewCount: number;
  correctCount: number;
  incorrectCount: number;
  lastReviewed: Date;
}

/**
 * Calculate new memory score based on performance
 */
export function calculateMemoryScore(
  currentScore: number,
  wasCorrect: boolean,
  difficulty: number = 0.5
): number {
  let newScore = currentScore;

  if (wasCorrect) {
    // Increase score for correct answer
    // Harder questions (higher difficulty) give bigger boost
    const increase = 15 + difficulty * 10; // 15-25 points
    newScore = Math.min(100, currentScore + increase);
  } else {
    // Decrease score for incorrect answer
    // Harder questions (higher difficulty) give smaller penalty
    const decrease = 20 - difficulty * 10; // 10-20 points
    newScore = Math.max(0, currentScore - decrease);
  }

  return Math.round(newScore);
}

/**
 * Calculate next review date based on memory score
 */
export function calculateNextReviewDate(memoryScore: number): Date {
  const now = new Date();
  const nextReview = new Date(now);

  if (memoryScore >= 85) {
    // Mastered - review in 7 days
    nextReview.setDate(now.getDate() + 7);
  } else if (memoryScore >= 70) {
    // Strong - review in 3 days
    nextReview.setDate(now.getDate() + 3);
  } else if (memoryScore >= 50) {
    // Learning - review in 1 day
    nextReview.setDate(now.getDate() + 1);
  } else {
    // Needs work - review same day (in 4 hours)
    nextReview.setHours(now.getHours() + 4);
  }

  return nextReview;
}

/**
 * Update learning progress after a review session
 */
export function updateLearningProgress(
  currentProgress: LearningProgress | null,
  result: ReviewResult
): UpdatedProgress {
  const now = new Date();

  // Initialize defaults for new words
  const currentScore = currentProgress?.memory_score ?? 50;
  const reviewCount = (currentProgress?.review_count ?? 0) + 1;
  const correctCount = (currentProgress?.correct_count ?? 0) + (result.wasCorrect ? 1 : 0);
  const incorrectCount = (currentProgress?.incorrect_count ?? 0) + (result.wasCorrect ? 0 : 1);

  // Calculate new memory score
  const memoryScore = calculateMemoryScore(
    currentScore,
    result.wasCorrect,
    result.difficulty ?? 0.5
  );

  // Calculate next review date
  const nextReviewDate = calculateNextReviewDate(memoryScore);

  return {
    memoryScore,
    nextReviewDate,
    reviewCount,
    correctCount,
    incorrectCount,
    lastReviewed: now,
  };
}

/**
 * Calculate difficulty based on question context
 * Used to adjust memory score changes
 */
export function calculateDifficulty(context: {
  questionType?: string;
  responseTime?: number; // milliseconds
  previousAttempts?: number;
}): number {
  let difficulty = 0.5; // Default medium difficulty

  // Question type difficulty
  switch (context.questionType) {
    case "write":
      difficulty = 0.8; // Writing is harder
      break;
    case "multiple-choice":
      difficulty = 0.3; // Multiple choice is easier
      break;
    case "true-false":
      difficulty = 0.2; // True/false is easiest
      break;
    case "flashcard":
    case "matching":
      difficulty = 0.5; // Medium difficulty
      break;
  }

  // Adjust for response time (faster = easier for user)
  if (context.responseTime !== undefined) {
    if (context.responseTime < 3000) {
      difficulty -= 0.1; // Quick response suggests it was easy
    } else if (context.responseTime > 10000) {
      difficulty += 0.1; // Slow response suggests it was hard
    }
  }

  // Adjust for previous attempts
  if (context.previousAttempts !== undefined && context.previousAttempts > 0) {
    difficulty -= context.previousAttempts * 0.1; // Got it wrong before, so less credit
  }

  // Clamp between 0 and 1
  return Math.max(0, Math.min(1, difficulty));
}

/**
 * Determine if a word is due for review
 */
export function isDueForReview(progress: LearningProgress | null): boolean {
  if (!progress) {
    return true; // New words always need review
  }

  const now = new Date();
  const nextReview = new Date(progress.next_review_date);

  return now >= nextReview;
}

/**
 * Get words that need review from a list
 */
export function getWordsNeedingReview(
  words: Array<{ id: string; progress: LearningProgress | null }>
): string[] {
  return words
    .filter((word) => isDueForReview(word.progress))
    .map((word) => word.id);
}

/**
 * Calculate overall memory score for a set
 * Average of all word memory scores
 */
export function calculateSetMemoryScore(
  progressList: Array<LearningProgress | null>
): number {
  if (progressList.length === 0) return 0;

  const total = progressList.reduce((sum, progress) => {
    return sum + (progress?.memory_score ?? 50);
  }, 0);

  return Math.round(total / progressList.length);
}

/**
 * Get retention rate for a word
 * Percentage of correct answers
 */
export function getRetentionRate(progress: LearningProgress | null): number {
  if (!progress || progress.review_count === 0) {
    return 0;
  }

  return Math.round((progress.correct_count / progress.review_count) * 100);
}

/**
 * Determine mastery level based on memory score
 */
export function getMasteryLevel(memoryScore: number): {
  level: "mastered" | "strong" | "learning" | "needs-work";
  label: string;
  color: string;
} {
  if (memoryScore >= 85) {
    return {
      level: "mastered",
      label: "Mastered",
      color: "green",
    };
  } else if (memoryScore >= 70) {
    return {
      level: "strong",
      label: "Strong",
      color: "blue",
    };
  } else if (memoryScore >= 50) {
    return {
      level: "learning",
      label: "Learning",
      color: "yellow",
    };
  } else {
    return {
      level: "needs-work",
      label: "Needs Work",
      color: "red",
    };
  }
}

/**
 * Get review interval description
 */
export function getReviewInterval(memoryScore: number): string {
  if (memoryScore >= 85) {
    return "Review in 7 days";
  } else if (memoryScore >= 70) {
    return "Review in 3 days";
  } else if (memoryScore >= 50) {
    return "Review tomorrow";
  } else {
    return "Review today";
  }
}
