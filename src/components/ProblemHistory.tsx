import React from 'react';
import { History, PlayCircle, Target } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SUBJECTS, DIFFICULTIES } from '../data/constants';

export function ProblemHistory() {
  const { state, dispatch } = useApp();

  const handleSelectProblem = (problem: any) => {
    dispatch({ type: 'SET_CURRENT_PROBLEM', payload: problem });
  };

  if (state.generatedProblems.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <History className="w-5 h-5 text-gray-400" />
          <h2 className="text-lg font-semibold text-gray-900">생성된 문제</h2>
        </div>
        <div className="text-center py-8">
          <Target className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500">아직 생성된 문제가 없습니다.</p>
          <p className="text-sm text-gray-400 mt-1">위에서 문제를 생성해보세요!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center space-x-2 mb-6">
        <History className="w-5 h-5 text-blue-600" />
        <h2 className="text-lg font-semibold text-gray-900">생성된 문제</h2>
        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
          {state.generatedProblems.length}개
        </span>
      </div>

      <div className="space-y-4 max-h-80 overflow-y-auto">
        {state.generatedProblems.map((problem, index) => {
          const subject = SUBJECTS.find(s => s.id === problem.subject);
          const difficulty = DIFFICULTIES.find(d => d.id === problem.difficulty);
          
          return (
            <div
              key={problem.id}
              className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:bg-blue-50/50 transition-colors cursor-pointer"
              onClick={() => handleSelectProblem(problem)}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-600">
                    문제 {index + 1}
                  </span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                    {subject?.name}
                  </span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    problem.difficulty === 'basic' 
                      ? 'bg-green-100 text-green-800'
                      : problem.difficulty === 'intermediate'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {difficulty?.name}
                  </span>
                </div>
                <PlayCircle className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-sm text-gray-800 line-clamp-2">
                {problem.question}
              </p>
              {problem.keywords.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {problem.keywords.slice(0, 3).map((keyword, keyIndex) => (
                    <span
                      key={keyIndex}
                      className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md"
                    >
                      {keyword}
                    </span>
                  ))}
                  {problem.keywords.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md">
                      +{problem.keywords.length - 3}
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}