"use client";

import Link from "next/link";
import { ArrowLeft, CreditCard, CheckCircle2, PenTool, Grid3x3, FileText, TrendingUp, Target, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface LearnModeSelectionProps {
  setId: string;
  setName: string;
  wordCount: number;
  memoryScore?: number;
  masteredCount?: number;
  dueCount?: number;
}

interface LearningMode {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  available: boolean;
  href: string;
}

export function LearnModeSelection({
  setId,
  setName,
  wordCount,
  memoryScore = 0,
  masteredCount = 0,
  dueCount = 0,
}: LearnModeSelectionProps) {
  const learningModes: LearningMode[] = [
    {
      id: "flashcards",
      name: "Flashcards",
      description: "Swipe through cards to review vocabulary",
      icon: <CreditCard className="w-8 h-8" />,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      available: true,
      href: `/dashboard/learn/${setId}/learn/flashcards`,
    },
    {
      id: "multiple-choice",
      name: "Multiple Choice",
      description: "Choose the correct definition from 4 options",
      icon: <CheckCircle2 className="w-8 h-8" />,
      color: "text-green-600",
      bgColor: "bg-green-100",
      available: true,
      href: `/dashboard/learn/${setId}/learn/multiple-choice`,
    },
    {
      id: "write",
      name: "Write the Word",
      description: "Type the correct word from its definition",
      icon: <PenTool className="w-8 h-8" />,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      available: true,
      href: `/dashboard/learn/${setId}/learn/write`,
    },
    {
      id: "matching",
      name: "Matching Game",
      description: "Match words with their definitions in a grid",
      icon: <Grid3x3 className="w-8 h-8" />,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
      available: true,
      href: `/dashboard/learn/${setId}/learn/matching`,
    },
    {
      id: "test",
      name: "Test Mode",
      description: "Mixed question types for comprehensive practice",
      icon: <FileText className="w-8 h-8" />,
      color: "text-red-600",
      bgColor: "bg-red-100",
      available: true,
      href: `/dashboard/learn/${setId}/learn/test`,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/dashboard/learn/${setId}`}
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Set
          </Link>

          <h1 className="text-4xl font-bold text-gray-900 mb-2">{setName}</h1>
          <p className="text-lg text-gray-600">
            Choose a learning mode • {wordCount} words
          </p>
        </div>

        {/* Progress Stats */}
        {wordCount > 0 && (
          <div className="mb-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Progress</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {/* Memory Score */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-gray-700">Memory Score</span>
                </div>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-3xl font-bold text-gray-900">{memoryScore}%</span>
                  <span className="text-sm text-gray-500">overall retention</span>
                </div>
                <Progress value={memoryScore} className="h-2" />
              </div>

              {/* Mastered Words */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-gray-700">Mastered Words</span>
                </div>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-3xl font-bold text-gray-900">{masteredCount}</span>
                  <span className="text-sm text-gray-500">of {wordCount} ({Math.round((masteredCount / wordCount) * 100)}%)</span>
                </div>
                <Progress value={(masteredCount / wordCount) * 100} className="h-2" />
              </div>

              {/* Due for Review */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-5 h-5 text-orange-600" />
                  <span className="text-sm font-medium text-gray-700">Due for Review</span>
                </div>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className={`text-3xl font-bold ${dueCount > 0 ? "text-orange-600" : "text-gray-900"}`}>
                    {dueCount}
                  </span>
                  <span className="text-sm text-gray-500">
                    {dueCount === 0 ? "All caught up!" : "need review"}
                  </span>
                </div>
                {dueCount > 0 && (
                  <div className="text-xs text-orange-600 font-medium mt-1">
                    Practice now to improve retention
                  </div>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="flex items-center gap-6 text-sm text-gray-600 pt-4 border-t border-gray-200">
              <span>
                <span className="font-semibold text-gray-900">{wordCount - masteredCount}</span> words still learning
              </span>
              {memoryScore >= 85 && (
                <span className="text-green-600 font-medium">
                  ✓ Excellent retention - keep up the great work!
                </span>
              )}
              {memoryScore >= 70 && memoryScore < 85 && (
                <span className="text-blue-600 font-medium">
                  Strong progress - a few more reviews to mastery!
                </span>
              )}
              {memoryScore < 70 && (
                <span className="text-orange-600 font-medium">
                  Practice regularly to improve your memory score
                </span>
              )}
            </div>
          </div>
        )}

        {/* Learning Modes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {learningModes.map((mode) => (
            <Link
              key={mode.id}
              href={mode.available ? mode.href : "#"}
              className={`block ${!mode.available && "pointer-events-none"}`}
            >
              <div
                className={`bg-white rounded-xl border-2 p-6 transition-all h-full ${
                  mode.available
                    ? "border-gray-200 hover:border-blue-500 hover:shadow-lg cursor-pointer"
                    : "border-gray-100 opacity-60"
                }`}
              >
                <div className="flex flex-col h-full">
                  <div className={`${mode.bgColor} ${mode.color} w-16 h-16 rounded-lg flex items-center justify-center mb-4`}>
                    {mode.icon}
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {mode.name}
                  </h3>

                  <p className="text-gray-600 mb-4 flex-grow">
                    {mode.description}
                  </p>

                  {!mode.available && (
                    <div className="mt-auto">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                        Coming Soon
                      </span>
                    </div>
                  )}

                  {mode.available && (
                    <div className="mt-auto">
                      <Button variant="outline" className="w-full" asChild>
                        <span>Start Practice</span>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Tips Section */}
        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            💡 Learning Tips
          </h3>
          <ul className="text-sm text-blue-700 space-y-2">
            <li>• Start with Flashcards to familiarize yourself with new words</li>
            <li>• Use Multiple Choice to test your recognition skills</li>
            <li>• Practice with Write mode to improve recall ability</li>
            <li>• Take the Test when you feel confident with the vocabulary</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
