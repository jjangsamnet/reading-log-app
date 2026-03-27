import { GemLevel } from '../types';

// 보석 등급 시스템 (10단계) - 독서록 편수 기준
export const GEM_LEVELS: GemLevel[] = [
  {
    level: 1,
    name: 'Rough Stone',
    nameKo: '원석',
    emoji: '◉',
    color: '#78716C',
    bgColor: '#F5F5F4',
    minLogs: 1,
    description: '독서의 첫 걸음을 내딛었어요!',
  },
  {
    level: 2,
    name: 'Amber',
    nameKo: '호박',
    emoji: '●',
    color: '#D97706',
    bgColor: '#FFFBEB',
    minLogs: 3,
    description: '꾸준히 읽고 있어요!',
  },
  {
    level: 3,
    name: 'Topaz',
    nameKo: '토파즈',
    emoji: '⭐',
    color: '#CA8A04',
    bgColor: '#FEF9C3',
    minLogs: 5,
    description: '독서 습관이 생기고 있어요!',
  },
  {
    level: 4,
    name: 'Peridot',
    nameKo: '페리도트',
    emoji: '♦',
    color: '#16A34A',
    bgColor: '#DCFCE7',
    minLogs: 8,
    description: '책과 친구가 되었어요!',
  },
  {
    level: 5,
    name: 'Aquamarine',
    nameKo: '아쿠아마린',
    emoji: '◆',
    color: '#0891B2',
    bgColor: '#CFFAFE',
    minLogs: 12,
    description: '멋진 독서가로 성장 중!',
  },
  {
    level: 6,
    name: 'Sapphire',
    nameKo: '사파이어',
    emoji: '❖',
    color: '#2563EB',
    bgColor: '#DBEAFE',
    minLogs: 16,
    description: '독서의 즐거움을 알아가요!',
  },
  {
    level: 7,
    name: 'Amethyst',
    nameKo: '자수정',
    emoji: '✦',
    color: '#7C3AED',
    bgColor: '#EDE9FE',
    minLogs: 20,
    description: '깊이 있는 독서를 하고 있어요!',
  },
  {
    level: 8,
    name: 'Ruby',
    nameKo: '루비',
    emoji: '❤',
    color: '#DC2626',
    bgColor: '#FEE2E2',
    minLogs: 25,
    description: '독서에 대한 열정이 빛나요!',
  },
  {
    level: 9,
    name: 'Emerald',
    nameKo: '에메랄드',
    emoji: '♥',
    color: '#059669',
    bgColor: '#D1FAE5',
    minLogs: 30,
    description: '진정한 독서왕에 가까워지고 있어요!',
  },
  {
    level: 10,
    name: 'Diamond',
    nameKo: '다이아몬드',
    emoji: '✨',
    color: '#6366F1',
    bgColor: '#E0E7FF',
    minLogs: 40,
    description: '최고의 독서왕! 다이아몬드 등급 달성!',
  },
];

export function getGemLevel(logCount: number): GemLevel {
  // 편수가 0이면 레벨 0 (등급 없음)
  if (logCount === 0) {
    return {
      level: 0,
      name: 'None',
      nameKo: '등급 없음',
      emoji: '☆',
      color: '#9CA3AF',
      bgColor: '#F3F4F6',
      minLogs: 0,
      description: '첫 번째 독서록을 작성해보세요!',
    };
  }

  // 가장 높은 해당 등급을 찾음
  let currentLevel = GEM_LEVELS[0];
  for (const level of GEM_LEVELS) {
    if (logCount >= level.minLogs) {
      currentLevel = level;
    } else {
      break;
    }
  }
  return currentLevel;
}

export function getNextGemLevel(logCount: number): GemLevel | null {
  for (const level of GEM_LEVELS) {
    if (logCount < level.minLogs) {
      return level;
    }
  }
  return null; // 최고 등급 달성
}

export function getProgressToNextLevel(logCount: number): number {
  const current = getGemLevel(logCount);
  const next = getNextGemLevel(logCount);
  if (!next) return 100;
  const range = next.minLogs - current.minLogs;
  const progress = logCount - current.minLogs;
  return Math.round((progress / range) * 100);
}
