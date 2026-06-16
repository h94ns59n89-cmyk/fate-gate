import { Solar, EightChar } from 'lunar-javascript';

export interface TrueSolarTimeParams {
  date: Date;
  longitude: number;
  timezone: number;
}

export interface PillarResult {
  heavenly: string;
  earthly: string;
  hidden_stems: string[];
  wuxing: string;
  shishen_gan: string;
  shishen_zhi: string[];
}

export interface BaziResult {
  year_pillar: PillarResult;
  month_pillar: PillarResult;
  day_pillar: PillarResult;
  hour_pillar: PillarResult;
  day_master: string;
  day_master_element: FiveElementType;
  shishen_distribution: Record<string, number>;
  dayun: {
    start_age: number;
    start_year: number;
    is_forward: boolean;
    decades: Array<{ start_age: number; end_age: number; gan_zhi: string }>;
  };
  calculation_meta: BaziCalculationMeta;
}

export interface BaziCalculationMeta {
  input_time: string;
  true_solar_time: string;
  true_solar_delta_minutes: number;
  longitude: number | null;
  latitude: number | null;
  timezone: number;
  policy_version: string;
  enabled_true_solar_time: boolean;
}

export interface ElementScore {
  score: number;
  status: '旺' | '偏旺' | '中和' | '偏弱' | '弱';
}

export type FiveElementType = 'wood' | 'fire' | 'earth' | 'metal' | 'water';
export const TRUE_SOLAR_TIME_POLICY_VERSION = 'true-solar-v1';

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

function toLocalDateTimeString(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
  ].join('-') + ` ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

const STEM_WUXING: Record<string, FiveElementType> = {
  '甲': 'wood', '乙': 'wood',
  '丙': 'fire', '丁': 'fire',
  '戊': 'earth', '己': 'earth',
  '庚': 'metal', '辛': 'metal',
  '壬': 'water', '癸': 'water',
};

const BRANCH_WUXING: Record<string, FiveElementType> = {
  '寅': 'wood', '卯': 'wood',
  '巳': 'fire', '午': 'fire',
  '辰': 'earth', '戌': 'earth', '丑': 'earth', '未': 'earth',
  '申': 'metal', '酉': 'metal',
  '亥': 'water', '子': 'water',
};

function wuxingToElement(wx: string): FiveElementType {
  if (wx.includes('木')) return 'wood';
  if (wx.includes('火')) return 'fire';
  if (wx.includes('土')) return 'earth';
  if (wx.includes('金')) return 'metal';
  if (wx.includes('水')) return 'water';
  return 'earth';
}

function calcElementScore(count: number, total: number): ElementScore {
  const pct = total > 0 ? (count / total) * 100 : 0;
  const score = Math.round(Math.min(pct * 3.33, 99));
  let status: ElementScore['status'];
  if (score >= 75) status = '旺';
  else if (score >= 60) status = '偏旺';
  else if (score >= 40) status = '中和';
  else if (score >= 20) status = '偏弱';
  else status = '弱';
  return { score, status };
}

export function calculateBazi(birthInfo: {
  birthDate: string;
  birthHour?: number;
  birthMinute?: number;
  longitude?: number;
  latitude?: number;
  timezone?: number;
  gender?: number;
}): BaziResult {
  const { birthDate, birthHour = 12, birthMinute = 0, timezone = 8, gender = 1 } = birthInfo;
  const parts = birthDate.split('-');
  const year = parseInt(parts[0]!, 10);
  const month = parseInt(parts[1]!, 10);
  const day = parseInt(parts[2]!, 10);
  const inputDate = new Date(year, month - 1, day, birthHour, birthMinute, 0);
  const hasLocation = typeof birthInfo.longitude === 'number' && Number.isFinite(birthInfo.longitude);
  const calculationDate = hasLocation
    ? calcTrueSolarTime({ date: inputDate, longitude: birthInfo.longitude!, timezone })
    : inputDate;
  const trueSolarDeltaMinutes = Math.round((calculationDate.getTime() - inputDate.getTime()) / 60000);

  const solar = Solar.fromYmdHms(
    calculationDate.getFullYear(),
    calculationDate.getMonth() + 1,
    calculationDate.getDate(),
    calculationDate.getHours(),
    calculationDate.getMinutes(),
    0,
  );
  const lunar = solar.getLunar();
  const ec = EightChar.fromLunar(lunar);

  function buildPillar(
    gan: string, zhi: string, hideGan: string[],
    wuxing: string, ssGan: string, ssZhi: string[],
  ): PillarResult {
    return {
      heavenly: gan, earthly: zhi, hidden_stems: hideGan,
      wuxing, shishen_gan: ssGan, shishen_zhi: ssZhi,
    };
  }

  // ShiShen distribution across all pillars
  const shishenCounts: Record<string, number> = {};
  const allSS = [
    ec.getYearShiShenGan(), ec.getMonthShiShenGan(),
    ec.getDayShiShenGan(), ec.getTimeShiShenGan(),
    ...ec.getYearShiShenZhi(), ...ec.getMonthShiShenZhi(),
    ...ec.getDayShiShenZhi(), ...ec.getTimeShiShenZhi(),
  ];
  for (const ss of allSS) {
    shishenCounts[ss] = (shishenCounts[ss] ?? 0) + 1;
  }

  // DaYun
  const yun = ec.getYun(gender);
  const dayunArr = yun.getDaYun();
  const decades = dayunArr
    .filter((d: { getGanZhi: () => string }) => d.getGanZhi() !== '')
    .map((d: { getStartAge: () => number; getEndAge: () => number; getGanZhi: () => string }) => ({
      start_age: d.getStartAge(),
      end_age: d.getEndAge(),
      gan_zhi: d.getGanZhi(),
    }));

  return {
    year_pillar: buildPillar(
      ec.getYearGan(), ec.getYearZhi(), ec.getYearHideGan(),
      ec.getYearWuXing(), ec.getYearShiShenGan(), ec.getYearShiShenZhi(),
    ),
    month_pillar: buildPillar(
      ec.getMonthGan(), ec.getMonthZhi(), ec.getMonthHideGan(),
      ec.getMonthWuXing(), ec.getMonthShiShenGan(), ec.getMonthShiShenZhi(),
    ),
    day_pillar: buildPillar(
      ec.getDayGan(), ec.getDayZhi(), ec.getDayHideGan(),
      ec.getDayWuXing(), ec.getDayShiShenGan(), ec.getDayShiShenZhi(),
    ),
    hour_pillar: buildPillar(
      ec.getTimeGan(), ec.getTimeZhi(), ec.getTimeHideGan(),
      ec.getTimeWuXing(), ec.getTimeShiShenGan(), ec.getTimeShiShenZhi(),
    ),
    day_master: ec.getDayGan(),
    day_master_element: wuxingToElement(ec.getDayWuXing()),
    shishen_distribution: shishenCounts,
    dayun: {
      start_age: yun.getStartYear(),
      start_year: year + yun.getStartYear(),
      is_forward: yun.isForward(),
      decades,
    },
    calculation_meta: {
      input_time: toLocalDateTimeString(inputDate),
      true_solar_time: toLocalDateTimeString(calculationDate),
      true_solar_delta_minutes: trueSolarDeltaMinutes,
      longitude: birthInfo.longitude ?? null,
      latitude: birthInfo.latitude ?? null,
      timezone,
      policy_version: TRUE_SOLAR_TIME_POLICY_VERSION,
      enabled_true_solar_time: hasLocation,
    },
  };
}

export function analyzeFiveElements(bazi: BaziResult): Record<FiveElementType, ElementScore> {
  const elements: FiveElementType[] = ['wood', 'fire', 'earth', 'metal', 'water'];
  const counts: Record<FiveElementType, number> = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 };
  const pillars = [bazi.year_pillar, bazi.month_pillar, bazi.day_pillar, bazi.hour_pillar];
  let total = 0;

  for (const p of pillars) {
    const stemEl = STEM_WUXING[p.heavenly];
    if (stemEl) { counts[stemEl]++; total++; }

    const branchEl = BRANCH_WUXING[p.earthly];
    if (branchEl) { counts[branchEl]++; total++; }

    for (const hg of p.hidden_stems) {
      const hgEl = STEM_WUXING[hg];
      if (hgEl) { counts[hgEl] += 0.5; total += 0.5; }
    }
  }

  const result = {} as Record<FiveElementType, ElementScore>;
  for (const el of elements) {
    result[el] = calcElementScore(counts[el], total);
  }
  return result;
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
    birth: '1990-08-15 12:00',
    expected: { year: '庚午', month: '甲申', day: '壬子', hour: '丙午' },
  },
  {
    desc: '闰年2月29日',
    birth: '2000-02-29 06:00',
    expected: { year: '庚辰', month: '戊寅', day: '丁巳', hour: '癸卯' },
  },
  {
    desc: '子时边界',
    birth: '2024-01-01 23:00',
    expected: { year: '癸卯', month: '甲子', day: '甲子', hour: '丙子' },
  },
];
