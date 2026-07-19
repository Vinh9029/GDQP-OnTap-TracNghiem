export interface Question {
  id: number;
  question: string;
  options: string[];
  answer: number; // 0 for A, 1 for B, 2 for C, 3 for D
  explanation?: string;
}

export interface QuizState {
  currentQuestionIndex: number;
  selectedAnswers: { [questionId: number]: number };
  bookmarked: number[];
  isSubmitted: boolean;
  timeRemaining: number; // in seconds
  wrongAnswers: number[];
}

export interface UserStats {
  answeredQuestions: Record<string, boolean>; // key format: `${part}_${questionId}` -> true (correct) or false (incorrect)
  userAnswers: Record<string, number>; // key format: `${part}_${questionId}` -> optionIndex (0-3)
  incorrectQuestions: string[]; // array of `${part}_${questionId}`
  bookmarkedQuestions: string[]; // array of `${part}_${questionId}`
  streak: number;
  lastActiveDate: string; // today.toDateString()
}

export interface ExamResult {
  id: string;
  date: string;
  part: 1 | 2;
  score: number; // score calculated as correctAnswers * 0.25
  totalQuestions: number; // typically 40
  correctAnswers: number;
  timeSpentSeconds: number; // in seconds
  passed: boolean;
}

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  photoURL: string;
  xp: number;
  streak: number;
  avgExamScore: number;
  totalExams: number;
  createdAt: string;
}

export interface LeaderboardEntry {
  uid: string;
  name: string;
  photoURL: string;
  xp: number;
  streak: number;
  avgExamScore: number;
  totalExams: number;
  rank?: number;
  isCurrentUser?: boolean;
}

