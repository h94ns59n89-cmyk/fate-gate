import type { PersonalityTags, FullReport, ComparisonResult } from '@/lib/types';

const MOCK_TAGS: Record<string, { tags: string[]; traits: string[]; theme: string; summary: string; past_tendencies: string[] }> = {
  '甲木': {
    tags: ['甲木型·领导者人格 (ENTJ)', '偏印格·谋略家 (INTJ)', '正官格·规则守护者 (ESTJ)'],
    traits: ['天生的领导者，善于统筹全局', '喜欢规则但也能灵活破局', '有责任心，略显固执', '思维缜密，谋定后动'],
    theme: '破土成木，向阳而生',
    summary: '甲木参天，志向高远。命局中木旺成势，天生具备领导才能与战略眼光。',
    past_tendencies: ['过去十年正官大运期间，你可能是团队里那个主动站出来定流程的人——别人还在犹豫，你已经把分工表排好了。', '前几年金旺的流年，工作压力不小，你大概率经历过"算了，与其等别人不如自己来"的包揽期，也因此被说过控制欲强。'],
  },
  '乙木': {
    tags: ['乙木型·协调者人格 (ESFJ)', '正财格·务实家 (ISTJ)', '食神格·生活家 (ESFP)'],
    traits: ['善于协调人际关系', '务实稳健，注重细节', '热爱生活，懂得享受', '柔中带刚，坚韧不拔'],
    theme: '柔枝韧骨，顺势而为',
    summary: '乙木柔韧，顺势而为。命局中木性通达，善于在变化中找到平衡。',
    past_tendencies: ['回想前几年偏财大运，你可能同时搞过好几份收入——主业之外不是接私活就是捣鼓小买卖，钱没赚多少但折腾劲很足。', '遇到火旺的年份你特别爱社交，周末约饭组局从不缺席，朋友圈里那个"攒局王"大概率就是你。'],
  },
  '丙火': {
    tags: ['丙火型·太阳人格 (ENFP)', '比肩格·行动派 (ESTP)', '伤官格·创新者 (ENTP)'],
    traits: ['热情开朗，感染力强', '行动力十足，说干就干', '富有创造力，不拘一格', '自信大方，乐于助人'],
    theme: '如日方升，光芒四射',
    summary: '丙火如日，光明磊落。命局中火势充沛，天生具有感染力与创造力。',
    past_tendencies: ['过去比肩大运那几年，你习惯了一个人扛事——方案自己写、锅自己背、功劳分大家，嘴上说"没事"但心里其实希望有人搭把手。', '碰上水旺的年份你挺难受的，热情抛出去像打在棉花上，但也正是在那之后你学会了看人下菜碟，不是谁都值得你掏心掏肺。'],
  },
  '丁火': {
    tags: ['丁火型·烛光人格 (INFJ)', '七杀格·进取者 (ENTJ)', '偏财格·冒险家 (ESTP)'],
    traits: ['温和细腻，善解人意', '有进取心，目标明确', '敢于冒险，把握机会', '内心坚定，外柔内刚'],
    theme: '烛照暗夜，温暖人心',
    summary: '丁火如烛，温暖细腻。命局中火性内敛，善于在细节中发现机会。',
    past_tendencies: ['七杀大运那几年你过得不轻松，换工作、被 push、项目 Deadline 一个接一个——现在回头看，你可能会惊讶自己居然扛过来了。', '水旺流年你的情绪像坐过山车，白天还在会议上冲锋陷阵，深夜却对着聊天记录翻来覆去睡不着，那时候的你比现在敏感得多。'],
  },
  '戊土': {
    tags: ['戊土型·厚德人格 (ISFJ)', '正印格·智慧者 (INTP)', '劫财格·实干家 (ISTP)'],
    traits: ['稳重可靠，值得信赖', '学识渊博，善于思考', '脚踏实地，执行力强', '包容大度，有担当'],
    theme: '厚德载物，稳如泰山',
    summary: '戊土厚重，承载万物。命局中土势稳固，天生具备可靠与包容的品质。',
    past_tendencies: ['正印大运期间你大概率是个"考证狂魔"或"书虫"——别人下班刷剧你刷课，考了一堆证虽然不一定都用上了，但那个过程让你心里踏实。', '金旺年份你突然不甘心了，明明干得不差却总觉得天花板太低，那段时间你频繁刷招聘网站、甚至动了转行的念头。'],
  },
  '己土': {
    tags: ['己土型·润物人格 (ISFJ)', '正官格·自律者 (ISTJ)', '食神格·品味家 (ISFP)'],
    traits: ['谦逊低调，默默付出', '自律性强，有条理', '品味出众，审美在线', '善于理财，精打细算'],
    theme: '润物无声，滋养万物',
    summary: '己土润泽，滋养无声。命局中土性温和，善于在平凡中创造价值。',
    past_tendencies: ['正官大运那几年你在单位或团队里是公认的"靠谱担当"——流程走得最顺、表格填得最齐、领导交代的事从来不掉链子，但也因此被琐事缠了很久。', '水旺年份你突然开始讲究起来了，换手机、改造出租屋、研究穿搭，不是乱花钱而是在弥补之前"太懂事"没敢要的那些东西。'],
  },
  '庚金': {
    tags: ['庚金型·剑锋人格 (ENTJ)', '劫财格·开拓者 (ESTP)', '偏印格·战略家 (INTJ)'],
    traits: ['果断坚毅，雷厉风行', '开拓精神强，敢于创新', '战略眼光独到', '意志坚定，百折不挠'],
    theme: '百炼成钢，锋芒毕露',
    summary: '庚金如剑，锋芒毕露。命局中金势锐利，天生具备决断力与开拓精神。',
    past_tendencies: ['劫财大运期间你可能合伙做过生意或跟朋友一起搞过项目——过程鸡飞狗跳，最后可能没赚到钱但攒了一肚子故事和教训。', '火旺年份压力山大，领导刁难、客户难缠、指标压得喘不过气，但你骨子里的倔劲也被逼出来了——越是说你不行的你偏要干成。'],
  },
  '辛金': {
    tags: ['辛金型·珠宝人格 (INFJ)', '正财格·精致者 (ISTJ)', '七杀格·完美主义者 (INTJ)'],
    traits: ['追求完美，精益求精', '审美品味高雅', '做事认真负责', '有原则，不随波逐流'],
    theme: '精雕细琢，光华内敛',
    summary: '辛金如珠，光华内敛。命局中金性精致，善于在细节中追求卓越。',
    past_tendencies: ['正财大运那几年你活得挺务实的——存钱目标精确到月、买东西必看性价比、连谈恋爱都会下意识评估"投入产出比"', '木旺年份你在"将就"和"讲究"之间反复拉扯，一边觉得差不多得了，一边又忍不住对细节吹毛求疵，这种拧巴大概持续了一整年。'],
  },
  '壬水': {
    tags: ['壬水型·江河人格 (ENFP)', '伤官格·表达者 (ENTP)', '正印格·学者型 (INTP)'],
    traits: ['思维敏捷，口才出众', '学习能力强，知识面广', '适应力强，随遇而安', '有智慧，善谋略'],
    theme: '奔流不息，海纳百川',
    summary: '壬水奔流，智慧深远。命局中水势浩荡，天生具备学习力与适应力。',
    past_tendencies: ['伤官大运期间你嘴巴比脑子快的那几年——怼过领导、在群里发表过激言论、写过热血澎湃但第二天就想删的朋友圈，但你也是靠这种表达欲让被人记住了你。', '土旺年份你被现实上了一课：方案被毙、预算被砍、想法被无视，你学会了闭嘴观察而不是急着反驳——那之后你说话开始带脑子了。'],
  },
  '癸水': {
    tags: ['癸水型·雨露人格 (INFP)', '偏财格·投资者 (ENTJ)', '比肩格·合作者 (ESFJ)'],
    traits: ['直觉敏锐，洞察力强', '善于投资理财', '团队协作能力强', '心思细腻，考虑周全'],
    theme: '上善若水，润物无声',
    summary: '癸水如露，润物无声。命局中水性灵动，善于在协作中发挥价值。',
    past_tendencies: ['偏财大运那几年你对"搞钱"格外上头——炒过币、跟过风口、研究过各种被动收入，虽然有的踩了坑但你的财务嗅觉确实是在那时练出来的。', '火旺年份你突然打开了社交开关，以前能推就推的局你开始主动去了，甚至成了几个圈子的核心连接人——这种转变连你自己都有点意外。'],
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
    past_tendencies: data.past_tendencies,
  };
}

export function mockFullReport(dayMaster: string): FullReport {
  const tags = mockPersonalityTags(dayMaster);
  return {
    cover: {
      title: '星隅测试报告',
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
      past_tendency: tags.past_tendencies?.[0] ?? '过去十年你可能一直是那个"先干了再说"的人——项目抢着接、责任主动扛，但偶尔也因冲锋太快忽略了周围人的节奏。',
    },
    career: {
      suitable_directions: ['管理咨询', '教育培训', '创意设计'],
      avoid_directions: ['重复性劳动', '高压销售'],
      advice: '发挥领导才能，选择能展现个人影响力的岗位。',
      past_tendency: '前几年你可能在"稳定"和"折腾"之间反复横跳——一边舍不得现有平台的资源，一边又被新机会撩得心痒，换或不换的想法在脑子里打了好几架。',
    },
    relationships: {
      communication_style: '理性主导，兼顾感性',
      compatibility: ['乙木型', '丁火型', '己土型'],
      advice: '在亲密关系中适当表达柔软的一面。',
      past_tendency: '回想过去那段感情/人际关系周期，你可能是那个"先热后冷"的人——开始的时候全力以赴，但时间一长就开始思考"这是我要的吗"，这种模式在不同关系里重复了好几次。',
    },
    health: { focus_areas: ['注意脾胃保养', '适度运动'], advice: '保持规律作息，避免过度思虑。', past_tendency: '前几年压力大的那段时间，你可能有过"身体被掏空"的感觉——失眠、胃胀、偏头痛轮番上阵，当时没当回事，现在回头看其实是身体在报警了。' },
    current_year: { overall: '稳中有进', career: '机会增多', wealth: '稳步增长', relationships: '桃花旺盛' },
    decade_trend: { age_range: '25-34', gan_zhi: '戊午', element: '火', focus: '正官运·事业责任期', advice: '当前戊午大运火土旺盛，你是丁火日主得印星生扶，宜稳扎稳打积累职场资本。' },
    self_improvement: {
      directions: ['培养副业技能', '拓展社交圈', '加强身体锻炼'],
      book_suggestions: ['《人性的弱点》', '《思考，快与慢》'],
    },
    glossary: {
      day_master: {
        meaning: '日主是八字四柱中出生日的天干，代表命主自身的五行属性和核心特质',
        your_chart: '你的日主为丙火，属太阳之火，在八字中处于旺相状态，代表你天生热情开朗、感染力强',
        why_it_matters: '丙火日主的人适合从事需要感染力和创造力的工作，在团队中通常是天然的中心人物',
      },
      five_elements: {
        meaning: '五行指金木水火土五种基本能量的运行规律和相生相克关系',
        your_chart: '你的八字火旺木相，缺金水，属于"火炎土燥"格局，需要补水来平衡',
        why_it_matters: '你天生火性偏强，做事有冲劲但容易急躁，补水可以帮你提升耐心和决策的冷静度',
      },
      shishen: {
        meaning: '十神是日主与其他天干地支之间的关系分类，反映一个人的性格特质和社会角色',
        your_chart: '你的八字中偏印最旺，代表你思维独特、善于深度思考，但也容易钻牛角尖',
        why_it_matters: '偏印旺的人适合研究型、分析型工作，但在人际关系中需要警惕过于孤僻的倾向',
      },
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
