import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { AppState, Problem, GradingResult, MockExamState } from '../types';

type Action =
  | { type: 'SET_API_KEY'; payload: string }
  | { type: 'SET_SUBJECT'; payload: string }
  | { type: 'SET_DIFFICULTY'; payload: string }
  | { type: 'SET_GENERATING'; payload: boolean }
  | { type: 'SET_GRADING'; payload: boolean }
  | { type: 'SET_CURRENT_PROBLEM'; payload: Problem | null }
  | { type: 'SET_GRADING_RESULT'; payload: GradingResult | null }
  | { type: 'ADD_GENERATED_PROBLEM'; payload: Problem }
  | { type: 'START_MOCK_EXAM'; payload: Problem[] }
  | { type: 'UPDATE_MOCK_EXAM_ANSWER'; payload: { problemId: string; answer: string } }
  | { type: 'NEXT_MOCK_PROBLEM' }
  | { type: 'PREV_MOCK_PROBLEM' }
  | { type: 'UPDATE_MOCK_TIME'; payload: number }
  | { type: 'SUBMIT_MOCK_EXAM'; payload: GradingResult[] }
  | { type: 'END_MOCK_EXAM' }
  | { type: 'RESET_MOCK_EXAM' };

const initialState: AppState = {
  geminiApiKey: '',
  selectedSubject: '',
  selectedDifficulty: '',
  currentProblem: null,
  isGenerating: false,
  isGrading: false,
  gradingResult: null,
  generatedProblems: [],
  mockExam: {
    isActive: false,
    problems: [],
    currentProblemIndex: 0,
    answers: {},
    timeRemaining: 5400, // 90 minutes in seconds
    startTime: 0,
    isSubmitted: false,
  },
};

function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_API_KEY':
      return { ...state, geminiApiKey: action.payload };
    case 'SET_SUBJECT':
      return { ...state, selectedSubject: action.payload };
    case 'SET_DIFFICULTY':
      return { ...state, selectedDifficulty: action.payload };
    case 'SET_GENERATING':
      return { ...state, isGenerating: action.payload };
    case 'SET_GRADING':
      return { ...state, isGrading: action.payload };
    case 'SET_CURRENT_PROBLEM':
      return { ...state, currentProblem: action.payload, gradingResult: null };
    case 'SET_GRADING_RESULT':
      return { ...state, gradingResult: action.payload };
    case 'ADD_GENERATED_PROBLEM':
      return { 
        ...state, 
        generatedProblems: [...state.generatedProblems, action.payload] 
      };
    case 'START_MOCK_EXAM':
      return {
        ...state,
        mockExam: {
          ...state.mockExam,
          isActive: true,
          problems: action.payload,
          currentProblemIndex: 0,
          answers: {},
          timeRemaining: 5400,
          startTime: Date.now(),
          isSubmitted: false,
          results: undefined,
        },
      };
    case 'UPDATE_MOCK_EXAM_ANSWER':
      return {
        ...state,
        mockExam: {
          ...state.mockExam,
          answers: {
            ...state.mockExam.answers,
            [action.payload.problemId]: action.payload.answer,
          },
        },
      };
    case 'NEXT_MOCK_PROBLEM':
      return {
        ...state,
        mockExam: {
          ...state.mockExam,
          currentProblemIndex: Math.min(
            state.mockExam.currentProblemIndex + 1,
            state.mockExam.problems.length - 1
          ),
        },
      };
    case 'PREV_MOCK_PROBLEM':
      return {
        ...state,
        mockExam: {
          ...state.mockExam,
          currentProblemIndex: Math.max(state.mockExam.currentProblemIndex - 1, 0),
        },
      };
    case 'UPDATE_MOCK_TIME':
      return {
        ...state,
        mockExam: {
          ...state.mockExam,
          timeRemaining: action.payload,
        },
      };
    case 'SUBMIT_MOCK_EXAM':
      return {
        ...state,
        mockExam: {
          ...state.mockExam,
          isSubmitted: true,
          results: action.payload,
        },
      };
    case 'END_MOCK_EXAM':
      return {
        ...state,
        mockExam: {
          ...initialState.mockExam,
        },
      };
    case 'RESET_MOCK_EXAM':
      return {
        ...state,
        mockExam: {
          ...initialState.mockExam,
        },
      };
    default:
      return state;
  }
}

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<Action>;
} | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}