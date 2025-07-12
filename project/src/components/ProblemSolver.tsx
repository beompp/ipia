import React, { useState } from 'react';
import { Send, CheckCircle, XCircle, BookOpen } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { GeminiService } from '../services/geminiService';

export function ProblemSolver() {
  const { state, dispatch } = useApp();
  const [userAnswer, setUserAnswer] = useState('');

  if (!state.currentProblem) return null;

  const handleSubmitAnswer = async () => {
    if (!userAnswer.trim() || !state.geminiApiKey || !state.currentProblem) return;

    dispatch({ type: 'SET_GRADING', payload: true });
    
    try {
      const geminiService = new GeminiService(state.geminiApiKey);
      const result = await geminiService.gradeProblem(state.currentProblem, userAnswer);
      
      dispatch({ type: 'SET_GRADING_RESULT', payload: result });
    } catch (error) {
      alert(error instanceof Error ? error.message : '채점 중 오류가 발생했습니다.');
    } finally {
      dispatch({ type: 'SET_GRADING', payload: false });
    }
  };

  const handleNextProblem = () => {
    setUserAnswer('');
    dispatch({ type: 'SET_CURRENT_PROBLEM', payload: null });
    dispatch({ type: 'SET_GRADING_RESULT', payload: null });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center space-x-2 mb-6">
        <BookOpen className="w-5 h-5 text-blue-600" />
        <h2 className="text-lg font-semibold text-gray-900">문제 풀이</h2>
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
          state.currentProblem.difficulty === 'basic' 
            ? 'bg-green-100 text-green-800'
            : state.currentProblem.difficulty === 'intermediate'
            ? 'bg-yellow-100 text-yellow-800'
            : 'bg-red-100 text-red-800'
        }`}>
          {state.currentProblem.difficulty === 'basic' ? '기초' : 
           state.currentProblem.difficulty === 'intermediate' ? '중급' : '고급'}
        </span>
      </div>

      <div className="mb-6">
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <h3 className="font-medium text-gray-900 mb-2">문제</h3>
          <p className="text-gray-800 whitespace-pre-line leading-relaxed">
            {state.currentProblem.question}
          </p>
        </div>

        {state.currentProblem.keywords.length > 0 && (
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700 mb-2">참고 키워드:</p>
            <div className="flex flex-wrap gap-2">
              {state.currentProblem.keywords.map((keyword, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-md"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {!state.gradingResult ? (
        <div className="space-y-4">
          <div>
            <label htmlFor="answer" className="block text-sm font-medium text-gray-700 mb-2">
              답안 작성
            </label>
            <textarea
              id="answer"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder={state.currentProblem.type === 'essay' 
                ? '상세한 답안을 작성하세요...' 
                : '간단한 답안을 작성하세요...'}
              rows={state.currentProblem.type === 'essay' ? 6 : 3}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          <button
            onClick={handleSubmitAnswer}
            disabled={!userAnswer.trim() || state.isGrading}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            {state.isGrading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>채점 중...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>정답 제출</span>
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className={`p-4 rounded-lg border-2 ${
            state.gradingResult.isCorrect 
              ? 'bg-green-50 border-green-200' 
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-center space-x-2 mb-3">
              {state.gradingResult.isCorrect ? (
                <CheckCircle className="w-6 h-6 text-green-600" />
              ) : (
                <XCircle className="w-6 h-6 text-red-600" />
              )}
              <h3 className={`font-semibold ${
                state.gradingResult.isCorrect ? 'text-green-800' : 'text-red-800'
              }`}>
                {state.gradingResult.isCorrect ? '정답입니다!' : '틀렸습니다.'}
              </h3>
              <span className={`px-2 py-1 text-sm font-medium rounded-full ${
                state.gradingResult.isCorrect 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {state.gradingResult.score}점
              </span>
            </div>
            <p className={`${
              state.gradingResult.isCorrect ? 'text-green-700' : 'text-red-700'
            }`}>
              {state.gradingResult.feedback}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">제출한 답안</h4>
              <p className="text-gray-800 whitespace-pre-line">
                {state.gradingResult.userAnswer}
              </p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">정답</h4>
              <p className="text-gray-800 whitespace-pre-line">
                {state.gradingResult.correctAnswer}
              </p>
            </div>
          </div>

          <div className="bg-indigo-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">해설</h4>
            <p className="text-gray-800 whitespace-pre-line leading-relaxed">
              {state.gradingResult.explanation}
            </p>
          </div>

          <button
            onClick={handleNextProblem}
            className="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            새 문제 풀기
          </button>
        </div>
      )}
    </div>
  );
}