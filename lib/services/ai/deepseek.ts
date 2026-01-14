/**
 * DeepSeek AI Service Implementation
 *
 * Uses OpenRouter API to access DeepSeek models for vocabulary extraction.
 */

import {
  AIService,
  WordExtractionRequest,
  WordExtractionResponse,
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
