'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const ADMIN_TOKEN = '123456';

function renderReportContent(report: Record<string, unknown>): string {
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

  let html = `<div style="font-family:'Noto Sans SC','PingFang SC','Microsoft YaHei',sans-serif;padding:40px 48px;background:#FAF8F5;color:#4A3F3A;max-width:800px;margin:0 auto;">`;

  for (const section of sections) {
    const data = report[section.key] as Record<string, unknown> | undefined;
    if (!data) continue;

    html += `<div style="margin-bottom:40px;">`;
    html += `<div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;">
      <span style="width:3px;height:18px;background:#C9A88D;border-radius:2px;display:inline-block;"></span>
      <h2 style="font-size:16px;font-weight:600;margin:0;color:#6B5D53;">${section.label}</h2>
    </div>`;

    for (const [key, value] of Object.entries(data)) {
      const label = key.replace(/_/g, ' ');
      if (typeof value === 'string') {
        html += `<div style="margin-bottom:12px;">
          <p style="font-size:11px;color:#B8A89A;margin:0 0 4px 0;text-transform:${key.length < 6 ? 'none' : 'none'};">${label}</p>
          <p style="font-size:14px;line-height:1.7;margin:0;color:#4A3F3A/85;">${value}</p>
        </div>`;
      } else if (Array.isArray(value)) {
        html += `<div style="margin-bottom:12px;">
          <p style="font-size:11px;color:#B8A89A;margin:0 0 4px 0;">${label}</p>
          <ul style="margin:0;padding-left:18px;">`;
        for (const item of value) {
          html += `<li style="font-size:14px;line-height:1.7;color:#4A3F3A/85;">${String(item)}</li>`;
        }
        html += `</ul></div>`;
      } else if (typeof value === 'object' && value !== null) {
        html += `<div style="margin-bottom:12px;">
          <p style="font-size:11px;color:#B8A89A;margin:0 0 4px 0;">${label}</p>
          <pre style="font-size:12px;line-height:1.6;background:#EDE6DE;padding:12px;border-radius:8px;overflow-x:auto;margin:0;color:#6B5D53;">${JSON.stringify(value, null, 2)}</pre>
        </div>`;
      }
    }
    html += `</div>`;
  }

  html += `<div style="text-align:center;padding-top:20px;border-top:1px solid #EDE6DE;">
    <p style="font-size:10px;color:#D4C0B0;">星隅出品 · AI 生成 · 仅供娱乐参考</p>
  </div></div>`;

  return html;
}

export default function AdminPage() {
  const [token, setToken] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [data, setData] = useState<{ pending: { id: number; user_id: number; created_at: string }[]; completed: { id: number; user_id: number; created_at: string; generated_at: string | null }[] } | null>(null);
  const [generating, setGenerating] = useState<Set<number>>(new Set());
  const [log, setLog] = useState<string[]>([]);
  const [selectedReport, setSelectedReport] = useState<{ id: number; content: string } | null>(null);
  const [exportingPDF, setExportingPDF] = useState<Set<number>>(new Set());
  const pdfRenderRef = useRef<HTMLDivElement>(null);

  const addLog = useCallback((msg: string) => {
    setLog((prev) => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev.slice(0, 99)]);
  }, []);

  const fetchReports = useCallback(async () => {
    try {
      const res = await fetch(`/api/v1/admin/reports/list?token=${token}`);
      const json = await res.json();
      if (json.code === 0) {
        setData(json.data);
        addLog(`已加载 ${json.data.pending.length} 个待生成报告`);
      }
    } catch {
      addLog('加载报告列表失败');
    }
  }, [token, addLog]);

  useEffect(() => {
    if (authenticated) fetchReports();
  }, [authenticated, fetchReports]);

  const handleLogin = () => {
    if (token === ADMIN_TOKEN) {
      setAuthenticated(true);
      addLog('管理员登录成功');
    } else {
      addLog('密码错误');
    }
  };

  const handleGenerate = async (reportId: number) => {
    setGenerating((prev) => new Set(prev).add(reportId));
    addLog(`开始生成报告 #${reportId}...`);
    try {
      const res = await fetch('/api/v1/admin/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, report_id: reportId }),
      });
      const json = await res.json();
      if (json.code === 0) {
        addLog(`✅ 报告 #${reportId} 生成成功 (${json.data.latency_ms}ms)`);
        fetchReports();
      } else {
        addLog(`❌ 报告 #${reportId} 生成失败: ${json.message}`);
      }
    } catch {
      addLog(`❌ 报告 #${reportId} 生成请求异常`);
    } finally {
      setGenerating((prev) => { const next = new Set(prev); next.delete(reportId); return next; });
    }
  };

  const handleView = async (reportId: number) => {
    try {
      const res = await fetch(`/api/v1/reports/${reportId}`);
      const json = await res.json();
      if (json.code === 0 && json.data?.full_report) {
        setSelectedReport({ id: reportId, content: JSON.stringify(json.data.full_report, null, 2) });
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
      const html = renderReportContent(reportData);

      // Create temp container off-screen
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
        backgroundColor: '#FAF8F5',
        logging: false,
      });

      document.body.removeChild(container);

      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      const pdf = new jsPDF('p', 'mm', 'a4');
      let page = 0;

      while (heightLeft > 0) {
        if (page > 0) pdf.addPage();
        const srcHeight = (canvas.height * (pageHeight / imgHeight));
        const sx = 0;
        const sy = page * srcHeight;
        const sHeight = Math.min(srcHeight, canvas.height - sy);

        const pageCanvas = document.createElement('canvas');
        pageCanvas.width = canvas.width;
        pageCanvas.height = sHeight * (canvas.width / imgWidth / (canvas.width / imgWidth));
        const ctx = pageCanvas.getContext('2d')!;
        ctx.drawImage(canvas, 0, sy, canvas.width, sHeight, 0, 0, pageCanvas.width, pageCanvas.height);

        pdf.addImage(pageCanvas.toDataURL('image/png'), 'PNG', 0, 0, imgWidth, (pageCanvas.height * imgWidth) / pageCanvas.width);
        heightLeft -= pageHeight;
        position += pageHeight;
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

  if (!authenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#1F1D2B] p-4">
        <div className="w-full max-w-sm rounded-[12px] bg-[#FFFFFF] p-6 shadow-lg">
          <h1 className="mb-1 text-center text-lg font-semibold text-[#1F1D2B]">管理员登录</h1>
          <p className="mb-5 text-center text-xs text-[#8A8696]">星隅报告生成后台</p>
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
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-[#1F1D2B]">报告管理后台</h1>
            <p className="text-xs text-[#8A8696]">为免费报告生成完整内容</p>
          </div>
          <button
            onClick={() => { setAuthenticated(false); setData(null); }}
            className="rounded-[6px] border border-[rgba(0,0,0,0.1)] px-3 py-1.5 text-xs text-[#6B6778] hover:bg-[#FFFFFF]"
          >
            退出
          </button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div>
            <div className="mb-6">
              <h2 className="mb-3 text-sm font-semibold text-[#1F1D2B]">
                待生成报告
                <span className="ml-2 text-xs font-normal text-[#8A8696]">{data?.pending.length ?? '-'} 条</span>
              </h2>
              {data?.pending.length === 0 && (
                <div className="rounded-[10px] bg-[#FFFFFF] px-4 py-8 text-center text-sm text-[#8A8696]">
                  暂无待生成报告
                </div>
              )}
              <div className="space-y-2">
                {data?.pending.map((r) => (
                  <div key={r.id} className="flex items-center justify-between rounded-[10px] bg-[#FFFFFF] px-4 py-3 shadow-sm">
                    <div>
                      <span className="text-sm font-medium text-[#1F1D2B]">#{r.id}</span>
                      <span className="ml-2 text-xs text-[#8A8696]">用户 {r.user_id}</span>
                      <span className="ml-2 text-xs text-[#B8B6C0]">{new Date(r.created_at).toLocaleDateString()}</span>
                    </div>
                    <button
                      onClick={() => handleGenerate(r.id)}
                      disabled={generating.has(r.id)}
                      className="rounded-[6px] bg-[#9B7FBB] px-3 py-1.5 text-xs font-medium text-[#FFFFFF] transition-colors hover:bg-[#8A6EAA] disabled:opacity-50"
                    >
                      {generating.has(r.id) ? '生成中...' : '生成完整报告'}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="mb-3 text-sm font-semibold text-[#1F1D2B]">
                已生成报告
                <span className="ml-2 text-xs font-normal text-[#8A8696]">{data?.completed.length ?? '-'} 条</span>
              </h2>
              <div className="space-y-2">
                {data?.completed.map((r) => (
                  <div key={r.id} className="flex items-center justify-between rounded-[10px] bg-[#FFFFFF] px-4 py-3 shadow-sm">
                    <div>
                      <span className="text-sm font-medium text-[#1F1D2B]">#{r.id}</span>
                      <span className="ml-2 text-xs text-[#8A8696]">用户 {r.user_id}</span>
                      <span className="ml-2 text-xs text-[#7CB87C]">✓</span>
                    </div>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => handleView(r.id)}
                        className="rounded-[6px] border border-[rgba(0,0,0,0.1)] px-3 py-1.5 text-xs text-[#6B6778] hover:bg-[#FFFFFF]"
                      >
                        查看
                      </button>
                      <button
                        onClick={() => handleExportPDF(r.id)}
                        disabled={exportingPDF.has(r.id)}
                        className="rounded-[6px] bg-[#C9A88D] px-3 py-1.5 text-xs font-medium text-[#FFFFFF] transition-colors hover:bg-[#B89A7D] disabled:opacity-50"
                      >
                        {exportingPDF.has(r.id) ? '导出中...' : '导出PDF'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            <div className="mb-4 rounded-[10px] bg-[#FFFFFF] p-4 shadow-sm">
              <h3 className="mb-2 text-xs font-semibold text-[#6B6778]">操作日志</h3>
              <div className="h-60 space-y-1 overflow-y-auto text-[11px] text-[#8A8696]">
                {log.map((msg, i) => (
                  <div key={i} className="leading-relaxed">{msg}</div>
                ))}
                {log.length === 0 && <div className="text-[#B8B6C0]">暂无日志</div>}
              </div>
            </div>

            <button
              onClick={fetchReports}
              className="w-full rounded-[8px] border border-[rgba(0,0,0,0.1)] bg-[#FFFFFF] py-2 text-xs font-medium text-[#6B6778] hover:bg-[#F8F8FA]"
            >
              刷新列表
            </button>
          </div>
        </div>
      </div>

      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="max-h-[80vh] w-full max-w-2xl overflow-auto rounded-[12px] bg-[#FFFFFF] p-6 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-[#1F1D2B]">报告 #{selectedReport.id} 完整内容</h3>
              <button
                onClick={() => setSelectedReport(null)}
                className="rounded-[4px] px-2 py-1 text-xs text-[#8A8696] hover:bg-[#F5F4F7]"
              >
                关闭
              </button>
            </div>
            <pre className="overflow-auto rounded-[8px] bg-[#F8F8FA] p-4 text-xs leading-relaxed text-[#1F1D2B]/80">
              {selectedReport.content}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
