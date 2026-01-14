"use client";

import { useState } from "react";
import { VocabWord } from "@/types";
import { motion, PanInfo } from "framer-motion";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FlashcardProps {
  word: VocabWord;
  onKnow: () => void;
  onDontKnow: () => void;
}

export function Flashcard({ word, onKnow, onDontKnow }: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [exitX, setExitX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);

  const handleFlip = () => {
    if (!isSwiping) {
      setIsFlipped(!isFlipped);
    }
  };

  const handleDragEnd = (event: any, info: PanInfo) => {
    const threshold = 150;

    if (Math.abs(info.offset.x) > threshold) {
      // Swipe detected
      setIsSwiping(true);
      if (info.offset.x > 0) {
        // Swipe right = Know
        setExitX(1000);
        setTimeout(onKnow, 250);
      } else {
        // Swipe left = Don't Know
        setExitX(-1000);
        setTimeout(onDontKnow, 250);
      }
    }
  };

  const handleKnowClick = () => {
    setIsSwiping(true);
    setExitX(1000);
    setTimeout(onKnow, 250);
  };

  const handleDontKnowClick = () => {
    setIsSwiping(true);
    setExitX(-1000);
    setTimeout(onDontKnow, 250);
  };

  return (
    <div className="relative">
      {/* Swipe Hints */}
      <div className="absolute inset-x-0 -top-12 flex justify-between items-center px-8 text-sm">
        <div className="flex items-center gap-2 text-red-500 opacity-50">
          <X className="w-5 h-5" />
          <span>Swipe left</span>
        </div>
        <div className="flex items-center gap-2 text-green-500 opacity-50">
          <span>Swipe right</span>
          <Check className="w-5 h-5" />
        </div>
      </div>

      {/* Card Container */}
      <div className="perspective-1000 min-h-[400px] flex items-center justify-center">
        <motion.div
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          onDragEnd={handleDragEnd}
          animate={{
            x: exitX,
            opacity: exitX !== 0 ? 0 : 1,
            scale: exitX !== 0 ? 0.8 : 1,
          }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="cursor-grab active:cursor-grabbing"
          style={{
            width: "100%",
            maxWidth: "600px",
          }}
        >
          <motion.div
            onClick={handleFlip}
            animate={{ rotateY: isFlipped ? 180 : 0 }}
            transition={{ duration: 0.6, type: "spring" }}
            style={{
              transformStyle: "preserve-3d",
            }}
            className="relative w-full h-[400px]"
          >
            {/* Front Side (Word) */}
            <motion.div
              style={{
                backfaceVisibility: "hidden",
              }}
              className="absolute inset-0 bg-white rounded-2xl shadow-2xl border-2 border-gray-200 p-8 flex flex-col items-center justify-center"
            >
              <p className="text-sm font-medium text-gray-500 mb-4 uppercase tracking-wider">
                Word
              </p>
              <h2 className="text-5xl font-bold text-gray-900 mb-6 text-center">
                {word.word}
              </h2>
              <p className="text-sm text-gray-400 italic">Tap to see definition</p>
            </motion.div>

            {/* Back Side (Definition) */}
            <motion.div
              style={{
                backfaceVisibility: "hidden",
                rotateY: 180,
              }}
              className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-2xl p-8 flex flex-col items-center justify-center text-white"
            >
              <p className="text-sm font-medium mb-4 uppercase tracking-wider opacity-90">
                Definition
              </p>
              <p className="text-2xl font-medium mb-6 text-center leading-relaxed">
                {word.definition}
              </p>
              {word.example_sentence && (
                <div className="mt-4 pt-4 border-t border-white/30 w-full">
                  <p className="text-sm opacity-75 mb-2">Example:</p>
                  <p className="text-base italic text-center">
                    "{word.example_sentence}"
                  </p>
                </div>
              )}
              <p className="text-sm opacity-75 mt-6 italic">
                Tap to see word again
              </p>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 mt-8 max-w-[600px] mx-auto">
        <Button
          onClick={handleDontKnowClick}
          variant="outline"
          size="lg"
          className="flex-1 h-14 border-2 border-red-500 text-red-600 hover:bg-red-50 hover:border-red-600"
          disabled={isSwiping}
        >
          <X className="w-5 h-5 mr-2" />
          Still Learning
        </Button>
        <Button
          onClick={handleKnowClick}
          size="lg"
          className="flex-1 h-14 bg-green-600 hover:bg-green-700 text-white"
          disabled={isSwiping}
        >
          <Check className="w-5 h-5 mr-2" />
          I Know This
        </Button>
      </div>

      {/* Mobile Touch Hint */}
      <div className="mt-6 text-center">
        <p className="text-xs text-gray-400">
          💡 On mobile: Swipe the card left or right
        </p>
      </div>
    </div>
  );
}
