"use client";

import { VocabSet } from "@/types";
import { BookOpen, MoreVertical, Trash2, Edit, FolderInput, Bell, TrendingUp } from "lucide-react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { deleteVocabSet } from "@/lib/actions/sets";
import { useState } from "react";
import { motion } from "framer-motion";

interface SetCardProps {
  set: VocabSet & {
    vocab_words?: { count: number }[];
    wordCount?: number;
    masteredCount?: number;
    isDue?: boolean;
    memoryScore?: number;
  };
  onEdit?: (set: VocabSet) => void;
  onMove?: (set: VocabSet) => void;
}

export function SetCard({ set, onEdit, onMove }: SetCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const wordCount = set.wordCount || set.vocab_words?.[0]?.count || 0;
  const masteredCount = set.masteredCount || 0;
  const isDue = set.isDue || false;
  const memoryScore = set.memoryScore || 0;

  const masteryPercentage = wordCount > 0 ? Math.round((masteredCount / wordCount) * 100) : 0;

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this set? This cannot be undone.")) {
      return;
    }

    setIsDeleting(true);
    const result = await deleteVocabSet(set.id);

    if (result.error) {
      alert("Error deleting set: " + result.error);
      setIsDeleting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 hover:shadow-lg transition-shadow group relative"
    >
      {/* Review Notification Badge */}
      {isDue && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 15 }}
          className="absolute -top-2 -right-2 flex items-center gap-1 px-2 sm:px-3 py-1 bg-orange-500 text-white text-[10px] sm:text-xs font-bold rounded-full shadow-lg animate-pulse"
        >
          <Bell className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
          <span className="hidden xs:inline">Review Due</span>
          <span className="xs:hidden">Due</span>
        </motion.div>
      )}

      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
          <div className="p-2 sm:p-3 rounded-lg bg-blue-100 text-blue-600 flex-shrink-0">
            <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <Link href={`/dashboard/learn/${set.id}`}>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors truncate">
                {set.name}
              </h3>
            </Link>
            {set.description && (
              <p className="text-xs sm:text-sm text-gray-500 line-clamp-1">{set.description}</p>
            )}
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity p-2 hover:bg-gray-100 rounded-lg flex-shrink-0">
            <MoreVertical className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {onEdit && (
              <DropdownMenuItem onClick={() => onEdit(set)}>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </DropdownMenuItem>
            )}
            {onMove && (
              <DropdownMenuItem onClick={() => onMove(set)}>
                <FolderInput className="w-4 h-4 mr-2" />
                Move to Folder
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-red-600 focus:text-red-600"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {isDeleting ? "Deleting..." : "Delete"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 mb-3">
        <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm flex-wrap">
          <span className="font-medium text-gray-900">{wordCount} words</span>
          {wordCount > 0 && (
            <>
              <span className="text-gray-400">•</span>
              <span className={`font-medium ${masteryPercentage >= 85 ? "text-green-600" : masteryPercentage >= 70 ? "text-blue-600" : masteryPercentage >= 50 ? "text-yellow-600" : "text-gray-600"}`}>
                {masteryPercentage}% mastered
              </span>
            </>
          )}
        </div>

        <Link href={`/dashboard/learn/${set.id}`} className="w-full sm:w-auto">
          <button className="w-full sm:w-auto text-xs sm:text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors px-3 py-1.5 sm:px-0 sm:py-0 bg-blue-50 sm:bg-transparent rounded-md sm:rounded-none">
            {isDue ? "Review Now" : "Study"}
          </button>
        </Link>
      </div>

      {/* Memory Score Display */}
      {wordCount > 0 && (
        <div className="mb-3">
          <div className="flex items-center justify-between text-[10px] sm:text-xs mb-1">
            <span className="text-gray-600 flex items-center gap-1">
              <TrendingUp className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              Memory Score
            </span>
            <span className="font-semibold text-gray-900">{memoryScore}%</span>
          </div>
        </div>
      )}

      {/* Progress bar */}
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${memoryScore}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={`h-full rounded-full ${
            memoryScore >= 85
              ? "bg-green-500"
              : memoryScore >= 70
              ? "bg-blue-500"
              : memoryScore >= 50
              ? "bg-yellow-500"
              : "bg-red-500"
          }`}
        />
      </div>
    </motion.div>
  );
}
