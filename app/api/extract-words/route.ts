import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getDefaultAIService } from "@/lib/services/ai";
import { fetchOxfordDefinition } from "@/lib/services/dictionary/oxford";
import { ExtractedWord } from "@/lib/services/ai/types";

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { essay, setId } = body;

    if (!essay || !essay.trim()) {
      return NextResponse.json(
        { error: "Essay text is required" },
        { status: 400 }
      );
    }

    if (!setId) {
      return NextResponse.json(
        { error: "Set ID is required" },
        { status: 400 }
      );
    }

    // Get all words from ALL user's sets (to avoid duplicates)
    const { data: allSets } = await supabase
      .from("vocab_sets")
      .select(
        `
        id,
        vocab_words (word)
      `
      )
      .eq("user_id", user.id);

    // Flatten and deduplicate all words
    const allUserWords = allSets
      ? Array.from(
          new Set(
            allSets.flatMap((set: any) =>
              (set.vocab_words || []).map((w: any) => w.word.toLowerCase())
            )
          )
        )
      : [];

    // Get AI service
    const aiService = getDefaultAIService();

    // Step 1: Extract words only using AI
    const wordsResult = await aiService.extractWordsOnly({
      essay: essay.trim(),
      allUserWords,
      maxWords: 50,
    });

    if (wordsResult.error) {
      return NextResponse.json({ error: wordsResult.error }, { status: 500 });
    }

    if (wordsResult.words.length === 0) {
      return NextResponse.json({
        words: [],
        aiModel: aiService.getName(),
        provider: "Oxford + " + aiService.getProvider(),
      });
    }

    // Step 2: Fetch definitions from Oxford for each word
    // Process in batches of 3 with delays to be respectful to Oxford
    const BATCH_SIZE = 3;
    const DELAY_MS = 300;
    const extractedWords: ExtractedWord[] = [];

    for (let i = 0; i < wordsResult.words.length; i += BATCH_SIZE) {
      const batch = wordsResult.words.slice(i, i + BATCH_SIZE);

      const batchResults = await Promise.all(
        batch.map(async (word) => {
          // Try Oxford first
          const oxfordDef = await fetchOxfordDefinition(word);

          if (oxfordDef.found && oxfordDef.definition) {
            return {
              word: word,
              definition: oxfordDef.definition,
              example_sentence: oxfordDef.example_sentence || `The word "${word}" is commonly used in English.`,
            };
          }

          // Fallback to AI definition if Oxford doesn't have it
          const aiDef = await aiService.getDefinitionForWord(word, essay);
          if (aiDef) {
            return aiDef;
          }

          // Last resort: return with placeholder
          return null;
        })
      );

      // Filter out nulls and add to results
      batchResults.forEach((result) => {
        if (result) {
          extractedWords.push(result);
        }
      });

      // Add delay between batches (except for last batch)
      if (i + BATCH_SIZE < wordsResult.words.length) {
        await new Promise((resolve) => setTimeout(resolve, DELAY_MS));
      }
    }

    return NextResponse.json({
      words: extractedWords,
      aiModel: aiService.getName(),
      provider: "Oxford Learner's Dictionary + " + aiService.getProvider(),
    });
  } catch (error) {
    console.error("Word extraction error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to extract words from essay",
      },
      { status: 500 }
    );
  }
}
