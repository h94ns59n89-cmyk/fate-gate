import { loadEnvConfig } from '@next/env';
loadEnvConfig(process.cwd());

import { PrismaClient, Prisma } from '@prisma/client';

const TAG_TO_MBTI: Record<string, string> = {
  '甲木型·领导者人格': 'ENTJ',
  '偏印格·谋略家': 'INTJ',
  '正官格·规则守护者': 'ESTJ',
  '乙木型·协调者人格': 'ESFJ',
  '正财格·务实家': 'ISTJ',
  '食神格·生活家': 'ESFP',
  '丙火型·太阳人格': 'ENFP',
  '比肩格·行动派': 'ESTP',
  '伤官格·创新者': 'ENTP',
  '丁火型·烛光人格': 'INFJ',
  '七杀格·进取者': 'ENTJ',
  '偏财格·冒险家': 'ESTP',
  '戊土型·厚德人格': 'ISFJ',
  '正印格·智慧者': 'INTP',
  '劫财格·实干家': 'ISTP',
  '己土型·润物人格': 'ISFJ',
  '正官格·自律者': 'ISTJ',
  '食神格·品味家': 'ISFP',
  '庚金型·剑锋人格': 'ENTJ',
  '劫财格·开拓者': 'ESTP',
  '偏印格·战略家': 'INTJ',
  '辛金型·珠宝人格': 'INFJ',
  '正财格·精致者': 'ISTJ',
  '七杀格·完美主义者': 'INTJ',
  '壬水型·江河人格': 'ENFP',
  '伤官格·表达者': 'ENTP',
  '正印格·学者型': 'INTP',
  '癸水型·雨露人格': 'INFP',
  '偏财格·投资者': 'ENTJ',
  '比肩格·合作者': 'ESFJ',
};

function appendMBTI(tag: string): string {
  if (/\([A-Z]{4}\)$/.test(tag)) return tag;
  const mbti = TAG_TO_MBTI[tag];
  if (mbti) return `${tag} (${mbti})`;
  return tag;
}

async function main() {
  const prisma = new PrismaClient();
  try {
    console.log('Fetching reports with existing personalityTags...');
    const reports = await prisma.personalityReport.findMany({
      where: { personalityTags: { not: Prisma.JsonNull } },
    });
    console.log(`Found ${reports.length} reports to process.`);

    let updated = 0;
    for (const report of reports) {
      const tags = report.personalityTags as string[] | null;
      if (!tags || !Array.isArray(tags)) continue;

      const newTags = tags.map(appendMBTI);
      if (newTags.every((t, i) => t === tags[i])) continue;

      const summary = report.summaryJson as Record<string, unknown> | null;
      const updatedSummary = summary
        ? { ...summary, personality_tags: newTags }
        : null;

      const fullReport = report.fullReportJson as Record<string, unknown> | null;
      const updatedFullReport = fullReport?.personality
        ? { ...fullReport, personality: { ...(fullReport.personality as Record<string, unknown>), type: appendMBTI((fullReport.personality as Record<string, unknown>).type as string) } }
        : undefined;

      await prisma.personalityReport.update({
        where: { id: report.id },
        data: {
          personalityTags: newTags as never,
          ...(updatedSummary ? { summaryJson: updatedSummary as never } : {}),
          ...(updatedFullReport ? { fullReportJson: updatedFullReport as never } : {}),
        },
      });
      updated++;
    }

    console.log(`Updated ${updated} reports with MBTI tags.`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error('Backfill failed:', e);
  process.exit(1);
});
