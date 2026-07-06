import { getEnv } from '@/lib/env';
import { parseJsonFromAI } from './client';
import type { AICompletionOptions } from './client';

export type GenerationType = 'personality_tags' | 'full_report' | 'comparison';

export interface GenerationResult<T> {
  data: T | null;
  provider: string;
  model: string;
  latencyMs: number;
}

function validateAIOutput(type: GenerationType, data: unknown): string[] {
  const errors: string[] = [];
  if (!data || typeof data !== 'object') {
    errors.push('输出不是有效的 JSON 对象');
    return errors;
  }
  const d = data as Record<string, unknown>;
  switch (type) {
    case 'personality_tags': {
      if (!Array.isArray(d.personality_tags) || d.personality_tags.length === 0) errors.push('personality_tags 必须是非空数组');
      if (!Array.isArray(d.core_traits) || d.core_traits.length === 0) errors.push('core_traits 必须是非空数组');
      if (typeof d.life_theme !== 'string' || !d.life_theme) errors.push('life_theme 必须是非空字符串');
      if (typeof d.five_elements_summary !== 'string' || !d.five_elements_summary) errors.push('five_elements_summary 必须是非空字符串');
      break;
    }
    case 'full_report': {
      const required = ['cover', 'personality', 'career', 'relationships', 'health', 'current_year', 'decade_trend', 'self_improvement', 'glossary', 'footer'];
      for (const key of required) {
        if (!d[key] || typeof d[key] !== 'object') errors.push(`${key} 字段缺失或格式不正确`);
      }
      break;
    }
    case 'comparison': {
      if (typeof d.overall_match !== 'number') errors.push('overall_match 必须是数字');
      if (!d.dimensions || typeof d.dimensions !== 'object') errors.push('dimensions 格式不正确');
      if (typeof d.complementarity !== 'string' || !d.complementarity) errors.push('complementarity 必须是非空字符串');
      if (!Array.isArray(d.strengths)) errors.push('strengths 必须是数组');
      break;
    }
  }
  return errors;
}

function tryStringify(data: unknown): string {
  try { return JSON.stringify(data, null, 2); } catch { return String(data); }
}

export async function generateJsonWithFallback<T>(
  buildMessages: () => Array<{ role: string; content: string }>,
  type: GenerationType,
  options: AICompletionOptions = {},
): Promise<GenerationResult<T>> {
  const { ai } = getEnv();
  const start = Date.now();

  if (options.model?.startsWith('deepseek')) {
    if (!ai.deepseekApiKey && ai.openaiApiKey) {
      options = { ...options, model: ai.openaiModel as never };
    }
  } else if (options.model?.startsWith('gpt')) {
    if (!ai.openaiApiKey && ai.deepseekApiKey) {
      options = { ...options, model: ai.deepseekModel as never };
    }
  }

  const messages = buildMessages();
  let data = await parseJsonFromAI<T>(messages as never, options);

  // Validate, retry once on schema mismatch
  if (data !== null) {
    const errors = validateAIOutput(type, data);
    if (errors.length > 0) {
      const retryMessages = [
        ...messages,
        { role: 'assistant', content: tryStringify(data) },
        { role: 'user', content: `输出格式有误：${errors.join('；')}\n请重新生成，严格遵循要求的格式。` },
      ];
      data = await parseJsonFromAI<T>(retryMessages as never, options);
    }
  }

  const provider = data !== null
    ? (options.model?.startsWith('deepseek') ? 'deepseek' : 'openai')
    : 'none';

  return {
    data,
    provider,
    model: options.model ?? ai.openaiModel,
    latencyMs: Date.now() - start,
  };
}
