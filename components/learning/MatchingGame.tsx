"use client";

import { useState, useEffect } from "react";
import { VocabWord } from "@/types";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RotateCcw, Trophy, Clock } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  updateMultipleWordsProgress,
  recordLearningSession,
} from "@/lib/actions/learning-progress";

interface MatchingGameProps {
  setId: string;
  setName: string;
  words: VocabWord[];
}

interface Tile {
  id: string;
  content: string;
  type: "word" | "definition";
  wordId: string;
  matched: boolean;
}

export function MatchingGame({
  setId,
  setName,
  words,
}: MatchingGameProps) {
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [selectedTiles, setSelectedTiles] = useState<string[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<string[]>([]);
  const [attempts, setAttempts] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [currentBatch, setCurrentBatch] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [completedWords, setCompletedWords] = useState<string[]>([]);
  const [isLoadingNext, setIsLoadingNext] = useState(false);

  // Initialize game
  useEffect(() => {
    loadBatch(0);
    setStartTime(Date.now());
  }, [words]);

  // Check if current batch is complete
  useEffect(() => {
    const currentBatchSize = Math.min(6, words.length - currentBatch * 6);

    if (matchedPairs.length > 0 && matchedPairs.length === currentBatchSize) {
      // Add to total attempts
      setTotalAttempts(totalAttempts + attempts);

      // Mark words as completed
      const batchWords = words.slice(currentBatch * 6, currentBatch * 6 + 6);
      setCompletedWords([...completedWords, ...batchWords.map(w => w.id)]);

      // Check if there are more words
      const nextBatchStart = (currentBatch + 1) * 6;
      if (nextBatchStart < words.length) {
        // Show loading state
        setIsLoadingNext(true);
        // Load next batch after a short delay
        setTimeout(() => {
          setCurrentBatch(currentBatch + 1);
          loadBatch(currentBatch + 1);
          setIsLoadingNext(false);
        }, 2000);
      } else {
        // All words completed
        setIsComplete(true);
        setEndTime(Date.now());
      }
    }
  }, [matchedPairs, currentBatch, words]);

  // Record progress when game completes
  useEffect(() => {
    if (!isComplete || completedWords.length === 0) return;

    const recordProgress = async () => {
      try {
        // All matches were correct (that's how the game works)
        // Calculate a score based on efficiency (fewer attempts is better)
        const totalPairs = completedWords.length;
        const finalAttempts = totalAttempts + attempts;
        const perfectAttempts = totalPairs; // One attempt per pair
        const efficiency = Math.min(100, Math.round((perfectAttempts / finalAttempts) * 100));

        // Update progress for all completed words (all correct)
        await updateMultipleWordsProgress(
          completedWords.map((wordId) => ({
            wordId,
            wasCorrect: true,
            questionType: "matching",
          }))
        );

        // Record the learning session
        await recordLearningSession(setId, "matching", efficiency);
      } catch (error) {
        console.error("Error recording progress:", error);
      }
    };

    recordProgress();
  }, [isComplete, completedWords, totalAttempts, attempts, setId]);

  const loadBatch = (batchIndex: number) => {
    const startIdx = batchIndex * 6;
    const endIdx = Math.min(startIdx + 6, words.length);
    const batchWords = words.slice(startIdx, endIdx);

    // Create tiles for words and definitions
    const wordTiles: Tile[] = batchWords.map((word) => ({
      id: `word-${word.id}`,
      content: word.word,
      type: "word",
      wordId: word.id,
      matched: false,
    }));

    const definitionTiles: Tile[] = batchWords.map((word) => ({
      id: `def-${word.id}`,
      content: word.definition,
      type: "definition",
      wordId: word.id,
      matched: false,
    }));

    // Combine and shuffle
    const allTiles = [...wordTiles, ...definitionTiles].sort(
      () => Math.random() - 0.5
    );

    setTiles(allTiles);
    setSelectedTiles([]);
    setMatchedPairs([]);
    setAttempts(0);
  };

  const restartGame = () => {
    setCurrentBatch(0);
    setTotalAttempts(0);
    setCompletedWords([]);
    setStartTime(Date.now());
    setEndTime(null);
    setIsComplete(false);
    loadBatch(0);
  };

  const handleTileClick = (tileId: string) => {
    // Ignore if tile is already matched or selected
    if (
      matchedPairs.includes(tiles.find((t) => t.id === tileId)?.wordId || "") ||
      selectedTiles.includes(tileId)
    ) {
      return;
    }

    // If two tiles already selected, ignore
    if (selectedTiles.length >= 2) {
      return;
    }

    const newSelected = [...selectedTiles, tileId];
    setSelectedTiles(newSelected);

    // Check for match when two tiles are selected
    if (newSelected.length === 2) {
      setAttempts(attempts + 1);

      const tile1 = tiles.find((t) => t.id === newSelected[0]);
      const tile2 = tiles.find((t) => t.id === newSelected[1]);

      if (tile1 && tile2 && tile1.wordId === tile2.wordId) {
        // Match found!
        setMatchedPairs([...matchedPairs, tile1.wordId]);
        setTimeout(() => {
          setSelectedTiles([]);
        }, 500);
      } else {
        // No match - deselect after delay
        setTimeout(() => {
          setSelectedTiles([]);
        }, 1000);
      }
    }
  };

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  if (tiles.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Preparing game...</p>
        </div>
      </div>
    );
  }

  // Loading next round screen
  if (isLoadingNext) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <Trophy className="w-10 h-10 text-white" />
          </motion.div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Round {currentBatch + 1} Complete! 🎉
          </h2>
          <p className="text-gray-600 mb-4">Loading next round...</p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  // Completion screen
  if (isComplete && startTime && endTime) {
    const totalTime = endTime - startTime;
    const finalAttempts = totalAttempts + attempts;
    const totalPairs = completedWords.length;

    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-yellow-50 py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
            {/* Celebration Header */}
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", duration: 0.5 }}
                className="w-20 h-20 bg-gradient-to-br from-orange-400 to-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <Trophy className="w-10 h-10 text-white" />
              </motion.div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                🎉 All Words Matched!
              </h1>
              <p className="text-gray-600">
                You completed {totalPairs} word pairs across {currentBatch + 1} {currentBatch + 1 === 1 ? "round" : "rounds"}!
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                <Clock className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <div className="text-3xl font-bold text-blue-600 mb-1">
                  {formatTime(totalTime)}
                </div>
                <div className="text-sm text-gray-600">Total Time</div>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 text-center">
                <Trophy className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <div className="text-3xl font-bold text-purple-600 mb-1">
                  {finalAttempts}
                </div>
                <div className="text-sm text-gray-600">Total Attempts</div>
              </div>
            </div>

            {/* Performance Message */}
            <div className="text-center mb-8">
              {finalAttempts <= totalPairs + (currentBatch + 1) * 2 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-lg text-green-800 font-medium">
                    ⭐ Excellent memory! You&apos;re a matching master!
                  </p>
                </div>
              )}
              {finalAttempts > totalPairs + (currentBatch + 1) * 2 &&
                finalAttempts <= totalPairs * 2 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-lg text-blue-800 font-medium">
                      Great job! You matched them efficiently!
                    </p>
                  </div>
                )}
              {finalAttempts > totalPairs * 2 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-lg text-yellow-800 font-medium">
                    Good effort! Practice more to improve your memory!
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button
                onClick={restartGame}
                className="flex-1"
                variant="outline"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Play Again
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

  // Game screen
  const currentTime = startTime ? Date.now() - startTime : 0;
  const totalRounds = Math.ceil(words.length / 6);
  const currentRound = currentBatch + 1;
  const totalWordsCompleted = completedWords.length + matchedPairs.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-yellow-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
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
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{setName}</h1>
              <p className="text-sm text-gray-600 mt-1">
                Round {currentRound} of {totalRounds} • {totalWordsCompleted}/{words.length} words completed
              </p>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="w-4 h-4" />
                <span className="font-mono">{formatTime(currentTime)}</span>
              </div>
              <div className="text-gray-600">
                Attempts: <span className="font-semibold">{attempts}</span>
              </div>
              <div className="text-gray-600">
                Current: <span className="font-semibold">{matchedPairs.length}</span> / {tiles.length / 2}
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <p className="text-center text-gray-600">
            <span className="font-semibold">How to play:</span> Click on tiles to match words with their definitions. Find all pairs to win!
          </p>
        </div>

        {/* Game Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <AnimatePresence>
            {tiles.map((tile) => {
              const isSelected = selectedTiles.includes(tile.id);
              const isMatched = matchedPairs.includes(tile.wordId);

              return (
                <motion.button
                  key={tile.id}
                  onClick={() => handleTileClick(tile.id)}
                  disabled={isMatched}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{
                    opacity: isMatched ? 0.3 : 1,
                    scale: isMatched ? 0.95 : 1,
                  }}
                  whileHover={!isMatched ? { scale: 1.05 } : {}}
                  whileTap={!isMatched ? { scale: 0.95 } : {}}
                  className={`relative p-6 rounded-xl border-2 transition-all min-h-[120px] flex items-center justify-center text-center ${
                    isMatched
                      ? "bg-green-50 border-green-300 cursor-not-allowed"
                      : isSelected
                      ? "bg-blue-100 border-blue-500 shadow-lg"
                      : tile.type === "word"
                      ? "bg-orange-50 border-orange-200 hover:border-orange-400"
                      : "bg-yellow-50 border-yellow-200 hover:border-yellow-400"
                  }`}
                >
                  <div>
                    <p
                      className={`text-sm font-medium mb-1 ${
                        isMatched
                          ? "text-green-600"
                          : tile.type === "word"
                          ? "text-orange-600"
                          : "text-yellow-600"
                      }`}
                    >
                      {tile.type === "word" ? "Word" : "Definition"}
                    </p>
                    <p
                      className={`font-medium ${
                        tile.type === "word" ? "text-lg" : "text-sm"
                      } ${
                        isMatched
                          ? "text-gray-400 line-through"
                          : "text-gray-900"
                      }`}
                    >
                      {tile.content}
                    </p>
                  </div>

                  {isMatched && (
                    <div className="absolute inset-0 flex items-center justify-center bg-green-100 bg-opacity-50 rounded-xl">
                      <div className="text-4xl">✓</div>
                    </div>
                  )}
                </motion.button>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Hint */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            💡 Orange tiles are words, yellow tiles are definitions
          </p>
        </div>
      </div>
    </div>
  );
}
