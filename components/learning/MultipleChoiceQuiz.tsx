"use client";

import { useState, useEffect } from "react";
import { VocabWord } from "@/types";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Check, X, RotateCcw } from "lucide-react";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";
import {
  updateMultipleWordsProgress,
  recordLearningSession,
} from "@/lib/actions/learning-progress";

interface MultipleChoiceQuizProps {
  setId: string;
  setName: string;
  words: VocabWord[];
}

interface Question {
  word: VocabWord;
  options: string[];
  correctAnswer: string;
}

interface Answer {
  wordId: string;
  selectedAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
}

export function MultipleChoiceQuiz({
  setId,
  setName,
  words,
}: MultipleChoiceQuizProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [showResults, setShowResults] = useState(false);

  // Generate questions on component mount
  useEffect(() => {
    const generatedQuestions = generateQuestions(words);
    setQuestions(generatedQuestions);
  }, [words]);

  // Record progress when quiz completes
  useEffect(() => {
    if (!showResults || answers.length === 0) return;

    const recordProgress = async () => {
      try {
        const correctCount = answers.filter((a) => a.isCorrect).length;
        const percentage = Math.round((correctCount / answers.length) * 100);

        // Update progress for all answered questions
        await updateMultipleWordsProgress(
          answers.map((answer) => ({
            wordId: answer.wordId,
            wasCorrect: answer.isCorrect,
            questionType: "multiple-choice",
          }))
        );

        // Record the learning session
        await recordLearningSession(setId, "multiple_choice", percentage);
      } catch (error) {
        console.error("Error recording progress:", error);
      }
    };

    recordProgress();
  }, [showResults, answers, setId]);

  // Generate questions with 4 options each
  const generateQuestions = (wordList: VocabWord[]): Question[] => {
    // Shuffle words for random order
    const shuffled = [...wordList].sort(() => Math.random() - 0.5);

    return shuffled.map((word) => {
      // Get 3 random wrong answers
      const wrongAnswers = wordList
        .filter((w) => w.id !== word.id)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map((w) => w.definition);

      // Combine correct and wrong answers, then shuffle
      const options = [word.definition, ...wrongAnswers].sort(
        () => Math.random() - 0.5
      );

      return {
        word,
        options,
        correctAnswer: word.definition,
      };
    });
  };

  const handleOptionSelect = (option: string) => {
    if (hasAnswered) return;

    setSelectedOption(option);
    setHasAnswered(true);

    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = option === currentQuestion.correctAnswer;

    // Record the answer
    const newAnswer: Answer = {
      wordId: currentQuestion.word.id,
      selectedAnswer: option,
      correctAnswer: currentQuestion.correctAnswer,
      isCorrect,
    };

    setAnswers([...answers, newAnswer]);
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOption(null);
      setHasAnswered(false);
    } else {
      setShowResults(true);
    }
  };

  const handleRestart = () => {
    const generatedQuestions = generateQuestions(words);
    setQuestions(generatedQuestions);
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setHasAnswered(false);
    setAnswers([]);
    setShowResults(false);
  };

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading quiz...</p>
        </div>
      </div>
    );
  }

  // Show results screen
  if (showResults) {
    const correctCount = answers.filter((a) => a.isCorrect).length;
    const totalCount = answers.length;
    const percentage = Math.round((correctCount / totalCount) * 100);

    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
            {/* Results Header */}
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-10 h-10 text-green-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Quiz Complete!
              </h1>
              <p className="text-gray-600">
                You answered {correctCount} out of {totalCount} questions correctly
              </p>
            </div>

            {/* Score Display */}
            <div className="bg-gradient-to-r from-green-500 to-blue-500 rounded-xl p-8 text-center mb-8">
              <div className="text-white">
                <div className="text-6xl font-bold mb-2">{percentage}%</div>
                <div className="text-lg opacity-90">Your Score</div>
              </div>
            </div>

            {/* Performance Message */}
            <div className="text-center mb-8">
              {percentage === 100 && (
                <p className="text-lg text-green-600 font-medium">
                  🎉 Perfect score! You&apos;ve mastered this vocabulary!
                </p>
              )}
              {percentage >= 80 && percentage < 100 && (
                <p className="text-lg text-blue-600 font-medium">
                  Great job! You&apos;re doing really well!
                </p>
              )}
              {percentage >= 60 && percentage < 80 && (
                <p className="text-lg text-yellow-600 font-medium">
                  Good effort! Keep practicing to improve!
                </p>
              )}
              {percentage < 60 && (
                <p className="text-lg text-orange-600 font-medium">
                  Keep practicing! Review the words and try again!
                </p>
              )}
            </div>

            {/* Review Incorrect Answers */}
            {answers.some((a) => !a.isCorrect) && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Review Incorrect Answers
                </h3>
                <div className="space-y-3">
                  {answers
                    .filter((a) => !a.isCorrect)
                    .map((answer, index) => {
                      const word = words.find((w) => w.id === answer.wordId);
                      return (
                        <div
                          key={index}
                          className="bg-red-50 border border-red-200 rounded-lg p-4"
                        >
                          <p className="font-semibold text-gray-900 mb-1">
                            {word?.word}
                          </p>
                          <p className="text-sm text-gray-600 mb-2">
                            <span className="text-red-600">Your answer:</span>{" "}
                            {answer.selectedAnswer}
                          </p>
                          <p className="text-sm text-green-600">
                            <span className="font-medium">Correct:</span>{" "}
                            {answer.correctAnswer}
                          </p>
                        </div>
                      );
                    })}
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
  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 py-8 px-4">
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
              {currentQuestionIndex + 1} / {questions.length}
            </span>
          </div>

          <Progress value={progress} className="h-2" />
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
          {/* Question */}
          <div className="mb-8">
            <p className="text-sm font-medium text-gray-500 mb-3">
              What is the definition of:
            </p>
            <h2 className="text-4xl font-bold text-gray-900">
              {currentQuestion.word.word}
            </h2>
          </div>

          {/* Options */}
          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => {
              const isSelected = selectedOption === option;
              const isCorrect = option === currentQuestion.correctAnswer;
              const showCorrect = hasAnswered && isCorrect;
              const showIncorrect = hasAnswered && isSelected && !isCorrect;

              return (
                <button
                  key={index}
                  onClick={() => handleOptionSelect(option)}
                  disabled={hasAnswered}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    showCorrect
                      ? "border-green-500 bg-green-50"
                      : showIncorrect
                      ? "border-red-500 bg-red-50"
                      : isSelected
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300 bg-white"
                  } ${hasAnswered ? "cursor-default" : "cursor-pointer"}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-gray-900">{option}</span>
                    {showCorrect && (
                      <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                    )}
                    {showIncorrect && (
                      <X className="w-5 h-5 text-red-600 flex-shrink-0" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Feedback */}
          {hasAnswered && (
            <div className="mt-6">
              {selectedOption === currentQuestion.correctAnswer ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-green-800 font-medium">
                    ✓ Correct! Well done!
                  </p>
                </div>
              ) : (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800 font-medium mb-2">
                    ✗ Incorrect. The correct answer is:
                  </p>
                  <p className="text-gray-900">{currentQuestion.correctAnswer}</p>
                </div>
              )}

              {/* Example Sentence */}
              {currentQuestion.word.example_sentence && (
                <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Example:</p>
                  <p className="text-gray-900 italic">
                    &quot;{currentQuestion.word.example_sentence}&quot;
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Next Button */}
          {hasAnswered && (
            <div className="mt-6">
              <Button onClick={handleNext} className="w-full" size="lg">
                {currentQuestionIndex < questions.length - 1
                  ? "Next Question"
                  : "View Results"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
