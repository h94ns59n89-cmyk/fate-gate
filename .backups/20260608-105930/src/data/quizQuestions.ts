export interface QuizOption {
  id: number;
  text: string;
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
      { id: 0, text: '冷静分析，寻找规律' },
      { id: 1, text: '发挥创意，另辟蹊径' },
      { id: 2, text: '主动出击，立即行动' },
      { id: 3, text: '有条不紊，按部就班' },
    ],
  },
  {
    id: 1,
    question: '朋友最常怎么形容你？',
    options: [
      { id: 0, text: '温暖贴心，善解人意' },
      { id: 1, text: '坚守原则，有底线' },
      { id: 2, text: '踏实稳重，值得信赖' },
      { id: 3, text: '积极进取，有冲劲' },
    ],
  },
  {
    id: 2,
    question: '你更喜欢哪种生活方式？',
    options: [
      { id: 0, text: '冒险探索，不断尝试新事物' },
      { id: 1, text: '社交聚会，和朋友一起' },
      { id: 2, text: '灵活自由，随遇而安' },
      { id: 3, text: '安静独处，深度思考' },
    ],
  },
  {
    id: 3,
    question: '做决定时你更依赖什么？',
    options: [
      { id: 0, text: '追求完美，反复权衡' },
      { id: 1, text: '内心平静，听从直觉' },
      { id: 2, text: '热爱自由，不受束缚' },
      { id: 3, text: '热情驱动，跟随感觉' },
    ],
  },
  {
    id: 4,
    question: '你最大的优势是什么？',
    options: [
      { id: 0, text: '善于领导，统筹全局' },
      { id: 1, text: '善于倾听，共情力强' },
      { id: 2, text: '忠诚可靠，说到做到' },
      { id: 3, text: '务实落地，执行力强' },
    ],
  },
];

const HOUR_LABELS = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

export function computeGuessedHour(answers: Array<{ questionId: number; optionId: number }>) {
  const scores = new Array(12).fill(0);

  for (const { questionId, optionId } of answers) {
    const idx = (questionId * 7 + optionId * 3) % 12;
    scores[idx] += 1;
  }

  const total = scores.reduce((a, b) => a + b, 0);

  const sorted = scores
    .map((s, i) => ({
      hour: i * 2,
      label: HOUR_LABELS[i] ?? '',
      confidence: total > 0 ? Math.round((s / total) * 100) : 0,
    }))
    .sort((a, b) => b.confidence - a.confidence);

  return sorted[0]!;
}
