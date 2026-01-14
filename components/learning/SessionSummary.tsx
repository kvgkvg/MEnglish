"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { RotateCcw, CheckCircle2, XCircle, BookOpen } from "lucide-react";
import {
  updateMultipleWordsProgress,
  recordLearningSession,
} from "@/lib/actions/learning-progress";
import { Confetti } from "@/components/ui/confetti";
import { motion } from "framer-motion";

interface CardResult {
  wordId: string;
  word: string;
  correct: boolean;
}

interface SessionSummaryProps {
  setId: string;
  setName: string;
  results: CardResult[];
  onRestart: () => void;
}

export function SessionSummary({
  setId,
  setName,
  results,
  onRestart,
}: SessionSummaryProps) {
  const [isRecording, setIsRecording] = useState(true);

  const knownCount = results.filter((r) => r.correct).length;
  const learningCount = results.filter((r) => !r.correct).length;
  const totalCount = results.length;
  const percentage = Math.round((knownCount / totalCount) * 100);

  // Record progress when summary mounts
  useEffect(() => {
    const recordProgress = async () => {
      try {
        // Update progress for all reviewed words
        await updateMultipleWordsProgress(
          results.map((result) => ({
            wordId: result.wordId,
            wasCorrect: result.correct,
            questionType: "flashcard",
          }))
        );

        // Record the learning session
        await recordLearningSession(setId, "flashcard", percentage);
      } catch (error) {
        console.error("Error recording progress:", error);
      } finally {
        setIsRecording(false);
      }
    };

    recordProgress();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4">
      <Confetti active={percentage === 100} />
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-xl shadow-lg border border-gray-200 p-8"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 0.6, delay: 0.2 }}
              className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <CheckCircle2 className="w-10 h-10 text-blue-600" />
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-bold text-gray-900 mb-2"
            >
              Session Complete!
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-gray-600"
            >
              You reviewed {totalCount} {totalCount === 1 ? "card" : "cards"} from {setName}
            </motion.p>
          </div>

          {/* Score Display */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, type: "spring" }}
            className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-8 text-center mb-8"
          >
            <div className="text-white">
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7, type: "spring", stiffness: 200 }}
                className="text-6xl font-bold mb-2"
              >
                {percentage}%
              </motion.div>
              <div className="text-lg opacity-90">Known Words</div>
            </div>
          </motion.div>

          {/* Statistics */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
              <CheckCircle2 className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <div className="text-3xl font-bold text-green-600 mb-1">
                {knownCount}
              </div>
              <div className="text-sm text-gray-600">I Know These</div>
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 text-center">
              <XCircle className="w-8 h-8 text-orange-600 mx-auto mb-2" />
              <div className="text-3xl font-bold text-orange-600 mb-1">
                {learningCount}
              </div>
              <div className="text-sm text-gray-600">Still Learning</div>
            </div>
          </div>

          {/* Performance Message */}
          <div className="mb-8 text-center">
            {percentage === 100 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-lg text-green-800 font-medium">
                  🎉 Perfect! You know all the words in this set!
                </p>
              </div>
            )}
            {percentage >= 75 && percentage < 100 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-lg text-blue-800 font-medium">
                  Great job! Keep reviewing to master the remaining words!
                </p>
              </div>
            )}
            {percentage >= 50 && percentage < 75 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-lg text-yellow-800 font-medium">
                  Good progress! Practice more to strengthen your memory!
                </p>
              </div>
            )}
            {percentage < 50 && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <p className="text-lg text-orange-800 font-medium">
                  Keep practicing! Regular review will help you learn these words!
                </p>
              </div>
            )}
          </div>

          {/* Words to Review */}
          {learningCount > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Words to Review
              </h3>
              <div className="space-y-2">
                {results
                  .filter((r) => !r.correct)
                  .map((result, index) => (
                    <div
                      key={index}
                      className="bg-orange-50 border border-orange-200 rounded-lg px-4 py-3 flex items-center gap-3"
                    >
                      <BookOpen className="w-5 h-5 text-orange-600 flex-shrink-0" />
                      <span className="text-gray-900 font-medium">
                        {result.word}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={onRestart}
              className="flex-1"
              variant="outline"
              size="lg"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Study Again
            </Button>
            <Button asChild className="flex-1" size="lg">
              <Link href={`/dashboard/learn/${setId}/learn/multiple-choice`}>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Test Yourself
              </Link>
            </Button>
            <Button asChild variant="outline" className="flex-1" size="lg">
              <Link href={`/dashboard/learn/${setId}/learn`}>
                Back to Modes
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
