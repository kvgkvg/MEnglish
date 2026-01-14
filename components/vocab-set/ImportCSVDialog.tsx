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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { addWordsToSet } from "@/lib/actions/words";
import { Upload, FileText, X, Type } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import Papa from "papaparse";

interface ImportCSVDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  setId: string;
  setName: string;
}

interface ParsedRow {
  [key: string]: string;
}

export function ImportCSVDialog({
  open,
  onOpenChange,
  setId,
  setName,
}: ImportCSVDialogProps) {
  const [inputMethod, setInputMethod] = useState<"file" | "text">("file");
  const [file, setFile] = useState<File | null>(null);
  const [textInput, setTextInput] = useState("");
  const [parsedData, setParsedData] = useState<ParsedRow[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [wordColumn, setWordColumn] = useState<string>("");
  const [definitionColumn, setDefinitionColumn] = useState<string>("");
  const [exampleColumn, setExampleColumn] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<"upload" | "map" | "preview">("upload");

  const processParseResults = (results: Papa.ParseResult<ParsedRow>) => {
    if (results.data.length === 0) {
      setError("No data found");
      return;
    }

    const data = results.data as ParsedRow[];
    setParsedData(data);

    // Get column names
    const cols = Object.keys(data[0]);
    setColumns(cols);

    // Auto-detect columns (case-insensitive)
    const wordCol = cols.find((c) =>
      /^(word|term|vocabulary|vocab)$/i.test(c)
    );
    const defCol = cols.find((c) =>
      /^(definition|def|meaning|description)$/i.test(c)
    );
    const exampleCol = cols.find((c) =>
      /^(example|sentence|usage|context)$/i.test(c)
    );

    if (wordCol) setWordColumn(wordCol);
    if (defCol) setDefinitionColumn(defCol);
    if (exampleCol) setExampleColumn(exampleCol);

    setStep("map");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setError(null);

    // Parse the file
    Papa.parse(selectedFile, {
      header: true,
      skipEmptyLines: true,
      complete: processParseResults,
      error: (error: Error) => {
        setError(`Error parsing file: ${error.message}`);
      },
    });
  };

  const handleTextParse = () => {
    if (!textInput.trim()) {
      setError("Please paste CSV/TSV content");
      return;
    }

    setError(null);

    // Parse the text
    Papa.parse(textInput, {
      header: true,
      skipEmptyLines: true,
      complete: processParseResults,
      error: (error: Error) => {
        setError(`Error parsing text: ${error.message}`);
      },
    });
  };

  const handlePreview = () => {
    if (!wordColumn || !definitionColumn) {
      setError("Please select at least Word and Definition columns");
      return;
    }
    setStep("preview");
  };

  const handleImport = async () => {
    if (!wordColumn || !definitionColumn) {
      setError("Please select at least Word and Definition columns");
      return;
    }

    setLoading(true);
    setError(null);

    // Map parsed data to words
    const words = parsedData
      .filter((row) => row[wordColumn]?.trim() && row[definitionColumn]?.trim())
      .map((row) => ({
        word: row[wordColumn].trim(),
        definition: row[definitionColumn].trim(),
        example_sentence: exampleColumn ? row[exampleColumn]?.trim() : undefined,
      }));

    if (words.length === 0) {
      setError("No valid words found to import");
      setLoading(false);
      return;
    }

    const result = await addWordsToSet(setId, words);

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      // Reset state
      setFile(null);
      setParsedData([]);
      setColumns([]);
      setWordColumn("");
      setDefinitionColumn("");
      setExampleColumn("");
      setStep("upload");
      setLoading(false);
      onOpenChange(false);
    }
  };

  const handleReset = () => {
    setInputMethod("file");
    setFile(null);
    setTextInput("");
    setParsedData([]);
    setColumns([]);
    setWordColumn("");
    setDefinitionColumn("");
    setExampleColumn("");
    setStep("upload");
    setError(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import from CSV/TSV</DialogTitle>
          <DialogDescription>
            Upload a CSV or TSV file with vocabulary words
          </DialogDescription>
        </DialogHeader>

        {/* Step 1: Upload */}
        {step === "upload" && (
          <div className="space-y-4 py-6">
            {/* Method Selection Tabs */}
            <div className="flex gap-2 border-b border-gray-200">
              <button
                onClick={() => setInputMethod("file")}
                className={`px-4 py-2 border-b-2 transition-colors ${
                  inputMethod === "file"
                    ? "border-blue-600 text-blue-600 font-medium"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  <span>Upload File</span>
                </div>
              </button>
              <button
                onClick={() => setInputMethod("text")}
                className={`px-4 py-2 border-b-2 transition-colors ${
                  inputMethod === "text"
                    ? "border-blue-600 text-blue-600 font-medium"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Type className="w-4 h-4" />
                  <span>Paste Text</span>
                </div>
              </button>
            </div>

            {/* File Upload Method */}
            {inputMethod === "file" && (
              <>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-blue-500 transition-colors">
                  <input
                    type="file"
                    accept=".csv,.tsv,.txt"
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-lg font-medium text-gray-900 mb-2">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-sm text-gray-500">
                      CSV or TSV file (max 5MB)
                    </p>
                  </label>
                </div>

                {file && (
                  <div className="flex items-center gap-3 bg-blue-50 p-4 rounded-lg">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-medium text-gray-900 flex-1">
                      {file.name}
                    </span>
                    <button
                      onClick={handleReset}
                      className="text-gray-500 hover:text-red-600"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </>
            )}

            {/* Text Input Method */}
            {inputMethod === "text" && (
              <>
                <div>
                  <Label htmlFor="csv-text">CSV/TSV Content *</Label>
                  <Textarea
                    id="csv-text"
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    placeholder={`Paste your CSV/TSV content here:

word,definition,example
serendipity,happy accident,It was pure serendipity
ephemeral,short-lived,Beauty is ephemeral

Or tab-separated:
word	definition	example
serendipity	happy accident	It was pure serendipity`}
                    className="mt-1.5 min-h-[300px] font-mono text-sm"
                  />
                </div>

                <Button onClick={handleTextParse} className="w-full">
                  Parse CSV/TSV
                </Button>
              </>
            )}

            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm font-medium text-gray-900 mb-2">
                Expected format:
              </p>
              <pre className="text-xs text-gray-600 bg-white p-3 rounded border">
                {`word,definition,example
serendipity,happy accident,It was pure serendipity
ephemeral,short-lived,Beauty is ephemeral`}
              </pre>
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                {error}
              </div>
            )}
          </div>
        )}

        {/* Step 2: Map Columns */}
        {step === "map" && (
          <div className="space-y-4 py-6">
            <p className="text-sm text-gray-600">
              Map your CSV columns to vocabulary fields. Found {parsedData.length}{" "}
              rows.
            </p>

            <div>
              <Label>Word Column *</Label>
              <Select value={wordColumn} onValueChange={setWordColumn}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Select column for words" />
                </SelectTrigger>
                <SelectContent>
                  {columns.map((col) => (
                    <SelectItem key={col} value={col}>
                      {col}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Definition Column *</Label>
              <Select value={definitionColumn} onValueChange={setDefinitionColumn}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Select column for definitions" />
                </SelectTrigger>
                <SelectContent>
                  {columns.map((col) => (
                    <SelectItem key={col} value={col}>
                      {col}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Example Column (optional)</Label>
              <Select
                value={exampleColumn || "none"}
                onValueChange={(val) => setExampleColumn(val === "none" ? "" : val)}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Select column for examples" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {columns.map((col) => (
                    <SelectItem key={col} value={col}>
                      {col}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                {error}
              </div>
            )}
          </div>
        )}

        {/* Step 3: Preview */}
        {step === "preview" && (
          <div className="space-y-4 py-6">
            <p className="text-sm text-gray-600">
              Preview of {parsedData.length} words to be imported:
            </p>

            <div className="max-h-96 overflow-y-auto space-y-3">
              {parsedData.slice(0, 10).map((row, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg">
                  <p className="font-semibold text-gray-900">
                    {row[wordColumn]}
                  </p>
                  <p className="text-sm text-gray-700 mt-1">
                    {row[definitionColumn]}
                  </p>
                  {exampleColumn && row[exampleColumn] && (
                    <p className="text-sm text-gray-500 italic mt-1">
                      {row[exampleColumn]}
                    </p>
                  )}
                </div>
              ))}
              {parsedData.length > 10 && (
                <p className="text-sm text-gray-500 text-center">
                  ... and {parsedData.length - 10} more words
                </p>
              )}
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                {error}
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          {step === "upload" && (
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
          )}

          {step === "map" && (
            <>
              <Button type="button" variant="outline" onClick={handleReset}>
                Back
              </Button>
              <Button onClick={handlePreview}>Next: Preview</Button>
            </>
          )}

          {step === "preview" && (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep("map")}
              >
                Back
              </Button>
              <Button onClick={handleImport} disabled={loading}>
                {loading ? "Importing..." : `Import ${parsedData.length} Words`}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
