"use client";

import { LearningProgress } from "@/types";
import { Progress } from "@/components/ui/progress";
import { getMasteryLevel, getReviewInterval, getRetentionRate } from "@/lib/algorithms/spaced-repetition";
import { CheckCircle2, Clock, TrendingUp } from "lucide-react";

interface WordProgressCardProps {
  word: string;
  definition: string;
  progress: LearningProgress | null;
}

export function WordProgressCard({ word, definition, progress }: WordProgressCardProps) {
  const memoryScore = progress?.memory_score ?? 50;
  const mastery = getMasteryLevel(memoryScore);
  const retentionRate = getRetentionRate(progress);
  const reviewInterval = getReviewInterval(memoryScore);

  // Color mapping
  const colorMap = {
    green: {
      bg: "bg-green-50",
      border: "border-green-200",
      text: "text-green-700",
      badge: "bg-green-100 text-green-700",
      progress: "bg-green-500",
    },
    blue: {
      bg: "bg-blue-50",
      border: "border-blue-200",
      text: "text-blue-700",
      badge: "bg-blue-100 text-blue-700",
      progress: "bg-blue-500",
    },
    yellow: {
      bg: "bg-yellow-50",
      border: "border-yellow-200",
      text: "text-yellow-700",
      badge: "bg-yellow-100 text-yellow-700",
      progress: "bg-yellow-500",
    },
    red: {
      bg: "bg-red-50",
      border: "border-red-200",
      text: "text-red-700",
      badge: "bg-red-100 text-red-700",
      progress: "bg-red-500",
    },
  };

  const colors = colorMap[mastery.color as keyof typeof colorMap];

  // Check if due for review
  const isDue = progress ? new Date() >= new Date(progress.next_review_date) : true;

  return (
    <div className={`${colors.bg} border ${colors.border} rounded-lg p-4 transition-all hover:shadow-md`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-bold text-gray-900 text-lg mb-1">{word}</h3>
          <p className="text-sm text-gray-600 line-clamp-2">{definition}</p>
        </div>

        {isDue && (
          <span className="ml-2 px-2 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full flex-shrink-0">
            Review Due
          </span>
        )}
      </div>

      {/* Memory Score Progress Bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium text-gray-600">Memory Score</span>
          <span className={`text-sm font-bold ${colors.text}`}>{memoryScore}%</span>
        </div>
        <Progress value={memoryScore} className={`h-2 ${colors.progress}`} />
      </div>

      {/* Stats Row */}
      <div className="flex items-center gap-4 text-xs">
        {/* Mastery Level */}
        <div className="flex items-center gap-1">
          <CheckCircle2 className="w-4 h-4 text-gray-500" />
          <span className={`font-medium px-2 py-1 rounded ${colors.badge}`}>
            {mastery.label}
          </span>
        </div>

        {/* Next Review */}
        {progress && (
          <div className="flex items-center gap-1 text-gray-600">
            <Clock className="w-4 h-4" />
            <span>{reviewInterval}</span>
          </div>
        )}

        {/* Retention Rate */}
        {progress && progress.review_count > 0 && (
          <div className="flex items-center gap-1 text-gray-600">
            <TrendingUp className="w-4 h-4" />
            <span>{retentionRate}% correct</span>
          </div>
        )}
      </div>

      {/* Review Count */}
      {progress && progress.review_count > 0 && (
        <div className="mt-2 pt-2 border-t border-gray-200">
          <div className="text-xs text-gray-500">
            Reviewed {progress.review_count} {progress.review_count === 1 ? "time" : "times"}
            {" • "}
            {progress.correct_count} correct, {progress.incorrect_count} incorrect
          </div>
        </div>
      )}

      {/* New Word Indicator */}
      {!progress && (
        <div className="mt-2 pt-2 border-t border-gray-200">
          <div className="text-xs text-gray-500">
            Not studied yet • Start learning to track progress
          </div>
        </div>
      )}
    </div>
  );
}
