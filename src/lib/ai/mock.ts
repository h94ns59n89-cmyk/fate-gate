import type { PersonalityTags, FullReport, ComparisonResult } from '@/lib/types';

const MOCK_TAGS: Record<string, { tags: string[]; traits: string[]; theme: string; summary: string }> = {
  '甲木': {
    tags: ['甲木型·领导者人格', '偏印格·谋略家', '正官格·规则守护者'],
    traits: ['天生的领导者，善于统筹全局', '喜欢规则但也能灵活破局', '有责任心，略显固执', '思维缜密，谋定后动'],
    theme: '破土成木，向阳而生',
    summary: '甲木参天，志向高远。命局中木旺成势，天生具备领导才能与战略眼光。',
  },
  '乙木': {
    tags: ['乙木型·协调者人格', '正财格·务实家', '食神格·生活家'],
    traits: ['善于协调人际关系', '务实稳健，注重细节', '热爱生活，懂得享受', '柔中带刚，坚韧不拔'],
    theme: '柔枝韧骨，顺势而为',
    summary: '乙木柔韧，顺势而为。命局中木性通达，善于在变化中找到平衡。',
  },
  '丙火': {
    tags: ['丙火型·太阳人格', '比肩格·行动派', '伤官格·创新者'],
    traits: ['热情开朗，感染力强', '行动力十足，说干就干', '富有创造力，不拘一格', '自信大方，乐于助人'],
    theme: '如日方升，光芒四射',
    summary: '丙火如日，光明磊落。命局中火势充沛，天生具有感染力与创造力。',
  },
  '丁火': {
    tags: ['丁火型·烛光人格', '七杀格·进取者', '偏财格·冒险家'],
    traits: ['温和细腻，善解人意', '有进取心，目标明确', '敢于冒险，把握机会', '内心坚定，外柔内刚'],
    theme: '烛照暗夜，温暖人心',
    summary: '丁火如烛，温暖细腻。命局中火性内敛，善于在细节中发现机会。',
  },
  '戊土': {
    tags: ['戊土型·厚德人格', '正印格·智慧者', '劫财格·实干家'],
    traits: ['稳重可靠，值得信赖', '学识渊博，善于思考', '脚踏实地，执行力强', '包容大度，有担当'],
    theme: '厚德载物，稳如泰山',
    summary: '戊土厚重，承载万物。命局中土势稳固，天生具备可靠与包容的品质。',
  },
  '己土': {
    tags: ['己土型·润物人格', '正官格·自律者', '食神格·品味家'],
    traits: ['谦逊低调，默默付出', '自律性强，有条理', '品味出众，审美在线', '善于理财，精打细算'],
    theme: '润物无声，滋养万物',
    summary: '己土润泽，滋养无声。命局中土性温和，善于在平凡中创造价值。',
  },
  '庚金': {
    tags: ['庚金型·剑锋人格', '劫财格·开拓者', '偏印格·战略家'],
    traits: ['果断坚毅，雷厉风行', '开拓精神强，敢于创新', '战略眼光独到', '意志坚定，百折不挠'],
    theme: '百炼成钢，锋芒毕露',
    summary: '庚金如剑，锋芒毕露。命局中金势锐利，天生具备决断力与开拓精神。',
  },
  '辛金': {
    tags: ['辛金型·珠宝人格', '正财格·精致者', '七杀格·完美主义者'],
    traits: ['追求完美，精益求精', '审美品味高雅', '做事认真负责', '有原则，不随波逐流'],
    theme: '精雕细琢，光华内敛',
    summary: '辛金如珠，光华内敛。命局中金性精致，善于在细节中追求卓越。',
  },
  '壬水': {
    tags: ['壬水型·江河人格', '伤官格·表达者', '正印格·学者型'],
    traits: ['思维敏捷，口才出众', '学习能力强，知识面广', '适应力强，随遇而安', '有智慧，善谋略'],
    theme: '奔流不息，海纳百川',
    summary: '壬水奔流，智慧深远。命局中水势浩荡，天生具备学习力与适应力。',
  },
  '癸水': {
    tags: ['癸水型·雨露人格', '偏财格·投资者', '比肩格·合作者'],
    traits: ['直觉敏锐，洞察力强', '善于投资理财', '团队协作能力强', '心思细腻，考虑周全'],
    theme: '上善若水，润物无声',
    summary: '癸水如露，润物无声。命局中水性灵动，善于在协作中发挥价值。',
  },
};

function getDayMasterKey(dayMaster: string): string {
  if (MOCK_TAGS[dayMaster]) return dayMaster;
  for (const key of Object.keys(MOCK_TAGS)) {
    if (dayMaster.includes(key) || key.includes(dayMaster)) return key;
  }
  return '甲木';
}

export function mockPersonalityTags(dayMaster: string): PersonalityTags {
  const key = getDayMasterKey(dayMaster);
  const data = MOCK_TAGS[key] ?? MOCK_TAGS['甲木']!;
  return {
    personality_tags: data.tags,
    core_traits: data.traits,
    life_theme: data.theme,
    five_elements_summary: data.summary,
  };
}

export function mockFullReport(dayMaster: string): FullReport {
  const tags = mockPersonalityTags(dayMaster);
  return {
    cover: {
      title: '命理人格分析报告',
      subtitle: '基于子平八字学的现代人格解读',
      day_master: dayMaster,
      life_theme: tags.life_theme,
      generated_at: new Date().toISOString(),
    },
    personality: {
      type: tags.personality_tags[0],
      core_traits: tags.core_traits,
      five_elements: '五行中和，气势均衡',
      strengths: ['思维缜密', '执行力强', '善于沟通'],
      growth_areas: ['偶尔过于固执', '需要更多灵活性'],
    },
    career: {
      suitable_directions: ['管理咨询', '教育培训', '创意设计'],
      avoid_directions: ['重复性劳动', '高压销售'],
      advice: '发挥领导才能，选择能展现个人影响力的岗位。',
    },
    relationships: {
      communication_style: '理性主导，兼顾感性',
      compatibility: ['乙木型', '丁火型', '己土型'],
      advice: '在亲密关系中适当表达柔软的一面。',
    },
    health: { focus_areas: ['注意脾胃保养', '适度运动'], advice: '保持规律作息，避免过度思虑。' },
    current_year: { overall: '稳中有进', career: '机会增多', wealth: '稳步增长', relationships: '桃花旺盛' },
    decade_trend: { age_range: '25-34', focus: '事业上升期', advice: '把握当下十年黄金发展期。' },
    self_improvement: {
      directions: ['培养副业技能', '拓展社交圈', '加强身体锻炼'],
      book_suggestions: ['《人性的弱点》', '《思考，快与慢》'],
    },
    glossary: {
      day_master: '代表你自己的五行属性',
      five_elements: '金木水火土的平衡状态',
      shishen: '十神关系，反映性格特质',
    },
    footer: { disclaimer: '本报告由 AI 生成，仅供娱乐参考。', version: '1.0' },
  };
}

export function mockComparison(): ComparisonResult {
  return {
    overall_match: 85,
    dimensions: { communication: 80, emotional: 75, values: 90, growth: 85 },
    complementarity: '五行互补，性格契合度较高。',
    strengths: ['价值观高度一致', '沟通顺畅', '共同成长空间大'],
    potential_conflicts: ['决策方式略有差异', '情绪表达频率不同'],
    advice: '多关注彼此的情感需求，保持开放沟通。',
    summary_tag: '天作之合 · 相得益彰',
  };
}
