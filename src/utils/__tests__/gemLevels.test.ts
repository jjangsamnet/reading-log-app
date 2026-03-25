import { describe, it, expect } from 'vitest';
import { getGemLevel, getNextGemLevel, getProgressToNextLevel, GEM_LEVELS } from '../gemLevels';

describe('보석 등급 시스템', () => {
  describe('getGemLevel', () => {
    it('독서록 0편이면 등급 없음(레벨 0) 반환', () => {
      const level = getGemLevel(0);
      expect(level.level).toBe(0);
      expect(level.nameKo).toBe('등급 없음');
    });

    it('독서록 1편이면 원석(레벨 1) 반환', () => {
      const level = getGemLevel(1);
      expect(level.level).toBe(1);
      expect(level.nameKo).toBe('원석');
    });

    it('독서록 2편이면 여전히 원석(레벨 1)', () => {
      const level = getGemLevel(2);
      expect(level.level).toBe(1);
    });

    it('독서록 3편이면 호박(레벨 2)', () => {
      const level = getGemLevel(3);
      expect(level.level).toBe(2);
      expect(level.nameKo).toBe('호박');
    });

    it('독서록 5편이면 토파즈(레벨 3)', () => {
      const level = getGemLevel(5);
      expect(level.level).toBe(3);
      expect(level.nameKo).toBe('토파즈');
    });

    it('독서록 8편이면 페리도트(레벨 4)', () => {
      const level = getGemLevel(8);
      expect(level.level).toBe(4);
      expect(level.nameKo).toBe('페리도트');
    });

    it('독서록 12편이면 아쿠아마린(레벨 5)', () => {
      const level = getGemLevel(12);
      expect(level.level).toBe(5);
      expect(level.nameKo).toBe('아쿠아마린');
    });

    it('독서록 16편이면 사파이어(레벨 6)', () => {
      const level = getGemLevel(16);
      expect(level.level).toBe(6);
    });

    it('독서록 20편이면 자수정(레벨 7)', () => {
      const level = getGemLevel(20);
      expect(level.level).toBe(7);
    });

    it('독서록 25편이면 루비(레벨 8)', () => {
      const level = getGemLevel(25);
      expect(level.level).toBe(8);
    });

    it('독서록 30편이면 에메랄드(레벨 9)', () => {
      const level = getGemLevel(30);
      expect(level.level).toBe(9);
    });

    it('독서록 40편이면 다이아몬드(레벨 10)', () => {
      const level = getGemLevel(40);
      expect(level.level).toBe(10);
      expect(level.nameKo).toBe('다이아몬드');
    });

    it('독서록 100편이면 여전히 다이아몬드(레벨 10)', () => {
      const level = getGemLevel(100);
      expect(level.level).toBe(10);
    });

    it('경계값 테스트: 각 등급의 최소 편수에서 정확히 해당 등급 반환', () => {
      GEM_LEVELS.forEach((gem) => {
        const level = getGemLevel(gem.minLogs);
        expect(level.level).toBe(gem.level);
      });
    });

    it('경계값 테스트: 각 등급의 최소 편수 -1에서 이전 등급 반환', () => {
      for (let i = 1; i < GEM_LEVELS.length; i++) {
        const level = getGemLevel(GEM_LEVELS[i].minLogs - 1);
        expect(level.level).toBe(GEM_LEVELS[i - 1].level);
      }
    });
  });

  describe('getNextGemLevel', () => {
    it('0편이면 다음 등급은 원석(레벨 1)', () => {
      const next = getNextGemLevel(0);
      expect(next).not.toBeNull();
      expect(next!.level).toBe(1);
    });

    it('1편이면 다음 등급은 호박(레벨 2)', () => {
      const next = getNextGemLevel(1);
      expect(next!.level).toBe(2);
    });

    it('40편 이상이면 다음 등급 없음(null)', () => {
      const next = getNextGemLevel(40);
      expect(next).toBeNull();
    });

    it('100편이면 다음 등급 없음(null)', () => {
      const next = getNextGemLevel(100);
      expect(next).toBeNull();
    });
  });

  describe('getProgressToNextLevel', () => {
    it('0편이면 진행률 0%', () => {
      const progress = getProgressToNextLevel(0);
      expect(progress).toBe(0);
    });

    it('최고 등급(40편)이면 진행률 100%', () => {
      const progress = getProgressToNextLevel(40);
      expect(progress).toBe(100);
    });

    it('원석(1편)에서 호박(3편) 사이인 2편이면 50%', () => {
      const progress = getProgressToNextLevel(2);
      expect(progress).toBe(50);
    });

    it('진행률이 0~100 범위 내', () => {
      for (let i = 0; i <= 50; i++) {
        const progress = getProgressToNextLevel(i);
        expect(progress).toBeGreaterThanOrEqual(0);
        expect(progress).toBeLessThanOrEqual(100);
      }
    });
  });

  describe('GEM_LEVELS 데이터 무결성', () => {
    it('정확히 10개의 등급이 있어야 함', () => {
      expect(GEM_LEVELS).toHaveLength(10);
    });

    it('레벨이 1부터 10까지 순서대로', () => {
      GEM_LEVELS.forEach((gem, idx) => {
        expect(gem.level).toBe(idx + 1);
      });
    });

    it('minLogs가 오름차순', () => {
      for (let i = 1; i < GEM_LEVELS.length; i++) {
        expect(GEM_LEVELS[i].minLogs).toBeGreaterThan(GEM_LEVELS[i - 1].minLogs);
      }
    });

    it('모든 등급에 필수 필드가 있어야 함', () => {
      GEM_LEVELS.forEach((gem) => {
        expect(gem.name).toBeTruthy();
        expect(gem.nameKo).toBeTruthy();
        expect(gem.emoji).toBeTruthy();
        expect(gem.color).toBeTruthy();
        expect(gem.bgColor).toBeTruthy();
        expect(gem.description).toBeTruthy();
      });
    });
  });
});
