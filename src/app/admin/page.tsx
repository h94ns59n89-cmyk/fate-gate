'use client';

import { useState, useEffect, useCallback } from 'react';

const ADMIN_TOKEN = '123456';

export default function AdminPage() {
  const [token, setToken] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [data, setData] = useState<{ pending: { id: number; user_id: number; created_at: string }[]; completed: { id: number; user_id: number; created_at: string; generated_at: string | null }[] } | null>(null);
  const [generating, setGenerating] = useState<Set<number>>(new Set());
  const [log, setLog] = useState<string[]>([]);
  const [selectedReport, setSelectedReport] = useState<{ id: number; content: string } | null>(null);

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
        {/* Header */}
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
          {/* Main content */}
          <div>
            {/* Pending reports */}
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

            {/* Completed reports */}
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
                    <button
                      onClick={() => handleView(r.id)}
                      className="rounded-[6px] border border-[rgba(0,0,0,0.1)] px-3 py-1.5 text-xs text-[#6B6778] hover:bg-[#FFFFFF]"
                    >
                      查看
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar: log + preview */}
          <div>
            {/* Action log */}
            <div className="mb-4 rounded-[10px] bg-[#FFFFFF] p-4 shadow-sm">
              <h3 className="mb-2 text-xs font-semibold text-[#6B6778]">操作日志</h3>
              <div className="h-60 space-y-1 overflow-y-auto text-[11px] text-[#8A8696]">
                {log.map((msg, i) => (
                  <div key={i} className="leading-relaxed">{msg}</div>
                ))}
                {log.length === 0 && <div className="text-[#B8B6C0]">暂无日志</div>}
              </div>
            </div>

            {/* Quick actions */}
            <button
              onClick={fetchReports}
              className="w-full rounded-[8px] border border-[rgba(0,0,0,0.1)] bg-[#FFFFFF] py-2 text-xs font-medium text-[#6B6778] hover:bg-[#F8F8FA]"
            >
              刷新列表
            </button>
          </div>
        </div>
      </div>

      {/* Report preview modal */}
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
