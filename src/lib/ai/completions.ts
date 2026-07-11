import { getEnv } from '@/lib/env';
import { buildPersonalityTagsPrompt, buildFullReportPrompt, buildComparisonPrompt } from '@/lib/prompts/templates';
import { generateJsonWithFallback } from './provider';
import { mockPersonalityTags, mockFullReport, mockComparison } from './mock';
import { computeAnalysis } from './bazi-logic';
import type { PersonalityTags, FullReport, ComparisonResult } from '@/lib/types';
import type { AICompletionOptions } from './client';
import { sha256 } from '@/lib/utils';

function computeSeed(baziData: Record<string, unknown>): number {
  const raw = JSON.stringify(baziData);
  const hash = sha256(raw);
  return parseInt(hash.substring(0, 8), 16);
}

export async function generatePersonalityTags(
  baziData: Record<string, unknown>,
  options: AICompletionOptions = {},
): Promise<{ data: PersonalityTags | null; provider: string; latencyMs: number }> {
  const { features } = getEnv();
  const dayMaster = (baziData.dayMaster as string) ?? '';

  if (features.enableMock) {
    if (!dayMaster) return { data: null, provider: 'mock', latencyMs: 0 };
    const data = mockPersonalityTags(dayMaster);
    return { data, provider: 'mock', latencyMs: 0 };
  }

  const analysis = computeAnalysis(baziData);
  const result = await generateJsonWithFallback<PersonalityTags>(
    () => [
      { role: 'system', content: '你是一位精通子平八字命理的现代人格分析师。请严格按照要求的 JSON 格式输出。' },
      { role: 'user', content: buildPersonalityTagsPrompt(baziData, analysis) },
    ],
    'personality_tags',
    { ...options, seed: computeSeed(baziData) },
  );

  return { data: result.data, provider: result.provider, model: result.model, latencyMs: result.latencyMs };
}

export async function generateFullReport(
  baziData: Record<string, unknown>,
  options: AICompletionOptions = {},
): Promise<{ data: FullReport | null; provider: string; model: string; latencyMs: number }> {
  const { features } = getEnv();
  const dayMaster = (baziData.dayMaster as string) ?? '';

  if (features.enableMock) {
    if (!dayMaster) return { data: null, provider: 'mock', model: 'mock', latencyMs: 0 };
    const data = mockFullReport(dayMaster);
    return { data, provider: 'mock', model: 'mock', latencyMs: 0 };
  }

  const analysis = computeAnalysis(baziData);
  const result = await generateJsonWithFallback<FullReport>(
    () => [
      { role: 'system', content: '你是资深命理分析师，30 年咨询经验。请严格按照要求的 10 章节 JSON 格式输出。' },
      { role: 'user', content: buildFullReportPrompt(baziData, analysis) },
    ],
    'full_report',
    { ...options, seed: computeSeed(baziData) },
  );

  return { data: result.data, provider: result.provider, model: result.model, latencyMs: result.latencyMs };
}

export async function generateComparison(
  userABazi: Record<string, unknown>,
  userBBazi: Record<string, unknown>,
  options: AICompletionOptions = {},
): Promise<{ data: ComparisonResult | null; provider: string; model: string; latencyMs: number }> {
  const { features } = getEnv();

  if (features.enableMock) {
    const data = mockComparison();
    return { data, provider: 'mock', model: 'mock', latencyMs: 0 };
  }

  const combined = { ...userABazi, _partner: userBBazi };
  const result = await generateJsonWithFallback<ComparisonResult>(
    () => [
      { role: 'system', content: '你是精通八字合盘的关系分析师。请严格按照要求的 JSON 格式输出。' },
      { role: 'user', content: buildComparisonPrompt(userABazi, userBBazi) },
    ],
    'comparison',
    { ...options, seed: computeSeed(combined) },
  );

  return { data: result.data, provider: result.provider, latencyMs: result.latencyMs };
}
