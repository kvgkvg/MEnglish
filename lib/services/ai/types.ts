/**
 * AI Service Types
 *
 * This defines the interface for AI services used in the application.
 * Any AI model (DeepSeek, GPT, Claude, custom models) should implement this interface.
 */

export interface ExtractedWord {
  word: string;
  definition: string;
  example_sentence: string;
}

export interface WordExtractionRequest {
  essay: string;
  allUserWords: string[]; // All words user already knows (to skip duplicates)
  maxWords?: number; // Maximum number of words to extract (default: 50)
}

export interface WordExtractionResponse {
  words: ExtractedWord[];
  error?: string;
}

// Response for words-only extraction (no definitions)
export interface WordsOnlyResponse {
  words: string[];
  error?: string;
}

/**
 * Base interface that all AI services must implement
 *
 * The extractWords method should:
 * - Extract ALMOST ALL non-basic vocabulary from the essay
 * - Skip words in allUserWords (user already knows)
 * - Skip basic/common words (the, is, and, run, happy, etc.)
 * - Provide clear definitions and example sentences
 * - Maximize vocabulary coverage for learning
 */
export interface AIService {
  extractWords(request: WordExtractionRequest): Promise<WordExtractionResponse>;
  extractWordsOnly(request: WordExtractionRequest): Promise<WordsOnlyResponse>;
  getDefinitionForWord(word: string, context?: string): Promise<ExtractedWord | null>;
  getName(): string;
  getProvider(): string;
}
