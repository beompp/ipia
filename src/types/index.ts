export interface Problem {
  id: string;
  subject: string;
  difficulty: 'basic' | 'intermediate' | 'advanced';
  question: string;
  answer: string;
  explanation: string;
  type: 'short' | 'essay';
  keywords: string[];
}

export interface GradingResult {
  isCorrect: boolean;
  score: number;
  feedback: string;
  explanation: string;
  userAnswer: string;
  correctAnswer: string;
}

export interface MockExamState {
  isActive: boolean;
  problems: Problem[];
  currentProblemIndex: number;
  answers: { [key: string]: string };
  timeRemaining: number;
  startTime: number;
  isSubmitted: boolean;
  results?: GradingResult[];
}

export interface AppState {
  geminiApiKey: string;
  selectedSubject: string;
  selectedDifficulty: string;
  currentProblem: Problem | null;
  isGenerating: boolean;
  isGrading: boolean;
  gradingResult: GradingResult | null;
  mockExam: MockExamState;
  generatedProblems: Problem[];
}

export type Subject = {
  id: string;
  name: string;
  description: string;
};

export type Difficulty = {
  id: string;
  name: string;
  description: string;
};