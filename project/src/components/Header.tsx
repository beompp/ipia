import React, { useState } from 'react';
import { Key, BookOpen, Clock } from 'lucide-react';
import { useApp } from '../context/AppContext';

export function Header() {
  const { state, dispatch } = useApp();
  const [isApiKeyVisible, setIsApiKeyVisible] = useState(false);

  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: 'SET_API_KEY', payload: e.target.value });
  };

  const toggleApiKeyVisibility = () => {
    setIsApiKeyVisible(!isApiKeyVisible);
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-lg">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                정보처리 산업기사 실기
              </h1>
              <p className="text-sm text-gray-500">AI 문제은행 시스템</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {state.mockExam.isActive && (
              <div className="flex items-center space-x-2 bg-orange-50 px-3 py-2 rounded-lg">
                <Clock className="w-4 h-4 text-orange-600" />
                <span className="text-sm font-medium text-orange-800">
                  모의고사 진행 중
                </span>
              </div>
            )}
            
            <div className="flex items-center space-x-2">
              <Key className="w-4 h-4 text-gray-400" />
              <div className="relative">
                <input
                  type={isApiKeyVisible ? 'text' : 'password'}
                  placeholder="Gemini API 키를 입력하세요"
                  value={state.geminiApiKey}
                  onChange={handleApiKeyChange}
                  className="w-64 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={toggleApiKeyVisibility}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {isApiKeyVisible ? '숨기기' : '보기'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}