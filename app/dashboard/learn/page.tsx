import { getFolders } from "@/lib/actions/folders";
import { getVocabSets } from "@/lib/actions/sets";
import { getSetWordsWithProgress, getSetNextReviewDate } from "@/lib/actions/learning-progress";
import { calculateSetMemoryScore } from "@/lib/algorithms/spaced-repetition";
import { LearnPageClient } from "./LearnPageClient";

export default async function LearnPage() {
  const [foldersResult, setsResult] = await Promise.all([
    getFolders(),
    getVocabSets(),
  ]);

  const folders = foldersResult.data || [];
  const sets = setsResult.data || [];

  // Fetch progress for all sets
  const setsWithProgressData = await Promise.all(
    sets.map(async (set) => {
      try {
        const wordsWithProgress = await getSetWordsWithProgress(set.id);
        const nextReviewDate = await getSetNextReviewDate(set.id);

        const progressList = wordsWithProgress.map((w) => w.progress);
        const memoryScore = calculateSetMemoryScore(progressList);

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
      } catch (error) {
        // If error fetching progress, return set with default values
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
    })
  );

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
