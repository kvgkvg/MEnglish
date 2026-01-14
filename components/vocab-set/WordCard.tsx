"use client";

import { VocabWord } from "@/types";
import { useState } from "react";
import { MoreVertical, Edit, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { deleteWord } from "@/lib/actions/words";

interface WordCardProps {
  word: VocabWord;
  onEdit?: (word: VocabWord) => void;
}

export function WordCard({ word, onEdit }: WordCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${word.word}"?`)) {
      return;
    }

    setIsDeleting(true);
    const result = await deleteWord(word.id);

    if (result.error) {
      alert("Error deleting word: " + result.error);
      setIsDeleting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition-shadow group">
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-900">{word.word}</h3>

        <DropdownMenu>
          <DropdownMenuTrigger className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 rounded">
            <MoreVertical className="w-4 h-4 text-gray-600" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {onEdit && (
              <DropdownMenuItem onClick={() => onEdit(word)}>
                <Edit className="w-4 h-4 mr-2" />
                Edit
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

      <p className="text-gray-700 mb-3">{word.definition}</p>

      {word.example_sentence && (
        <p className="text-sm text-gray-500 italic border-l-2 border-blue-200 pl-3">
          {word.example_sentence}
        </p>
      )}
    </div>
  );
}
