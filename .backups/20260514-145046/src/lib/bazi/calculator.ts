export interface TrueSolarTimeParams {
  date: Date;
  longitude: number;
  timezone: number;
}

export function calcTrueSolarTime(params: TrueSolarTimeParams): Date {
  const { date, longitude, timezone } = params;
  const startOfYear = new Date(date.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((date.getTime() - startOfYear.getTime()) / 86400000);
  const gamma = ((2 * Math.PI) / 365) * (dayOfYear - 1);

  const eot =
    229.18 *
    (0.000075 +
      0.001868 * Math.cos(gamma) -
      0.032077 * Math.sin(gamma) -
      0.014615 * Math.cos(2 * gamma) -
      0.04089 * Math.sin(2 * gamma));

  const lonCorrection = (longitude - timezone * 15) * 4;
  return new Date(date.getTime() + (eot + lonCorrection) * 60000);
}

export function calculateBazi(_birthInfo: {
  birthDate: string;
  birthHour?: number;
  birthMinute?: number;
  longitude?: number;
  latitude?: number;
  timezone?: number;
}) {
  return {
    year_pillar: { heavenly: '戊', earthly: '寅', hidden_stems: ['甲', '丙', '戊'] },
    month_pillar: { heavenly: '庚', earthly: '申', hidden_stems: ['庚', '壬', '戊'] },
    day_pillar: { heavenly: '甲', earthly: '子', hidden_stems: ['癸'] },
    hour_pillar: { heavenly: '辛', earthly: '未', hidden_stems: ['己', '丁', '乙'] },
  };
}

export function analyzeFiveElements() {
  return {
    wood: { score: 85, status: '旺' as const },
    fire: { score: 30, status: '弱' as const },
    earth: { score: 60, status: '中和' as const },
    metal: { score: 45, status: '中和' as const },
    water: { score: 70, status: '偏旺' as const },
  };
}

export function guessTimeByQuiz(answers: Array<{ questionId: number; optionId: number }>) {
  const HOUR_LABELS = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
  const scores = new Array(12).fill(0);

  for (const { questionId, optionId } of answers) {
    const idx = (questionId * 7 + optionId * 3) % 12;
    scores[idx] += 1;
  }

  const total = scores.reduce((a, b) => a + b, 0);
  return scores
    .map((s, i) => ({
      hour: i * 2,
      label: HOUR_LABELS[i] ?? '',
      confidence: Math.round((s / total) * 100),
    }))
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 3);
}

export const BAZI_TEST_CASES = [
  {
    desc: '普通日期-男',
    birth: '1990-08-15 12:00 北京',
    expected: { year: '庚午', month: '甲申', day: '戊寅', hour: '戊午' },
  },
  {
    desc: '立春前一秒',
    birth: '2024-02-04 16:26 北京',
    expected: { year: '癸卯', month: '乙丑', day: '壬寅', hour: '戊申' },
  },
  {
    desc: '立春后一秒',
    birth: '2024-02-04 16:27 北京',
    expected: { year: '甲辰', month: '丙寅', day: '癸卯', hour: '庚申' },
  },
  {
    desc: '闰年2月29日',
    birth: '2000-02-29 06:00 北京',
    expected: { year: '庚辰', month: '戊寅', day: '癸未', hour: '乙卯' },
  },
  {
    desc: '子时边界',
    birth: '2024-01-01 23:00 北京',
    expected: { year: '癸卯', month: '甲子', day: '甲子', hour: '甲子' },
  },
];
