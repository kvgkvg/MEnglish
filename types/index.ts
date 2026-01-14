export interface VocabSet {
  id: string;
  user_id: string;
  folder_id: string | null;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface VocabWord {
  id: string;
  set_id: string;
  word: string;
  definition: string;
  example_sentence: string | null;
  created_at: string;
}

export interface LearningProgress {
  id: string;
  user_id: string;
  word_id: string;
  memory_score: number;
  next_review_date: string;
  last_reviewed: string | null;
  review_count: number;
  correct_count: number;
  incorrect_count: number;
}

export interface LearningSession {
  id: string;
  user_id: string;
  set_id: string;
  session_type: "flashcard" | "multiple_choice" | "write" | "matching" | "test";
  score: number | null;
  completed_at: string;
}

export interface UserStats {
  id: string;
  user_id: string;
  total_words_learned: number;
  current_streak: number;
  longest_streak: number;
  last_activity_date: string;
}

export interface Folder {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
  updated_at: string;
}
