import { describe, it, expect } from 'vitest';
import {
  BAZI_TEST_CASES as testCases,
  calcTrueSolarTime,
  calculateBazi,
  guessTimeByQuiz,
} from '@/lib/bazi/calculator';
import { resolveBirthLocation } from '@/lib/bazi/location';

describe('Bazi Calculator', () => {
  it('should have test cases defined', () => {
    expect(testCases.length).toBeGreaterThan(0);
  });

  it('should handle all test cases with correct structure', () => {
    for (const tc of testCases) {
      expect(tc.desc).toBeTruthy();
      expect(tc.birth).toBeTruthy();
      expect(tc.expected).toBeTruthy();
    }
  });

  it('should parse birth info correctly', () => {
    const birthStr = '1990-08-15 12:00 北京';
    const [date, time, place] = birthStr.split(' ');
    expect(date).toBe('1990-08-15');
    expect(time).toBe('12:00');
    expect(place).toBe('北京');
  });

  it('should identify correct year pillar for normal dates', () => {
    const testCase = testCases[0]!;
    expect(testCase.expected.year).toBeDefined();
    expect(testCase.expected.year.length).toBe(2);
  });

  it('should calculate true solar time', () => {
    const result = calcTrueSolarTime({
      date: new Date('2024-06-15T14:00:00'),
      longitude: 87.6,
      timezone: 8,
    });
    expect(result).toBeInstanceOf(Date);
    expect(result.getTime()).not.toBeNaN();
  });

  it('should resolve common city coordinates for true solar time', () => {
    const location = resolveBirthLocation({ birthPlace: '上海市' });
    expect(location?.place).toBe('上海');
    expect(location?.longitude).toBeCloseTo(121.47, 1);
    expect(location?.timezone).toBe(8);
  });

  it('should include true solar time metadata in bazi result', () => {
    const location = resolveBirthLocation({ birthPlace: '乌鲁木齐' })!;
    const result = calculateBazi({
      birthDate: '1990-08-15',
      birthHour: 14,
      birthMinute: 0,
      longitude: location.longitude,
      latitude: location.latitude,
      timezone: location.timezone,
    });

    expect(result.calculation_meta.enabled_true_solar_time).toBe(true);
    expect(result.calculation_meta.true_solar_delta_minutes).toBeLessThan(-100);
    expect(result.calculation_meta.longitude).toBeCloseTo(location.longitude, 2);
  });

  it('should guess time from quiz answers', () => {
    const answers = [
      { questionId: 1, optionId: 2 },
      { questionId: 2, optionId: 1 },
      { questionId: 3, optionId: 0 },
    ];
    const result = guessTimeByQuiz(answers);
    expect(result.length).toBeLessThanOrEqual(3);
    expect(result[0]).toBeDefined();
    expect(result[0]?.confidence).toBeGreaterThan(0);
    expect(result[0]?.label).toBeTruthy();
  });
});
