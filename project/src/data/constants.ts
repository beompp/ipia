import { Subject, Difficulty } from '../types';

export const SUBJECTS: Subject[] = [
  {
    id: 'database',
    name: '데이터베이스',
    description: 'SQL, 정규화, 트랜잭션, 인덱스 등'
  },
  {
    id: 'system',
    name: '시스템',
    description: '운영체제, 프로세스, 메모리 관리 등'
  },
  {
    id: 'software',
    name: '소프트웨어공학',
    description: '개발방법론, 설계, 테스트 등'
  },
  {
    id: 'network',
    name: '네트워크',
    description: 'TCP/IP, 라우팅, 프로토콜 등'
  },
  {
    id: 'security',
    name: '정보보안',
    description: '암호화, 인증, 보안 정책 등'
  }
];

export const DIFFICULTIES: Difficulty[] = [
  {
    id: 'basic',
    name: '기초',
    description: '기본 개념과 용어 이해'
  },
  {
    id: 'intermediate',
    name: '중급',
    description: '응용 및 실무 문제 해결'
  },
  {
    id: 'advanced',
    name: '고급',
    description: '복합적 사고와 심화 문제'
  }
];

export const MOCK_EXAM_SETTINGS = {
  TOTAL_PROBLEMS: 25,
  TIME_LIMIT_MINUTES: 90,
  TIME_LIMIT_SECONDS: 90 * 60, // 5400 seconds
};