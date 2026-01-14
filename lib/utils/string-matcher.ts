/**
 * String matching utilities for validating user answers with typo tolerance
 */

/**
 * Calculate Levenshtein distance between two strings
 * (number of single-character edits required to change one word into another)
 */
function levenshteinDistance(str1: string, str2: string): number {
  const len1 = str1.length;
  const len2 = str2.length;
  const matrix: number[][] = [];

  // Initialize matrix
  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }

  // Fill matrix
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1, // insertion
          matrix[i - 1][j] + 1 // deletion
        );
      }
    }
  }

  return matrix[len1][len2];
}

/**
 * Calculate similarity percentage between two strings
 */
function calculateSimilarity(str1: string, str2: string): number {
  const maxLength = Math.max(str1.length, str2.length);
  if (maxLength === 0) return 100;

  const distance = levenshteinDistance(str1, str2);
  return ((maxLength - distance) / maxLength) * 100;
}

/**
 * Normalize string for comparison (lowercase, trim, remove extra spaces)
 */
function normalizeString(str: string): string {
  return str.toLowerCase().trim().replace(/\s+/g, " ");
}

/**
 * Match answer with fuzzy matching
 * Returns { isCorrect, similarity, feedback }
 */
export interface MatchResult {
  isCorrect: boolean;
  similarity: number;
  feedback: "exact" | "close" | "wrong";
  message: string;
}

export function matchAnswer(
  userAnswer: string,
  correctAnswer: string
): MatchResult {
  const normalizedUser = normalizeString(userAnswer);
  const normalizedCorrect = normalizeString(correctAnswer);

  // Exact match
  if (normalizedUser === normalizedCorrect) {
    return {
      isCorrect: true,
      similarity: 100,
      feedback: "exact",
      message: "Perfect! That's exactly right.",
    };
  }

  // Calculate similarity
  const similarity = calculateSimilarity(normalizedUser, normalizedCorrect);

  // Very close match (minor typo) - allow 85%+ similarity
  if (similarity >= 85) {
    return {
      isCorrect: true,
      similarity,
      feedback: "close",
      message: `Close enough! You had a minor typo. The correct spelling is "${correctAnswer}".`,
    };
  }

  // Wrong answer
  return {
    isCorrect: false,
    similarity,
    feedback: "wrong",
    message: `Not quite. The correct answer is "${correctAnswer}".`,
  };
}

/**
 * Check if answer has acceptable typos for autocorrect hint
 * (useful for showing "Did you mean...?" suggestions)
 */
export function hasAcceptableTypos(
  userAnswer: string,
  correctAnswer: string
): boolean {
  const normalizedUser = normalizeString(userAnswer);
  const normalizedCorrect = normalizeString(correctAnswer);

  if (normalizedUser === normalizedCorrect) return false;

  const similarity = calculateSimilarity(normalizedUser, normalizedCorrect);
  return similarity >= 70 && similarity < 85;
}
