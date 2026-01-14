"use client";

import { useState } from "react";
import { Folder, VocabSet, LearningProgress } from "@/types";
import { SetCard } from "@/components/vocab-set/SetCard";
import { CreateSetDialog } from "@/components/vocab-set/CreateSetDialog";
import { CreateFolderDialog } from "@/components/vocab-set/CreateFolderDialog";
import { MoveSetDialog } from "@/components/vocab-set/MoveSetDialog";
import { ReviewCalendar } from "@/components/learning/ReviewCalendar";
import { Button } from "@/components/ui/button";
import { Plus, FolderPlus, ChevronDown, ChevronRight, Calendar } from "lucide-react";
import { motion } from "framer-motion";

interface LearnPageClientProps {
  folders: Folder[];
  sets: (VocabSet & {
    vocab_words?: { count: number }[];
    wordCount?: number;
    masteredCount?: number;
    isDue?: boolean;
    memoryScore?: number;
  })[];
  setsForCalendar: Array<{
    set: VocabSet;
    progress: LearningProgress[];
    nextReviewDate: string | null;
  }>;
}

export function LearnPageClient({ folders, sets, setsForCalendar }: LearnPageClientProps) {
  const [createSetOpen, setCreateSetOpen] = useState(false);
  const [createFolderOpen, setCreateFolderOpen] = useState(false);
  const [moveSetOpen, setMoveSetOpen] = useState(false);
  const [selectedSet, setSelectedSet] = useState<VocabSet | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [showCalendar, setShowCalendar] = useState(true);

  // Calculate review statistics (set-based)
  const setsNeedingReview = sets.filter((set) => set.isDue);

  const toggleFolder = (folderId: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  const handleMoveSet = (set: VocabSet) => {
    setSelectedSet(set);
    setMoveSetOpen(true);
  };

  // Group sets by folder
  const setsWithoutFolder = sets.filter((set) => !set.folder_id);
  const setsByFolder = folders.reduce((acc, folder) => {
    acc[folder.id] = sets.filter((set) => set.folder_id === folder.id);
    return acc;
  }, {} as Record<string, typeof sets>);

  const hasSets = sets.length > 0;
  const hasFolders = folders.length > 0;

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Learn</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">Manage and study your vocabulary sets</p>
        </div>

        <div className="flex flex-wrap gap-2 sm:gap-3 w-full sm:w-auto">
          <Button
            variant="outline"
            onClick={() => setShowCalendar(!showCalendar)}
            size="sm"
            className="flex-1 sm:flex-none"
          >
            <Calendar className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">{showCalendar ? "Hide" : "Show"} Calendar</span>
            <span className="sm:hidden ml-2">Calendar</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => setCreateFolderOpen(true)}
            size="sm"
            className="flex-1 sm:flex-none"
          >
            <FolderPlus className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">New Folder</span>
            <span className="sm:hidden ml-2">Folder</span>
          </Button>
          <Button onClick={() => setCreateSetOpen(true)} size="sm" className="flex-1 sm:flex-none">
            <Plus className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">New Set</span>
            <span className="sm:hidden ml-2">Set</span>
          </Button>
        </div>
      </div>

      {/* Review Calendar */}
      {showCalendar && hasSets && (
        <ReviewCalendar sets={setsForCalendar} />
      )}

      {/* Empty State */}
      {!hasSets && !hasFolders && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="max-w-md mx-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              No Vocabulary Sets Yet
            </h2>
            <p className="text-gray-600 mb-6">
              Create your first vocabulary set to start learning!
            </p>
            <Button onClick={() => setCreateSetOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create New Set
            </Button>
          </div>
        </div>
      )}

      {/* Sets and Folders */}
      {(hasSets || hasFolders) && (
        <div className="space-y-6">
          {/* Root-level sets (no folder) */}
          {setsWithoutFolder.length > 0 && (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                visible: {
                  transition: {
                    staggerChildren: 0.1,
                  },
                },
              }}
              className="space-y-4"
            >
              <h2 className="text-lg font-semibold text-gray-900">All Sets</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {setsWithoutFolder.map((set) => (
                  <SetCard
                    key={set.id}
                    set={set}
                    onMove={handleMoveSet}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {/* Folders with their sets */}
          {folders.map((folder, index) => {
            const folderSets = setsByFolder[folder.id] || [];
            const isExpanded = expandedFolders.has(folder.id);

            return (
              <motion.div
                key={folder.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="space-y-4"
              >
                <motion.div
                  className="flex items-center gap-2"
                  whileHover={{ x: 4 }}
                  transition={{ duration: 0.2 }}
                >
                  <motion.button
                    onClick={() => toggleFolder(folder.id)}
                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <motion.div
                      animate={{ rotate: isExpanded ? 0 : -90 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown className="w-5 h-5 text-gray-600" />
                    </motion.div>
                  </motion.button>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {folder.name}
                  </h2>
                  <span className="text-sm text-gray-500">
                    ({folderSets.length} {folderSets.length === 1 ? "set" : "sets"})
                  </span>
                </motion.div>

                {isExpanded && folderSets.length > 0 && (
                  <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={{
                      visible: {
                        transition: {
                          staggerChildren: 0.1,
                        },
                      },
                    }}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ml-8">
                      {folderSets.map((set) => (
                        <SetCard
                          key={set.id}
                          set={set}
                          onMove={handleMoveSet}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}

                {isExpanded && folderSets.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    transition={{ duration: 0.3 }}
                    className="ml-8 text-sm text-gray-500 bg-gray-50 p-4 rounded-lg"
                  >
                    No sets in this folder yet. Create a new set and move it here.
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Dialogs */}
      <CreateSetDialog
        open={createSetOpen}
        onOpenChange={setCreateSetOpen}
        folders={folders}
      />
      <CreateFolderDialog
        open={createFolderOpen}
        onOpenChange={setCreateFolderOpen}
      />
      <MoveSetDialog
        open={moveSetOpen}
        onOpenChange={setMoveSetOpen}
        set={selectedSet}
        folders={folders}
      />
    </div>
  );
}
