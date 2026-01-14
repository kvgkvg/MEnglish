import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { WriteTheWordQuiz } from "@/components/learning/WriteTheWordQuiz";

export default async function WriteTheWordPage({
  params,
}: {
  params: Promise<{ setId: string }>;
}) {
  const { setId } = await params;
  const supabase = await createClient();

  // Get authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    notFound();
  }

  // Get vocab set with words
  const { data: vocabSet, error } = await supabase
    .from("vocab_sets")
    .select(
      `
      *,
      vocab_words (*)
    `
    )
    .eq("id", setId)
    .eq("user_id", user.id)
    .single();

  if (error || !vocabSet) {
    notFound();
  }

  const words = vocabSet.vocab_words || [];

  if (words.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">✏️</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            No Words Yet
          </h2>
          <p className="text-gray-600 mb-6">
            Add some vocabulary words to this set before you can practice writing.
          </p>
          <a
            href={`/dashboard/learn/${setId}`}
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Set
          </a>
        </div>
      </div>
    );
  }

  return (
    <WriteTheWordQuiz
      setId={vocabSet.id}
      setName={vocabSet.name}
      words={words}
    />
  );
}
