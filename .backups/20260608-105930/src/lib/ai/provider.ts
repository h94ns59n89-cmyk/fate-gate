import { getEnv } from '@/lib/env';
import { chatCompletion, parseJsonFromAI } from './client';
import type { AICompletionOptions } from './client';

export type GenerationType = 'personality_tags' | 'full_report' | 'comparison';

export interface GenerationResult<T> {
  data: T | null;
  provider: string;
  model: string;
  latencyMs: number;
}

export async function generateWithFallback<T>(
  buildMessages: () => Array<{ role: string; content: string }>,
  parse: (content: string | null) => T | null,
  type: GenerationType,
  options: AICompletionOptions = {},
): Promise<GenerationResult<T>> {
  const { ai } = getEnv();
  const start = Date.now();

  if (options.model?.startsWith('deepseek')) {
    if (!ai.deepseekApiKey) {
      if (ai.openaiApiKey) {
        options = { ...options, model: ai.openaiModel as never };
      } else {
        return { data: null, provider: 'none', model: '', latencyMs: Date.now() - start };
      }
    }
  } else if (options.model?.startsWith('gpt')) {
    if (!ai.openaiApiKey) {
      if (ai.deepseekApiKey) {
        options = { ...options, model: ai.deepseekModel as never };
      } else {
        return { data: null, provider: 'none', model: '', latencyMs: Date.now() - start };
      }
    }
  }

  const messages = buildMessages();
  const content = await chatCompletion(messages as never, options);
  const data = parse(content);

  const provider = content !== null
    ? (options.model?.startsWith('deepseek') ? 'deepseek' : 'openai')
    : 'none';

  return {
    data,
    provider,
    model: options.model ?? ai.openaiModel,
    latencyMs: Date.now() - start,
  };
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
  const data = await parseJsonFromAI<T>(messages as never, options);

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
