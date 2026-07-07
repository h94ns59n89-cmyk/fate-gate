const BRANCH_ELEMENT: Record<string, string> = {
  子: 'water', 丑: 'earth', 寅: 'wood', 卯: 'wood',
  辰: 'earth', 巳: 'fire', 午: 'fire', 未: 'earth',
  申: 'metal', 酉: 'metal', 戌: 'earth', 亥: 'water',
};

const BRANCH_HIDDEN: Record<string, string[]> = {
  子: ['癸'], 丑: ['己', '癸', '辛'], 寅: ['甲', '丙', '戊'],
  卯: ['乙'], 辰: ['戊', '乙', '癸'], 巳: ['丙', '庚', '戊'],
  午: ['丁', '己'], 未: ['己', '丁', '乙'], 申: ['庚', '壬', '戊'],
  酉: ['辛'], 戌: ['戊', '辛', '丁'], 亥: ['壬', '甲'],
};

const WINTER_MONTHS = ['亥', '子', '丑'];
const SUMMER_MONTHS = ['巳', '午', '未'];
const SPRING_MONTHS = ['寅', '卯', '辰'];
const AUTUMN_MONTHS = ['申', '酉', '戌'];

// Strong roots (禄=临官, 刃=帝旺) → +2; Weak roots (长生, 余气/墓) → +1
const ROOTS_STRONG: Record<string, string[]> = {
  甲: ['寅', '卯'], 乙: ['卯', '寅'],
  丙: ['巳', '午'], 丁: ['午', '巳'],
  戊: ['巳', '午'], 己: ['午', '巳'],
  庚: ['申', '酉'], 辛: ['酉', '申'],
  壬: ['亥', '子'], 癸: ['子', '亥'],
};

const ROOTS_WEAK: Record<string, string[]> = {
  甲: ['亥', '辰'], 乙: ['午', '辰'],
  丙: ['寅'],      丁: ['酉', '未'],
  戊: ['辰', '未', '戌'], 己: ['未', '戌', '辰'],
  庚: ['巳', '戌'], 辛: ['子', '戌'],
  壬: ['申', '丑'], 癸: ['卯', '丑'],
};

const HEAVENLY_ELEMENT: Record<string, string> = {
  甲: 'wood', 乙: 'wood', 丙: 'fire', 丁: 'fire',
  戊: 'earth', 己: 'earth', 庚: 'metal', 辛: 'metal',
  壬: 'water', 癸: 'water',
};

const GENERATES: Record<string, string> = {
  wood: 'fire', fire: 'earth', earth: 'metal', metal: 'water', water: 'wood',
};

const CONTROLS: Record<string, string> = {
  wood: 'earth', fire: 'metal', earth: 'water', metal: 'wood', water: 'fire',
};

function getElement(dayMaster: string): string {
  return HEAVENLY_ELEMENT[dayMaster.charAt(0)] ?? '';
}

function getMonthBranch(pillars: Record<string, unknown>): string {
  const mp = pillars.month_pillar as Record<string, unknown> | undefined;
  return (mp?.earthly as string) ?? '';
}

function hasElementInChart(pillars: Record<string, unknown>, elementChars: string[]): boolean {
  const all: string[] = [
    (pillars.year_pillar as Record<string, unknown>)?.heavenly as string,
    (pillars.month_pillar as Record<string, unknown>)?.heavenly as string,
    (pillars.day_pillar as Record<string, unknown>)?.heavenly as string,
    (pillars.hour_pillar as Record<string, unknown>)?.heavenly as string,
  ];
  for (const b of ['year_pillar', 'month_pillar', 'day_pillar', 'hour_pillar']) {
    const p = pillars[b] as Record<string, unknown> | undefined;
    const earthly = (p?.earthly as string) ?? '';
    const hidden = BRANCH_HIDDEN[earthly];
    if (hidden) all.push(...hidden);
  }
  return elementChars.some(c => all.includes(c));
}

function getScore(fiveElements: Record<string, unknown>, element: string): number {
  const el = fiveElements[element] as Record<string, unknown> | undefined;
  return (el?.score as number) ?? 0;
}

function getRelationship(me: string, other: string): '同我' | '生我' | '我生' | '克我' | '我克' | '' {
  if (me === other) return '同我';
  if (GENERATES[other] === me) return '生我';
  if (GENERATES[me] === other) return '我生';
  if (CONTROLS[other] === me) return '克我';
  if (CONTROLS[me] === other) return '我克';
  return '';
}

function getTotalHiddenCount(pillars: Record<string, unknown>, element: string): number {
  let count = 0;
  for (const b of ['year_pillar', 'month_pillar', 'day_pillar', 'hour_pillar']) {
    const p = pillars[b] as Record<string, unknown> | undefined;
    const earthly = (p?.earthly as string) ?? '';
    const hidden = BRANCH_HIDDEN[earthly];
    if (hidden) {
      for (const stem of hidden) {
        if (HEAVENLY_ELEMENT[stem] === element) count++;
      }
    }
  }
  return count;
}

export interface BaziAnalysis {
  wang_shuai: '身强' | '身弱' | '中和';
  yong_shen: string;
  ji_shen: string;
  reasoning: string;
}

export function computeAnalysis(baziData: Record<string, unknown>): BaziAnalysis {
  const dayMaster = (baziData.dayMaster as string) ?? '';
  const pillars = (baziData.pillars as Record<string, unknown>) ?? {};
  const fiveElements = (baziData.fiveElements as Record<string, unknown>) ?? {};

  const dm = dayMaster[0] || '';
  const monthBranch = getMonthBranch(pillars);

  const fireScore = getScore(fiveElements, 'fire');
  const earthScore = getScore(fiveElements, 'earth');
  const metalScore = getScore(fiveElements, 'metal');
  const waterScore = getScore(fiveElements, 'water');
  const woodScore = getScore(fiveElements, 'wood');

  const me = getElement(dayMaster);
  const mbElement = BRANCH_ELEMENT[monthBranch] || '';

  // --- 旺衰判断 ---
  let wangScore = 0;

  // 得令: 月令对日主的力量
  const monthRel = getRelationship(me, mbElement);
  if (monthRel === '同我') wangScore += 3;
  else if (monthRel === '生我') wangScore += 2;
  else if (monthRel === '克我') wangScore -= 2;
  else if (monthRel === '我克') wangScore -= 1;
  else if (monthRel === '我生') wangScore -= 1;

  // 根气: strong +2, weak +1
  for (const b of ['year_pillar', 'month_pillar', 'day_pillar', 'hour_pillar']) {
    const p = pillars[b] as Record<string, unknown> | undefined;
    const earthly = (p?.earthly as string) ?? '';
    if ((ROOTS_STRONG[dm] || []).includes(earthly)) wangScore += 2;
    else if ((ROOTS_WEAK[dm] || []).includes(earthly)) wangScore += 1;
  }

  // 天干: proper relationship-based scoring
  for (const b of ['year_pillar', 'month_pillar', 'hour_pillar']) {
    const p = pillars[b] as Record<string, unknown> | undefined;
    const h = (p?.heavenly as string) ?? '';
    const he = HEAVENLY_ELEMENT[h] || '';
    if (!he) continue;
    const rel = getRelationship(me, he);
    if (rel === '同我') wangScore += 1;
    else if (rel === '生我') wangScore += 1;
    else wangScore -= 1;
  }

  // 泄身修正: 我生 element 过旺会泄身
  const childElement = GENERATES[me];
  if (childElement) {
    const childScore = getScore(fiveElements, childElement);
    if (childScore >= 3) {
      const hiddenChild = getTotalHiddenCount(pillars, childElement);
      const drainPenalty = Math.floor((childScore + hiddenChild) / 3);
      wangScore -= drainPenalty;
    }
  }

  const wang_shuai = wangScore >= 2 ? '身强' : wangScore <= -2 ? '身弱' : '中和';

  // --- 从格检测 (极端分布) ---
  const totalScore = woodScore + fireScore + earthScore + metalScore + waterScore;
  if (totalScore > 0) {
    const maxScore = Math.max(woodScore, fireScore, earthScore, metalScore, waterScore);
    const maxRatio = maxScore / totalScore;
    // 单一五行占比≥70% 且日主不是该五行
    if (maxRatio >= 0.7 && !(
      (me === 'wood' && woodScore === maxScore) ||
      (me === 'fire' && fireScore === maxScore) ||
      (me === 'earth' && earthScore === maxScore) ||
      (me === 'metal' && metalScore === maxScore) ||
      (me === 'water' && waterScore === maxScore)
    )) {
      let dominant = '';
      if (woodScore === maxScore) dominant = '木';
      else if (fireScore === maxScore) dominant = '火';
      else if (earthScore === maxScore) dominant = '土';
      else if (metalScore === maxScore) dominant = '金';
      else if (waterScore === maxScore) dominant = '水';

      // 从格: 按旺势方向取用神
      if ((me === 'wood' && dominant === 'fire') ||
          (me === 'fire' && dominant === 'earth') ||
          (me === 'earth' && dominant === 'metal') ||
          (me === 'metal' && dominant === 'water') ||
          (me === 'water' && dominant === 'wood')) {
        // 从儿格 (我生者旺)
        return { wang_shuai: '身弱', yong_shen: dominant, ji_shen: me, reasoning: `从儿格成立：${dominant}占比${Math.round(maxRatio * 100)}%，日主从其旺势。用神=${dominant}，忌神=${me}。` };
      }
      // 从官杀/从财
      return { wang_shuai: '身弱', yong_shen: dominant, ji_shen: me, reasoning: `疑似从格：${dominant}占比${Math.round(maxRatio * 100)}%，日主被严重压制。用神=${dominant}（顺其势），忌神=${me}（帮扶反逆势）。` };
    }
  }

  // --- 病药检查 ---
  let byResult: { yong: string; ji: string; reason: string } | null = null;

  if (me === 'fire' && fireScore >= 3 && earthScore >= 3 && (monthBranch === '丑' || monthBranch === '辰')) {
    byResult = { yong: '木', ji: '土', reason: `土晦火成立：火得分${fireScore}、土得分${earthScore}、月令${monthBranch}湿土，土在盖住火的光芒，非正常泄气。用木制土疏晦。` };
  }

  if (!byResult && me === 'metal' && earthScore >= 3 && metalScore <= 1) {
    byResult = { yong: '木', ji: '土', reason: `土埋金成立：土得分${earthScore}偏旺而金得分${metalScore}弱，土把金埋住了。用木疏土。` };
  }

  if (!byResult && me === 'metal' && fireScore >= 4 && metalScore <= 1) {
    byResult = { yong: '水', ji: '火', reason: `火克金成立：火得分${fireScore}过旺而金得分${metalScore}极弱，火在熔金。用水制火。` };
  }

  if (!byResult && waterScore >= 4 && (woodScore <= 1 || fireScore <= 1)) {
    byResult = { yong: '土', ji: '水', reason: `水为病：水得分${waterScore}过旺，漂木/灭火。用土止水。` };
  }

  if (!byResult && me === 'wood' && metalScore >= 3 && woodScore <= 1) {
    byResult = { yong: '火', ji: '金', reason: `金伐木成立：金得分${metalScore}旺而木得分${woodScore}弱，金在伐木。用火克金。` };
  }

  if (!byResult && me === 'earth' && woodScore >= 4 && earthScore <= 1) {
    byResult = { yong: '金', ji: '木', reason: `木塞土成立：木得分${woodScore}过旺而土得分${earthScore}弱，木把土撑裂了。用金伐木。` };
  }

  if (byResult) {
    return { wang_shuai, yong_shen: byResult.yong, ji_shen: byResult.ji, reasoning: byResult.reason };
  }

  // --- 调候检查 ---
  let thResult: { yong: string; ji: string; reason: string } | null = null;

  if (SUMMER_MONTHS.includes(monthBranch)) {
    const hasWater = hasElementInChart(pillars, ['壬', '癸', '子', '亥']);
    if (!hasWater) {
      thResult = { yong: '水', ji: '火', reason: `生于${monthBranch}月夏季，八字中无水，调候缺失。用水降温润局。` };
    }
  }

  if (!thResult && WINTER_MONTHS.includes(monthBranch)) {
    const hasFire = hasElementInChart(pillars, ['丙', '丁', '巳', '午', '戌', '未']);
    if (!hasFire) {
      thResult = { yong: '火', ji: '水', reason: `生于${monthBranch}月冬季，八字中无火，调候缺失。用火暖局。` };
    }
  }

  if (!thResult && SPRING_MONTHS.includes(monthBranch)) {
    const hasFire = hasElementInChart(pillars, ['丙', '丁', '巳', '午']);
    if (!hasFire) {
      thResult = { yong: '火', ji: '水', reason: `生于${monthBranch}月春季，余寒未退，八字中缺火暖局。` };
    }
  }

  if (!thResult && AUTUMN_MONTHS.includes(monthBranch)) {
    const hasWater = hasElementInChart(pillars, ['壬', '癸', '子', '亥']);
    if (!hasWater) {
      thResult = { yong: '水', ji: '火', reason: `生于${monthBranch}月秋季，金燥气盛，八字中缺水润局。` };
    }
  }

  if (thResult) {
    return { wang_shuai, yong_shen: thResult.yong, ji_shen: thResult.ji, reasoning: thResult.reason };
  }

  // --- 扶抑（兜底） ---
  let fyYong = '';
  let fyJi = '';

  if (wang_shuai === '身强') {
    // 克泄耗: 优先选在八字中有实际存在的元素(score>0)
    const candidates = [
      { el: '金', score: metalScore },
      { el: '水', score: waterScore },
      { el: '土', score: earthScore },
    ].filter(c => c.score < 3 && c.score > 0);
    if (candidates.length > 0) {
      candidates.sort((a, b) => a.score - b.score);
      fyYong = candidates[0]!.el;
      fyJi = me === 'fire' ? '木火' : me === 'water' ? '金水' : me === 'wood' ? '水火' : me === 'metal' ? '土金' : '火土';
    } else {
      // 没有合适的克泄耗→可能中和或取最弱
      const fallback = [
        { el: '金', score: metalScore },
        { el: '水', score: waterScore },
        { el: '土', score: earthScore },
      ].sort((a, b) => a.score - b.score);
      fyYong = fallback[0]?.el || '金';
      fyJi = me === 'fire' ? '木火' : me === 'water' ? '金水' : me === 'wood' ? '水火' : me === 'metal' ? '土金' : '火土';
    }
  } else if (wang_shuai === '身弱') {
    const parentElement = Object.keys(GENERATES).find(k => GENERATES[k] === me) || '';
    const parentScore = parentElement ? getScore(fiveElements, parentElement) : 0;
    const selfScore = getScore(fiveElements, me);
    const parentLabel = parentElement ? { wood: '木', fire: '火', earth: '土', metal: '金', water: '水' }[parentElement] || '' : '';
    const selfLabel = { wood: '木', fire: '火', earth: '土', metal: '金', water: '水' }[me] || '';
    const candidates = [
      { el: parentLabel, score: parentScore },
      { el: selfLabel, score: selfScore },
    ].filter(c => c.el && c.score < 3);
    if (candidates.length > 0) {
      candidates.sort((a, b) => a.score - b.score);
      fyYong = candidates[0]!.el;
    } else {
      // 都偏旺则取较弱的
      const fallback = [
        { el: parentLabel, score: parentScore },
        { el: selfLabel, score: selfScore },
      ].filter(c => c.el).sort((a, b) => a.score - b.score);
      fyYong = fallback[0]?.el || parentLabel || '印';
    }
    fyJi = '克泄耗';
  } else {
    fyYong = '中和';
    fyJi = '';
  }

  const fyReason = fyYong === '中和'
    ? '日主中和，无需扶抑。'
    : `日主${wang_shuai}，${wang_shuai === '身强' ? '需要克泄耗' : '需要生扶'}。最弱者为用神。`;

  return { wang_shuai, yong_shen: fyYong, ji_shen: fyJi, reasoning: fyReason };
}
