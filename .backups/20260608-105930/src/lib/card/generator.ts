export interface CardTemplate {
  width: number;
  height: number;
  backgroundColor: string;
  textColor: string;
  accentColor: string;
}

export const SUMMARY_CARD_TEMPLATE: CardTemplate = {
  width: 800,
  height: 1200,
  backgroundColor: 'linear-gradient(135deg, #1A1A2E, #16213E, #0F3460)',
  textColor: '#FFFFFF',
  accentColor: '#D4A853',
};

export const COMPARISON_CARD_TEMPLATE: CardTemplate = {
  width: 800,
  height: 1000,
  backgroundColor: 'linear-gradient(135deg, #1A1A2E, #16213E)',
  textColor: '#FFFFFF',
  accentColor: '#D4A853',
};

export function generateSummaryCardHtml(data: {
  personalityTags: string[];
  matchScore?: number;
  lifeTheme?: string;
}): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/></head>
<body style="margin:0;width:800px;height:1200px;
  background:linear-gradient(135deg,#1A1A2E,#16213E,#0F3460);
  display:flex;flex-direction:column;align-items:center;justify-content:center;
  font-family:sans-serif;color:#fff;padding:40px;box-sizing:border-box;">
  <h1 style="font-size:48px;color:#D4A853;margin-bottom:16px;">你的命理人格</h1>
  ${data.personalityTags
    .map(
      (tag, i) => `
    <div style="font-size:${i === 0 ? '32px' : '24px'};margin-bottom:12px;opacity:${i === 0 ? '1' : '0.8'};">
      ${tag}
    </div>
  `,
    )
    .join('')}
  ${data.matchScore ? `<div style="font-size:72px;color:#D4A853;margin:24px 0;">${data.matchScore}%</div>` : ''}
  ${data.lifeTheme ? `<div style="font-size:20px;opacity:0.7;margin-top:24px;font-style:italic;">${data.lifeTheme}</div>` : ''}
  <div style="position:absolute;bottom:40px;font-size:14px;opacity:0.4;">AI命理人格系统</div>
</body></html>`;
}

export function generateComparisonCardHtml(data: {
  userTag: string;
  targetTag: string;
  matchScore: number;
}): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/></head>
<body style="margin:0;width:800px;height:1000px;
  background:linear-gradient(135deg,#1A1A2E,#16213E);
  display:flex;flex-direction:column;align-items:center;justify-content:center;
  font-family:sans-serif;color:#fff;padding:40px;box-sizing:border-box;">
  <h1 style="font-size:36px;color:#D4A853;margin-bottom:40px;">我与TA的命理人格</h1>
  <div style="display:flex;gap:40px;margin-bottom:32px;">
    <div style="text-align:center;">
      <div style="font-size:24px;margin-bottom:8px;">${data.userTag}</div>
    </div>
    <div style="text-align:center;">
      <div style="font-size:24px;margin-bottom:8px;">${data.targetTag}</div>
    </div>
  </div>
  <div style="font-size:72px;color:#D4A853;margin-bottom:24px;">${data.matchScore}%</div>
  <div style="font-size:18px;opacity:0.7;">匹配度</div>
  <div style="position:absolute;bottom:40px;font-size:14px;opacity:0.4;">AI命理人格系统</div>
</body></html>`;
}
