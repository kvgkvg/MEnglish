"use client";

import { useState, useEffect } from "react";
import { VocabWord } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Check, X, Trophy, RotateCcw } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  generateTest,
  TestQuestion,
  TrueFalseQuestion,
  MultipleChoiceQuestion,
  WriteQuestion,
  MatchingQuestion,
} from "@/lib/utils/test-generator";
import { matchAnswer } from "@/lib/utils/string-matcher";
import {
  updateMultipleWordsProgress,
  recordLearningSession,
} from "@/lib/actions/learning-progress";

interface TestModeProps {
  setId: string;
  setName: string;
  words: VocabWord[];
}

interface Answer {
  questionId: string;
  questionType: string;
  isCorrect: boolean;
  userAnswer: string;
  correctAnswer: string;
}

export function TestMode({ setId, setName, words }: TestModeProps) {
  const [questions, setQuestions] = useState<TestQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [matchingSelected, setMatchingSelected] = useState<string[]>([]);
  const [matchingPairs, setMatchingPairs] = useState<
    Array<{ wordId: string; selectedDef: string }>
  >([]);

  // Initialize test
  useEffect(() => {
    // Generate test covering all words in the set
    const testQuestions = generateTest(words, words.length);
    setQuestions(testQuestions);
  }, [words]);

  // Record progress when test completes
  useEffect(() => {
    if (!isComplete || answers.length === 0 || questions.length === 0) return;

    const recordProgress = async () => {
      try {
        const correctCount = answers.filter((a) => a.isCorrect).length;
        const percentage = Math.round((correctCount / answers.length) * 100);

        // Map answers to word IDs from questions
        const progressUpdates = answers.map((answer) => {
          const question = questions.find((q) => q.id === answer.questionId);
          return {
            wordId: question?.wordId || "",
            wasCorrect: answer.isCorrect,
            questionType: answer.questionType,
          };
        }).filter(update => update.wordId); // Filter out any with missing wordId

        // Update progress for all test questions
        if (progressUpdates.length > 0) {
          await updateMultipleWordsProgress(progressUpdates);
        }

        // Record the learning session
        await recordLearningSession(setId, "test", percentage);
      } catch (error) {
        console.error("Error recording progress:", error);
      }
    };

    recordProgress();
  }, [isComplete, answers, questions, setId]);

  const currentQuestion = questions[currentIndex];

  const moveToNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setHasAnswered(false);
      setUserInput("");
      setSelectedOption(null);
      setMatchingSelected([]);
      setMatchingPairs([]);
    } else {
      setIsComplete(true);
    }
  };

  // Add keyboard listener for Enter key to move to next question
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // For Write questions, Enter is handled by the form submit
      if (currentQuestion?.type === "write" && !hasAnswered) {
        return;
      }

      // For all other cases, Enter moves to next question after answering
      if (e.key === "Enter" && hasAnswered && !isComplete) {
        moveToNext();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [hasAnswered, isComplete, currentQuestion, moveToNext]);

  const handleTrueFalseAnswer = (userAnswer: boolean) => {
    if (hasAnswered) return;

    const q = currentQuestion as TrueFalseQuestion;
    const isCorrect = userAnswer === q.isCorrect;

    setAnswers([
      ...answers,
      {
        questionId: q.id,
        questionType: "true-false",
        isCorrect,
        userAnswer: userAnswer ? "True" : "False",
        correctAnswer: q.isCorrect ? "True" : "False",
      },
    ]);

    setHasAnswered(true);
    setTimeout(moveToNext, 1500);
  };

  const handleMultipleChoiceAnswer = (option: string) => {
    if (hasAnswered) return;

    const q = currentQuestion as MultipleChoiceQuestion;
    const isCorrect = option === q.correctAnswer;

    setSelectedOption(option);
    setAnswers([
      ...answers,
      {
        questionId: q.id,
        questionType: "multiple-choice",
        isCorrect,
        userAnswer: option,
        correctAnswer: q.correctAnswer,
      },
    ]);

    setHasAnswered(true);
    setTimeout(moveToNext, 1500);
  };

  const handleWriteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || hasAnswered) return;

    const q = currentQuestion as WriteQuestion;
    const result = matchAnswer(userInput, q.correctAnswer);

    setAnswers([
      ...answers,
      {
        questionId: q.id,
        questionType: "write",
        isCorrect: result.isCorrect,
        userAnswer: userInput,
        correctAnswer: q.correctAnswer,
      },
    ]);

    setHasAnswered(true);
  };

  const handleMatchingPair = (wordId: string, definition: string) => {
    if (hasAnswered) return;

    const existing = matchingPairs.find((p) => p.wordId === wordId);
    if (existing) {
      // Update selection
      setMatchingPairs(
        matchingPairs.map((p) =>
          p.wordId === wordId ? { wordId, selectedDef: definition } : p
        )
      );
    } else {
      setMatchingPairs([...matchingPairs, { wordId, selectedDef: definition }]);
    }
  };

  const submitMatching = () => {
    if (hasAnswered) return;

    const q = currentQuestion as MatchingQuestion;
    if (matchingPairs.length !== q.pairs.length) return;

    let correctCount = 0;
    matchingPairs.forEach((pair) => {
      const correctPair = q.pairs.find((p) => p.wordId === pair.wordId);
      if (correctPair && correctPair.definition === pair.selectedDef) {
        correctCount++;
      }
    });

    const isCorrect = correctCount === q.pairs.length;

    setAnswers([
      ...answers,
      {
        questionId: q.id,
        questionType: "matching",
        isCorrect,
        userAnswer: `${correctCount}/${q.pairs.length} correct`,
        correctAnswer: `${q.pairs.length}/${q.pairs.length} correct`,
      },
    ]);

    setHasAnswered(true);
    setTimeout(moveToNext, 2000);
  };

  const restartTest = () => {
    // Generate test covering all words in the set
    const testQuestions = generateTest(words, words.length);
    setQuestions(testQuestions);
    setCurrentIndex(0);
    setAnswers([]);
    setIsComplete(false);
    setHasAnswered(false);
    setUserInput("");
    setSelectedOption(null);
    setMatchingSelected([]);
    setMatchingPairs([]);
  };

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Generating test...</p>
        </div>
      </div>
    );
  }

  // Results screen
  if (isComplete) {
    const correctAnswers = answers.filter((a) => a.isCorrect).length;
    const totalQuestions = answers.length;
    const percentage = Math.round((correctAnswers / totalQuestions) * 100);

    const byType = {
      "true-false": { correct: 0, total: 0 },
      "multiple-choice": { correct: 0, total: 0 },
      write: { correct: 0, total: 0 },
      matching: { correct: 0, total: 0 },
    };

    answers.forEach((answer) => {
      const type = answer.questionType as keyof typeof byType;
      byType[type].total++;
      if (answer.isCorrect) byType[type].correct++;
    });

    const incorrectAnswers = answers.filter((a) => !a.isCorrect);

    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50 py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", duration: 0.5 }}
                className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${
                  percentage >= 80
                    ? "bg-gradient-to-br from-green-400 to-emerald-400"
                    : percentage >= 60
                    ? "bg-gradient-to-br from-blue-400 to-cyan-400"
                    : "bg-gradient-to-br from-orange-400 to-yellow-400"
                }`}
              >
                <Trophy className="w-10 h-10 text-white" />
              </motion.div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Test Complete!
              </h1>
              <p className="text-gray-600">
                You scored {correctAnswers} out of {totalQuestions}
              </p>
            </div>

            {/* Score */}
            <div className="text-center mb-8">
              <div className="text-6xl font-bold text-gray-900 mb-2">
                {percentage}%
              </div>
              <div className="text-gray-600">
                {percentage >= 80 && "Excellent work! You've mastered this set!"}
                {percentage >= 60 &&
                  percentage < 80 &&
                  "Good job! Keep practicing to improve!"}
                {percentage < 60 && "Keep studying! You'll get better with practice!"}
              </div>
            </div>

            {/* Breakdown by type */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Performance by Question Type
              </h2>
              <div className="space-y-3">
                {Object.entries(byType).map(([type, stats]) => {
                  if (stats.total === 0) return null;
                  const typePercentage = Math.round(
                    (stats.correct / stats.total) * 100
                  );
                  return (
                    <div key={type} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700 capitalize">
                        {type.replace("-", " ")}
                      </span>
                      <div className="flex items-center gap-3">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all"
                            style={{ width: `${typePercentage}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600 w-16 text-right">
                          {stats.correct}/{stats.total}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Incorrect answers */}
            {incorrectAnswers.length > 0 && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Review Incorrect Answers
                </h2>
                <div className="space-y-3">
                  {incorrectAnswers.map((answer, idx) => (
                    <div
                      key={idx}
                      className="bg-red-50 border border-red-200 rounded-lg p-4"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-xs font-medium text-red-600 uppercase">
                          {answer.questionType.replace("-", " ")}
                        </span>
                        <X className="w-4 h-4 text-red-600" />
                      </div>
                      <div className="text-sm text-gray-700 mb-1">
                        <span className="font-medium">Your answer:</span>{" "}
                        {answer.userAnswer}
                      </div>
                      <div className="text-sm text-gray-700">
                        <span className="font-medium">Correct answer:</span>{" "}
                        {answer.correctAnswer}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-4">
              <Button onClick={restartTest} className="flex-1" variant="outline">
                <RotateCcw className="w-4 h-4 mr-2" />
                Retry Test
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

  // Test screen
  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50 py-8 px-4">
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

          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-bold text-gray-900">{setName}</h1>
            <span className="text-sm text-gray-600">
              Question {currentIndex + 1} of {questions.length}
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-red-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white rounded-xl shadow-lg border border-gray-200 p-8"
          >
            {/* True/False Question */}
            {currentQuestion.type === "true-false" && (
              <TrueFalseQuestionComponent
                question={currentQuestion as TrueFalseQuestion}
                onAnswer={handleTrueFalseAnswer}
                hasAnswered={hasAnswered}
              />
            )}

            {/* Multiple Choice Question */}
            {currentQuestion.type === "multiple-choice" && (
              <MultipleChoiceQuestionComponent
                question={currentQuestion as MultipleChoiceQuestion}
                onAnswer={handleMultipleChoiceAnswer}
                hasAnswered={hasAnswered}
                selectedOption={selectedOption}
              />
            )}

            {/* Write Question */}
            {currentQuestion.type === "write" && (
              <WriteQuestionComponent
                question={currentQuestion as WriteQuestion}
                userInput={userInput}
                setUserInput={setUserInput}
                onSubmit={handleWriteSubmit}
                hasAnswered={hasAnswered}
                onNext={moveToNext}
              />
            )}

            {/* Matching Question */}
            {currentQuestion.type === "matching" && (
              <MatchingQuestionComponent
                question={currentQuestion as MatchingQuestion}
                matchingPairs={matchingPairs}
                onSelectPair={handleMatchingPair}
                onSubmit={submitMatching}
                hasAnswered={hasAnswered}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// True/False Component
function TrueFalseQuestionComponent({
  question,
  onAnswer,
  hasAnswered,
}: {
  question: TrueFalseQuestion;
  onAnswer: (answer: boolean) => void;
  hasAnswered: boolean;
}) {
  return (
    <div>
      <div className="mb-2">
        <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
          True or False
        </span>
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Is this definition correct for "{question.word}"?
      </h2>
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6">
        <p className="text-lg text-gray-700">{question.definition}</p>
      </div>
      <div className="flex gap-4">
        <Button
          onClick={() => onAnswer(true)}
          disabled={hasAnswered}
          className="flex-1 h-14 text-lg"
          variant={hasAnswered && question.isCorrect ? "default" : "outline"}
        >
          <Check className="w-5 h-5 mr-2" />
          True
        </Button>
        <Button
          onClick={() => onAnswer(false)}
          disabled={hasAnswered}
          className="flex-1 h-14 text-lg"
          variant={hasAnswered && !question.isCorrect ? "default" : "outline"}
        >
          <X className="w-5 h-5 mr-2" />
          False
        </Button>
      </div>
      {hasAnswered && !question.isCorrect && question.correctDefinition && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm font-medium text-blue-900 mb-1">
            Correct definition:
          </p>
          <p className="text-sm text-blue-700">{question.correctDefinition}</p>
        </div>
      )}
    </div>
  );
}

// Multiple Choice Component
function MultipleChoiceQuestionComponent({
  question,
  onAnswer,
  hasAnswered,
  selectedOption,
}: {
  question: MultipleChoiceQuestion;
  onAnswer: (option: string) => void;
  hasAnswered: boolean;
  selectedOption: string | null;
}) {
  return (
    <div>
      <div className="mb-2">
        <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
          Multiple Choice
        </span>
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        What is the definition of:
      </h2>
      <div className="text-3xl font-bold text-blue-600 mb-6">
        {question.word}
      </div>
      <div className="space-y-3">
        {question.options.map((option, idx) => {
          const isSelected = selectedOption === option;
          const isCorrect = option === question.correctAnswer;
          const showCorrect = hasAnswered && isCorrect;
          const showWrong = hasAnswered && isSelected && !isCorrect;

          return (
            <button
              key={idx}
              onClick={() => onAnswer(option)}
              disabled={hasAnswered}
              className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                showCorrect
                  ? "bg-green-50 border-green-500"
                  : showWrong
                  ? "bg-red-50 border-red-500"
                  : isSelected
                  ? "bg-blue-50 border-blue-500"
                  : "bg-white border-gray-200 hover:border-gray-300"
              } ${hasAnswered ? "cursor-not-allowed" : "cursor-pointer"}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-gray-700">{option}</span>
                {showCorrect && <Check className="w-5 h-5 text-green-600" />}
                {showWrong && <X className="w-5 h-5 text-red-600" />}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Write Component
function WriteQuestionComponent({
  question,
  userInput,
  setUserInput,
  onSubmit,
  hasAnswered,
  onNext,
}: {
  question: WriteQuestion;
  userInput: string;
  setUserInput: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  hasAnswered: boolean;
  onNext: () => void;
}) {
  return (
    <div>
      <div className="mb-2">
        <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
          Write the Word
        </span>
      </div>
      <h2 className="text-xl font-bold text-gray-900 mb-6">
        Write the word for this definition:
      </h2>
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6">
        <p className="text-lg text-gray-700">{question.definition}</p>
      </div>
      <form onSubmit={onSubmit} className="space-y-4">
        <Input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Type your answer..."
          className="text-lg h-14"
          disabled={hasAnswered}
          autoFocus
        />
        {!hasAnswered && (
          <Button type="submit" className="w-full h-12">
            Submit Answer
          </Button>
        )}
        {hasAnswered && (
          <div>
            {userInput.toLowerCase() === question.correctAnswer.toLowerCase() ? (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg mb-4">
                <div className="flex items-center gap-2 text-green-700 font-medium mb-1">
                  <Check className="w-5 h-5" />
                  Correct!
                </div>
              </div>
            ) : (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
                <div className="flex items-center gap-2 text-red-700 font-medium mb-1">
                  <X className="w-5 h-5" />
                  Incorrect
                </div>
                <p className="text-sm text-gray-700 mt-2">
                  The correct answer is:{" "}
                  <span className="font-bold">{question.correctAnswer}</span>
                </p>
              </div>
            )}
            <Button onClick={onNext} className="w-full h-12">
              Next Question
            </Button>
          </div>
        )}
      </form>
    </div>
  );
}

// Matching Component
function MatchingQuestionComponent({
  question,
  matchingPairs,
  onSelectPair,
  onSubmit,
  hasAnswered,
}: {
  question: MatchingQuestion;
  matchingPairs: Array<{ wordId: string; selectedDef: string }>;
  onSelectPair: (wordId: string, definition: string) => void;
  onSubmit: () => void;
  hasAnswered: boolean;
}) {
  const words = question.pairs.map((p) => ({ id: p.wordId, word: p.word }));
  const definitions = [...question.pairs]
    .sort(() => Math.random() - 0.5)
    .map((p) => p.definition);

  const allPairsSelected = matchingPairs.length === question.pairs.length;

  return (
    <div>
      <div className="mb-2">
        <span className="inline-block px-3 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">
          Matching
        </span>
      </div>
      <h2 className="text-xl font-bold text-gray-900 mb-6">
        Match each word with its definition
      </h2>

      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Words column */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-600 mb-2">Words</h3>
          {words.map((word) => (
            <div
              key={word.id}
              className="bg-orange-50 border-2 border-orange-200 rounded-lg p-4"
            >
              <p className="font-medium text-gray-900">{word.word}</p>
            </div>
          ))}
        </div>

        {/* Definitions column */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-600 mb-2">
            Definitions
          </h3>
          {words.map((word) => {
            const selected = matchingPairs.find((p) => p.wordId === word.id);
            return (
              <div key={word.id} className="relative">
                <select
                  value={selected?.selectedDef || ""}
                  onChange={(e) => onSelectPair(word.id, e.target.value)}
                  disabled={hasAnswered}
                  className="w-full p-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg appearance-none cursor-pointer disabled:cursor-not-allowed"
                >
                  <option value="">Select definition...</option>
                  {definitions.map((def, idx) => (
                    <option key={idx} value={def}>
                      {def}
                    </option>
                  ))}
                </select>
              </div>
            );
          })}
        </div>
      </div>

      <Button
        onClick={onSubmit}
        disabled={!allPairsSelected || hasAnswered}
        className="w-full h-12"
      >
        {allPairsSelected ? "Submit Matches" : "Select all pairs to continue"}
      </Button>

      {hasAnswered && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-700">
            Matches checked! Moving to next question...
          </p>
        </div>
      )}
    </div>
  );
}
