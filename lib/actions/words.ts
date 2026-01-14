"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function addWordsToSet(
  setId: string,
  words: { word: string; definition: string; example_sentence?: string }[]
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  // Verify the set belongs to the user
  const { data: set, error: setError } = await supabase
    .from("vocab_sets")
    .select("id")
    .eq("id", setId)
    .eq("user_id", user.id)
    .single();

  if (setError || !set) {
    return { error: "Set not found or unauthorized" };
  }

  // Insert all words
  const wordsToInsert = words.map((word) => ({
    set_id: setId,
    ...word,
  }));

  const { data, error } = await supabase
    .from("vocab_words")
    .insert(wordsToInsert)
    .select();

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/dashboard/learn/${setId}`);
  revalidatePath("/dashboard/learn");
  return { data };
}

export async function updateWord(
  wordId: string,
  data: { word?: string; definition?: string; example_sentence?: string }
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  // Verify the word belongs to the user's set
  const { data: wordData, error: wordError } = await supabase
    .from("vocab_words")
    .select("set_id, vocab_sets!inner(user_id)")
    .eq("id", wordId)
    .single();

  if (wordError || !wordData || (wordData.vocab_sets as any).user_id !== user.id) {
    return { error: "Word not found or unauthorized" };
  }

  const { data: updated, error } = await supabase
    .from("vocab_words")
    .update(data)
    .eq("id", wordId)
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/dashboard/learn/${wordData.set_id}`);
  return { data: updated };
}

export async function deleteWord(wordId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  // Get the word to find its set_id and verify ownership
  const { data: wordData, error: wordError } = await supabase
    .from("vocab_words")
    .select("set_id, vocab_sets!inner(user_id)")
    .eq("id", wordId)
    .single();

  if (wordError || !wordData || (wordData.vocab_sets as any).user_id !== user.id) {
    return { error: "Word not found or unauthorized" };
  }

  const { error } = await supabase.from("vocab_words").delete().eq("id", wordId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/dashboard/learn/${wordData.set_id}`);
  return { success: true };
}

export async function getWordsForSet(setId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  // Verify the set belongs to the user
  const { data: set, error: setError } = await supabase
    .from("vocab_sets")
    .select("id")
    .eq("id", setId)
    .eq("user_id", user.id)
    .single();

  if (setError || !set) {
    return { error: "Set not found or unauthorized" };
  }

  const { data, error } = await supabase
    .from("vocab_words")
    .select("*")
    .eq("set_id", setId)
    .order("created_at", { ascending: true });

  if (error) {
    return { error: error.message };
  }

  return { data };
}
