import { getEnv } from '@/lib/env';
import { buildPersonalityTagsPrompt, buildFullReportPrompt, buildComparisonPrompt } from '@/lib/prompts/templates';
import { generateJsonWithFallback } from './provider';
import { mockPersonalityTags, mockFullReport, mockComparison } from './mock';
import type { PersonalityTags, FullReport, ComparisonResult } from '@/lib/types';
import type { AICompletionOptions } from './client';

export async function generatePersonalityTags(
  baziData: Record<string, unknown>,
  options: AICompletionOptions = {},
): Promise<{ data: PersonalityTags | null; provider: string; latencyMs: number }> {
  const { features } = getEnv();
  const dayMaster = (baziData.dayMaster as string) ?? '甲木';

  if (features.enableMock) {
    const data = mockPersonalityTags(dayMaster);
    return { data, provider: 'mock', latencyMs: 0 };
  }

  const result = await generateJsonWithFallback<PersonalityTags>(
    () => [
      { role: 'system', content: '你是一位精通子平八字命理的现代人格分析师。请严格按照要求的 JSON 格式输出。' },
      { role: 'user', content: buildPersonalityTagsPrompt(baziData) },
    ],
    'personality_tags',
    options,
  );

  return { data: result.data, provider: result.provider, latencyMs: result.latencyMs };
}

export async function generateFullReport(
  baziData: Record<string, unknown>,
  options: AICompletionOptions = {},
): Promise<{ data: FullReport | null; provider: string; latencyMs: number }> {
  const { features } = getEnv();
  const dayMaster = (baziData.dayMaster as string) ?? '甲木';

  if (features.enableMock) {
    const data = mockFullReport(dayMaster);
    return { data, provider: 'mock', latencyMs: 0 };
  }

  const result = await generateJsonWithFallback<FullReport>(
    () => [
      { role: 'system', content: '你是资深命理人格分析师，30 年咨询经验。请严格按照要求的 10 章节 JSON 格式输出。' },
      { role: 'user', content: buildFullReportPrompt(baziData) },
    ],
    'full_report',
    options,
  );

  return { data: result.data, provider: result.provider, latencyMs: result.latencyMs };
}

export async function generateComparison(
  userABazi: Record<string, unknown>,
  userBBazi: Record<string, unknown>,
  options: AICompletionOptions = {},
): Promise<{ data: ComparisonResult | null; provider: string; latencyMs: number }> {
  const { features } = getEnv();

  if (features.enableMock) {
    const data = mockComparison();
    return { data, provider: 'mock', latencyMs: 0 };
  }

  const result = await generateJsonWithFallback<ComparisonResult>(
    () => [
      { role: 'system', content: '你是精通八字合盘的关系分析师。请严格按照要求的 JSON 格式输出。' },
      { role: 'user', content: buildComparisonPrompt(userABazi, userBBazi) },
    ],
    'comparison',
    options,
  );

  return { data: result.data, provider: result.provider, latencyMs: result.latencyMs };
}
