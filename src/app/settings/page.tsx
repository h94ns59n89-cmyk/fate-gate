'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Monitor } from 'lucide-react';

interface ElectronAPI {
  readConfig: () => Promise<Config | null>;
  writeConfig: (config: Config) => Promise<boolean>;
}

interface Config {
  provider: string;
  apiKey: string;
  baseUrl: string;
  model: string;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

const PROVIDER_PRESETS: Record<string, { baseUrl: string; models: string[] }> = {
  DeepSeek: { baseUrl: 'https://api.deepseek.com/v1', models: [] },
  OpenAI: { baseUrl: 'https://api.openai.com/v1', models: [] },
};

export default function SettingsPage() {
  const router = useRouter();
  const [config, setConfig] = useState<Config>({
    provider: 'DeepSeek',
    apiKey: '',
    baseUrl: 'https://api.deepseek.com/v1',
    model: 'deepseek-chat',
  });
  const [models, setModels] = useState<string[]>([]);
  const [modelsLoading, setModelsLoading] = useState(false);
  const [modelsError, setModelsError] = useState('');
  const [testing, setTesting] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [testMsg, setTestMsg] = useState('');
  const [saved, setSaved] = useState(false);
  const [isElectron, setIsElectron] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    setIsElectron(typeof window !== 'undefined' && 'electronAPI' in window);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem('admin_auth');
      setIsAdmin(!!raw);
    } catch { setIsAdmin(false); }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const api = window.electronAPI;
    if (api?.readConfig) {
      api.readConfig().then((cfg: Config | null) => {
        if (cfg) setConfig(cfg);
      });
    } else {
      try {
        const raw = localStorage.getItem('ai_config');
        if (raw) setConfig(JSON.parse(raw));
      } catch {}
    }
  }, []);

  const updateConfig = useCallback((patch: Partial<Config>) => {
    setConfig((prev) => {
      const next = { ...prev, ...patch };
      return next;
    });
  }, []);

  const handleProviderChange = useCallback((provider: string) => {
    const preset = PROVIDER_PRESETS[provider];
    setConfig({
      provider,
      apiKey: '',
      baseUrl: preset?.baseUrl ?? '',
      model: '',
    });
    setModels([]);
    setTestStatus('idle');
    setTestMsg('');
  }, []);

  const fetchModels = useCallback(async (baseUrl: string, apiKey: string) => {
    if (!baseUrl || !apiKey) return;
    setModelsLoading(true);
    setModelsError('');
    try {
      const res = await fetch('/api/v1/ai/models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ baseUrl, apiKey }),
      });
      const json = await res.json();
      if (json.code === 0 && json.data?.models?.length > 0) {
        setModels(json.data.models);
        setConfig((prev) => ({ ...prev, model: json.data.models[0] }));
      } else {
        setModelsError(json.message || '获取失败');
      }
    } catch {
      setModelsError('网络错误');
    } finally {
      setModelsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!config.baseUrl || !config.apiKey) return;
    const timer = setTimeout(() => fetchModels(config.baseUrl, config.apiKey), 600);
    return () => clearTimeout(timer);
  }, [config.baseUrl, config.apiKey, fetchModels]);

  const handleTest = useCallback(async () => {
    setTesting(true);
    setTestStatus('idle');
    setTestMsg('');
    try {
      const res = await fetch('/api/v1/ai/models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ baseUrl: config.baseUrl, apiKey: config.apiKey }),
      });
      const json = await res.json();
      if (json.code === 0) {
        setTestStatus('success');
        setTestMsg(`连接成功 · 模型: ${config.model || '—'}`);
      } else {
        setTestStatus('error');
        setTestMsg(json.message || '连接失败');
      }
    } catch {
      setTestStatus('error');
      setTestMsg('网络错误');
    } finally {
      setTesting(false);
    }
  }, [config.baseUrl, config.apiKey, config.model]);

  const handleSave = useCallback(async () => {
    try {
      const api = window.electronAPI;
      if (api?.writeConfig) {
        const ok = await api.writeConfig(config);
        if (!ok) { setTestStatus('error'); setTestMsg('保存失败'); return; }
      } else {
        localStorage.setItem('ai_config', JSON.stringify(config));
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      setTestStatus('error');
      setTestMsg('保存失败');
    }
  }, [config]);

  const isCustom = config.provider === '自定义';

  return (
    <div className="mx-auto max-w-md px-5 py-8">
      <div className="mb-6 flex items-center gap-2">
        <button
          onClick={() => router.back()}
          className="flex h-8 w-8 items-center justify-center rounded-[6px] text-[#6B6778] transition-colors hover:bg-[#F5F0FA] hover:text-[#1F1D2B]"
        >
          <ArrowLeft className="h-[18px] w-[18px]" />
        </button>
        <h1 className="text-[20px] font-semibold text-[#1F1D2B]">设置</h1>
      </div>

      <div className="rounded-[12px] bg-[#FFFFFF] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="mb-4 text-[12px] font-semibold tracking-[0.5px] text-[#6B6778]">
          模型配置
        </div>

        {/* 服务商 */}
        <div className="mb-4">
          <label className="mb-1.5 block text-[12px] text-[#6B6778]">服务商</label>
          <select
            value={config.provider}
            onChange={(e) => handleProviderChange(e.target.value)}
            className="h-10 w-full rounded-[6px] border border-[rgba(0,0,0,0.12)] bg-[#FFFFFF] px-3 text-[13px] text-[#1F1D2B] outline-none transition-colors focus:border-[#9B7FBB]"
          >
            <option value="DeepSeek">DeepSeek</option>
            <option value="OpenAI">OpenAI</option>
            <option value="自定义">自定义</option>
          </select>
        </div>

        {/* API Key */}
        <div className="mb-4">
          <label className="mb-1.5 block text-[12px] text-[#6B6778]">API Key</label>
          <input
            type="password"
            value={config.apiKey}
            onChange={(e) => { updateConfig({ apiKey: e.target.value }); setTestStatus('idle'); setTestMsg(''); }}
            placeholder="sk-xxxxxxxxxxxxxxxx"
            className="h-10 w-full rounded-[6px] border border-[rgba(0,0,0,0.12)] bg-[#FFFFFF] px-3 text-[13px] text-[#1F1D2B] outline-none transition-colors placeholder:text-[#B8B6C0] focus:border-[#9B7FBB]"
          />
        </div>

        {/* 接口地址 */}
        <div className="mb-4">
          <label className="mb-1.5 block text-[12px] text-[#6B6778]">接口地址</label>
          <input
            type="url"
            value={config.baseUrl}
            onChange={(e) => { updateConfig({ baseUrl: e.target.value }); setTestStatus('idle'); setTestMsg(''); }}
            readOnly={!isCustom}
            placeholder="https://api.deepseek.com/v1"
            className={`h-10 w-full rounded-[6px] border border-[rgba(0,0,0,0.12)] bg-[#FFFFFF] px-3 text-[13px] text-[#1F1D2B] outline-none transition-colors placeholder:text-[#B8B6C0] focus:border-[#9B7FBB] ${!isCustom ? 'cursor-not-allowed opacity-50' : ''}`}
          />
          <p className="mt-1 text-[11px] text-[#8A8696]">选中「自定义」服务商时可修改</p>
        </div>

        {/* 模型 */}
        <div className="mb-5">
          <div className="mb-1.5 flex items-center justify-between">
            <label className="text-[12px] text-[#6B6778]">模型</label>
            <button
              onClick={() => fetchModels(config.baseUrl, config.apiKey)}
              disabled={modelsLoading || !config.apiKey}
              className="inline-flex items-center gap-1 text-[11px] text-[#9B7FBB] transition-colors hover:text-[#8A6EAA] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {modelsLoading && (
                <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-[rgba(155,127,187,0.2)] border-t-[#9B7FBB]" />
              )}
              刷新列表
            </button>
          </div>
          <select
            value={config.model}
            onChange={(e) => updateConfig({ model: e.target.value })}
            disabled={models.length === 0}
            className="h-10 w-full rounded-[6px] border border-[rgba(0,0,0,0.12)] bg-[#FFFFFF] px-3 text-[13px] text-[#1F1D2B] outline-none transition-colors focus:border-[#9B7FBB] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {models.length === 0 ? (
              <option value="">{modelsLoading ? '加载中...' : modelsError || '请输入 API Key 后自动获取'}</option>
            ) : (
              models.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))
            )}
          </select>
          {modelsError && (
            <p className="mt-1 text-[11px] text-[#C97A6A]">{modelsError}</p>
          )}
        </div>

        {/* Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleTest}
            disabled={testing || !config.apiKey}
            className="h-9 rounded-[6px] border border-[rgba(0,0,0,0.1)] bg-[#FFFFFF] px-5 text-[12px] font-medium text-[#6B6778] transition-colors hover:bg-[#F8F8FA] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {testing ? '测试中...' : '测试连接'}
          </button>
          <button
            onClick={handleSave}
            disabled={!config.apiKey || !config.model}
            className="h-9 rounded-[6px] border-none bg-[#9B7FBB] px-5 text-[12px] font-medium text-[#FFFFFF] transition-colors hover:bg-[#8A6EAA] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {saved ? '已保存 ✓' : '保存'}
          </button>
        </div>

        {/* Status */}
        {testMsg && (
          <div className={`mt-4 flex items-center gap-2 rounded-[6px] px-3.5 py-2.5 text-[12px] ${
            testStatus === 'success'
              ? 'bg-[rgba(143,207,160,0.1)] text-[#5FAF7A]'
              : testStatus === 'error'
                ? 'bg-[rgba(224,151,138,0.1)] text-[#C97A6A]'
                : 'bg-[#F8F8FA] text-[#8A8696]'
          }`}>
            <span className={`inline-block h-[7px] w-[7px] flex-shrink-0 rounded-full ${
              testStatus === 'success' ? 'bg-[#8FCFA0]' : testStatus === 'error' ? 'bg-[#E0978A]' : 'bg-[#C4C1CE]'
            }`} />
            {testMsg}
          </div>
        )}

        {/* Desktop only hint for web */}
        {!isElectron && (
          <div className="mt-6 rounded-[10px] border border-[rgba(155,127,187,0.12)] bg-[rgba(155,127,187,0.04)] p-4 text-center">
            <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-[rgba(155,127,187,0.08)]">
              <Monitor className="h-5 w-5 text-[#9B7FBB]" />
            </div>
            <p className="text-[13px] leading-relaxed text-[#6B6778]">
              {isAdmin
                ? '配置将应用于管理后台的报告生成'
                : '模型配置仅在桌面版可用，请下载桌面版进行设置'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
