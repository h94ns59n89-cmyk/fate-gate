import { withMiddleware } from '@/lib/middleware';
import { success, error } from '@/lib/api-response';
import { cache } from '@/lib/cache';
import { CACHE_TTL } from '@/lib/constants';
import prisma from '@/lib/db/client';

function computePersonalityTags(dayMaster: string): { tags: string[]; traits: string[]; theme: string } {
  const tags: Record<string, { tags: string[]; traits: string[]; theme: string }> = {
    '甲木': {
      tags: ['甲木型·领导者人格', '偏印格·谋略家', '正官格·规则守护者'],
      traits: ['天生的领导者，善于统筹全局', '喜欢规则但也能灵活破局', '有责任心，略显固执', '思维缜密，谋定后动'],
      theme: '破土成木，向阳而生',
    },
    '乙木': {
      tags: ['乙木型·协调者人格', '正财格·务实家', '食神格·生活家'],
      traits: ['善于协调人际关系', '务实稳健，注重细节', '热爱生活，懂得享受', '柔中带刚，坚韧不拔'],
      theme: '柔枝韧骨，顺势而为',
    },
    '丙火': {
      tags: ['丙火型·太阳人格', '比肩格·行动派', '伤官格·创新者'],
      traits: ['热情开朗，感染力强', '行动力十足，说干就干', '富有创造力，不拘一格', '自信大方，乐于助人'],
      theme: '如日方升，光芒四射',
    },
    '丁火': {
      tags: ['丁火型·烛光人格', '七杀格·进取者', '偏财格·冒险家'],
      traits: ['温和细腻，善解人意', '有进取心，目标明确', '敢于冒险，把握机会', '内心坚定，外柔内刚'],
      theme: '烛照暗夜，温暖人心',
    },
    '戊土': {
      tags: ['戊土型·厚德人格', '正印格·智慧者', '劫财格·实干家'],
      traits: ['稳重可靠，值得信赖', '学识渊博，善于思考', '脚踏实地，执行力强', '包容大度，有担当'],
      theme: '厚德载物，稳如泰山',
    },
    '己土': {
      tags: ['己土型·润物人格', '正官格·自律者', '食神格·品味家'],
      traits: ['谦逊低调，默默付出', '自律性强，有条理', '品味出众，审美在线', '善于理财，精打细算'],
      theme: '润物无声，滋养万物',
    },
    '庚金': {
      tags: ['庚金型·剑锋人格', '劫财格·开拓者', '偏印格·战略家'],
      traits: ['果断坚毅，雷厉风行', '开拓精神强，敢于创新', '战略眼光独到', '意志坚定，百折不挠'],
      theme: '百炼成钢，锋芒毕露',
    },
    '辛金': {
      tags: ['辛金型·珠宝人格', '正财格·精致者', '七杀格·完美主义者'],
      traits: ['追求完美，精益求精', '审美品味高雅', '做事认真负责', '有原则，不随波逐流'],
      theme: '精雕细琢，光华内敛',
    },
    '壬水': {
      tags: ['壬水型·江河人格', '伤官格·表达者', '正印格·学者型'],
      traits: ['思维敏捷，口才出众', '学习能力强，知识面广', '适应力强，随遇而安', '有智慧，善谋略'],
      theme: '奔流不息，海纳百川',
    },
    '癸水': {
      tags: ['癸水型·雨露人格', '偏财格·投资者', '比肩格·合作者'],
      traits: ['直觉敏锐，洞察力强', '善于投资理财', '团队协作能力强', '心思细腻，考虑周全'],
      theme: '上善若水，润物无声',
    },
  };
  return (tags[dayMaster] ?? tags['甲木'])!;
}

export const POST = withMiddleware(async (req) => {
  const body = await req.json();
  const { birth_date, user_id } = body;

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

  const personality = computePersonalityTags(dayMaster);

  const cacheKey = `bazi:${body.birth_date}-${body.birth_hour}`;
  const cached = await cache.get(cacheKey);

  if (cached) {
    return success({
      bazi: baziResult,
      five_elements: fiveElements,
      day_master: dayMaster,
      personality_tags: personality.tags,
      core_traits: personality.traits,
      life_theme: personality.theme,
      report_id: 0,
      cache_hit: true,
    });
  }

  let reportId = 0;
  try {
    const report = await prisma.personalityReport.create({
      data: {
        userId: BigInt(user_id ?? 0),
        birthInfoId: BigInt(1),
        reportType: 'FREE',
        status: 'PENDING',
        baziJson: baziResult,
        fiveElementsJson: fiveElements,
        personalityTags: personality.tags,
        cacheKey,
      },
    });
    reportId = Number(report.id);
  } catch {
    console.warn('DB unavailable, skipping report persist');
  }

  await cache.set(cacheKey, { bazi: baziResult, fiveElements }, CACHE_TTL.BAZI);

  return success({
    bazi: baziResult,
    five_elements: fiveElements,
    day_master: dayMaster,
    personality_tags: personality.tags,
    core_traits: personality.traits,
    life_theme: personality.theme,
    report_id: reportId,
    cache_hit: false,
  });
});
