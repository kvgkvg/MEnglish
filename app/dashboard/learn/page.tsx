import { getFolders } from "@/lib/actions/folders";
import { getVocabSets } from "@/lib/actions/sets";
import { getAllSetsWordsWithProgress } from "@/lib/actions/learning-progress";
import { calculateSetMemoryScore } from "@/lib/algorithms/spaced-repetition";
import { calculateNextReviewDate } from "@/lib/utils/progress-helpers";
import { LearnPageClient } from "./LearnPageClient";

// Revalidate every 30 seconds for faster navigation
export const revalidate = 30;

export default async function LearnPage() {
  // Fetch folders and sets in parallel
  const [foldersResult, setsResult] = await Promise.all([
    getFolders(),
    getVocabSets(),
  ]);

  const folders = foldersResult.data || [];
  const sets = setsResult.data || [];

  // Batch fetch all words with progress in just 2 DB queries (instead of 2*N)
  const setIds = sets.map((s) => s.id);
  const allSetsProgress = await getAllSetsWordsWithProgress(setIds);

  // Process all sets using the cached data
  const setsWithProgressData = sets.map((set) => {
    try {
      const wordsWithProgress = allSetsProgress.get(set.id) || [];
      const progressList = wordsWithProgress.map((w) => w.progress);

      // Calculate from existing data (no extra DB call)
      const memoryScore = calculateSetMemoryScore(progressList);
      const nextReviewDate = calculateNextReviewDate(progressList);

      const masteredCount = wordsWithProgress.filter(
        (w) => w.progress && w.progress.memory_score >= 85
      ).length;

      const wordCount = wordsWithProgress.length;

      // Check if set is due for review
      const isDue = nextReviewDate ? new Date() >= nextReviewDate : true;

      // Extract just the progress for calendar
      const progress = progressList.filter((p) => p !== null);

      return {
        set: {
          ...set,
          memoryScore,
          masteredCount,
          isDue,
          nextReviewDate: nextReviewDate?.toISOString() || null,
          wordCount,
        },
        progress: progress.filter((p): p is NonNullable<typeof p> => p !== null),
      };
    } catch {
      // If error processing, return set with default values
      return {
        set: {
          ...set,
          memoryScore: 0,
          masteredCount: 0,
          isDue: false,
          nextReviewDate: null,
          wordCount: 0,
        },
        progress: [],
      };
    }
  });

  const setsWithProgress = setsWithProgressData.map((s) => s.set);
  const setsForCalendar = setsWithProgressData.map((s) => ({
    set: s.set,
    progress: s.progress,
    nextReviewDate: s.set.nextReviewDate,
  }));

  return (
    <LearnPageClient
      folders={folders}
      sets={setsWithProgress}
      setsForCalendar={setsForCalendar}
    />
  );
}
