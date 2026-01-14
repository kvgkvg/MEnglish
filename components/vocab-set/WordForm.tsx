"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useEffect, useRef } from "react";

interface Word {
  word: string;
  definition: string;
  example_sentence?: string;
}

interface WordFormProps {
  word: Word;
  index: number;
  onUpdate: (index: number, word: Word) => void;
  onRemove: (index: number) => void;
  showRemove: boolean;
  onTabOnLastField?: () => void;
  isLastForm?: boolean;
  autoFocus?: boolean;
}

export function WordForm({
  word,
  index,
  onUpdate,
  onRemove,
  showRemove,
  onTabOnLastField,
  isLastForm,
  autoFocus,
}: WordFormProps) {
  const wordInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoFocus && wordInputRef.current) {
      setTimeout(() => {
        wordInputRef.current?.focus();
        // Scroll the form into view
        formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 100);
    }
  }, [autoFocus]);

  const handleChange = (field: keyof Word, value: string) => {
    onUpdate(index, { ...word, [field]: value });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // If Tab is pressed on the last field of the last form, add a new word
    if (e.key === "Tab" && !e.shiftKey && isLastForm && onTabOnLastField) {
      // Check if word and definition are filled
      if (word.word.trim() && word.definition.trim()) {
        e.preventDefault();
        onTabOnLastField();
      }
    }
  };

  return (
    <div ref={formRef} className="bg-gray-50 rounded-lg p-6 relative border border-gray-200">
      {showRemove && (
        <button
          type="button"
          onClick={() => onRemove(index)}
          className="absolute top-4 right-4 p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      )}

      <div className="space-y-4">
        <div>
          <Label htmlFor={`word-${index}`}>
            Word / Phrase *
          </Label>
          <Input
            ref={wordInputRef}
            id={`word-${index}`}
            value={word.word}
            onChange={(e) => handleChange("word", e.target.value)}
            placeholder="e.g., serendipity"
            className="mt-1.5"
          />
        </div>

        <div>
          <Label htmlFor={`definition-${index}`}>
            Definition *
          </Label>
          <Input
            id={`definition-${index}`}
            value={word.definition}
            onChange={(e) => handleChange("definition", e.target.value)}
            placeholder="e.g., the occurrence of events by chance in a happy way"
            className="mt-1.5"
          />
        </div>

        <div>
          <Label htmlFor={`example-${index}`}>
            Example Sentence (optional)
          </Label>
          <Input
            id={`example-${index}`}
            value={word.example_sentence || ""}
            onChange={(e) => handleChange("example_sentence", e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g., Meeting you was pure serendipity."
            className="mt-1.5"
          />
        </div>
      </div>
    </div>
  );
}
