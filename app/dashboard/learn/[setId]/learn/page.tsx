import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { LearnModeSelection } from "@/components/learning/LearnModeSelection";
import { getSetWordsWithProgress, getDueWordsInSet } from "@/lib/actions/learning-progress";
import { calculateSetMemoryScore } from "@/lib/algorithms/spaced-repetition";

export default async function LearnPage({
  params,
}: {
  params: Promise<{ setId: string }>;
}) {
  const { setId } = await params;
  const supabase = await createClient();

  // Get authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    notFound();
  }

  // Get vocab set with words
  const { data: vocabSet, error } = await supabase
    .from("vocab_sets")
    .select(
      `
      *,
      vocab_words (*)
    `
    )
    .eq("id", setId)
    .eq("user_id", user.id)
    .single();

  if (error || !vocabSet) {
    notFound();
  }

  // Get progress data
  const wordsWithProgress = await getSetWordsWithProgress(setId).catch(() => []);
  const dueWordIds = await getDueWordsInSet(setId).catch(() => []);

  const progressList = wordsWithProgress.map((w) => w.progress);
  const setMemoryScore = calculateSetMemoryScore(progressList);

  const masteredCount = wordsWithProgress.filter(
    (w) => w.progress && w.progress.memory_score >= 85
  ).length;

  return (
    <LearnModeSelection
      setId={vocabSet.id}
      setName={vocabSet.name}
      wordCount={vocabSet.vocab_words?.length || 0}
      memoryScore={setMemoryScore}
      masteredCount={masteredCount}
      dueCount={dueWordIds.length}
    />
  );
}
