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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { addWordsToSet } from "@/lib/actions/words";
import { Sparkles, Loader2, AlertCircle } from "lucide-react";
import { ExtractedWord } from "@/lib/services/ai/types";

interface ImportEssayDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  setId: string;
  setName: string;
}

export function ImportEssayDialog({
  open,
  onOpenChange,
  setId,
  setName,
}: ImportEssayDialogProps) {
  const [essay, setEssay] = useState("");
  const [extractedWords, setExtractedWords] = useState<ExtractedWord[]>([]);
  const [selectedWords, setSelectedWords] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<"input" | "review">("input");
  const [aiModel, setAiModel] = useState<string>("");

  const handleExtract = async () => {
    if (!essay.trim()) {
      setError("Please paste your essay text");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/extract-words", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          essay: essay.trim(),
          setId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to extract words");
      }

      if (data.words.length === 0) {
        setError("No new vocabulary words found in the essay");
        setLoading(false);
        return;
      }

      setExtractedWords(data.words);
      setAiModel(data.aiModel);
      // Select all words by default
      setSelectedWords(new Set(data.words.map((_: any, index: number) => index)));
      setStep("review");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to extract words");
    } finally {
      setLoading(false);
    }
  };

  const toggleWord = (index: number) => {
    const newSelected = new Set(selectedWords);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedWords(newSelected);
  };

  const toggleAll = () => {
    if (selectedWords.size === extractedWords.length) {
      setSelectedWords(new Set());
    } else {
      setSelectedWords(
        new Set(extractedWords.map((_, index) => index))
      );
    }
  };

  const handleImport = async () => {
    if (selectedWords.size === 0) {
      setError("Please select at least one word to import");
      return;
    }

    setImporting(true);
    setError(null);

    // Get selected words
    const wordsToImport = Array.from(selectedWords)
      .map((index) => extractedWords[index])
      .map((word) => ({
        word: word.word,
        definition: word.definition,
        example_sentence: word.example_sentence,
      }));

    const result = await addWordsToSet(setId, wordsToImport);

    if (result.error) {
      setError(result.error);
      setImporting(false);
    } else {
      // Reset state
      setEssay("");
      setExtractedWords([]);
      setSelectedWords(new Set());
      setStep("input");
      setImporting(false);
      onOpenChange(false);
    }
  };

  const handleReset = () => {
    setEssay("");
    setExtractedWords([]);
    setSelectedWords(new Set());
    setStep("input");
    setError(null);
    setAiModel("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            AI Essay Import
          </DialogTitle>
          <DialogDescription>
            Paste your essay and AI will extract relevant vocabulary for &quot;{setName}&quot;
          </DialogDescription>
        </DialogHeader>

        {/* Step 1: Essay Input */}
        {step === "input" && (
          <div className="space-y-4 py-6">
            <div>
              <Label htmlFor="essay">Essay or Text *</Label>
              <Textarea
                id="essay"
                value={essay}
                onChange={(e) => setEssay(e.target.value)}
                placeholder={`Paste your essay here...

The AI will analyze the text and extract advanced vocabulary words that would be valuable for English learners. It will automatically skip words you already know from your existing vocabulary sets.`}
                className="mt-1.5 min-h-[300px]"
              />
              <p className="text-xs text-gray-500 mt-2">
                Tip: Longer essays (300+ words) work best for vocabulary extraction
              </p>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-purple-900 mb-1">
                    How it works:
                  </p>
                  <ul className="text-purple-700 space-y-1 list-disc list-inside">
                    <li>AI extracts vocabulary words from your essay</li>
                    <li>Definitions sourced from Oxford Learner&apos;s Dictionary</li>
                    <li>Automatically skips words you already know</li>
                    <li>Maximizes learning by capturing all useful vocabulary</li>
                    <li>You can review and select which words to import</li>
                  </ul>
                  <p className="text-purple-600 mt-2 text-xs">
                    Note: Extraction may take longer as we fetch precise definitions from Oxford.
                  </p>
                </div>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Review Extracted Words */}
        {step === "review" && (
          <div className="space-y-4 py-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">
                  Found <span className="font-semibold">{extractedWords.length}</span> vocabulary
                  words
                  {aiModel && (
                    <span className="text-xs text-gray-500 ml-2">
                      • Extracted by {aiModel}
                    </span>
                  )}
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={toggleAll}>
                {selectedWords.size === extractedWords.length
                  ? "Deselect All"
                  : "Select All"}
              </Button>
            </div>

            <div className="max-h-[400px] overflow-y-auto space-y-3 pr-2">
              {extractedWords.map((word, index) => (
                <div
                  key={index}
                  className={`border rounded-lg p-4 transition-all cursor-pointer hover:border-purple-300 ${
                    selectedWords.has(index)
                      ? "border-purple-500 bg-purple-50"
                      : "border-gray-200 bg-white"
                  }`}
                  onClick={() => toggleWord(index)}
                >
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={selectedWords.has(index)}
                      onCheckedChange={() => toggleWord(index)}
                      className="mt-1"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-lg">
                        {word.word}
                      </p>
                      <p className="text-sm text-gray-700 mt-1">
                        {word.definition}
                      </p>
                      {word.example_sentence && (
                        <p className="text-sm text-gray-500 italic mt-2">
                          &quot;{word.example_sentence}&quot;
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {error && (
              <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          {step === "input" && (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleExtract} disabled={loading || !essay.trim()}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Fetching from Oxford...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Extract Words
                  </>
                )}
              </Button>
            </>
          )}

          {step === "review" && (
            <>
              <Button type="button" variant="outline" onClick={handleReset}>
                Back
              </Button>
              <Button onClick={handleImport} disabled={importing || selectedWords.size === 0}>
                {importing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Importing...
                  </>
                ) : (
                  `Import ${selectedWords.size} ${selectedWords.size === 1 ? "Word" : "Words"}`
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
