import OpenAI from 'openai';
import { getEnv } from '@/lib/env';
import { Logger } from '@/lib/logger';
import { checkCircuit, recordSuccess, recordFailure } from '@/lib/circuit';
import { traceAsync, createTraceContext, createChildSpan } from '@/lib/trace';
import type { TraceContext } from '@/lib/trace';

export type AIModel = 'gpt-4o' | 'gpt-4o-mini' | 'deepseek-chat' | 'deepseek-reasoner' | 'deepseek-v4-pro' | 'deepseek-v4-flash';

export interface AICompletionOptions {
  model?: AIModel;
  temperature?: number;
  maxTokens?: number;
  timeout?: number;
  trace?: TraceContext;
  seed?: number;
  apiKey?: string;
  baseUrl?: string;
}

export interface AIProvider {
  name: 'openai' | 'deepseek';
  client: OpenAI;
  defaultModel: AIModel;
}

const MODEL_BASE_URLS: Record<string, string> = {
  'gpt-4o': 'https://api.openai.com/v1',
  'gpt-4o-mini': 'https://api.openai.com/v1',
  'deepseek-chat': 'https://api.deepseek.com/v1',
  'deepseek-reasoner': 'https://api.deepseek.com/v1',
  'deepseek-v4-pro': 'https://api.deepseek.com/v1',
  'deepseek-v4-flash': 'https://api.deepseek.com/v1',
};

function getBaseUrlForModel(model?: string): string {
  if (model && MODEL_BASE_URLS[model]) return MODEL_BASE_URLS[model];
  return 'https://api.deepseek.com/v1';
}

let openaiClient: OpenAI | null = null;
let deepseekClient: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    const { ai } = getEnv();
    openaiClient = new OpenAI({
      apiKey: ai.openaiApiKey,
      timeout: 60000,
      maxRetries: 0,
    });
  }
  return openaiClient;
}

function getDeepSeekClient(): OpenAI {
  if (!deepseekClient) {
    const { ai } = getEnv();
    deepseekClient = new OpenAI({
      apiKey: ai.deepseekApiKey,
      baseURL: 'https://api.deepseek.com/v1',
      timeout: 60000,
      maxRetries: 0,
    });
  }
  return deepseekClient;
}

export function getActiveProviders(): AIProvider[] {
  const { ai } = getEnv();
  const providers: AIProvider[] = [];

  if (ai.openaiApiKey) {
    providers.push({ name: 'openai', client: getOpenAIClient(), defaultModel: ai.openaiModel as AIModel });
  }
  if (ai.deepseekApiKey) {
    providers.push({ name: 'deepseek', client: getDeepSeekClient(), defaultModel: ai.deepseekModel as AIModel });
  }

  return providers;
}

export async function chatCompletion(
  messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[],
  options: AICompletionOptions = {},
): Promise<string | null> {
  const trace = options.trace ?? createTraceContext();
  const model = options.model;

  // Custom user-provided key/URL (from admin settings page)
  const customBaseUrl = options.baseUrl || getBaseUrlForModel(options.model);
  if (options.apiKey && customBaseUrl) {
    const customClient = new OpenAI({
      apiKey: options.apiKey,
      baseURL: customBaseUrl,
      timeout: options.timeout ?? 60000,
      maxRetries: 0,
    });
      const childTrace = createChildSpan(trace);
      const result = await traceAsync(childTrace, 'ai.chat.custom', async () => {
        const response = await customClient.chat.completions.create({
          model: model ?? 'deepseek-chat',
          messages,
          temperature: options.temperature ?? 0,
          max_tokens: options.maxTokens ?? 4096,
          ...(options.seed !== undefined ? { seed: options.seed } : {}),
        });
        const content = response.choices[0]?.message?.content;
        if (!content) throw new Error('Empty AI response');
        return content;
      });
      return result;
  }

  const providers = getActiveProviders();
  if (providers.length === 0) throw new Error('未配置 API Key，请在设置页配置 AI 模型');

  for (const provider of providers) {
    const circuitKey = provider.name === 'openai' ? 'gpt-api' : 'deepseek-api';
    if (!checkCircuit(circuitKey)) continue;

    const m = model ?? provider.defaultModel;
    const childTrace = createChildSpan(trace);

    try {
      const result = await traceAsync(childTrace, `ai.chat.${provider.name}`, async () => {
        const response = await provider.client.chat.completions.create({
          model: m,
          messages,
          temperature: options.temperature ?? 0,
          max_tokens: options.maxTokens ?? 4096,
          ...(options.seed !== undefined ? { seed: options.seed } : {}),
        });

        const content = response.choices[0]?.message?.content;
        if (!content) throw new Error('Empty AI response');
        return content;
      });

      recordSuccess(circuitKey);
      return result;
    } catch (err) {
      recordFailure(circuitKey);
      const errorMsg = err instanceof Error ? err.message : String(err);
      const aiLog = options.trace ? Logger.for('ai', options.trace) : Logger.for('ai');
      aiLog.error(`${provider.name} failed`, { error: errorMsg });
      continue;
    }
  }

  return null;
}

export async function parseJsonFromAI<T>(
  messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[],
  options: AICompletionOptions = {},
): Promise<T | null> {
  const content = await chatCompletion(
    [
      ...messages,
      { role: 'user', content: '请严格按照要求的 JSON 格式输出，不要包含任何其他文字。' },
    ],
    options,
  );

  if (!content) return null;

  try {
    const cleaned = content
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();
    return JSON.parse(cleaned) as T;
  } catch {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]) as T;
      } catch {
        return null;
      }
    }
    return null;
  }
}
