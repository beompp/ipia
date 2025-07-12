import React, { useEffect, useState } from 'react';
import { 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle, 
  XCircle,
  BarChart3,
  Trophy,
  AlertTriangle 
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { GeminiService } from '../services/geminiService';

export function MockExam() {
  const { state, dispatch } = useApp();
  const [currentAnswer, setCurrentAnswer] = useState('');

  const mockExam = state.mockExam;
  const currentProblem = mockExam.problems[mockExam.currentProblemIndex];

  // Timer effect
  useEffect(() => {
    if (!mockExam.isActive || mockExam.isSubmitted) return;

    const timer = setInterval(() => {
      dispatch({ type: 'UPDATE_MOCK_TIME', payload: mockExam.timeRemaining - 1 });
      
      if (mockExam.timeRemaining <= 1) {
        handleSubmitExam();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [mockExam.isActive, mockExam.timeRemaining, mockExam.isSubmitted]);

  // Load saved answer when changing problems
  useEffect(() => {
    if (currentProblem) {
      setCurrentAnswer(mockExam.answers[currentProblem.id] || '');
    }
  }, [mockExam.currentProblemIndex, currentProblem]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerChange = (answer: string) => {
    setCurrentAnswer(answer);
    if (currentProblem) {
      dispatch({ 
        type: 'UPDATE_MOCK_EXAM_ANSWER', 
        payload: { problemId: currentProblem.id, answer } 
      });
    }
  };

  const handleNextProblem = () => {
    dispatch({ type: 'NEXT_MOCK_PROBLEM' });
  };

  const handlePrevProblem = () => {
    dispatch({ type: 'PREV_MOCK_PROBLEM' });
  };

  const handleSubmitExam = async () => {
    if (!state.geminiApiKey) return;

    try {
      const geminiService = new GeminiService(state.geminiApiKey);
      const results = [];
      
      for (const problem of mockExam.problems) {
        const userAnswer = mockExam.answers[problem.id] || '';
        if (userAnswer.trim()) {
          const result = await geminiService.gradeProblem(problem, userAnswer);
          results.push(result);
        } else {
          results.push({
            isCorrect: false,
            score: 0,
            feedback: '답안을 제출하지 않았습니다.',
            explanation: problem.explanation,
            userAnswer: '',
            correctAnswer: problem.answer
          });
        }
      }
      
      dispatch({ type: 'SUBMIT_MOCK_EXAM', payload: results });
    } catch (error) {
      alert('채점 중 오류가 발생했습니다.');
    }
  };

  const handleEndExam = () => {
    dispatch({ type: 'END_MOCK_EXAM' });
  };

  const getAnsweredCount = () => {
    return Object.keys(mockExam.answers).filter(key => mockExam.answers[key]?.trim()).length;
  };

  const getAverageScore = () => {
    if (!mockExam.results) return 0;
    const totalScore = mockExam.results.reduce((sum, result) => sum + result.score, 0);
    return Math.round(totalScore / mockExam.results.length);
  };

  const getCorrectCount = () => {
    if (!mockExam.results) return 0;
    return mockExam.results.filter(result => result.isCorrect).length;
  };

  if (!mockExam.isActive) return null;

  // Results view
  if (mockExam.isSubmitted && mockExam.results) {
    const averageScore = getAverageScore();
    const correctCount = getCorrectCount();
    const totalProblems = mockExam.problems.length;

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="text-center mb-8">
          <Trophy className="w-16 h-16 mx-auto mb-4 text-yellow-500" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">모의고사 결과</h2>
          <p className="text-gray-600">수고하셨습니다! 결과를 확인해보세요.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-blue-50 rounded-lg p-6 text-center">
            <BarChart3 className="w-8 h-8 mx-auto mb-2 text-blue-600" />
            <div className="text-2xl font-bold text-blue-900">{averageScore}점</div>
            <div className="text-sm text-blue-700">평균 점수</div>
          </div>
          <div className="bg-green-50 rounded-lg p-6 text-center">
            <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-600" />
            <div className="text-2xl font-bold text-green-900">{correctCount}/{totalProblems}</div>
            <div className="text-sm text-green-700">정답 문항</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-6 text-center">
            <Clock className="w-8 h-8 mx-auto mb-2 text-purple-600" />
            <div className="text-2xl font-bold text-purple-900">
              {Math.round((5400 - mockExam.timeRemaining) / 60)}분
            </div>
            <div className="text-sm text-purple-700">소요 시간</div>
          </div>
        </div>

        <div className="space-y-4 max-h-96 overflow-y-auto">
          {mockExam.results.map((result, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border-2 ${
                result.isCorrect 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-red-50 border-red-200'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-900">문제 {index + 1}</span>
                <div className="flex items-center space-x-2">
                  {result.isCorrect ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                  <span className={`px-2 py-1 text-sm font-medium rounded-full ${
                    result.isCorrect 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {result.score}점
                  </span>
                </div>
              </div>
              <p className={`text-sm ${
                result.isCorrect ? 'text-green-700' : 'text-red-700'
              }`}>
                {result.feedback}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={handleEndExam}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors"
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  if (!currentProblem) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-bold text-gray-900">모의고사 진행 중</h2>
          <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
            {mockExam.currentProblemIndex + 1} / {mockExam.problems.length}
          </span>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">답안 작성:</span>
            <span className="font-medium text-gray-900">
              {getAnsweredCount()} / {mockExam.problems.length}
            </span>
          </div>
          <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
            mockExam.timeRemaining < 600 ? 'bg-red-100' : 'bg-gray-100'
          }`}>
            <Clock className={`w-4 h-4 ${
              mockExam.timeRemaining < 600 ? 'text-red-600' : 'text-gray-600'
            }`} />
            <span className={`font-mono font-medium ${
              mockExam.timeRemaining < 600 ? 'text-red-800' : 'text-gray-800'
            }`}>
              {formatTime(mockExam.timeRemaining)}
            </span>
          </div>
        </div>
      </div>

      {mockExam.timeRemaining < 600 && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-800">시간이 얼마 남지 않았습니다!</p>
            <p className="text-sm text-red-700">
              남은 시간을 확인하고 답안 작성을 완료해주세요.
            </p>
          </div>
        </div>
      )}

      <div className="mb-6">
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <h3 className="font-medium text-gray-900 mb-2">문제 {mockExam.currentProblemIndex + 1}</h3>
          <p className="text-gray-800 whitespace-pre-line leading-relaxed">
            {currentProblem.question}
          </p>
        </div>

        <div>
          <label htmlFor="mockAnswer" className="block text-sm font-medium text-gray-700 mb-2">
            답안 작성
          </label>
          <textarea
            id="mockAnswer"
            value={currentAnswer}
            onChange={(e) => handleAnswerChange(e.target.value)}
            placeholder="답안을 작성하세요..."
            rows={currentProblem.type === 'essay' ? 6 : 3}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <button
          onClick={handlePrevProblem}
          disabled={mockExam.currentProblemIndex === 0}
          className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>이전 문제</span>
        </button>

        <div className="flex items-center space-x-3">
          {mockExam.currentProblemIndex === mockExam.problems.length - 1 ? (
            <button
              onClick={handleSubmitExam}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              시험 제출
            </button>
          ) : (
            <button
              onClick={handleNextProblem}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <span>다음 문제</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}