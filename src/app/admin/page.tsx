'use client';

import { useState, useEffect, useCallback } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Logo } from '@/components/common/Logo';
import { ReportPageViewer } from '@/components/report/ReportPageViewer';
import type { FullReport } from '@/lib/types';

const ADMIN_TOKEN = '123456';

function renderReportHTML(report: Record<string, unknown>): string {
  const sections = [
    { key: 'cover', label: '封面' },
    { key: 'personality', label: '人格分析' },
    { key: 'career', label: '事业发展' },
    { key: 'relationships', label: '感情模式' },
    { key: 'health', label: '健康提示' },
    { key: 'current_year', label: '流年运势' },
    { key: 'decade_trend', label: '大运趋势' },
    { key: 'self_improvement', label: '成长建议' },
    { key: 'glossary', label: '术语解释' },
    { key: 'footer', label: '声明' },
  ];
  const d = (key: string) => report[key] as Record<string, unknown> | undefined;

  function esc(s: string): string {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function tag(text: string): string {
    return `<span style="display:inline-block;border-radius:999px;background:rgba(155,127,187,0.08);padding:2px 10px;font-size:11px;color:#9B7FBB;">${esc(text)}</span>`;
  }

  function pastTendency(text?: string): string {
    if (!text) return '';
    return `<div style="border:1px dashed rgba(138,134,150,0.3);border-radius:4px;background:#F8F8FA;padding:10px 14px;margin-top:12px;"><p style="font-size:9px;color:#8A8696;margin:0 0 4px 0;letter-spacing:1px;">过去可能倾向</p><p style="font-size:12px;line-height:1.6;color:rgba(31,29,43,0.55);margin:0;font-style:italic;">${esc(text)}</p></div>`;
  }

  function adviceBlock(text?: string): string {
    if (!text) return '';
    return `<div style="border-left:2px solid #9B7FBB;border-radius:4px;background:rgba(155,127,187,0.05);padding:8px 14px;margin-top:12px;"><p style="font-size:9px;color:rgba(155,127,187,0.6);margin:0 0 4px 0;letter-spacing:1px;">建议</p><p style="font-size:12px;line-height:1.6;color:rgba(31,29,43,0.7);margin:0;">${esc(text)}</p></div>`;
  }

  function numberedList(items: string[]): string {
    return items.map((item, i) =>
      `<div style="display:flex;align-items:flex-start;gap:8px;margin-bottom:8px;"><span style="display:flex;width:18px;height:18px;border-radius:999px;background:rgba(155,127,187,0.1);align-items:center;justify-content:center;font-size:9px;font-weight:600;color:#9B7FBB;flex-shrink:0;">${i + 1}</span><span style="font-size:12px;line-height:1.5;color:rgba(31,29,43,0.7);">${esc(item)}</span></div>`
    ).join('');
  }

  function card(items: string[]): string {
    return items.map((item) =>
      `<div style="display:flex;align-items:center;gap:10px;border:1px solid rgba(0,0,0,0.06);border-radius:4px;background:#F8F8FA;padding:8px 12px;margin-bottom:6px;"><span style="display:flex;width:24px;height:24px;border-radius:3px;background:rgba(155,127,187,0.1);align-items:center;justify-content:center;font-size:12px;color:#9B7FBB;flex-shrink:0;">✦</span><span style="font-size:12px;color:rgba(31,29,43,0.7);">${esc(item)}</span></div>`
    ).join('');
  }

  function sideCard(items: string[], title: string, color: string): string {
    return `<div style="border-left:2px solid ${color};border-radius:4px;background:rgba(${color === '#8FCFA0' ? '143,207,160' : '224,151,138'},0.05);padding:8px 12px;"><p style="font-size:9px;font-weight:600;color:${color};margin:0 0 6px 0;letter-spacing:1px;">${esc(title)}</p><ul style="margin:0;padding-left:14px;">${items.map(s => `<li style="font-size:11px;line-height:1.5;color:rgba(31,29,43,0.6);margin-bottom:2px;">${esc(s)}</li>`).join('')}</ul></div>`;
  }

  let html = `<div style="font-family:'Noto Sans SC','PingFang SC','Microsoft YaHei',sans-serif;padding:0;background:#FFFFFF;color:rgba(31,29,43,0.85);max-width:800px;margin:0 auto;">`;

  for (const section of sections) {
    const data = d(section.key);
    if (!data) continue;

    html += `<div style="padding:20px 32px;page-break-inside:avoid;">`;

    if (section.key === 'cover') {
      html += `<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:600px;text-align:center;">`;
      html += `<div style="display:flex;align-items:center;gap:8px;margin-bottom:24px;"><div style="width:40px;height:1px;background:linear-gradient(to right,transparent,rgba(155,127,187,0.3));"></div><div style="display:flex;gap:3px;"><div style="width:4px;height:4px;border-radius:999px;background:#9B7FBB;"></div><div style="width:4px;height:4px;border-radius:999px;background:rgba(155,127,187,0.5);"></div><div style="width:4px;height:4px;border-radius:999px;background:rgba(155,127,187,0.2);"></div></div><div style="width:40px;height:1px;background:linear-gradient(to left,transparent,rgba(155,127,187,0.3));"></div></div>`;
      if (data.day_master) html += `<span style="display:inline-block;border:1px solid rgba(155,127,187,0.25);background:rgba(155,127,187,0.08);border-radius:3px;padding:4px 14px;font-size:11px;color:#9B7FBB;font-weight:500;">日主 ${esc(data.day_master as string)}</span>`;
      if (data.title) html += `<h1 style="font-size:28px;font-size:28px;font-weight:700;margin:20px 0 8px 0;color:#1F1D2B;font-family:serif;">${esc(data.title as string)}</h1>`;
      if (data.subtitle) html += `<p style="font-size:13px;color:#6B6778;margin:0 0 20px 0;">${esc(data.subtitle as string)}</p>`;
      html += `<div style="width:60px;height:1px;background:linear-gradient(to right,transparent,rgba(155,127,187,0.25),transparent);margin-bottom:20px;"></div>`;
      if (data.life_theme) html += `<div style="border-left:2px solid rgba(155,127,187,0.3);padding-left:14px;max-width:320px;"><p style="font-size:14px;font-style:italic;font-family:serif;color:#9B7FBB;margin:0;">「${esc(data.life_theme as string)}」</p></div>`;
      if (data.generated_at) html += `<p style="margin-top:40px;font-size:10px;color:#8A8696;">生成于 ${new Date(data.generated_at as string).toLocaleDateString('zh-CN')}</p>`;
      html += `</div>`;
    } else if (section.key === 'footer') {
      html += `<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:400px;"><div style="width:48px;border-top:1px solid rgba(0,0,0,0.06);"></div><p style="margin-top:14px;font-size:11px;color:#8A8696;">本内容由 AI 生成，仅供娱乐参考</p></div>`;
    } else {
      html += `<div style="display:flex;align-items:center;gap:8px;margin-bottom:14px;border-bottom:1px solid rgba(0,0,0,0.06);padding-bottom:10px;"><span style="color:#6B6778;font-size:12px;font-weight:500;">${section.label}</span></div>`;

      if (section.key === 'personality') {
        if (data.type) html += `<div style="text-align:center;margin-bottom:12px;">${tag(data.type as string)}</div>`;
        if (data.five_elements) html += `<p style="text-align:center;font-size:12px;color:#6B6778;margin:0 0 12px 0;">${esc(data.five_elements as string)}</p>`;
        const traits = data.core_traits as string[] | undefined;
        if (traits?.length) html += `<div style="margin-bottom:12px;"><p style="font-size:10px;font-weight:600;color:#6B6778;margin:0 0 8px 0;letter-spacing:1px;">✦ 核心特质</p>${numberedList(traits)}</div>`;
        const strengths = data.strengths as string[] | undefined;
        const growth = data.growth_areas as string[] | undefined;
        if (strengths?.length || growth?.length) {
          html += `<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px;">`;
          if (strengths?.length) html += sideCard(strengths, '优势', '#8FCFA0');
          if (growth?.length) html += sideCard(growth, '成长', '#E0978A');
          html += `</div>`;
        }
        html += pastTendency(data.past_tendency as string);
      }

      if (section.key === 'career') {
        const suitable = data.suitable_directions as string[] | undefined;
        const avoid = data.avoid_directions as string[] | undefined;
        if (suitable?.length) html += `<div style="margin-bottom:12px;"><p style="font-size:10px;font-weight:600;color:#6B6778;margin:0 0 8px 0;letter-spacing:1px;">适合方向</p>${card(suitable)}</div>`;
        if (avoid?.length) html += `<div style="margin-bottom:12px;"><p style="font-size:10px;font-weight:600;color:#8A8696;margin:0 0 8px 0;letter-spacing:1px;">建议规避</p><div style="display:flex;flex-wrap:wrap;gap:6px;">${avoid.map(s => `<span style="font-size:11px;color:#8A8696;text-decoration:line-through;">${esc(s)}</span>`).join('')}</div></div>`;
        html += adviceBlock(data.advice as string);
        html += pastTendency(data.past_tendency as string);
      }

      if (section.key === 'relationships') {
        if (data.communication_style) html += `<div style="border:1px solid rgba(0,0,0,0.06);border-radius:4px;background:#F8F8FA;padding:12px;text-align:center;margin-bottom:12px;"><p style="font-size:9px;font-weight:600;color:#6B6778;margin:0 0 4px 0;letter-spacing:1px;">沟通风格</p><p style="font-size:12px;font-weight:500;color:#1F1D2B;margin:0;">${esc(data.communication_style as string)}</p></div>`;
        const compat = data.compatibility as string[] | undefined;
        if (compat?.length) html += `<div style="margin-bottom:12px;"><p style="font-size:10px;font-weight:600;color:#6B6778;margin:0 0 8px 0;letter-spacing:1px;">兼容类型</p><div style="display:flex;flex-wrap:wrap;gap:4px;">${compat.map(s => tag(s)).join('')}</div></div>`;
        html += adviceBlock(data.advice as string);
        html += pastTendency(data.past_tendency as string);
      }

      if (section.key === 'health') {
        const areas = data.focus_areas as string[] | undefined;
        if (areas?.length) html += `<div style="margin-bottom:12px;"><p style="font-size:10px;font-weight:600;color:#6B6778;margin:0 0 8px 0;letter-spacing:1px;">关注领域</p>${card(areas)}</div>`;
        html += adviceBlock(data.advice as string);
        html += pastTendency(data.past_tendency as string);
      }

      if (section.key === 'current_year') {
        const items = [
          { label: '整体运势', key: 'overall' },
          { label: '事业', key: 'career' },
          { label: '财富', key: 'wealth' },
          { label: '感情', key: 'relationships' },
        ];
        html += `<p style="font-size:10px;font-weight:600;color:#6B6778;text-align:center;margin:0 0 12px 0;">${new Date().getFullYear()} 年运势</p>`;
        html += `<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">`;
        for (const { label, key } of items) {
          const v = data[key] as string | undefined;
          html += `<div style="border:1px solid rgba(0,0,0,0.06);border-radius:4px;background:#F8F8FA;padding:10px;text-align:center;"><p style="font-size:9px;color:#8A8696;margin:0 0 6px 0;">${label}</p><span style="display:inline-block;border-radius:999px;border:1px solid rgba(0,0,0,0.08);padding:2px 10px;font-size:10px;color:#6B6778;background:#F8F8FA;">${v ?? '-'}</span></div>`;
        }
        html += `</div>`;
      }

      if (section.key === 'decade_trend') {
        html += `<div style="border:1px solid rgba(155,127,187,0.15);border-radius:4px;background:linear-gradient(to bottom,rgba(155,127,187,0.05),transparent);padding:16px;text-align:center;margin-bottom:12px;"><div style="width:24px;height:3px;background:#9B7FBB;border-radius:2px;margin:0 auto 8px auto;"></div><p style="font-size:9px;font-weight:600;color:#6B6778;margin:0 0 8px 0;letter-spacing:1px;">当前大运</p>`;
        if (data.age_range) html += `<p style="font-size:16px;font-weight:700;color:#9B7FBB;margin:0 0 4px 0;">${esc(data.age_range as string)} 岁</p>`;
        if (data.focus) html += `<p style="font-size:12px;color:rgba(31,29,43,0.6);margin:0;">${esc(data.focus as string)}</p></div>`;
        html += adviceBlock(data.advice as string);
      }

      if (section.key === 'self_improvement') {
        const dirs = data.directions as string[] | undefined;
        const books = data.book_suggestions as string[] | undefined;
        if (dirs?.length) html += `<div style="margin-bottom:12px;"><p style="font-size:10px;font-weight:600;color:#6B6778;margin:0 0 8px 0;letter-spacing:1px;">成长方向</p><ul style="margin:0;padding-left:0;list-style:none;">${dirs.map(d => `<li style="display:flex;align-items:center;gap:8px;margin-bottom:6px;"><span style="display:flex;width:18px;height:18px;border-radius:999px;background:rgba(143,207,160,0.15);align-items:center;justify-content:center;font-size:9px;color:#8FCFA0;flex-shrink:0;">✓</span><span style="font-size:12px;color:rgba(31,29,43,0.7);">${esc(d)}</span></li>`).join('')}</ul></div>`;
        if (books?.length) html += `<div style="margin-bottom:12px;"><p style="font-size:10px;font-weight:600;color:#6B6778;margin:0 0 8px 0;letter-spacing:1px;">推荐阅读</p>${card(books)}</div>`;
      }

      if (section.key === 'glossary') {
        const glossaryZh: Record<string, string> = { day_master: '日主', five_elements: '五行', shishen: '十神', heavenly_stem: '天干', earthly_branch: '地支', hidden_stems: '藏干', dayun: '大运', liunian: '流年', nayin: '纳音', shensha: '神煞', kongwang: '空亡', yong_shen: '用神', xi_shen: '喜神', ji_shen: '忌神' };
        const entries = Object.entries(data).filter(([k]) => k !== 'id');
        for (const [term, desc] of entries) {
          html += `<div style="border:1px solid rgba(0,0,0,0.06);border-radius:4px;background:#F8F8FA;padding:8px 12px;margin-bottom:6px;"><p style="font-size:10px;font-weight:600;color:#9B7FBB;margin:0 0 2px 0;">${glossaryZh[term] ?? term}</p><p style="font-size:11px;line-height:1.5;color:rgba(31,29,43,0.6);margin:0;">${esc(desc as string)}</p></div>`;
        }
      }
    }

    html += `</div>`;
  }

  html += `<div style="text-align:center;padding:16px 32px;border-top:1px solid #EDE6DE;"><p style="font-size:9px;color:#D4C0B0;">星隅出品 · AI 生成 · 仅供娱乐参考</p></div></div>`;
  return html;
}

export default function AdminPage() {
  const [token, setToken] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [data, setData] = useState<{ pending: { kind: string; id: number; user_id: number; user_nickname: string; created_at: string }[]; completed: { kind: string; id: number; user_id: number; user_nickname: string; created_at: string; generated_at: string | null }[] } | null>(null);
  const [generating, setGenerating] = useState<Set<number>>(new Set());
  const [log, setLog] = useState<string[]>([]);
  const [exportingPDF, setExportingPDF] = useState<Set<number>>(new Set());
  const [viewReport, setViewReport] = useState<{ id: number; data: FullReport } | null>(null);
  const [viewComparison, setViewComparison] = useState<any | null>(null);
  const [tab, setTab] = useState<'pending' | 'completed' | 'log'>('pending');

  const addLog = useCallback((msg: string) => {
    setLog((prev) => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev.slice(0, 99)]);
  }, []);

  const fetchReports = useCallback(async () => {
    try {
      const res = await fetch(`/api/v1/admin/reports/list?token=${token}`);
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
      if (raw) { setAuthenticated(true); setToken(ADMIN_TOKEN); }
    } catch {}
  }, []);

  useEffect(() => {
    if (authenticated) fetchReports();
  }, [authenticated, fetchReports]);

  const handleLogin = () => {
    if (token === ADMIN_TOKEN) {
      setAuthenticated(true);
      try { localStorage.setItem('admin_auth', JSON.stringify({ name: '管理员', loggedIn: true })); } catch {}
      addLog('管理员登录成功');
    } else {
      addLog('密码错误');
    }
  };

  const handleGenerate = async (reportId: number, kind?: string) => {
    setGenerating((prev) => new Set(prev).add(reportId));
    addLog(`开始生成 ${kind === 'comparison' ? '合盘报告' : '报告'} #${reportId}...`);
    try {
      const res = await fetch('/api/v1/admin/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, report_id: reportId, kind }),
      });
      const json = await res.json();
      if (json.code === 0) {
        addLog(`✅ 报告 #${reportId} 生成成功 (${json.data.latency_ms}ms)`);
        fetchReports();
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

  const handleView = async (reportId: number) => {
    try {
      const res = await fetch(`/api/v1/reports/${reportId}`);
      const json = await res.json();
      if (json.code === 0 && json.data?.full_report) {
        setViewReport({ id: reportId, data: json.data.full_report as FullReport });
      } else {
        addLog(`报告 #${reportId} 暂无完整内容`);
      }
    } catch {
      addLog(`获取报告 #${reportId} 失败`);
    }
  };

  const handleExportPDF = async (reportId: number) => {
    setExportingPDF((prev) => new Set(prev).add(reportId));
    addLog(`开始导出 PDF #${reportId}...`);
    try {
      const res = await fetch(`/api/v1/reports/${reportId}`);
      const json = await res.json();
      if (json.code !== 0 || !json.data?.full_report) {
        addLog(`报告 #${reportId} 无完整内容，无法导出`);
        return;
      }

      const reportData = json.data.full_report as Record<string, unknown>;
      const html = renderReportHTML(reportData);

      const container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      container.style.top = '0';
      container.style.width = '800px';
      container.innerHTML = html;
      document.body.appendChild(container);

      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#FFFFFF',
        logging: false,
      });

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

      pdf.save(`星隅完整报告_#${reportId}.pdf`);
      addLog(`✅ PDF #${reportId} 导出成功 (${page} 页)`);
    } catch (err) {
      addLog(`❌ PDF #${reportId} 导出失败: ${err instanceof Error ? err.message : '未知错误'}`);
    } finally {
      setExportingPDF((prev) => { const next = new Set(prev); next.delete(reportId); return next; });
    }
  };

  const handleViewComparison = async (id: number) => {
    try {
      const res = await fetch(`/api/v1/comparisons/${id}`);
      const json = await res.json();
      if (json.code === 0) {
        setViewComparison(json.data);
      }
    } catch {
      addLog('加载合盘报告失败');
    }
  };

  if (!authenticated) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#F5F4F7] p-4">
        <div className="mb-6">
          <Logo />
        </div>
        <div className="w-full max-w-sm rounded-[12px] bg-[#FFFFFF] p-6 shadow-lg">
          <h1 className="mb-5 text-center text-lg font-semibold text-[#1F1D2B]">管理员登录</h1>
          <input
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            placeholder="输入管理密码"
            className="mb-3 w-full rounded-[8px] border border-[rgba(0,0,0,0.12)] px-3 py-2.5 text-sm outline-none focus:border-[#9B7FBB]"
          />
          <button
            onClick={handleLogin}
            className="w-full rounded-[8px] bg-[#9B7FBB] py-2.5 text-sm font-medium text-[#FFFFFF] hover:bg-[#8A6EAA]"
          >
            登录
          </button>
        </div>
      </div>
    );
  }

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
                        onClick={() => r.kind === 'comparison' ? handleViewComparison(r.id) : handleView(r.id)}
                        className="rounded-[6px] border border-[rgba(0,0,0,0.1)] px-3 py-1.5 text-xs text-[#6B6778] hover:bg-[#FFFFFF]"
                      >
                        查看
                      </button>
                      <button
                        onClick={() => handleExportPDF(r.id)}
                        disabled={exportingPDF.has(r.id) || r.kind === 'comparison'}
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
              <ReportPageViewer report={viewReport.data} />
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
                  <span className="mt-1 inline-block rounded-[2px] bg-[#9B7FBB]/8 px-2 py-0.5 text-[11px] text-[#9B7FBB]">{viewComparison.summary_tag}</span>
                )}
              </div>

              <div>
                <p className="mb-2 text-[11px] font-semibold text-[#6B6778] tracking-[0.5px]">双方</p>
                <div className="flex items-center justify-between rounded-[8px] bg-[#F8F8FA] px-4 py-2.5">
                  <div className="text-center">
                    <p className="text-xs text-[#1F1D2B]">{viewComparison.user_nickname}</p>
                    <div className="mt-1 flex flex-wrap justify-center gap-1">
                      {viewComparison.user_tags?.slice(0, 2).map((t: string, i: number) => (
                        <span key={i} className="rounded-[2px] bg-[#9B7FBB]/8 px-1.5 py-0.5 text-[9px] text-[#9B7FBB]">{t}</span>
                      ))}
                    </div>
                  </div>
                  <span className="text-lg text-[#8A8696]">⟷</span>
                  <div className="text-center">
                    <p className="text-xs text-[#1F1D2B]">{viewComparison.target_nickname ?? '未知'}</p>
                    <div className="mt-1 flex flex-wrap justify-center gap-1">
                      {viewComparison.target_tags?.slice(0, 2).map((t: string, i: number) => (
                        <span key={i} className="rounded-[2px] bg-[#9B7FBB]/8 px-1.5 py-0.5 text-[9px] text-[#9B7FBB]">{t}</span>
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
