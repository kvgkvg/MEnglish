"use client";

import { useState, useEffect, useRef } from "react";
import { VocabWord } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Check, X, RotateCcw } from "lucide-react";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";
import { matchAnswer, MatchResult } from "@/lib/utils/string-matcher";
import {
  updateMultipleWordsProgress,
  recordLearningSession,
} from "@/lib/actions/learning-progress";

interface WriteTheWordQuizProps {
  setId: string;
  setName: string;
  words: VocabWord[];
}

interface Answer {
  wordId: string;
  word: string;
  userAnswer: string;
  matchResult: MatchResult;
}

export function WriteTheWordQuiz({
  setId,
  setName,
  words,
}: WriteTheWordQuizProps) {
  const [shuffledWords, setShuffledWords] = useState<VocabWord[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [hasAnswered, setHasAnswered] = useState(false);
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [showResults, setShowResults] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Shuffle words on mount
  useEffect(() => {
    const shuffled = [...words].sort(() => Math.random() - 0.5);
    setShuffledWords(shuffled);
  }, [words]);

  // Focus input when question changes
  useEffect(() => {
    if (!hasAnswered && inputRef.current) {
      inputRef.current.focus();
    }
  }, [currentIndex, hasAnswered]);

  // Record progress when quiz completes
  useEffect(() => {
    if (!showResults || answers.length === 0) return;

    const recordProgress = async () => {
      try {
        const correctCount = answers.filter((a) => a.matchResult.isCorrect).length;
        const percentage = Math.round((correctCount / answers.length) * 100);

        // Update progress for all answered questions
        await updateMultipleWordsProgress(
          answers.map((answer) => ({
            wordId: answer.wordId,
            wasCorrect: answer.matchResult.isCorrect,
            questionType: "write",
          }))
        );

        // Record the learning session
        await recordLearningSession(setId, "write", percentage);
      } catch (error) {
        console.error("Error recording progress:", error);
      }
    };

    recordProgress();
  }, [showResults, answers, setId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!userInput.trim()) return;

    if (hasAnswered) {
      // If already answered, Enter key moves to next question
      handleNext();
      return;
    }

    const currentWord = shuffledWords[currentIndex];
    const result = matchAnswer(userInput, currentWord.word);

    setMatchResult(result);
    setHasAnswered(true);

    // Record answer
    setAnswers([
      ...answers,
      {
        wordId: currentWord.id,
        word: currentWord.word,
        userAnswer: userInput,
        matchResult: result,
      },
    ]);
  };

  const handleNext = () => {
    if (currentIndex < shuffledWords.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setUserInput("");
      setHasAnswered(false);
      setMatchResult(null);
    } else {
      setShowResults(true);
    }
  };

  const handleRestart = () => {
    const shuffled = [...words].sort(() => Math.random() - 0.5);
    setShuffledWords(shuffled);
    setCurrentIndex(0);
    setUserInput("");
    setHasAnswered(false);
    setMatchResult(null);
    setAnswers([]);
    setShowResults(false);
  };

  if (shuffledWords.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Preparing questions...</p>
        </div>
      </div>
    );
  }

  // Show results screen
  if (showResults) {
    const correctCount = answers.filter((a) => a.matchResult.isCorrect).length;
    const totalCount = answers.length;
    const percentage = Math.round((correctCount / totalCount) * 100);

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
            {/* Results Header */}
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-10 h-10 text-purple-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Quiz Complete!
              </h1>
              <p className="text-gray-600">
                You answered {correctCount} out of {totalCount} questions correctly
              </p>
            </div>

            {/* Score Display */}
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-8 text-center mb-8">
              <div className="text-white">
                <div className="text-6xl font-bold mb-2">{percentage}%</div>
                <div className="text-lg opacity-90">Your Score</div>
              </div>
            </div>

            {/* Performance Message */}
            <div className="text-center mb-8">
              {percentage === 100 && (
                <p className="text-lg text-green-600 font-medium">
                  🎉 Perfect! You spelled everything correctly!
                </p>
              )}
              {percentage >= 80 && percentage < 100 && (
                <p className="text-lg text-blue-600 font-medium">
                  Great job! Just a few more words to master!
                </p>
              )}
              {percentage >= 60 && percentage < 80 && (
                <p className="text-lg text-yellow-600 font-medium">
                  Good effort! Keep practicing your spelling!
                </p>
              )}
              {percentage < 60 && (
                <p className="text-lg text-orange-600 font-medium">
                  Keep practicing! Writing helps you remember better!
                </p>
              )}
            </div>

            {/* Review Mistakes */}
            {answers.some((a) => !a.matchResult.isCorrect) && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Words to Review
                </h3>
                <div className="space-y-3">
                  {answers
                    .filter((a) => !a.matchResult.isCorrect)
                    .map((answer, index) => (
                      <div
                        key={index}
                        className="bg-red-50 border border-red-200 rounded-lg p-4"
                      >
                        <p className="font-semibold text-gray-900 mb-1">
                          {answer.word}
                        </p>
                        <p className="text-sm text-red-600 mb-1">
                          Your answer: <span className="font-mono">{answer.userAnswer}</span>
                        </p>
                        <p className="text-sm text-gray-600">
                          Similarity: {Math.round(answer.matchResult.similarity)}%
                        </p>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button
                onClick={handleRestart}
                className="flex-1"
                variant="outline"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
              <Button asChild className="flex-1">
                <Link href={`/dashboard/learn/${setId}/learn`}>
                  Choose Another Mode
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Quiz screen
  const currentWord = shuffledWords[currentIndex];
  const progress = ((currentIndex + 1) / shuffledWords.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            href={`/dashboard/learn/${setId}/learn`}
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Learning Modes
          </Link>

          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">{setName}</h1>
            <span className="text-sm font-medium text-gray-600">
              {currentIndex + 1} / {shuffledWords.length}
            </span>
          </div>

          <Progress value={progress} className="h-2" />
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
          {/* Instruction */}
          <div className="mb-6">
            <p className="text-sm font-medium text-purple-600 mb-2 uppercase tracking-wider">
              Write the Word
            </p>
            <p className="text-gray-600">Type the word that matches this definition:</p>
          </div>

          {/* Definition */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 mb-6">
            <p className="text-xl text-gray-900 leading-relaxed">
              {currentWord.definition}
            </p>
          </div>

          {/* Example Sentence (shown after answering) */}
          {hasAnswered && currentWord.example_sentence && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600 mb-1">Example:</p>
              <p className="text-gray-900 italic">
                &quot;{currentWord.example_sentence}&quot;
              </p>
            </div>
          )}

          {/* Input Form */}
          <form onSubmit={handleSubmit} className="mb-6">
            <Input
              ref={inputRef}
              type="text"
              value={userInput}
              onChange={(e) => !hasAnswered && setUserInput(e.target.value)}
              placeholder={hasAnswered ? "Press Enter to continue..." : "Type your answer here..."}
              className="text-lg h-14"
              autoComplete="off"
              spellCheck="false"
            />
          </form>

          {/* Feedback */}
          {hasAnswered && matchResult && (
            <div className="mb-6">
              {matchResult.isCorrect ? (
                <div
                  className={`border rounded-lg p-4 ${
                    matchResult.feedback === "exact"
                      ? "bg-green-50 border-green-200"
                      : "bg-blue-50 border-blue-200"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Check
                      className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                        matchResult.feedback === "exact"
                          ? "text-green-600"
                          : "text-blue-600"
                      }`}
                    />
                    <div>
                      <p
                        className={`font-medium mb-1 ${
                          matchResult.feedback === "exact"
                            ? "text-green-800"
                            : "text-blue-800"
                        }`}
                      >
                        {matchResult.message}
                      </p>
                      {matchResult.feedback === "close" && (
                        <p className="text-sm text-gray-600">
                          Similarity: {Math.round(matchResult.similarity)}%
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <X className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-red-800 font-medium mb-1">
                        {matchResult.message}
                      </p>
                      <p className="text-sm text-gray-600">
                        Similarity: {Math.round(matchResult.similarity)}%
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Submit/Next Button */}
          {!hasAnswered ? (
            <Button
              onClick={handleSubmit}
              className="w-full"
              size="lg"
              disabled={!userInput.trim()}
            >
              Check Answer
            </Button>
          ) : (
            <Button onClick={handleNext} className="w-full" size="lg">
              {currentIndex < shuffledWords.length - 1
                ? "Next Question"
                : "View Results"}
            </Button>
          )}
        </div>

        {/* Hint */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            💡 Press Enter to submit • Press Enter again to continue • Minor typos are okay!
          </p>
        </div>
      </div>
    </div>
  );
}
