import React from 'react';
import { Plus, Sparkles, Timer, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { GeminiService } from '../services/geminiService';
import { MOCK_EXAM_SETTINGS } from '../data/constants';

export function ProblemGenerator() {
  const { state, dispatch } = useApp();

  const canGenerate = state.geminiApiKey && state.selectedSubject && state.selectedDifficulty;

  const handleGenerateProblem = async () => {
    if (!canGenerate) return;

    dispatch({ type: 'SET_GENERATING', payload: true });
    
    try {
      const geminiService = new GeminiService(state.geminiApiKey);
      const problem = await geminiService.generateProblem(
        state.selectedSubject,
        state.selectedDifficulty
      );
      
      dispatch({ type: 'ADD_GENERATED_PROBLEM', payload: problem });
      dispatch({ type: 'SET_CURRENT_PROBLEM', payload: problem });
    } catch (error) {
      alert(error instanceof Error ? error.message : '문제 생성 중 오류가 발생했습니다.');
    } finally {
      dispatch({ type: 'SET_GENERATING', payload: false });
    }
  };

  const handleStartMockExam = async () => {
    if (!canGenerate) return;

    dispatch({ type: 'SET_GENERATING', payload: true });
    
    try {
      const geminiService = new GeminiService(state.geminiApiKey);
      const problems = [];
      
      for (let i = 0; i < MOCK_EXAM_SETTINGS.TOTAL_PROBLEMS; i++) {
        const problem = await geminiService.generateProblem(
          state.selectedSubject,
          state.selectedDifficulty
        );
        problems.push(problem);
      }
      
      dispatch({ type: 'START_MOCK_EXAM', payload: problems });
    } catch (error) {
      alert(error instanceof Error ? error.message : '모의고사 생성 중 오류가 발생했습니다.');
    } finally {
      dispatch({ type: 'SET_GENERATING', payload: false });
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        문제 생성
      </h2>
      
      {!state.geminiApiKey && (
        <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-800">API 키가 필요합니다</p>
            <p className="text-sm text-amber-700">
              상단에 Gemini API 키를 입력해야 문제 생성이 가능합니다.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={handleGenerateProblem}
          disabled={!canGenerate || state.isGenerating}
          className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 py-4 rounded-lg font-medium transition-colors"
        >
          {state.isGenerating ? (
            <>
              <Sparkles className="w-5 h-5 animate-spin" />
              <span>문제 생성 중...</span>
            </>
          ) : (
            <>
              <Plus className="w-5 h-5" />
              <span>문제 생성</span>
            </>
          )}
        </button>

        <button
          onClick={handleStartMockExam}
          disabled={!canGenerate || state.isGenerating}
          className="flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 py-4 rounded-lg font-medium transition-colors"
        >
          {state.isGenerating ? (
            <>
              <Sparkles className="w-5 h-5 animate-spin" />
              <span>모의고사 준비 중...</span>
            </>
          ) : (
            <>
              <Timer className="w-5 h-5" />
              <span>모의고사 시작</span>
            </>
          )}
        </button>
      </div>

      <div className="mt-4 text-sm text-gray-600">
        <p>• 단일 문제: 선택한 과목과 난이도에 맞는 문제 1개 생성</p>
        <p>• 모의고사: {MOCK_EXAM_SETTINGS.TOTAL_PROBLEMS}문항, {MOCK_EXAM_SETTINGS.TIME_LIMIT_MINUTES}분 제한</p>
      </div>
    </div>
  );
}