import { Problem, GradingResult } from '../types';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';

export class GeminiService {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateProblem(subject: string, difficulty: string): Promise<Problem> {
    const prompt = this.createProblemGenerationPrompt(subject, difficulty);
    
    try {
      console.log('API 호출 시작:', { subject, difficulty });
      
      const response = await fetch(`${GEMINI_API_URL}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
            responseMimeType: "application/json"
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
          ]
        })
      });

      console.log('API 응답 상태:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API 오류 응답:', errorText);
        
        if (response.status === 403) {
          throw new Error('API 키가 유효하지 않거나 권한이 없습니다. API 키를 확인해주세요.');
        } else if (response.status === 429) {
          throw new Error('API 호출 한도를 초과했습니다. 잠시 후 다시 시도해주세요.');
        } else if (response.status === 503) {
          throw new Error('Gemini 서비스가 일시적으로 사용할 수 없습니다. 잠시 후 다시 시도해주세요.');
        } else {
          throw new Error(`API 호출 실패: ${response.status} - ${response.statusText}`);
        }
      }

      const data = await response.json();
      console.log('API 응답 데이터:', data);
      
      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
        console.error('잘못된 API 응답 구조:', data);
        throw new Error('API 응답 형식이 올바르지 않습니다.');
      }
      
      const generatedText = data.candidates[0].content.parts[0].text;
      console.log('생성된 텍스트:', generatedText);
      
      return this.parseProblemResponse(generatedText, subject, difficulty);
    } catch (error) {
      console.error('문제 생성 오류:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('문제 생성 중 알 수 없는 오류가 발생했습니다.');
    }
  }

  async gradeProblem(problem: Problem, userAnswer: string): Promise<GradingResult> {
    const prompt = this.createGradingPrompt(problem, userAnswer);
    
    try {
      console.log('채점 API 호출 시작');
      
      const response = await fetch(`${GEMINI_API_URL}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.3,
            topK: 20,
            topP: 0.8,
            maxOutputTokens: 1024,
            responseMimeType: "application/json"
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
          ]
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('채점 API 오류 응답:', errorText);
        
        if (response.status === 403) {
          throw new Error('API 키가 유효하지 않거나 권한이 없습니다.');
        } else if (response.status === 429) {
          throw new Error('API 호출 한도를 초과했습니다. 잠시 후 다시 시도해주세요.');
        } else if (response.status === 503) {
          throw new Error('Gemini 서비스가 일시적으로 사용할 수 없습니다. 잠시 후 다시 시도해주세요.');
        } else {
          throw new Error(`채점 API 호출 실패: ${response.status} - ${response.statusText}`);
        }
      }

      const data = await response.json();
      console.log('채점 API 응답:', data);
      
      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
        throw new Error('채점 API 응답 형식이 올바르지 않습니다.');
      }
      
      const gradingText = data.candidates[0].content.parts[0].text;
      
      return this.parseGradingResponse(gradingText, problem, userAnswer);
    } catch (error) {
      console.error('채점 오류:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('채점 중 알 수 없는 오류가 발생했습니다.');
    }
  }

  private createProblemGenerationPrompt(subject: string, difficulty: string): string {
    const difficultyMap = {
      basic: '기초',
      intermediate: '중급',
      advanced: '고급'
    };

    const subjectMap: { [key: string]: string } = {
      database: '데이터베이스',
      system: '시스템',
      software: '소프트웨어공학',
      network: '네트워크',
      security: '정보보안'
    };

    return `
정보처리 산업기사 실기시험 출제위원으로서 ${subjectMap[subject] || subject} 과목의 ${difficultyMap[difficulty as keyof typeof difficultyMap]} 난이도 문제를 1개 생성해주세요.

출제 기준:
- 실무 중심의 실기 문제
- ${difficulty === 'basic' ? '기본 개념 이해 확인' : difficulty === 'intermediate' ? '응용 능력 평가' : '고급 문제 해결 능력 평가'}
- 단답형 또는 서술형
- 명확한 정답과 해설 포함

다음 JSON 형식으로만 응답해주세요:

{
  "question": "문제 내용을 여기에 작성",
  "answer": "정답을 여기에 작성",
  "explanation": "상세한 해설을 여기에 작성",
  "type": "short 또는 essay 중 하나",
  "keywords": ["관련 키워드1", "관련 키워드2", "관련 키워드3"]
}
`;
  }

  private createGradingPrompt(problem: Problem, userAnswer: string): string {
    return `
정보처리 산업기사 실기시험의 채점관으로서 다음 문제와 수험생의 답안을 채점하고 피드백을 제공해주세요.

문제: ${problem.question}
정답: ${problem.answer}
수험생 답안: ${userAnswer}

채점 기준:
- 핵심 키워드가 포함되어 있는지 확인
- 유사한 표현도 정답으로 인정
- 부분 점수 고려 (0-100점)
- 건설적인 피드백 제공

다음 JSON 형식으로만 응답해주세요:

{
  "isCorrect": true 또는 false,
  "score": 0부터 100까지의 점수,
  "feedback": "채점 결과에 대한 설명",
  "explanation": "수험생을 위한 상세한 해설"
}
`;
  }

  private parseProblemResponse(response: string, subject: string, difficulty: string): Problem {
    try {
      console.log('파싱할 응답:', response);
      
      // JSON 파싱 시도
      let parsed;
      try {
        parsed = JSON.parse(response);
      } catch (jsonError) {
        // JSON 블록 추출 시도
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsed = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('유효한 JSON을 찾을 수 없습니다.');
        }
      }
      
      // 필수 필드 검증
      if (!parsed.question || !parsed.answer || !parsed.explanation) {
        console.error('누락된 필드:', parsed);
        throw new Error('필수 필드가 누락되었습니다.');
      }
      
      return {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        subject,
        difficulty: difficulty as 'basic' | 'intermediate' | 'advanced',
        question: parsed.question,
        answer: parsed.answer,
        explanation: parsed.explanation,
        type: parsed.type === 'essay' ? 'essay' : 'short',
        keywords: Array.isArray(parsed.keywords) ? parsed.keywords : []
      };
    } catch (error) {
      console.error('응답 파싱 오류:', error);
      console.error('원본 응답:', response);
      throw new Error('AI 응답을 파싱하는 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
  }

  private parseGradingResponse(response: string, problem: Problem, userAnswer: string): GradingResult {
    try {
      console.log('채점 결과 파싱:', response);
      
      // JSON 파싱 시도
      let parsed;
      try {
        parsed = JSON.parse(response);
      } catch (jsonError) {
        // JSON 블록 추출 시도
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsed = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('유효한 JSON을 찾을 수 없습니다.');
        }
      }
      
      return {
        isCorrect: Boolean(parsed.isCorrect),
        score: Number(parsed.score) || 0,
        feedback: parsed.feedback || '채점 결과를 확인할 수 없습니다.',
        explanation: parsed.explanation || problem.explanation,
        userAnswer,
        correctAnswer: problem.answer
      };
    } catch (error) {
      console.error('채점 결과 파싱 오류:', error);
      console.error('원본 응답:', response);
      throw new Error('채점 결과를 파싱하는 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
  }
}