import { describe, it, expect } from 'vitest';
import {
  generateInviteCode,
  getGridLayout,
  parseGridLayout,
  findNextEmptySeat,
  formatDate,
  timeAgo,
} from '../helpers';

describe('초대 코드 생성', () => {
  it('6자리 코드를 생성', () => {
    const code = generateInviteCode();
    expect(code).toHaveLength(6);
  });

  it('혼동되는 문자(0, O, 1, I)가 없어야 함', () => {
    for (let i = 0; i < 100; i++) {
      const code = generateInviteCode();
      expect(code).not.toMatch(/[0OoIil1]/);
    }
  });

  it('매번 다른 코드를 생성 (확률적)', () => {
    const codes = new Set<string>();
    for (let i = 0; i < 100; i++) {
      codes.add(generateInviteCode());
    }
    expect(codes.size).toBeGreaterThan(90);
  });

  it('대문자와 숫자로만 구성', () => {
    for (let i = 0; i < 50; i++) {
      const code = generateInviteCode();
      expect(code).toMatch(/^[A-Z2-9]+$/);
    }
  });
});

describe('그리드 레이아웃', () => {
  describe('getGridLayout', () => {
    it('25명 이하면 5x5', () => {
      expect(getGridLayout(1)).toBe('5x5');
      expect(getGridLayout(25)).toBe('5x5');
    });

    it('26~30명이면 5x6', () => {
      expect(getGridLayout(26)).toBe('5x6');
      expect(getGridLayout(30)).toBe('5x6');
    });

    it('31명 이상이면 5x7', () => {
      expect(getGridLayout(31)).toBe('5x7');
      expect(getGridLayout(35)).toBe('5x7');
    });

    it('0명이면 5x5', () => {
      expect(getGridLayout(0)).toBe('5x5');
    });
  });

  describe('parseGridLayout', () => {
    it('5x5를 파싱하면 cols=5, rows=5', () => {
      expect(parseGridLayout('5x5')).toEqual({ cols: 5, rows: 5 });
    });

    it('5x6을 파싱하면 cols=5, rows=6', () => {
      expect(parseGridLayout('5x6')).toEqual({ cols: 5, rows: 6 });
    });

    it('5x7을 파싱하면 cols=5, rows=7', () => {
      expect(parseGridLayout('5x7')).toEqual({ cols: 5, rows: 7 });
    });
  });

  describe('findNextEmptySeat', () => {
    it('빈 교실에서 첫 번째 좌석(0,0) 반환', () => {
      const seat = findNextEmptySeat([], '5x5');
      expect(seat).toEqual({ row: 0, col: 0 });
    });

    it('첫 번째 좌석이 차있으면 (0,1) 반환', () => {
      const students = [{ seat: { row: 0, col: 0 } }];
      const seat = findNextEmptySeat(students, '5x5');
      expect(seat).toEqual({ row: 0, col: 1 });
    });

    it('첫 번째 행이 가득 차면 다음 행 시작', () => {
      const students = Array.from({ length: 5 }, (_, i) => ({
        seat: { row: 0, col: i },
      }));
      const seat = findNextEmptySeat(students, '5x5');
      expect(seat).toEqual({ row: 1, col: 0 });
    });

    it('모든 좌석이 차면 null 반환', () => {
      const students: { seat: { row: number; col: number } }[] = [];
      for (let r = 0; r < 5; r++) {
        for (let c = 0; c < 5; c++) {
          students.push({ seat: { row: r, col: c } });
        }
      }
      const seat = findNextEmptySeat(students, '5x5');
      expect(seat).toBeNull();
    });

    it('중간에 빈 좌석을 찾아야 함', () => {
      const students = [
        { seat: { row: 0, col: 0 } },
        { seat: { row: 0, col: 2 } },
      ];
      const seat = findNextEmptySeat(students, '5x5');
      expect(seat).toEqual({ row: 0, col: 1 });
    });
  });
});

describe('날짜 유틸', () => {
  describe('formatDate', () => {
    it('타임스탬프를 YYYY.MM.DD 형식으로 변환', () => {
      const date = new Date(2025, 2, 15).getTime(); // 2025-03-15
      expect(formatDate(date)).toBe('2025.03.15');
    });

    it('한 자리 월/일에 0 패딩', () => {
      const date = new Date(2025, 0, 5).getTime(); // 2025-01-05
      expect(formatDate(date)).toBe('2025.01.05');
    });
  });

  describe('timeAgo', () => {
    it('1분 미만이면 "방금 전"', () => {
      expect(timeAgo(Date.now() - 30000)).toBe('방금 전');
    });

    it('5분 전이면 "5분 전"', () => {
      expect(timeAgo(Date.now() - 5 * 60000)).toBe('5분 전');
    });

    it('3시간 전이면 "3시간 전"', () => {
      expect(timeAgo(Date.now() - 3 * 3600000)).toBe('3시간 전');
    });

    it('2일 전이면 "2일 전"', () => {
      expect(timeAgo(Date.now() - 2 * 86400000)).toBe('2일 전');
    });

    it('8일 이상이면 날짜 형식 반환', () => {
      const timestamp = Date.now() - 10 * 86400000;
      expect(timeAgo(timestamp)).toMatch(/^\d{4}\.\d{2}\.\d{2}$/);
    });
  });
});
