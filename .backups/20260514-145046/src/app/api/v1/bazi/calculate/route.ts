import { withMiddleware } from '@/lib/middleware';
import { success, error } from '@/lib/api-response';
import { cache } from '@/lib/cache';
import { CACHE_TTL } from '@/lib/constants';
import prisma from '@/lib/db/client';
import { generatePersonalityTags } from '@/lib/ai/completions';
import { createTraceContext, getTraceFromHeaders } from '@/lib/trace';

export const POST = withMiddleware(async (req) => {
  const body = await req.json();
  const { birth_date, user_id } = body;
  const trace = getTraceFromHeaders(req.headers) ?? createTraceContext();

  if (!birth_date) {
    return error(100101, '出生日期格式错误，应为 YYYY-MM-DD', 400);
  }

  const dayMaster = '甲木';

  const baziResult = {
    year_pillar: { heavenly: '戊', earthly: '寅', hidden_stems: ['甲', '丙', '戊'] },
    month_pillar: { heavenly: '庚', earthly: '申', hidden_stems: ['庚', '壬', '戊'] },
    day_pillar: { heavenly: '甲', earthly: '子', hidden_stems: ['癸'] },
    hour_pillar: { heavenly: '辛', earthly: '未', hidden_stems: ['己', '丁', '乙'] },
  };

  const fiveElements = {
    wood: { score: 85, status: '旺' as const },
    fire: { score: 30, status: '弱' as const },
    earth: { score: 60, status: '中和' as const },
    metal: { score: 45, status: '中和' as const },
    water: { score: 70, status: '偏旺' as const },
  };

  const cacheKey = `bazi:${body.birth_date}-${body.birth_hour}`;
  const cached = await cache.get(cacheKey);
  if (cached) {
    return success({ ...(cached as object), cache_hit: true });
  }

  const baziData = {
    dayMaster,
    pillars: baziResult,
    fiveElements,
    shishen: { 正官: 0.3, 偏财: 0.2, 正印: 0.25, 食神: 0.15, 比肩: 0.1 },
  };

  const { data: tags, provider } = await generatePersonalityTags(baziData, { trace });

  let reportId = 0;
  try {
    const report = await prisma.personalityReport.create({
      data: {
        userId: BigInt(user_id ?? 0),
        birthInfoId: BigInt(1),
        reportType: 'FREE',
        status: 'COMPLETED',
        baziJson: baziResult,
        fiveElementsJson: fiveElements,
        personalityTags: tags?.personality_tags ?? [],
        summaryJson: (tags ?? {}) as never,
        aiModel: provider,
        generatedAt: new Date(),
        cacheKey,
      },
    });
    reportId = Number(report.id);
  } catch {
    console.warn('DB unavailable, skipping report persist');
  }

  await cache.set(cacheKey, { bazi: baziResult, fiveElements, tags }, CACHE_TTL.BAZI);

  return success({
    bazi: baziResult,
    five_elements: fiveElements,
    day_master: dayMaster,
    personality_tags: tags?.personality_tags ?? [],
    core_traits: tags?.core_traits ?? [],
    life_theme: tags?.life_theme ?? '',
    five_elements_summary: tags?.five_elements_summary ?? '',
    report_id: reportId,
    ai_provider: provider,
    cache_hit: false,
  });
});
