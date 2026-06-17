/*
 * 出生时辰推测问卷
 *
 * 参考依据：八字时辰（时柱地支）的传统性格特征
 * 来源：《渊海子平》《三命通会》中十二时辰地支的人格描述
 *
 * 十二时辰对应地支与核心特质：
 *   子(水) — 聪慧机敏，外柔内刚，善应变
 *   丑(土) — 勤恳务实，意志坚定，重信誉
 *   寅(木) — 勇敢果断，积极进取，有领导力
 *   卯(木) — 温和善良，心思细腻，善交际
 *   辰(土) — 胸怀大志，气度不凡，精力充沛
 *   巳(火) — 深谋远虑，智慧过人，神秘
 *   午(火) — 热情奔放，积极乐观，光明磊落
 *   未(土) — 文雅细腻，艺术天赋，富同情心
 *   申(金) — 聪敏变通，幽默风趣，善于表达
 *   酉(金) — 严谨自律，观察力强，追求完美
 *   戌(土) — 忠厚老实，责任感强，重义气
 *   亥(水) — 温和包容，心地善良，随和
 *
 * 每题选项映射到 4 个时辰组，累计得分最高的时辰作为推测结果。
 */

export interface QuizOption {
  id: number;
  text: string;
  branchIndices: number[]; // 指向 0-11 (子丑寅卯辰巳午未申酉戌亥)
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: QuizOption[];
}

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 0,
    question: '遇到难题时，你通常的第一反应是？',
    options: [
      { id: 0, text: '冷静分析，寻找规律',                         branchIndices: [0, 7, 9] },  // 子巳酉
      { id: 1, text: '发挥创意，另辟蹊径',                         branchIndices: [3, 6, 8] },  // 卯午申
      { id: 2, text: '主动出击，立即行动',                         branchIndices: [2, 4, 11] }, // 寅辰亥
      { id: 3, text: '有条不紊，按部就班',                         branchIndices: [1, 5, 10] }, // 丑未戌
    ],
  },
  {
    id: 1,
    question: '朋友最常怎么形容你？',
    options: [
      { id: 0, text: '温暖贴心，善解人意',                         branchIndices: [3, 6, 11] }, // 卯午亥
      { id: 1, text: '坚守原则，有底线',                           branchIndices: [1, 5, 10] }, // 丑未戌
      { id: 2, text: '踏实稳重，值得信赖',                         branchIndices: [0, 4, 9] },  // 子辰酉
      { id: 3, text: '积极进取，有冲劲',                           branchIndices: [2, 7, 8] },  // 寅巳申
    ],
  },
  {
    id: 2,
    question: '你更喜欢哪种生活方式？',
    options: [
      { id: 0, text: '冒险探索，不断尝试新事物',                   branchIndices: [2, 8, 11] }, // 寅申亥
      { id: 1, text: '社交聚会，和朋友一起',                       branchIndices: [3, 6, 9] },  // 卯午酉
      { id: 2, text: '灵活自由，随遇而安',                         branchIndices: [0, 4, 7] },  // 子辰巳
      { id: 3, text: '安静独处，深度思考',                         branchIndices: [1, 5, 10] }, // 丑未戌
    ],
  },
  {
    id: 3,
    question: '做决定时你更依赖什么？',
    options: [
      { id: 0, text: '追求完美，反复权衡',                         branchIndices: [1, 7, 9] },  // 丑巳酉
      { id: 1, text: '内心平静，听从直觉',                         branchIndices: [0, 3, 11] }, // 子卯亥
      { id: 2, text: '热爱自由，不受束缚',                         branchIndices: [2, 6, 8] },  // 寅午申
      { id: 3, text: '热情驱动，跟随感觉',                         branchIndices: [4, 5, 10] }, // 辰未戌
    ],
  },
  {
    id: 4,
    question: '你最大的优势是什么？',
    options: [
      { id: 0, text: '善于领导，统筹全局',                         branchIndices: [2, 4, 6] },  // 寅辰午
      { id: 1, text: '善于倾听，共情力强',                         branchIndices: [3, 7, 11] }, // 卯巳亥
      { id: 2, text: '忠诚可靠，说到做到',                         branchIndices: [1, 9, 10] }, // 丑酉戌
      { id: 3, text: '务实落地，执行力强',                         branchIndices: [0, 5, 8] },  // 子未申
    ],
  },
];

const HOUR_LABELS = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

const BRANCH_FIVE_ELEMENTS: Record<string, string> = {
  子: '水', 亥: '水',
  寅: '木', 卯: '木',
  巳: '火', 午: '火',
  申: '金', 酉: '金',
  丑: '土', 辰: '土', 未: '土', 戌: '土',
};

export function computeGuessedHour(
  answers: Array<{ questionId: number; optionId: number }>,
  _knownBranch?: number | null,
) {
  const scores = new Array(12).fill(0);

  for (const { questionId, optionId } of answers) {
    const q = QUIZ_QUESTIONS[questionId];
    if (!q) continue;
    const opt = q.options[optionId];
    if (!opt) continue;
    for (const idx of opt.branchIndices) {
      scores[idx] += 1;
    }
  }

  // 如果用户指定了某种线索（例如已知五行偏好），可加权调整
  // 目前仅基于题目得分

  const total = scores.reduce((a, b) => a + b, 0);

  const sorted = scores
    .map((s, i) => {
      const label = HOUR_LABELS[i] ?? '';
      const element = BRANCH_FIVE_ELEMENTS[label] ?? '';
      return {
        hour: i * 2,
        label,
        element,
        confidence: total > 0 ? Math.round((s / total) * 100) : 0,
      };
    })
    .sort((a, b) => b.confidence - a.confidence);

  return sorted[0]!;
}
