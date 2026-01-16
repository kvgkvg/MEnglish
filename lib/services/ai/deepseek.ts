/**
 * DeepSeek AI Service Implementation
 *
 * Uses OpenRouter API to access DeepSeek models for vocabulary extraction.
 */

import {
  AIService,
  WordExtractionRequest,
  WordExtractionResponse,
  WordsOnlyResponse,
  ExtractedWord,
} from "./types";

export class DeepSeekService implements AIService {
  private apiKey: string;
  private apiUrl = "https://openrouter.ai/api/v1/chat/completions";
  private modelId = "deepseek/deepseek-chat";

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  getName(): string {
    return "DeepSeek Chat";
  }

  getProvider(): string {
    return "OpenRouter";
  }

  /**
   * Extract vocabulary words from an essay
   */
  async extractWords(
    request: WordExtractionRequest
  ): Promise<WordExtractionResponse> {
    try {
      const prompt = this.buildPrompt(request);

      const response = await fetch(this.apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
          "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
          "X-Title": "MEnglish Vocabulary Learning",
        },
        body: JSON.stringify({
          model: this.modelId,
          messages: [
            {
              role: "system",
              content: "You are a professional lexicographer and vocabulary expert. Your task is to extract vocabulary words from essays and provide ACCURATE, DICTIONARY-QUALITY definitions that match what you would find in Oxford or Merriam-Webster dictionaries. Definitions must be factually correct, precise, and appropriate for English learners. Accuracy is paramount.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.3,
          max_tokens: 3000,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;

      if (!content) {
        throw new Error("No content in API response");
      }

      // Parse the JSON response from the AI
      const words = this.parseAIResponse(content);

      return {
        words,
      };
    } catch (error) {
      console.error("DeepSeek word extraction error:", error);
      return {
        words: [],
        error: error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  /**
   * Build the prompt for word extraction
   */
  private buildPrompt(request: WordExtractionRequest): string {
    const { essay, allUserWords, maxWords = 50 } = request;

    // Build existing words section
    const existingWordsText =
      allUserWords.length > 0
        ? `\n\nWords the user ALREADY KNOWS (DO NOT extract these):\n${allUserWords.slice(0, 50).join(", ")}${allUserWords.length > 50 ? `\n... and ${allUserWords.length - 50} more words` : ""}`
        : "";

    return `You are a professional lexicographer creating dictionary entries for English learners. Extract ALL meaningful vocabulary words from the following essay and provide ACCURATE, DICTIONARY-QUALITY definitions.

EXTRACTION RULES:
1. Extract ALMOST ALL non-basic words from the essay
2. DO extract: intermediate and advanced vocabulary, academic words, sophisticated terms, specialized vocabulary
3. DO NOT extract:
   - Basic words (the, is, are, and, but, in, on, at, this, that, etc.)
   - Words the user already knows (listed below)
   - Proper nouns (names of people, places, brands)
   - Numbers and dates

GOAL: Maximize the number of useful vocabulary words for learning
${existingWordsText}

ESSAY TEXT:
"""
${essay}
"""

CRITICAL DEFINITION REQUIREMENTS:
For each word, you MUST provide a PRECISE, ACCURATE definition as if you were writing a dictionary entry:

1. **Word**: Use lowercase, base form (infinitive for verbs, singular for nouns)

2. **Definition**: Provide an ACCURATE, dictionary-quality definition that:
   - Is FACTUALLY CORRECT and matches standard dictionary definitions
   - Uses clear, simple language appropriate for English learners
   - Captures the EXACT meaning as used in the essay context
   - Is concise (1-2 sentences maximum)
   - Avoids circular definitions (don't use the word to define itself)
   - Includes part of speech context when helpful (noun, verb, adjective, etc.)

   EXAMPLES OF GOOD DEFINITIONS:
   - "paramount" → "more important than anything else; supreme"
   - "proliferation" → "rapid increase in the number or amount of something"
   - "mitigate" → "to make something less severe, serious, or painful"
   - "empirical" → "based on observation or experience rather than theory"

3. **Example Sentence**: Provide a natural example that demonstrates the word's usage:
   - Use the ACTUAL sentence from the essay if it clearly shows the word's meaning
   - Otherwise, create a NEW, simple sentence that clearly illustrates the definition
   - Keep it natural and easy to understand
   - Ensure the sentence matches the definition provided

RESPOND ONLY with a valid JSON array in this EXACT format (no markdown, no extra text):
[
  {
    "word": "serendipity",
    "definition": "the occurrence of pleasant or valuable things by chance rather than through planning",
    "example_sentence": "Finding that old book in the attic was pure serendipity."
  }
]

Extract up to ${maxWords} words. Prioritize words that appear in the essay. ACCURACY IS CRITICAL - provide definitions that match what you would find in a reputable dictionary like Oxford or Merriam-Webster.`;
  }

  /**
   * Extract only the words from an essay (no definitions)
   * Used when fetching definitions from external dictionary
   */
  async extractWordsOnly(
    request: WordExtractionRequest
  ): Promise<WordsOnlyResponse> {
    try {
      const prompt = this.buildWordsOnlyPrompt(request);

      const response = await fetch(this.apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
          "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
          "X-Title": "MEnglish Vocabulary Learning",
        },
        body: JSON.stringify({
          model: this.modelId,
          messages: [
            {
              role: "system",
              content: "You are a vocabulary extraction expert. Your task is to identify vocabulary words from essays that would be valuable for English learners. Return ONLY a JSON array of words.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.2,
          max_tokens: 1000,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;

      if (!content) {
        throw new Error("No content in API response");
      }

      const words = this.parseWordsOnlyResponse(content);
      return { words };
    } catch (error) {
      console.error("DeepSeek words-only extraction error:", error);
      return {
        words: [],
        error: error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  /**
   * Get definition for a single word (fallback when Oxford doesn't have it)
   */
  async getDefinitionForWord(
    word: string,
    context?: string
  ): Promise<ExtractedWord | null> {
    try {
      const contextText = context
        ? `\n\nContext where the word was used: "${context}"`
        : "";

      const response = await fetch(this.apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
          "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
          "X-Title": "MEnglish Vocabulary Learning",
        },
        body: JSON.stringify({
          model: this.modelId,
          messages: [
            {
              role: "system",
              content: "You are a professional lexicographer. Provide accurate, dictionary-quality definitions.",
            },
            {
              role: "user",
              content: `Provide a definition and example sentence for the word "${word}".${contextText}

Respond with ONLY valid JSON in this format:
{
  "word": "${word}",
  "definition": "clear, concise definition",
  "example_sentence": "natural example sentence using the word"
}`,
            },
          ],
          temperature: 0.3,
          max_tokens: 300,
        }),
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;

      if (!content) {
        return null;
      }

      // Parse the response
      let jsonText = content.trim();
      if (jsonText.startsWith("```")) {
        jsonText = jsonText.replace(/```json?\n?/g, "").replace(/```\n?$/g, "");
      }

      const parsed = JSON.parse(jsonText);
      return {
        word: parsed.word?.toLowerCase().trim() || word,
        definition: parsed.definition?.trim() || "",
        example_sentence: parsed.example_sentence?.trim() || "",
      };
    } catch (error) {
      console.error(`Failed to get AI definition for "${word}":`, error);
      return null;
    }
  }

  /**
   * Build prompt for words-only extraction
   */
  private buildWordsOnlyPrompt(request: WordExtractionRequest): string {
    const { essay, allUserWords, maxWords = 50 } = request;

    const existingWordsText =
      allUserWords.length > 0
        ? `\n\nWords the user ALREADY KNOWS (DO NOT extract these):\n${allUserWords.slice(0, 50).join(", ")}${allUserWords.length > 50 ? `\n... and ${allUserWords.length - 50} more words` : ""}`
        : "";

    return `Extract ALL meaningful vocabulary words from the following essay.

EXTRACTION RULES:
1. Extract ALMOST ALL non-basic words from the essay
2. DO extract: intermediate and advanced vocabulary, academic words, sophisticated terms
3. DO NOT extract:
   - Basic words (the, is, are, and, but, in, on, at, this, that, etc.)
   - Words the user already knows (listed below)
   - Proper nouns (names of people, places, brands)
   - Numbers and dates
4. Return words in their BASE FORM (infinitive for verbs, singular for nouns)

GOAL: Maximize useful vocabulary words for learning
${existingWordsText}

ESSAY TEXT:
"""
${essay}
"""

RESPOND ONLY with a valid JSON array of words (lowercase, no definitions):
["word1", "word2", "word3"]

Extract up to ${maxWords} words.`;
  }

  /**
   * Parse words-only response
   */
  private parseWordsOnlyResponse(content: string): string[] {
    try {
      let jsonText = content.trim();
      if (jsonText.startsWith("```")) {
        jsonText = jsonText.replace(/```json?\n?/g, "").replace(/```\n?$/g, "");
      }

      const words = JSON.parse(jsonText);

      if (!Array.isArray(words)) {
        throw new Error("Response is not an array");
      }

      return words
        .filter((w): w is string => typeof w === "string")
        .map((w) => w.toLowerCase().trim())
        .filter((w) => w.length > 0);
    } catch (error) {
      console.error("Failed to parse words-only response:", error);
      throw new Error("Failed to parse AI response. Please try again.");
    }
  }

  /**
   * Parse AI response and extract words
   */
  private parseAIResponse(content: string): ExtractedWord[] {
    try {
      // Remove markdown code blocks if present
      let jsonText = content.trim();
      if (jsonText.startsWith("```json")) {
        jsonText = jsonText.replace(/```json\n?/g, "").replace(/```\n?$/g, "");
      } else if (jsonText.startsWith("```")) {
        jsonText = jsonText.replace(/```\n?/g, "").replace(/```\n?$/g, "");
      }

      // Parse JSON
      const words = JSON.parse(jsonText);

      // Validate and clean the data
      if (!Array.isArray(words)) {
        throw new Error("Response is not an array");
      }

      return words
        .filter((w) => w.word && w.definition && w.example_sentence)
        .map((w) => ({
          word: w.word.toLowerCase().trim(),
          definition: w.definition.trim(),
          example_sentence: w.example_sentence.trim(),
        }));
    } catch (error) {
      console.error("Failed to parse AI response:", error);
      console.error("Raw content:", content);
      throw new Error("Failed to parse AI response. Please try again.");
    }
  }
}
