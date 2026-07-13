'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { ReportPageViewer } from '@/components/report/ReportPageViewer';
import type { FullReport } from '@/lib/types';

function renderComparisonHTML(data: Record<string, unknown>): string {
  function esc(s: unknown): string {
    if (typeof s !== 'string') return '';
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function tag(text: string): string {
    return `<span style="display:inline-flex;align-items:center;justify-content:center;border-radius:999px;background:rgba(155,127,187,0.08);padding:2px 10px;font-size:11px;color:#9B7FBB;"><span style="display:inline;line-height:1;">${esc(text)}</span></span>`;
  }
  const dimensions = data.dimensions as Record<string, number> | undefined;
  const strengths = data.strengths as string[] | undefined;
  const potentialConflicts = data.potential_conflicts as string[] | undefined;
  const dimLabels: Record<string, string> = { communication: '沟通', emotional: '情感', values: '价值观', growth: '成长' };

  let html = `<div style="font-family:'Noto Sans SC','PingFang SC','Microsoft YaHei',sans-serif;padding:0;background:#FFFFFF;color:rgba(31,29,43,0.85);max-width:800px;margin:0 auto;">`;

  html += `<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:600px;text-align:center;padding:20px 32px;page-break-inside:avoid;">`;
  html += `<div style="display:flex;align-items:center;gap:8px;margin-bottom:24px;"><div style="width:40px;height:1px;background:linear-gradient(to right,transparent,rgba(155,127,187,0.3));"></div><div style="display:flex;gap:3px;"><div style="width:4px;height:4px;border-radius:999px;background:#9B7FBB;"></div><div style="width:4px;height:4px;border-radius:999px;background:rgba(155,127,187,0.5);"></div><div style="width:4px;height:4px;border-radius:999px;background:rgba(155,127,187,0.2);"></div></div><div style="width:40px;height:1px;background:linear-gradient(to left,transparent,rgba(155,127,187,0.3));"></div></div>`;
  html += `<h1 style="font-size:28px;font-weight:700;margin:0 0 8px 0;color:#1F1D2B;font-family:serif;">合盘报告</h1>`;
  if (data.summary_tag) html += `<span style="display:inline-flex;align-items:center;justify-content:center;border:1px solid rgba(155,127,187,0.25);background:rgba(155,127,187,0.08);border-radius:3px;padding:4px 14px;font-size:12px;color:#9B7FBB;font-weight:500;"><span style="display:inline;line-height:1;">${esc(data.summary_tag as string)}</span></span>`;
  if (data.match_score !== undefined) html += `<div style="margin-top:20px;"><p style="font-size:11px;color:#8A8696;margin:0 0 4px 0;">匹配度</p><p style="font-size:48px;font-weight:700;color:#9B7FBB;margin:0;">${data.match_score}%</p></div>`;
  if (data.generated_at) html += `<p style="margin-top:40px;font-size:10px;color:#8A8696;">生成于 ${new Date(data.generated_at as string).toLocaleDateString('zh-CN')}</p>`;
  html += `</div>`;

  html += `<div style="padding:20px 32px;page-break-inside:avoid;"><div style="display:flex;align-items:center;gap:8px;margin-bottom:14px;border-bottom:1px solid rgba(0,0,0,0.06);padding-bottom:10px;"><span style="color:#6B6778;font-size:12px;font-weight:500;">双方信息</span></div>`;
  html += `<div style="display:flex;align-items:center;justify-content:space-between;padding:12px 16px;background:#F8F8FA;border-radius:4px;">`;
  html += `<div style="text-align:center;"><p style="font-size:14px;font-weight:600;color:#1F1D2B;margin:0 0 6px 0;">${esc(data.user_nickname as string || '用户')}</p>`;
  const userTags = data.user_tags as string[] | undefined;
  if (userTags?.length) html += `<div style="display:flex;flex-wrap:wrap;gap:4px;justify-content:center;">${userTags.slice(0, 3).map(t => tag(t)).join('')}</div>`;
  html += `</div><span style="font-size:24px;color:#8A8696;">⟷</span>`;
  html += `<div style="text-align:center;"><p style="font-size:14px;font-weight:600;color:#1F1D2B;margin:0 0 6px 0;">${esc(data.target_nickname as string || '对方')}</p>`;
  const targetTags = data.target_tags as string[] | undefined;
  if (targetTags?.length) html += `<div style="display:flex;flex-wrap:wrap;gap:4px;justify-content:center;">${targetTags.slice(0, 3).map(t => tag(t)).join('')}</div>`;
  html += `</div></div></div>`;

  if (dimensions) {
    const entries = Object.entries(dimensions);
    if (entries.length > 0) {
      html += `<div style="padding:20px 32px;page-break-inside:avoid;"><div style="display:flex;align-items:center;gap:8px;margin-bottom:14px;border-bottom:1px solid rgba(0,0,0,0.06);padding-bottom:10px;"><span style="color:#6B6778;font-size:12px;font-weight:500;">维度分析</span></div>`;
      html += `<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">`;
      for (const [k, v] of entries) {
        html += `<div style="border:1px solid rgba(0,0,0,0.06);border-radius:4px;background:#F8F8FA;padding:12px;text-align:center;"><p style="font-size:10px;font-weight:600;color:#6B6778;margin:0 0 6px 0;letter-spacing:1px;">${dimLabels[k] ?? k}</p><p style="font-size:20px;font-weight:700;color:#9B7FBB;margin:0;">${v}</p></div>`;
      }
      html += `</div></div>`;
    }
  }

  if (data.complementarity) {
    html += `<div style="padding:20px 32px;page-break-inside:avoid;"><div style="display:flex;align-items:center;gap:8px;margin-bottom:14px;border-bottom:1px solid rgba(0,0,0,0.06);padding-bottom:10px;"><span style="color:#6B6778;font-size:12px;font-weight:500;">五行互补</span></div><p style="font-size:12px;line-height:1.7;color:rgba(31,29,43,0.7);margin:0;">${esc(data.complementarity as string)}</p></div>`;
  }

  if (strengths?.length) {
    html += `<div style="padding:20px 32px;page-break-inside:avoid;"><div style="display:flex;align-items:center;gap:8px;margin-bottom:14px;border-bottom:1px solid rgba(0,0,0,0.06);padding-bottom:10px;"><span style="color:#6B6778;font-size:12px;font-weight:500;">优势</span></div>`;
    for (const s of strengths) {
      html += `<div style="display:flex;align-items:center;gap:8px;border:1px solid rgba(0,0,0,0.06);border-radius:4px;background:#F8F8FA;padding:8px 12px;margin-bottom:6px;"><span style="flex-shrink:0;width:18px;height:18px;border-radius:999px;background:rgba(143,207,160,0.15);display:flex;align-items:center;justify-content:center;"><span style="font-size:9px;color:#8FCFA0;">✓</span></span><span style="font-size:12px;color:rgba(31,29,43,0.7);">${esc(s)}</span></div>`;
    }
    html += `</div>`;
  }

  if (potentialConflicts?.length) {
    html += `<div style="padding:20px 32px;page-break-inside:avoid;"><div style="display:flex;align-items:center;gap:8px;margin-bottom:14px;border-bottom:1px solid rgba(0,0,0,0.06);padding-bottom:10px;"><span style="color:#6B6778;font-size:12px;font-weight:500;">潜在冲突</span></div>`;
    for (const s of potentialConflicts) {
      html += `<div style="display:flex;align-items:center;gap:8px;border:1px solid rgba(0,0,0,0.06);border-radius:4px;background:#F8F8FA;padding:8px 12px;margin-bottom:6px;"><span style="font-size:12px;color:#E0978A;flex-shrink:0;">⚠</span><span style="font-size:12px;color:rgba(31,29,43,0.7);">${esc(s)}</span></div>`;
    }
    html += `</div>`;
  }

  if (data.advice) {
    html += `<div style="padding:20px 32px;page-break-inside:avoid;"><div style="display:flex;align-items:center;gap:8px;margin-bottom:14px;border-bottom:1px solid rgba(0,0,0,0.06);padding-bottom:10px;"><span style="color:#6B6778;font-size:12px;font-weight:500;">相处建议</span></div><div style="border-left:2px solid #9B7FBB;border-radius:4px;background:rgba(155,127,187,0.05);padding:10px 16px;"><p style="font-size:12px;line-height:1.7;color:rgba(31,29,43,0.7);margin:0;">${esc(data.advice as string)}</p></div></div>`;
  }

  html += `<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:400px;padding:20px 32px;"><div style="width:48px;border-top:1px solid rgba(0,0,0,0.06);"></div><p style="margin-top:14px;font-size:11px;color:#8A8696;">本内容由 AI 生成，仅供娱乐参考</p></div></div>`;
  return html;
}

export default function AdminPage() {
  const router = useRouter();
  const [token, setToken] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [data, setData] = useState<{ pending: { kind: string; id: number; user_id: number; user_nickname: string; created_at: string; status?: string; error?: string | null }[]; completed: { kind: string; id: number; user_id: number; user_nickname: string; created_at: string; generated_at: string | null }[] } | null>(null);
  const [generating, setGenerating] = useState<Set<number>>(new Set());
  const [log, setLog] = useState<string[]>([]);
  const [exportingPDF, setExportingPDF] = useState<Set<number>>(new Set());
  const [viewReport, setViewReport] = useState<{ id: number; data: FullReport; userNickname?: string; userId?: number } | null>(null);
  const [pdfExportData, setPdfExportData] = useState<{ report: FullReport; filename: string; userNickname?: string; userId?: number } | null>(null);
  const pdfExportRef = useRef<HTMLDivElement>(null);
  const [viewComparison, setViewComparison] = useState<any | null>(null);
  const [tab, setTab] = useState<'pending' | 'completed' | 'log'>('pending');
  const [aiModel, setAiModel] = useState('deepseek-chat');
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [modelsLoading, setModelsLoading] = useState(false);
  const [customConfig, setCustomConfig] = useState<{ apiKey: string; baseUrl: string; model?: string } | null>(null);

  const addLog = useCallback((msg: string) => {
    setLog((prev) => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev.slice(0, 99)]);
  }, []);

  // PDF export — capture each page div individually to avoid cross-page splitting
  useEffect(() => {
    if (!pdfExportData) return;
    const el = pdfExportRef.current;
    if (!el) return;
    const { filename } = pdfExportData;
    requestAnimationFrame(() => {
      requestAnimationFrame(async () => {
        try {
          const root = el.children[0] as HTMLElement;
          if (!root) return;
          const pageEls = Array.from(root.children) as HTMLElement[];
          const pdf = new jsPDF('p', 'mm', 'a4');
          const imgWidth = 210;
          const pageHeight = 297;
          for (let i = 0; i < pageEls.length; i++) {
            if (i > 0) pdf.addPage();
            const pageEl = pageEls[i]!;
            const pageCanvas = await html2canvas(pageEl, { scale: 2, useCORS: true, backgroundColor: '#FFFFFF', logging: false });
            let renderW = imgWidth;
            let renderH = (pageCanvas.height * imgWidth) / pageCanvas.width;
            if (renderH > pageHeight) {
              const scale = pageHeight / renderH;
              renderW *= scale;
              renderH *= scale;
            }
            const cx = (imgWidth - renderW) / 2;
            pdf.addImage(pageCanvas.toDataURL('image/png'), 'PNG', cx, 0, renderW, renderH);
          }
          pdf.save(filename);
          addLog(`✅ "${filename}" 导出成功 (${pageEls.length} 页)`);
        } catch (err) {
          addLog(`❌ PDF 导出失败: ${err instanceof Error ? err.message : '未知错误'}`);
        } finally {
          setPdfExportData(null);
        }
      });
    });
  }, [pdfExportData]);

  const fetchReports = useCallback(async () => {
    try {
      const res = await fetch('/api/v1/admin/reports/list', { headers: { 'Authorization': `Bearer ${token}` } });
      const json = await res.json();
      if (json.code === 0) {
        setData(json.data);
        addLog(`已加载 ${json.data.pending.length} 个待生成, ${json.data.completed.length} 个已完成`);
      }
    } catch {
      addLog('加载报告列表失败');
    }
  }, [token, addLog]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('admin_auth');
      if (raw) { const t = JSON.parse(raw).token; if (t) { setToken(t); setAuthenticated(true); return; } }
    } catch {}
    router.push('/admin/login');
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (authenticated) fetchReports();
  }, [authenticated, fetchReports]);

  useEffect(() => {
    if (!authenticated) return;
    const loadConfig = async () => {
      try {
        const api = window.electronAPI;
        if (api?.readConfig) {
          const cfg = await api.readConfig();
          if (cfg?.apiKey) {
            setCustomConfig({ apiKey: cfg.apiKey, baseUrl: cfg.baseUrl || '', model: cfg.model || '' });
            if (cfg.model) setAiModel(cfg.model);
          }
        } else {
          const raw = localStorage.getItem('ai_config');
          if (raw) {
            const cfg = JSON.parse(raw);
            if (cfg.apiKey) {
              setCustomConfig({ apiKey: cfg.apiKey, baseUrl: cfg.baseUrl || '', model: cfg.model || '' });
              if (cfg.model) setAiModel(cfg.model);
            }
          }
        }
      } catch {}
    };
    loadConfig();
  }, [authenticated]);

  useEffect(() => {
    if (!authenticated) return;
    setModelsLoading(true);
    const body = customConfig?.apiKey
      ? JSON.stringify({ apiKey: customConfig.apiKey, baseUrl: customConfig.baseUrl })
      : '{}';
    fetch('/api/v1/ai/models', { method: 'POST', body, headers: { 'Content-Type': 'application/json' } })
      .then((r) => r.json())
      .then((json) => {
        if (json.code === 0 && json.data?.models?.length > 0) {
          const models = [...new Set([...json.data.models, 'deepseek-chat', 'deepseek-reasoner'])];
          setAvailableModels(models);
          setAiModel((prev) => models.includes(prev) ? prev : 'deepseek-chat');
        }
      })
      .catch(() => {})
      .finally(() => setModelsLoading(false));
  }, [authenticated, customConfig]);

  const handleGenerate = async (reportId: number, kind?: string) => {
    setGenerating((prev) => new Set(prev).add(reportId));
    addLog(`开始生成 ${kind === 'comparison' ? '合盘报告' : '报告'} #${reportId}...`);
    try {
      const res = await fetch('/api/v1/admin/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token, report_id: reportId, kind, model: aiModel,
          ...(customConfig?.apiKey ? { apiKey: customConfig.apiKey, baseUrl: customConfig.baseUrl } : {}),
        }),
      });
      const json = await res.json();
      fetchReports();
      if (json.code === 0) {
        addLog(`✅ 报告 #${reportId} 生成成功 [${json.data.provider}:${json.data.model || aiModel}] (${json.data.latency_ms}ms)`);
      } else {
        addLog(`❌ 报告 #${reportId} 生成失败: ${json.message}`);
        alert(`生成失败: ${json.message}`);
      }
    } catch (err) {
      addLog(`❌ 报告 #${reportId} 生成请求异常`);
      alert(`生成请求异常: ${err instanceof Error ? err.message : '未知错误'}`);
    } finally {
      setGenerating((prev) => { const next = new Set(prev); next.delete(reportId); return next; });
    }
  };

  const handleView = async (reportId: number, userNickname?: string) => {
    try {
      const adminAuth = JSON.parse(localStorage.getItem('admin_auth') ?? '{}');
      const res = await fetch(`/api/v1/reports/${reportId}`, {
        headers: adminAuth?.token ? { 'Authorization': `Bearer ${adminAuth.token}` } : {},
      });
      const json = await res.json();
      if (json.code === 0 && json.data?.full_report) {
        setViewReport({ id: reportId, data: json.data.full_report as FullReport, ...(userNickname ? { userNickname } : {}), userId: json.data.user_id });
      } else {
        addLog(`报告 #${reportId} 暂无完整内容`);
      }
    } catch {
      addLog(`获取报告 #${reportId} 失败`);
    }
  };

  const handleExportPDF = async (reportId: number, kind?: string, userNickname?: string) => {
    setExportingPDF((prev) => new Set(prev).add(reportId));
    addLog(`开始导出 PDF #${reportId}...`);
    try {
      const isComparison = kind === 'comparison';
      let filename: string;

      if (isComparison) {
        const adminAuth = JSON.parse(localStorage.getItem('admin_auth') ?? '{}');
        const res = await fetch(`/api/v1/comparisons/${reportId}`, {
          headers: adminAuth?.token ? { 'Authorization': `Bearer ${adminAuth.token}` } : {},
        });
        const json = await res.json();
        if (json.code !== 0 || !json.data) {
          addLog(`合盘报告 #${reportId} 无完整内容，无法导出`);
          return;
        }
        filename = `星隅合盘报告_#${reportId}.pdf`;
        const html = renderComparisonHTML(json.data);
        const container = document.createElement('div');
        container.style.position = 'absolute';
        container.style.left = '-9999px';
        container.style.top = '0';
        container.style.width = '800px';
        container.innerHTML = html;
        document.body.appendChild(container);
        const canvas = await html2canvas(container, { scale: 2, useCORS: true, backgroundColor: '#FFFFFF', logging: false });
        document.body.removeChild(container);
        const imgWidth = 210;
        const pageHeight = 297;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;
        const pdf = new jsPDF('p', 'mm', 'a4');
        let page = 0;
        while (heightLeft > 0) {
          if (page > 0) pdf.addPage();
          const srcHeight = (canvas.height * (pageHeight / imgHeight));
          const sy = page * srcHeight;
          const sHeight = Math.min(srcHeight, canvas.height - sy);
          const pageCanvas = document.createElement('canvas');
          pageCanvas.width = canvas.width;
          pageCanvas.height = sHeight;
          const ctx = pageCanvas.getContext('2d')!;
          ctx.drawImage(canvas, 0, sy, canvas.width, sHeight, 0, 0, pageCanvas.width, pageCanvas.height);
          pdf.addImage(pageCanvas.toDataURL('image/png'), 'PNG', 0, 0, imgWidth, (pageCanvas.height * imgWidth) / pageCanvas.width);
          heightLeft -= pageHeight;
          page++;
        }
        pdf.save(filename);
        addLog(`✅ PDF #${reportId} 导出成功 (${page} 页)`);
      } else {
        const adminAuth = JSON.parse(localStorage.getItem('admin_auth') ?? '{}');
        const res = await fetch(`/api/v1/reports/${reportId}`, {
          headers: adminAuth?.token ? { 'Authorization': `Bearer ${adminAuth.token}` } : {},
        });
        const json = await res.json();
        if (json.code !== 0 || !json.data?.full_report) {
          addLog(`报告 #${reportId} 无完整内容，无法导出`);
          return;
        }
        filename = `星隅完整报告_#${reportId}.pdf`;
        setPdfExportData({ report: json.data.full_report as FullReport, filename, ...(userNickname ? { userNickname } : {}), userId: json.data.user_id });
      }
    } catch (err) {
      addLog(`❌ PDF #${reportId} 导出失败: ${err instanceof Error ? err.message : '未知错误'}`);
    } finally {
      setExportingPDF((prev) => { const next = new Set(prev); next.delete(reportId); return next; });
    }
  };

  const handleViewComparison = async (id: number) => {
    try {
      const adminAuth = JSON.parse(localStorage.getItem('admin_auth') ?? '{}');
      const res = await fetch(`/api/v1/comparisons/${id}`, {
        headers: adminAuth?.token ? { 'Authorization': `Bearer ${adminAuth.token}` } : {},
      });
      const json = await res.json();
      if (json.code === 0) {
        setViewComparison(json.data);
      }
    } catch {
      addLog('加载合盘报告失败');
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F4F7]">
      <div className="mx-auto max-w-4xl px-4 py-6">
        {/* Tab bar */}
        <div className="mb-6 flex gap-1 rounded-[10px] bg-[#FFFFFF] p-1 shadow-sm">
          <button
            onClick={() => setTab('pending')}
            className={`flex-1 rounded-[8px] py-2 text-xs font-medium transition-colors ${tab === 'pending' ? 'bg-[#9B7FBB] text-[#FFFFFF]' : 'text-[#6B6778] hover:text-[#1F1D2B]'}`}
          >
            待生成报告
            {data && data.pending.length > 0 && (
              <span className="ml-1 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#E0978A]/20 px-1 text-[9px] font-bold text-[#E0978A]">{data.pending.length}</span>
            )}
          </button>
          <button
            onClick={() => setTab('completed')}
            className={`flex-1 rounded-[8px] py-2 text-xs font-medium transition-colors ${tab === 'completed' ? 'bg-[#9B7FBB] text-[#FFFFFF]' : 'text-[#6B6778] hover:text-[#1F1D2B]'}`}
          >
            已生成报告
            {data && data.completed.length > 0 && (
              <span className="ml-1 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#8FCFA0]/20 px-1 text-[9px] font-bold text-[#8FCFA0]">{data.completed.length}</span>
            )}
          </button>
          <button
            onClick={() => setTab('log')}
            className={`flex-1 rounded-[8px] py-2 text-xs font-medium transition-colors ${tab === 'log' ? 'bg-[#9B7FBB] text-[#FFFFFF]' : 'text-[#6B6778] hover:text-[#1F1D2B]'}`}
          >
            操作日志
          </button>
        </div>

        {tab === 'pending' && (
          <div>
            <div className="mb-3 flex items-center justify-end gap-2">
              {customConfig?.apiKey && (
                <span className="flex items-center gap-1 rounded-[4px] bg-[rgba(143,207,160,0.1)] px-2 py-0.5 text-[10px] text-[#5FAF7A]">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#8FCFA0]" />
                  AI 已配置
                </span>
              )}
              <span className="text-xs text-[#8A8696]">模型</span>
              <select
                value={modelsLoading ? '' : aiModel}
                onChange={async (e) => {
                  const model = e.target.value;
                  setAiModel(model);
                  try {
                    const cfg = { provider: 'DeepSeek', apiKey: customConfig!.apiKey, baseUrl: customConfig!.baseUrl, model };
                    const api = window.electronAPI;
                    if (api?.writeConfig && customConfig?.apiKey) {
                      await api.writeConfig(cfg);
                    } else if (customConfig?.apiKey) {
                      localStorage.setItem('ai_config', JSON.stringify(cfg));
                    }
                  } catch {}
                }}
                className="rounded-[6px] border border-[rgba(0,0,0,0.12)] bg-[#FFFFFF] px-2.5 py-1.5 text-xs text-[#1F1D2B] outline-none focus:border-[#9B7FBB]"
                disabled={modelsLoading}
              >
                {modelsLoading ? (
                  <option value="">加载中...</option>
                ) : availableModels.length > 0 ? (
                  availableModels.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))
                ) : (
                  <>
                    <option value="gpt-4o-mini">gpt-4o-mini</option>
                    <option value="gpt-4o">gpt-4o</option>
                    <option value="deepseek-chat">deepseek-chat</option>
                    <option value="deepseek-reasoner">deepseek-reasoner</option>
                  </>
                )}
              </select>
            </div>
            {data?.pending.length === 0 ? (
              <div className="rounded-[10px] bg-[#FFFFFF] px-4 py-12 text-center text-sm text-[#8A8696] shadow-sm">
                暂无待生成报告
              </div>
            ) : (
              <div className="space-y-2">
                {data?.pending.map((r) => (
                  <div key={r.id} className="flex items-center justify-between rounded-[10px] bg-[#FFFFFF] px-4 py-3 shadow-sm">
                    <div className="min-w-0">
                      <span className="text-sm font-medium text-[#1F1D2B]">#{r.id}</span>
                      {r.kind === 'comparison' && <span className="ml-1.5 rounded-[2px] bg-[#C9A88D]/15 px-1.5 py-0.5 text-[9px] text-[#C9A88D]">合盘</span>}
                      {r.status === 'FAILED' && <span className="ml-1.5 rounded-[2px] bg-[#E0978A]/15 px-1.5 py-0.5 text-[9px] text-[#E0978A]">失败</span>}
                      <span className="ml-2 text-xs text-[#8A8696]">{r.user_nickname}</span>
                      <span className="ml-2 text-xs text-[#B8B6C0]">{new Date(r.created_at).toLocaleDateString()}</span>
                    </div>
                    <button
                      onClick={() => handleGenerate(r.id, r.kind)}
                      disabled={generating.has(r.id)}
                      className="shrink-0 rounded-[6px] bg-[#9B7FBB] px-3 py-1.5 text-xs font-medium text-[#FFFFFF] transition-colors hover:bg-[#8A6EAA] disabled:opacity-50"
                    >
                      {generating.has(r.id) ? '生成中...' : '生成完整报告'}
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-4 text-center">
              <button
                onClick={fetchReports}
                className="rounded-[8px] border border-[rgba(0,0,0,0.1)] bg-[#FFFFFF] px-6 py-2 text-xs font-medium text-[#6B6778] hover:bg-[#F8F8FA]"
              >
                刷新列表
              </button>
            </div>
          </div>
        )}

        {tab === 'completed' && (
          <div>
            {data?.completed.length === 0 ? (
              <div className="rounded-[10px] bg-[#FFFFFF] px-4 py-12 text-center text-sm text-[#8A8696] shadow-sm">
                暂无已生成报告
              </div>
            ) : (
              <div className="space-y-2">
                {data?.completed.map((r) => (
                  <div key={r.id} className="flex items-center justify-between rounded-[10px] bg-[#FFFFFF] px-4 py-3 shadow-sm">
                    <div className="min-w-0">
                      <span className="text-sm font-medium text-[#1F1D2B]">#{r.id}</span>
                      {r.kind === 'comparison' && <span className="ml-1.5 rounded-[2px] bg-[#C9A88D]/15 px-1.5 py-0.5 text-[9px] text-[#C9A88D]">合盘</span>}
                      <span className="ml-2 text-xs text-[#8A8696]">{r.user_nickname}</span>
                      <span className="ml-1 text-xs text-[#7CB87C]">✓</span>
                    </div>
                    <div className="flex shrink-0 gap-1.5">
                      <button
                        onClick={() => r.kind === 'comparison' ? handleViewComparison(r.id) : handleView(r.id, r.user_nickname !== '游客' ? r.user_nickname : undefined)}
                        className="rounded-[6px] border border-[rgba(0,0,0,0.1)] px-3 py-1.5 text-xs text-[#6B6778] hover:bg-[#FFFFFF]"
                      >
                        查看
                      </button>
                      <button
                        onClick={() => handleExportPDF(r.id, r.kind, r.user_nickname !== '游客' ? r.user_nickname : undefined)}
                        disabled={exportingPDF.has(r.id)}
                        className="rounded-[6px] bg-[#C9A88D] px-3 py-1.5 text-xs font-medium text-[#FFFFFF] transition-colors hover:bg-[#B89A7D] disabled:opacity-50"
                      >
                        {exportingPDF.has(r.id) ? '导出中...' : '导出PDF'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-4 text-center">
              <button
                onClick={fetchReports}
                className="rounded-[8px] border border-[rgba(0,0,0,0.1)] bg-[#FFFFFF] px-6 py-2 text-xs font-medium text-[#6B6778] hover:bg-[#F8F8FA]"
              >
                刷新列表
              </button>
            </div>
          </div>
        )}

        {tab === 'log' && (
          <div className="rounded-[10px] bg-[#FFFFFF] p-4 shadow-sm">
            <div className="space-y-1 text-[11px] text-[#8A8696]">
              {log.length === 0 ? (
                <div className="py-8 text-center text-[#B8B6C0]">暂无日志</div>
              ) : (
                log.map((msg, i) => (
                  <div key={i} className="leading-relaxed">{msg}</div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Hidden PDF export renderer */}
      <div ref={pdfExportRef} style={{ position: 'absolute', left: '-9999px', top: 0, width: '800px', background: '#FFFFFF' }}>
        {pdfExportData && <ReportPageViewer report={pdfExportData.report} variant="pdf" reportUserId={pdfExportData.userId ?? null} {...(pdfExportData.userNickname ? { userInfo: { nickname: pdfExportData.userNickname } } : {})} />}
      </div>

      {viewReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="relative max-h-[90vh] w-full max-w-3xl overflow-auto rounded-[12px] bg-[#FFFFFF] shadow-lg">
            <button
              onClick={() => setViewReport(null)}
              className="sticky top-2 float-right mr-2 mt-2 rounded-[6px] bg-[rgba(0,0,0,0.5)] px-3 py-1 text-xs text-[#FFFFFF] hover:bg-[rgba(0,0,0,0.6)] z-10"
            >
              关闭
            </button>
            <div className="clear-both px-4 pb-4">
              <ReportPageViewer report={viewReport.data} reportUserId={viewReport.userId ?? null} {...(viewReport.userNickname ? { userInfo: { nickname: viewReport.userNickname } } : {})} />
            </div>
          </div>
        </div>
      )}

      {viewComparison && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4" onClick={() => setViewComparison(null)}>
          <div
            className="flex max-h-[85vh] w-full max-w-xl flex-col rounded-[12px] bg-[#FFFFFF] shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[rgba(0,0,0,0.06)] px-5 py-3">
              <h3 className="text-sm font-semibold text-[#1F1D2B]">合盘报告 #{viewComparison.id}</h3>
              <button onClick={() => setViewComparison(null)} className="rounded-[4px] px-2 py-1 text-xs text-[#8A8696] hover:bg-[#F5F4F7]">关闭</button>
            </div>
            <div className="flex-1 space-y-5 overflow-y-auto p-5">
              <div className="text-center">
                <p className="text-xs text-[#8A8696]">匹配度</p>
                <p className="text-3xl font-bold text-[#9B7FBB]">{viewComparison.match_score ?? '-'}%</p>
                {viewComparison.summary_tag && (
                  <span className="mt-1 inline-flex items-center justify-center rounded-[2px] bg-[#9B7FBB]/8 px-2 py-0.5 text-[11px] text-[#9B7FBB]">{viewComparison.summary_tag}</span>
                )}
              </div>

              <div>
                <p className="mb-2 text-[11px] font-semibold text-[#6B6778] tracking-[0.5px]">双方</p>
                <div className="flex items-center justify-between rounded-[8px] bg-[#F8F8FA] px-4 py-2.5">
                  <div className="text-center">
                    <p className="text-xs text-[#1F1D2B]">{viewComparison.user_nickname}</p>
                    <div className="mt-1 flex flex-wrap justify-center gap-1">
                      {viewComparison.user_tags?.slice(0, 2).map((t: string, i: number) => (
                        <span key={i} className="inline-flex items-center justify-center rounded-[2px] bg-[#9B7FBB]/8 px-1.5 py-0.5 text-[9px] text-[#9B7FBB]">{t}</span>
                      ))}
                    </div>
                  </div>
                  <span className="text-lg text-[#8A8696]">⟷</span>
                  <div className="text-center">
                    <p className="text-xs text-[#1F1D2B]">{viewComparison.target_nickname ?? '未知'}</p>
                    <div className="mt-1 flex flex-wrap justify-center gap-1">
                      {viewComparison.target_tags?.slice(0, 2).map((t: string, i: number) => (
                        <span key={i} className="inline-flex items-center justify-center rounded-[2px] bg-[#9B7FBB]/8 px-1.5 py-0.5 text-[9px] text-[#9B7FBB]">{t}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {viewComparison.dimensions && typeof viewComparison.dimensions === 'object' && (
                <div>
                  <p className="mb-2 text-[11px] font-semibold text-[#6B6778] tracking-[0.5px]">维度分析</p>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(viewComparison.dimensions).map(([k, v]) => {
                      const labels: Record<string, string> = { communication: '沟通', emotional: '情感', values: '价值观', growth: '成长' };
                      return (
                        <div key={k} className="rounded-[6px] bg-[#F8F8FA] px-3 py-2 text-center">
                          <p className="text-[9px] text-[#8A8696]">{labels[k] ?? k}</p>
                          <p className="text-base font-semibold text-[#9B7FBB]">{String(v)}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {viewComparison.complementarity && (
                <div>
                  <p className="mb-1 text-[11px] font-semibold text-[#6B6778] tracking-[0.5px]">五行互补</p>
                  <p className="text-xs leading-relaxed text-[rgba(31,29,43,0.7)]">{viewComparison.complementarity}</p>
                </div>
              )}

              {viewComparison.strengths?.length > 0 && (
                <div>
                  <p className="mb-2 text-[11px] font-semibold text-[#6B6778] tracking-[0.5px]">优势</p>
                  <div className="space-y-1.5">
                    {viewComparison.strengths.map((s: string, i: number) => (
                      <div key={i} className="flex items-center gap-2 rounded-[6px] bg-[#F8F8FA] px-3 py-2">
                        <span className="text-xs text-[#8FCFA0]">✓</span>
                        <span className="text-xs text-[rgba(31,29,43,0.7)]">{s}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {viewComparison.potential_conflicts?.length > 0 && (
                <div>
                  <p className="mb-2 text-[11px] font-semibold text-[#6B6778] tracking-[0.5px]">潜在冲突</p>
                  <div className="space-y-1.5">
                    {viewComparison.potential_conflicts.map((s: string, i: number) => (
                      <div key={i} className="flex items-center gap-2 rounded-[6px] bg-[#F8F8FA] px-3 py-2">
                        <span className="text-xs text-[#E0978A]">⚠</span>
                        <span className="text-xs text-[rgba(31,29,43,0.7)]">{s}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {viewComparison.advice && (
                <div>
                  <p className="mb-1 text-[11px] font-semibold text-[#6B6778] tracking-[0.5px]">相处建议</p>
                  <div className="rounded-[6px] border-l-2 border-[#9B7FBB] bg-[rgba(155,127,187,0.05)] px-3 py-2">
                    <p className="text-xs leading-relaxed text-[rgba(31,29,43,0.7)]">{viewComparison.advice}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
