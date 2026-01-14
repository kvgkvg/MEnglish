"use server";

import { createClient } from "@/lib/supabase/server";
import { LearningProgress } from "@/types";
import {
  updateLearningProgress,
  ReviewResult,
  calculateDifficulty,
} from "@/lib/algorithms/spaced-repetition";

/**
 * Get learning progress for a specific word
 */
export async function getWordProgress(
  wordId: string
): Promise<LearningProgress | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  const { data, error } = await supabase
    .from("learning_progress")
    .select("*")
    .eq("user_id", user.id)
    .eq("word_id", wordId)
    .single();

  if (error && error.code !== "PGRST116") {
    // PGRST116 = no rows returned (word not studied yet)
    console.error("Error fetching word progress:", error);
    return null;
  }

  return data;
}

/**
 * Get learning progress for multiple words
 */
export async function getWordsProgress(
  wordIds: string[]
): Promise<Map<string, LearningProgress>> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  const { data, error } = await supabase
    .from("learning_progress")
    .select("*")
    .eq("user_id", user.id)
    .in("word_id", wordIds);

  if (error) {
    console.error("Error fetching words progress:", error);
    return new Map();
  }

  const progressMap = new Map<string, LearningProgress>();
  data?.forEach((progress) => {
    progressMap.set(progress.word_id, progress);
  });

  return progressMap;
}

/**
 * Update progress for a single word after review
 */
export async function updateWordProgress(
  wordId: string,
  result: ReviewResult,
  context?: {
    questionType?: string;
    responseTime?: number;
    previousAttempts?: number;
  }
): Promise<LearningProgress> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  // Get current progress
  const currentProgress = await getWordProgress(wordId);

  // Calculate difficulty if context provided
  const difficulty = context ? calculateDifficulty(context) : result.difficulty;

  // Calculate updated progress using spaced repetition algorithm
  const updated = updateLearningProgress(currentProgress, {
    wasCorrect: result.wasCorrect,
    difficulty,
  });

  // Upsert to database
  const { data, error } = await supabase
    .from("learning_progress")
    .upsert(
      {
        user_id: user.id,
        word_id: wordId,
        memory_score: updated.memoryScore,
        next_review_date: updated.nextReviewDate.toISOString(),
        last_reviewed: updated.lastReviewed.toISOString(),
        review_count: updated.reviewCount,
        correct_count: updated.correctCount,
        incorrect_count: updated.incorrectCount,
      },
      {
        onConflict: "user_id,word_id",
      }
    )
    .select()
    .single();

  if (error) {
    console.error("Error updating word progress:", error);
    throw new Error("Failed to update learning progress");
  }

  return data;
}

/**
 * Batch update progress for multiple words (e.g., after a learning session)
 */
export async function updateMultipleWordsProgress(
  results: Array<{
    wordId: string;
    wasCorrect: boolean;
    questionType?: string;
    responseTime?: number;
  }>
): Promise<void> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  // Get current progress for all words
  const wordIds = results.map((r) => r.wordId);
  const progressMap = await getWordsProgress(wordIds);

  // Calculate updates for each word
  const updates = results.map((result) => {
    const currentProgress = progressMap.get(result.wordId) || null;
    const difficulty = calculateDifficulty({
      questionType: result.questionType,
      responseTime: result.responseTime,
    });

    const updated = updateLearningProgress(currentProgress, {
      wasCorrect: result.wasCorrect,
      difficulty,
    });

    return {
      user_id: user.id,
      word_id: result.wordId,
      memory_score: updated.memoryScore,
      next_review_date: updated.nextReviewDate.toISOString(),
      last_reviewed: updated.lastReviewed.toISOString(),
      review_count: updated.reviewCount,
      correct_count: updated.correctCount,
      incorrect_count: updated.incorrectCount,
    };
  });

  // Batch upsert
  const { error } = await supabase
    .from("learning_progress")
    .upsert(updates, { onConflict: "user_id,word_id" });

  if (error) {
    console.error("Error batch updating progress:", error);
    throw new Error("Failed to update learning progress");
  }
}

/**
 * Record a learning session
 */
export async function recordLearningSession(
  setId: string,
  sessionType: "flashcard" | "multiple_choice" | "write" | "matching" | "test",
  score: number | null = null
): Promise<void> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  const { error } = await supabase.from("learning_sessions").insert({
    user_id: user.id,
    set_id: setId,
    session_type: sessionType,
    score: score,
    completed_at: new Date().toISOString(),
  });

  if (error) {
    console.error("Error recording learning session:", error);
    throw new Error("Failed to record learning session");
  }

  // Update user stats last activity date
  await updateUserStats(user.id);
}

/**
 * Update user stats (last activity, streak, etc.)
 */
async function updateUserStats(userId: string): Promise<void> {
  const supabase = await createClient();

  // Get current stats
  const { data: currentStats } = await supabase
    .from("user_stats")
    .select("*")
    .eq("user_id", userId)
    .single();

  const now = new Date();
  const today = now.toISOString().split("T")[0];

  let currentStreak = currentStats?.current_streak ?? 0;
  let longestStreak = currentStats?.longest_streak ?? 0;

  if (currentStats?.last_activity_date) {
    const lastActivity = new Date(currentStats.last_activity_date);
    const lastActivityDate = lastActivity.toISOString().split("T")[0];

    if (lastActivityDate === today) {
      // Same day, no change to streak
    } else {
      // Check if it's consecutive days
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayDate = yesterday.toISOString().split("T")[0];

      if (lastActivityDate === yesterdayDate) {
        // Consecutive day, increment streak
        currentStreak += 1;
        longestStreak = Math.max(longestStreak, currentStreak);
      } else {
        // Streak broken, reset to 1
        currentStreak = 1;
      }
    }
  } else {
    // First activity
    currentStreak = 1;
    longestStreak = 1;
  }

  // Upsert user stats
  await supabase
    .from("user_stats")
    .upsert(
      {
        user_id: userId,
        current_streak: currentStreak,
        longest_streak: longestStreak,
        last_activity_date: today,
        total_words_learned:
          currentStats?.total_words_learned ?? 0, // Will be updated separately
      },
      {
        onConflict: "user_id",
      }
    );
}

/**
 * Get all words from a set with their progress
 */
export async function getSetWordsWithProgress(setId: string): Promise<
  Array<{
    word: any;
    progress: LearningProgress | null;
  }>
> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  // Get all words in the set
  const { data: words, error: wordsError } = await supabase
    .from("vocab_words")
    .select("*")
    .eq("set_id", setId);

  if (wordsError) {
    throw new Error("Failed to fetch words");
  }

  if (!words || words.length === 0) {
    return [];
  }

  // Get progress for all words
  const wordIds = words.map((w) => w.id);
  const progressMap = await getWordsProgress(wordIds);

  // Combine words with their progress
  return words.map((word) => ({
    word,
    progress: progressMap.get(word.id) || null,
  }));
}

/**
 * Get words that are due for review in a set
 */
export async function getDueWordsInSet(setId: string): Promise<string[]> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  // Get all words in the set
  const { data: words } = await supabase
    .from("vocab_words")
    .select("id")
    .eq("set_id", setId);

  if (!words || words.length === 0) {
    return [];
  }

  const wordIds = words.map((w) => w.id);

  // Get progress for words
  const { data: progressList } = await supabase
    .from("learning_progress")
    .select("*")
    .eq("user_id", user.id)
    .in("word_id", wordIds);

  const now = new Date();
  const dueWords: string[] = [];

  // Check which words are due
  for (const word of words) {
    const progress = progressList?.find((p) => p.word_id === word.id);

    if (!progress) {
      // Never studied, due for review
      dueWords.push(word.id);
    } else {
      const nextReview = new Date(progress.next_review_date);
      if (now >= nextReview) {
        dueWords.push(word.id);
      }
    }
  }

  return dueWords;
}

/**
 * Check if a SET is due for review (set-based, not word-based)
 * Returns the next review date for the entire set
 */
export async function getSetNextReviewDate(setId: string): Promise<Date | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  // Get all words with progress
  const wordsWithProgress = await getSetWordsWithProgress(setId);

  if (wordsWithProgress.length === 0) {
    return null; // No words in set
  }

  // Check if any words have been studied
  const studiedWords = wordsWithProgress.filter((w) => w.progress !== null);

  if (studiedWords.length === 0) {
    // No words studied yet, set is due now
    return new Date();
  }

  // Find the earliest next review date among all words
  // This means the set is "due" when ANY word needs review
  const nextReviewDates = studiedWords
    .map((w) => w.progress!.next_review_date)
    .map((dateStr) => new Date(dateStr))
    .sort((a, b) => a.getTime() - b.getTime());

  return nextReviewDates[0] || new Date();
}

/**
 * Check if a set is due for review right now
 */
export async function isSetDueForReview(setId: string): Promise<boolean> {
  const nextReviewDate = await getSetNextReviewDate(setId);

  if (!nextReviewDate) {
    return true; // No words or never studied, should review
  }

  const now = new Date();
  return now >= nextReviewDate;
}
