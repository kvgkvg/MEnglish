import { VocabWord } from "@/types";

export type QuestionType = "true-false" | "multiple-choice" | "write" | "matching";

export interface TrueFalseQuestion {
  type: "true-false";
  id: string;
  word: string;
  definition: string;
  isCorrect: boolean;
  correctDefinition?: string;
}

export interface MultipleChoiceQuestion {
  type: "multiple-choice";
  id: string;
  word: string;
  options: string[];
  correctAnswer: string;
}

export interface WriteQuestion {
  type: "write";
  id: string;
  definition: string;
  correctAnswer: string;
}

export interface MatchingQuestion {
  type: "matching";
  id: string;
  pairs: Array<{
    wordId: string;
    word: string;
    definition: string;
  }>;
}

export type TestQuestion =
  | TrueFalseQuestion
  | MultipleChoiceQuestion
  | WriteQuestion
  | MatchingQuestion;

/**
 * Generate a mixed test with different question types
 */
export function generateTest(
  words: VocabWord[],
  questionCount: number = 10
): TestQuestion[] {
  if (words.length < 4) {
    throw new Error("Need at least 4 words to generate a test");
  }

  const questions: TestQuestion[] = [];
  const usedWordIds = new Set<string>();
  const shuffledWords = [...words].sort(() => Math.random() - 0.5);

  // Determine how many of each question type
  const typeCounts = distributeQuestions(questionCount);

  // Generate True/False questions
  for (let i = 0; i < typeCounts.trueFalse && shuffledWords.length > 0; i++) {
    const word = shuffledWords.shift()!;
    usedWordIds.add(word.id);
    questions.push(generateTrueFalseQuestion(word, words));
  }

  // Generate Multiple Choice questions
  for (let i = 0; i < typeCounts.multipleChoice && shuffledWords.length > 0; i++) {
    const word = shuffledWords.shift()!;
    usedWordIds.add(word.id);
    questions.push(generateMultipleChoiceQuestion(word, words));
  }

  // Generate Write questions
  for (let i = 0; i < typeCounts.write && shuffledWords.length > 0; i++) {
    const word = shuffledWords.shift()!;
    usedWordIds.add(word.id);
    questions.push(generateWriteQuestion(word));
  }

  // Generate Matching questions (uses 3 words per question)
  for (let i = 0; i < typeCounts.matching && shuffledWords.length >= 3; i++) {
    const matchWords = shuffledWords.splice(0, 3);
    matchWords.forEach((w) => usedWordIds.add(w.id));
    questions.push(generateMatchingQuestion(matchWords));
  }

  // Shuffle final questions
  return questions.sort(() => Math.random() - 0.5);
}

/**
 * Distribute questions across types
 */
function distributeQuestions(total: number): {
  trueFalse: number;
  multipleChoice: number;
  write: number;
  matching: number;
} {
  const counts = {
    trueFalse: Math.floor(total * 0.25),
    multipleChoice: Math.floor(total * 0.35),
    write: Math.floor(total * 0.25),
    matching: 0,
  };

  // Matching questions use 3 words, so calculate how many we can fit
  const remaining = total - (counts.trueFalse + counts.multipleChoice + counts.write);
  counts.matching = Math.max(0, Math.floor(remaining / 3));

  return counts;
}

/**
 * Generate a True/False question
 */
function generateTrueFalseQuestion(
  word: VocabWord,
  allWords: VocabWord[]
): TrueFalseQuestion {
  const isCorrect = Math.random() > 0.5;

  if (isCorrect) {
    return {
      type: "true-false",
      id: `tf-${word.id}`,
      word: word.word,
      definition: word.definition,
      isCorrect: true,
    };
  } else {
    // Use wrong definition from another word
    const wrongWord = allWords
      .filter((w) => w.id !== word.id)
      .sort(() => Math.random() - 0.5)[0];

    return {
      type: "true-false",
      id: `tf-${word.id}`,
      word: word.word,
      definition: wrongWord.definition,
      isCorrect: false,
      correctDefinition: word.definition,
    };
  }
}

/**
 * Generate a Multiple Choice question
 */
function generateMultipleChoiceQuestion(
  word: VocabWord,
  allWords: VocabWord[]
): MultipleChoiceQuestion {
  const wrongAnswers = allWords
    .filter((w) => w.id !== word.id)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3)
    .map((w) => w.definition);

  const options = [word.definition, ...wrongAnswers].sort(
    () => Math.random() - 0.5
  );

  return {
    type: "multiple-choice",
    id: `mc-${word.id}`,
    word: word.word,
    options,
    correctAnswer: word.definition,
  };
}

/**
 * Generate a Write question
 */
function generateWriteQuestion(word: VocabWord): WriteQuestion {
  return {
    type: "write",
    id: `write-${word.id}`,
    definition: word.definition,
    correctAnswer: word.word,
  };
}

/**
 * Generate a Matching question
 */
function generateMatchingQuestion(words: VocabWord[]): MatchingQuestion {
  return {
    type: "matching",
    id: `match-${words.map((w) => w.id).join("-")}`,
    pairs: words.map((w) => ({
      wordId: w.id,
      word: w.word,
      definition: w.definition,
    })),
  };
}
