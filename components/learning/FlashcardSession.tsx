"use client";

import { useState, useEffect } from "react";
import { VocabWord } from "@/types";
import { Flashcard } from "./Flashcard";
import { SessionSummary } from "./SessionSummary";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RotateCcw } from "lucide-react";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";

interface FlashcardSessionProps {
  setId: string;
  setName: string;
  words: VocabWord[];
}

interface CardResult {
  wordId: string;
  word: string;
  correct: boolean;
}

export function FlashcardSession({
  setId,
  setName,
  words,
}: FlashcardSessionProps) {
  const [shuffledWords, setShuffledWords] = useState<VocabWord[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<CardResult[]>([]);
  const [showSummary, setShowSummary] = useState(false);

  // Shuffle words on mount
  useEffect(() => {
    const shuffled = [...words].sort(() => Math.random() - 0.5);
    setShuffledWords(shuffled);
  }, [words]);

  const handleKnow = () => {
    const currentWord = shuffledWords[currentIndex];
    setResults([
      ...results,
      {
        wordId: currentWord.id,
        word: currentWord.word,
        correct: true,
      },
    ]);
    moveToNext();
  };

  const handleDontKnow = () => {
    const currentWord = shuffledWords[currentIndex];
    setResults([
      ...results,
      {
        wordId: currentWord.id,
        word: currentWord.word,
        correct: false,
      },
    ]);
    moveToNext();
  };

  const moveToNext = () => {
    if (currentIndex < shuffledWords.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setShowSummary(true);
    }
  };

  const handleRestart = () => {
    const shuffled = [...words].sort(() => Math.random() - 0.5);
    setShuffledWords(shuffled);
    setCurrentIndex(0);
    setResults([]);
    setShowSummary(false);
  };

  if (shuffledWords.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Preparing flashcards...</p>
        </div>
      </div>
    );
  }

  if (showSummary) {
    return (
      <SessionSummary
        setId={setId}
        setName={setName}
        results={results}
        onRestart={handleRestart}
      />
    );
  }

  const currentCard = shuffledWords[currentIndex];
  const progress = ((currentIndex + 1) / shuffledWords.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
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

        {/* Instruction */}
        <div className="text-center mb-6">
          <p className="text-gray-600">
            Tap the card to flip • Swipe or use buttons to continue
          </p>
        </div>

        {/* Flashcard */}
        <Flashcard
          key={currentCard.id}
          word={currentCard}
          onKnow={handleKnow}
          onDontKnow={handleDontKnow}
        />

        {/* Stats */}
        <div className="mt-8 flex justify-center gap-8">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">
              {results.filter((r) => r.correct).length}
            </div>
            <div className="text-sm text-gray-600">Know</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-red-600">
              {results.filter((r) => !r.correct).length}
            </div>
            <div className="text-sm text-gray-600">Learning</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-600">
              {shuffledWords.length - results.length}
            </div>
            <div className="text-sm text-gray-600">Remaining</div>
          </div>
        </div>
      </div>
    </div>
  );
}
