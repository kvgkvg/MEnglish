"use client";

import { useState } from "react";
import { VocabSet, VocabWord, LearningProgress } from "@/types";
import { WordCard } from "@/components/vocab-set/WordCard";
import { WordProgressCard } from "@/components/learning/WordProgressCard";
import { AddWordsDialog } from "@/components/vocab-set/AddWordsDialog";
import { ImportCSVDialog } from "@/components/vocab-set/ImportCSVDialog";
import { ImportEssayDialog } from "@/components/vocab-set/ImportEssayDialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, BookOpen, ArrowLeft, FileText, ChevronDown, Sparkles, TrendingUp, Clock } from "lucide-react";
import Link from "next/link";
import { calculateSetMemoryScore } from "@/lib/algorithms/spaced-repetition";
import { Progress } from "@/components/ui/progress";

interface SetDetailClientProps {
  vocabSet: VocabSet & { vocab_words?: VocabWord[] };
  words: VocabWord[];
  wordsWithProgress: Array<{
    word: VocabWord;
    progress: LearningProgress | null;
  }>;
}

export function SetDetailClient({ vocabSet, words, wordsWithProgress }: SetDetailClientProps) {
  const [addWordsOpen, setAddWordsOpen] = useState(false);
  const [importCSVOpen, setImportCSVOpen] = useState(false);
  const [importEssayOpen, setImportEssayOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"all" | "due">("all");

  const hasWords = words.length > 0;

  // Calculate set-level statistics
  const progressList = wordsWithProgress.map((w) => w.progress);
  const setMemoryScore = calculateSetMemoryScore(progressList);

  const wordsDue = wordsWithProgress.filter((w) => {
    if (!w.progress) return true; // New words are due
    return new Date() >= new Date(w.progress.next_review_date);
  });

  const masteredCount = wordsWithProgress.filter(
    (w) => w.progress && w.progress.memory_score >= 85
  ).length;

  const displayWords = viewMode === "due" ? wordsDue : wordsWithProgress;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <Link
          href="/dashboard/learn"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Learn
        </Link>

        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">{vocabSet.name}</h1>
            {vocabSet.description && (
              <p className="text-gray-600 mt-2">{vocabSet.description}</p>
            )}
            <div className="flex items-center gap-4 mt-4 text-sm">
              <span className="font-medium text-gray-900">{words.length} words</span>
              {words.length > 0 && (
                <>
                  <span className="text-gray-400">•</span>
                  <span className="text-gray-600">
                    {masteredCount} mastered ({Math.round((masteredCount / words.length) * 100)}%)
                  </span>
                  {wordsDue.length > 0 && (
                    <>
                      <span className="text-gray-400">•</span>
                      <span className="text-orange-600 font-medium">
                        {wordsDue.length} due for review
                      </span>
                    </>
                  )}
                </>
              )}
            </div>

            {/* Set Memory Score */}
            {words.length > 0 && (
              <div className="mt-4 max-w-md">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 flex items-center gap-1">
                    <TrendingUp className="w-4 h-4" />
                    Set Memory Score
                  </span>
                  <span className="text-sm font-bold text-blue-600">{setMemoryScore}%</span>
                </div>
                <Progress value={setMemoryScore} className="h-2" />
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Words
                  <ChevronDown className="w-4 h-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setAddWordsOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Manually
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setImportCSVOpen(true)}>
                  <FileText className="w-4 h-4 mr-2" />
                  Import CSV/TSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setImportEssayOpen(true)}>
                  <Sparkles className="w-4 h-4 mr-2" />
                  AI Essay Import
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            {hasWords && (
              <Button asChild>
                <Link href={`/dashboard/learn/${vocabSet.id}/learn`}>
                  <BookOpen className="w-4 h-4 mr-2" />
                  Start Learning
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Empty State */}
      {!hasWords && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              No Words Yet
            </h2>
            <p className="text-gray-600 mb-6">
              Add vocabulary words to start building your set. You can add them manually,
              import from CSV/TSV files, or use AI to extract words from essays.
            </p>
            <Button onClick={() => setAddWordsOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Words
            </Button>
          </div>
        </div>
      )}

      {/* Words Grid */}
      {hasWords && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Vocabulary Words
            </h2>
            <div className="flex items-center gap-3">
              {/* View Mode Toggle */}
              <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode("all")}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                    viewMode === "all"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  All Words ({wordsWithProgress.length})
                </button>
                <button
                  onClick={() => setViewMode("due")}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all flex items-center gap-1 ${
                    viewMode === "due"
                      ? "bg-white text-orange-600 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <Clock className="w-3 h-3" />
                  Due for Review ({wordsDue.length})
                </button>
              </div>
            </div>
          </div>

          {/* Empty state for "Due" view */}
          {viewMode === "due" && wordsDue.length === 0 && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
              <div className="max-w-md mx-auto">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-green-900 mb-2">
                  All Caught Up!
                </h3>
                <p className="text-green-700">
                  No words need review right now. Check back later or practice with learning modes to strengthen your memory.
                </p>
              </div>
            </div>
          )}

          {/* Words Grid */}
          {displayWords.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayWords.map((item) => (
                <WordProgressCard
                  key={item.word.id}
                  word={item.word.word}
                  definition={item.word.definition}
                  progress={item.progress}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Dialogs */}
      <AddWordsDialog
        open={addWordsOpen}
        onOpenChange={setAddWordsOpen}
        setId={vocabSet.id}
        setName={vocabSet.name}
      />
      <ImportCSVDialog
        open={importCSVOpen}
        onOpenChange={setImportCSVOpen}
        setId={vocabSet.id}
        setName={vocabSet.name}
      />
      <ImportEssayDialog
        open={importEssayOpen}
        onOpenChange={setImportEssayOpen}
        setId={vocabSet.id}
        setName={vocabSet.name}
      />
    </div>
  );
}
