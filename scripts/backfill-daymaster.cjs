const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const stemToElement = { '甲':'木','乙':'木','丙':'火','丁':'火','戊':'土','己':'土','庚':'金','辛':'金','壬':'水','癸':'水' };

async function main() {
  const reports = await prisma.personalityReport.findMany({
    where: { status: 'COMPLETED' },
    include: { birthInfo: true },
    orderBy: { id: 'asc' },
  });

  let fixed = 0;
  let skipped = 0;

  for (const report of reports) {
    const bj = report.baziJson;
    if (!bj) { skipped++; continue; }
    if (bj.day_master && bj.day_master_element) { skipped++; continue; }

    const dayPillar = bj.day_pillar;
    const dayMaster = bj.day_master || dayPillar?.heavenly || dayPillar?.gan;
    if (!dayMaster) { skipped++; console.log('Report #' + report.id + ': no day master found'); continue; }

    await prisma.personalityReport.update({
      where: { id: report.id },
      data: {
        baziJson: {
          ...bj,
          day_master: dayMaster,
          day_master_element: stemToElement[dayMaster] ?? null,
        },
      },
    });
    fixed++;
    console.log('Report #' + report.id + ': set day_master = ' + dayMaster + ', element = ' + (stemToElement[dayMaster] ?? 'null'));
  }

  console.log('\nDone: ' + fixed + ' fixed, ' + skipped + ' skipped');
}

main().catch(console.error).finally(() => prisma.$disconnect());
