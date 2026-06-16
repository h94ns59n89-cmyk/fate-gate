'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Button } from '@/components/common/Button';
import { trackEvent, EVENTS } from '@/lib/analytics';
import { useUserStore } from '@/stores/userStore';

interface ReportItem {
  id: number;
  report_type: string;
  status: string;
  created_at: string;
}

export default function MinePage() {
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const userId = useUserStore((s) => s.userId);
  const user = useUserStore((s) => s.user);
  const login = useUserStore((s) => s.login);
  const initGuest = useUserStore((s) => s.initGuest);
  const userLoading = useUserStore((s) => s.isLoading);

  const fetchReports = useCallback(async () => {
    try {
      const uid = userId ?? await initGuest();
      const res = await fetch(`/api/v1/users/me/reports`, {
        headers: uid ? { 'X-User-Id': String(uid) } : {},
      });
      if (!res.ok) throw new Error('获取报告列表失败');
      const data = await res.json();
      if (data.code === 0 && data.data?.items) {
        setReports(data.data.items);
      }
    } catch {
      setError('获取报告列表失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  }, [userId, initGuest]);

  useEffect(() => {
    trackEvent(EVENTS.USER_RETURN);
    if (!userLoading) {
      fetchReports();
    }
  }, [userLoading, fetchReports]);

  const handleWechatLogin = useCallback(async () => {
    const mockCode = `mock_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    await login(mockCode);
  }, [login]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4">
        <p className="text-sm text-[#f44747]">{error}</p>
        <Button onClick={fetchReports}>重试</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 pb-24 pt-14">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold text-[#d4d4d4]">我的报告</h1>
          <p className="mt-0.5 text-xs text-[#858585]">共 {reports.length} 份报告</p>
        </div>
        {user ? (
          <div className="flex items-center gap-2 text-xs text-[#858585]">
            {user.avatar_url && (
              <img src={user.avatar_url} alt="" className="size-6 rounded-full" />
            )}
            <span>{user.nickname ?? '微信用户'}</span>
            <button
              onClick={() => useUserStore.getState().logout?.()}
              className="text-[#6a6a6a] hover:text-[#f44747]"
            >
              退出
            </button>
          </div>
        ) : (
          <button
            onClick={handleWechatLogin}
            className="rounded border border-[#3c3c3c] px-3 py-1 text-xs text-[#d4d4d4] transition-colors hover:border-[#d4a853] hover:text-[#d4a853]"
          >
            微信登录
          </button>
        )}
      </div>

      <div className="mb-6 border-t border-[#3c3c3c] pt-6">
        <div className="flex items-center justify-center gap-4 text-xs text-[#6a6a6a]">
          <Link href="/terms" className="hover:text-[#858585]">用户协议</Link>
          <Link href="/privacy" className="hover:text-[#858585]">隐私政策</Link>
          <Link href="/disclaimer" className="hover:text-[#858585]">免责声明</Link>
        </div>
      </div>

      {reports.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 py-20">
          <p className="text-sm text-[#6a6a6a]">还没有生成过报告</p>
          <Link href="/">
            <Button>开始测试</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {reports.map((report) => (
            <Link
              key={report.id}
              href={`/report/${report.id}`}
              className="vscode-card block transition-colors hover:bg-[#2a2d2e]"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-[#d4d4d4]">
                    {report.report_type === 'paid' ? '完整人格报告' : '免费人格摘要'}
                  </div>
                  <div className="mt-0.5 text-xs text-[#6a6a6a]">
                    {new Date(report.created_at).toLocaleDateString('zh-CN')}
                  </div>
                </div>
                <div className="text-right">
                  <div
                    className={`text-xs ${
                      report.status === 'completed' ? 'text-[#6a9955]' : 'text-[#d4a853]'
                    }`}
                  >
                    {report.status === 'completed' ? '已完成' : '生成中'}
                  </div>
                  <div className="mt-0.5 text-xs text-[#6a6a6a]">→</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
