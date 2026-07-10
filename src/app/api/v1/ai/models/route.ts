import { NextResponse } from 'next/server';
import { getEnv } from '@/lib/env';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { baseUrl, apiKey } = body as { baseUrl?: string; apiKey?: string };

    const urls: { name: string; url: string; key: string }[] = [];

    if (baseUrl && apiKey) {
      urls.push({ name: 'user', url: baseUrl.replace(/\/+$/, ''), key: apiKey });
    } else {
      const { ai } = getEnv();
      if (ai.openaiApiKey) {
        urls.push({ name: 'openai', url: 'https://api.openai.com/v1', key: ai.openaiApiKey });
      }
      if (ai.deepseekApiKey) {
        urls.push({ name: 'deepseek', url: 'https://api.deepseek.com/v1', key: ai.deepseekApiKey });
      }
    }

    if (urls.length === 0) {
      return NextResponse.json({ code: 100101, message: '未配置 API Key', data: { models: [] } });
    }

    const allModels = new Set<string>();
    const errors: string[] = [];

    for (const { name, url, key } of urls) {
      try {
        const res = await fetch(`${url}/models`, {
          headers: { Authorization: `Bearer ${key}` },
          signal: AbortSignal.timeout(10000),
        });
        if (!res.ok) {
          errors.push(`${name}: HTTP ${res.status}`);
          continue;
        }
        const json = await res.json() as { data?: { id: string }[] };
        if (json.data) {
          for (const m of json.data) {
            allModels.add(m.id);
          }
        }
      } catch (e) {
        errors.push(`${name}: ${e instanceof Error ? e.message : '请求失败'}`);
      }
    }

    // Probe known-good models that weren't listed (some APIs hide them from /v1/models)
    const knownModels = ['deepseek-chat', 'deepseek-reasoner'];
    for (const { url, key } of urls) {
      for (const m of knownModels) {
        if (allModels.has(m)) continue;
        try {
          const probe = await fetch(`${url}/chat/completions`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${key}`,
            },
            body: JSON.stringify({
              model: m,
              messages: [{ role: 'user', content: 'ping' }],
              max_tokens: 1,
            }),
            signal: AbortSignal.timeout(5000),
          });
          if (probe.ok) allModels.add(m);
        } catch {}
      }
    }

    const sorted = [...allModels].sort();

    return NextResponse.json({
      code: 0,
      message: errors.length > 0 ? `部分来源失败: ${errors.join('; ')}` : 'success',
      data: { models: sorted },
    });

  } catch (e) {
    return NextResponse.json({
      code: 100500,
      message: e instanceof Error ? e.message : '服务器错误',
      data: { models: [] },
    }, { status: 500 });
  }
}
