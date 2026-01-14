import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getDefaultAIService } from "@/lib/services/ai";

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

    // Get AI service and extract words
    const aiService = getDefaultAIService();

    const result = await aiService.extractWords({
      essay: essay.trim(),
      allUserWords,
      maxWords: 50, // Extract more words - maximize learning
    });

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({
      words: result.words,
      aiModel: aiService.getName(),
      provider: aiService.getProvider(),
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
