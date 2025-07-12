import React from 'react';
import { ChevronDown } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SUBJECTS, DIFFICULTIES } from '../data/constants';

export function SubjectSelector() {
  const { state, dispatch } = useApp();

  const handleSubjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch({ type: 'SET_SUBJECT', payload: e.target.value });
  };

  const handleDifficultyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch({ type: 'SET_DIFFICULTY', payload: e.target.value });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        과목 및 난이도 선택
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
            과목 선택
          </label>
          <div className="relative">
            <select
              id="subject"
              value={state.selectedSubject}
              onChange={handleSubjectChange}
              className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-4 py-3 pr-10 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            >
              <option value="">과목을 선택하세요</option>
              {SUBJECTS.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>
          {state.selectedSubject && (
            <p className="mt-2 text-sm text-gray-600">
              {SUBJECTS.find(s => s.id === state.selectedSubject)?.description}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 mb-2">
            난이도 선택
          </label>
          <div className="relative">
            <select
              id="difficulty"
              value={state.selectedDifficulty}
              onChange={handleDifficultyChange}
              className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-4 py-3 pr-10 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            >
              <option value="">난이도를 선택하세요</option>
              {DIFFICULTIES.map((difficulty) => (
                <option key={difficulty.id} value={difficulty.id}>
                  {difficulty.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>
          {state.selectedDifficulty && (
            <p className="mt-2 text-sm text-gray-600">
              {DIFFICULTIES.find(d => d.id === state.selectedDifficulty)?.description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}