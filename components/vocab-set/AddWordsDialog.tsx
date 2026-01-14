"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { WordForm } from "./WordForm";
import { addWordsToSet } from "@/lib/actions/words";
import { Plus } from "lucide-react";

interface Word {
  word: string;
  definition: string;
  example_sentence?: string;
}

interface AddWordsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  setId: string;
  setName: string;
}

export function AddWordsDialog({
  open,
  onOpenChange,
  setId,
  setName,
}: AddWordsDialogProps) {
  const [words, setWords] = useState<Word[]>([
    { word: "", definition: "", example_sentence: "" },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastAddedIndex, setLastAddedIndex] = useState<number | null>(null);

  const handleAddWord = () => {
    setWords([...words, { word: "", definition: "", example_sentence: "" }]);
    setLastAddedIndex(words.length); // Mark the new word as needing focus
  };

  const handleRemoveWord = (index: number) => {
    setWords(words.filter((_, i) => i !== index));
  };

  const handleUpdateWord = (index: number, word: Word) => {
    const newWords = [...words];
    newWords[index] = word;
    setWords(newWords);
    // Reset lastAddedIndex after user starts typing
    if (lastAddedIndex === index) {
      setLastAddedIndex(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate that at least one word has both word and definition
    const validWords = words.filter(
      (w) => w.word.trim() !== "" && w.definition.trim() !== ""
    );

    if (validWords.length === 0) {
      setError("Please add at least one word with a definition");
      return;
    }

    setLoading(true);

    const result = await addWordsToSet(setId, validWords);

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      setWords([{ word: "", definition: "", example_sentence: "" }]);
      setLoading(false);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add Words to &quot;{setName}&quot;</DialogTitle>
            <DialogDescription>
              Add vocabulary words with their definitions and optional example sentences.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-6">
            {words.map((word, index) => (
              <WordForm
                key={index}
                word={word}
                index={index}
                onUpdate={handleUpdateWord}
                onRemove={handleRemoveWord}
                showRemove={words.length > 1}
                onTabOnLastField={handleAddWord}
                isLastForm={index === words.length - 1}
                autoFocus={index === lastAddedIndex}
              />
            ))}

            <Button
              type="button"
              variant="outline"
              onClick={handleAddWord}
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Another Word
            </Button>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                {error}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Adding..." : `Add ${words.filter(w => w.word.trim() && w.definition.trim()).length} Word${words.filter(w => w.word.trim() && w.definition.trim()).length !== 1 ? 's' : ''}`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
