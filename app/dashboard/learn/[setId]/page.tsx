import { getVocabSetById } from "@/lib/actions/sets";
import { getWordsForSet } from "@/lib/actions/words";
import { getSetWordsWithProgress } from "@/lib/actions/learning-progress";
import { notFound } from "next/navigation";
import { SetDetailClient } from "./SetDetailClient";

export default async function SetDetailPage({
  params,
}: {
  params: Promise<{ setId: string }>;
}) {
  const { setId } = await params;

  const [setResult, wordsResult, wordsWithProgressResult] = await Promise.all([
    getVocabSetById(setId),
    getWordsForSet(setId),
    getSetWordsWithProgress(setId).catch(() => []),
  ]);

  if (setResult.error || !setResult.data) {
    notFound();
  }

  const vocabSet = setResult.data;
  const words = wordsResult.data || [];
  const wordsWithProgress = wordsWithProgressResult || [];

  return (
    <SetDetailClient
      vocabSet={vocabSet}
      words={words}
      wordsWithProgress={wordsWithProgress}
    />
  );
}
