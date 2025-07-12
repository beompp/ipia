import React from 'react';
import { AppProvider } from './context/AppContext';
import { Header } from './components/Header';
import { SubjectSelector } from './components/SubjectSelector';
import { ProblemGenerator } from './components/ProblemGenerator';
import { ProblemSolver } from './components/ProblemSolver';
import { ProblemHistory } from './components/ProblemHistory';
import { MockExam } from './components/MockExam';
import { useApp } from './context/AppContext';

function AppContent() {
  const { state } = useApp();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {state.mockExam.isActive ? (
          <MockExam />
        ) : (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <SubjectSelector />
                <ProblemGenerator />
                {state.currentProblem && <ProblemSolver />}
              </div>
              
              <div className="lg:col-span-1">
                <ProblemHistory />
              </div>
            </div>
          </div>
        )}
      </main>
      
      <footer className="bg-white border-t border-gray-200 py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-600 text-sm">
              정보처리 산업기사 실기시험 대비 AI 문제은행 시스템
            </p>
            <p className="text-gray-500 text-xs mt-2">
              Powered by Gemini AI • 실제 시험과 차이가 있을 수 있습니다
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;