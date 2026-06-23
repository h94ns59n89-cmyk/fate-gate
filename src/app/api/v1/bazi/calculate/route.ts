import { withMiddleware } from '@/lib/middleware';
import { success, error } from '@/lib/api-response';
import { cache } from '@/lib/cache';
import { CACHE_TTL } from '@/lib/constants';
import prisma from '@/lib/db/client';
import { calculateBazi, analyzeFiveElements, TRUE_SOLAR_TIME_POLICY_VERSION } from '@/lib/bazi/calculator';
import { resolveBirthLocation } from '@/lib/bazi/location';
import { generatePersonalityTags } from '@/lib/ai/completions';
import { createTraceContext, getTraceFromHeaders } from '@/lib/trace';
import { Logger } from '@/lib/logger';
import { sha256 } from '@/lib/utils';
import { baziCalculateSchema } from '@/lib/validation';

export const POST = withMiddleware(async (req) => {
  const body = await req.json();
  const parsed = baziCalculateSchema.safeParse(body);
  if (!parsed.success) {
    return error(100101, parsed.error?.issues?.[0]?.message ?? '参数校验失败', 400);
  }
  const {
    birth_date,
    birth_hour,
    birth_minute,
    birth_place,
    user_id,
    gender,
    longitude,
    latitude,
    timezone,
    is_solar_calendar,
  } = parsed.data;
  const trace = getTraceFromHeaders(req.headers) ?? createTraceContext();

  const location = await resolveBirthLocation({
    birthPlace: birth_place ?? null,
    longitude: typeof longitude === 'number' ? longitude : null,
    latitude: typeof latitude === 'number' ? latitude : null,
    timezone: typeof timezone === 'number' ? timezone : null,
  });

  if (!location) {
    return error(100103, '出生地点暂未识别，请填写可解析的地点名称或经纬度', 400);
  }

  const normalizedBirthHour = birth_hour ?? 12;
  const normalizedBirthMinute = birth_minute ?? 0;
  const cacheKey = [
    'bazi',
    user_id ? `u${user_id}` : 'anon',
    birth_date,
    normalizedBirthHour,
    normalizedBirthMinute,
    location.longitude.toFixed(4),
    location.latitude.toFixed(4),
    location.timezone,
    is_solar_calendar !== false ? 'solar' : 'lunar',
    gender ?? 1,
    TRUE_SOLAR_TIME_POLICY_VERSION,
  ].join(':');
  const cached = await cache.get(cacheKey);
  if (cached) {
    return success({ ...(cached as object), cache_hit: true });
  }

  // Phase 1: Pure calculation (zero AI)
  const bazi = calculateBazi({
    birthDate: birth_date,
    birthHour: normalizedBirthHour,
    birthMinute: normalizedBirthMinute,
    longitude: location.longitude,
    latitude: location.latitude,
    timezone: location.timezone,
    gender: gender ?? 1,
  });
  const fiveElements = analyzeFiveElements(bazi);

  // Phase 2: AI interpretation only
  const baziForAI = {
    dayMaster: bazi.day_master,
    dayMasterElement: bazi.day_master_element,
    pillars: {
      year: bazi.year_pillar,
      month: bazi.month_pillar,
      day: bazi.day_pillar,
      hour: bazi.hour_pillar,
    },
    fiveElements,
    shishen: bazi.shishen_distribution,
    dayun: bazi.dayun,
    calculationMeta: bazi.calculation_meta,
  };

  const { data: tags, provider } = await generatePersonalityTags(baziForAI, { trace });

  let birthInfoId = 0;
  let reportId = 0;
  if (user_id != null) {
    try {
      await prisma.birthInfo.updateMany({
        where: { userId: Number(user_id), isCurrent: true, deletedAt: null },
        data: { isCurrent: false },
      });

      const birthInfo = await prisma.birthInfo.create({
        data: {
          userId: Number(user_id),
          birthDate: new Date(`${birth_date}T00:00:00`),
          birthHour: normalizedBirthHour,
          birthMinute: normalizedBirthMinute,
          birthPlace: location.place,
          longitude: location.longitude,
          latitude: location.latitude,
          timezone: location.timezone,
          isSolarCalendar: is_solar_calendar !== false,
          isCurrent: true,
        },
      });
      birthInfoId = Number(birthInfo.id);

      const report = await prisma.personalityReport.create({
        data: {
          userId: Number(user_id),
          birthInfoId: birthInfo.id,
          reportType: 'FREE',
          status: 'COMPLETED',
          baziJson: {
            year_pillar: bazi.year_pillar,
            month_pillar: bazi.month_pillar,
            day_pillar: bazi.day_pillar,
            hour_pillar: bazi.hour_pillar,
            calculation_meta: bazi.calculation_meta,
            location,
          } as never,
          fiveElementsJson: fiveElements as never,
          personalityTags: tags?.personality_tags ?? [],
          summaryJson: {
            ...(tags ?? {}),
            calculation_meta: bazi.calculation_meta,
          } as never,
          shishenJson: bazi.shishen_distribution as never,
          dayunJson: bazi.dayun as never,
          aiModel: provider,
          generatedAt: new Date(),
          cacheKey: `free:${user_id}:${sha256(cacheKey)}`,
        },
      });
      reportId = Number(report.id);
    } catch (err) {
      Logger.for('bazi', trace).warn('DB unavailable or persistence failed, returning transient result', { error: (err as Error)?.message });
    }
  }

  const responsePayload = {
    bazi: {
      year_pillar: bazi.year_pillar,
      month_pillar: bazi.month_pillar,
      day_pillar: bazi.day_pillar,
      hour_pillar: bazi.hour_pillar,
      calculation_meta: bazi.calculation_meta,
    },
    five_elements: fiveElements,
    day_master: bazi.day_master,
    day_master_element: bazi.day_master_element,
    shishen_distribution: bazi.shishen_distribution,
    dayun: bazi.dayun,
    calculation_meta: bazi.calculation_meta,
    location,
    personality_tags: tags?.personality_tags ?? [],
    core_traits: tags?.core_traits ?? [],
    life_theme: tags?.life_theme ?? '',
    five_elements_summary: tags?.five_elements_summary ?? '',
    birth_info_id: birthInfoId,
    report_id: reportId,
    ai_provider: provider,
    cache_hit: false,
  };

  await cache.set(cacheKey, responsePayload, CACHE_TTL.BAZI);

  return success(responsePayload);
});
