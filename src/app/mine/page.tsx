'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Button } from '@/components/common/Button';
import { SummaryCard } from '@/components/report/SummaryCard';
import { trackEvent, EVENTS } from '@/lib/analytics';
import { useUserStore } from '@/stores/userStore';

interface PersonalityItem {
  kind: 'personality';
  id: number;
  report_type: string;
  status: string;
  created_at: string;
  personality_tags?: string[];
  five_elements?: { wood?: number; fire?: number; earth?: number; metal?: number; water?: number };
  summary?: { core_traits?: string[]; life_theme?: string };
  bazi?: { calculation_meta?: { enabled_true_solar_time?: boolean; true_solar_time?: string; true_solar_delta_minutes?: number } };
}

interface ComparisonItem {
  kind: 'comparison';
  id: number;
  match_score?: number | null;
  is_paid?: boolean;
  created_at: string;
  summary_tag?: string | null;
}

type ReportItem = PersonalityItem | ComparisonItem;

export default function MinePage() {
  const router = useRouter();
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const userId = useUserStore((s) => s.userId);
  const user = useUserStore((s) => s.user);
  const login = useUserStore((s) => s.login);
  const userLoading = useUserStore((s) => s.isLoading);
  const [loggingIn, setLoggingIn] = useState(false);

  const fetchReports = useCallback(async () => {
    try {
      const state = useUserStore.getState();
      const token = state.token;
      if (!token) return;
      const res = await fetch(`/api/v1/users/me/reports`, {
        headers: { 'Authorization': `Bearer ${token}` },
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
  }, []);

  useEffect(() => {
    trackEvent(EVENTS.USER_RETURN);
    if (userLoading) return;
    if (userId && useUserStore.getState().token) {
      fetchReports();
      return;
    }
    setLoggingIn(true);
    const mockCode = `mock_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    login(mockCode).then(() => {
      setLoggingIn(false);
      fetchReports();
    }).catch(() => {
      setLoggingIn(false);
      setError('微信登录失败');
    });
  }, [userLoading, userId, login, fetchReports]);

  if (loading || loggingIn) {
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
        <Button onClick={() => fetchReports()}>重试</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 pb-[60px] pt-14">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[#d4d4d4]">我的报告</h1>
          <p className="mt-0.5 text-xs text-[#858585]">共 {reports.length} 份报告</p>
        </div>
        {user && (
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
        )}
      </div>

      {userId && (
        <div className="mb-6 flex items-center justify-between rounded-card border border-[#d4a853]/20 bg-[#d4a853]/5 px-4 py-3">
          <div>
            <p className="text-xs text-[#858585]">邀请码</p>
            <p className="font-mono text-sm font-semibold text-[#d4a853]">u_{userId}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigator.clipboard.writeText(`u_${userId}`)}
              className="rounded-md border border-[#d4a853]/30 bg-[#d4a853]/10 px-3 py-1 text-xs font-medium text-[#d4a853] hover:bg-[#d4a853]/20"
            >
              复制
            </button>
            <Link href="/comparison">
              <button className="rounded-md border border-[#d4a853]/30 bg-[#d4a853]/10 px-3 py-1 text-xs font-medium text-[#d4a853] hover:bg-[#d4a853]/20">
                合盘
              </button>
            </Link>
          </div>
        </div>
      )}

      {reports.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 py-20">
          <p className="text-sm text-[#6a6a6a]">还没有生成过报告</p>
          <Link href="/">
            <Button>开始测试</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {reports.map((report) => {
            const isExpanded = expandedId === report.id;
            if (report.kind === 'comparison') {
              return (
                <div key={`c-${report.id}`} className="vscode-card overflow-hidden">
                  <Link href={`/comparison/${report.id}`} className="flex items-center justify-between py-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[#d4a853]">✦</span>
                      <span className="text-xs text-[#858585]">{new Date(report.created_at).toLocaleDateString('zh-CN')}</span>
                      <span className="text-xs text-[#6a9955]">合盘</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {typeof report.summary_tag === 'string' && (
                        <span className="text-[10px] text-[#d4a853]">{report.summary_tag}</span>
                      )}
                      {report.match_score != null && (
                        <span className="text-xs font-semibold text-[#d4a853]">{report.match_score}%</span>
                      )}
                    </div>
                  </Link>
                </div>
              );
            }
            return (
              <div key={report.id} className="vscode-card overflow-hidden">
                <button
                  onClick={() => setExpandedId(isExpanded ? null : report.id)}
                  className="flex w-full items-center justify-between text-left"
                >
                  <div className="flex items-center gap-2">
                    <svg
                      className={`size-3 text-[#6a6a6a] transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                    <span className="text-xs text-[#858585]">
                      {new Date(report.created_at).toLocaleDateString('zh-CN')}
                    </span>
                    <span className={`text-xs ${report.status === 'completed' ? 'text-[#6a9955]' : 'text-[#d4a853]'}`}>
                      {report.status === 'completed' ? '已完成' : '生成中'}
                    </span>
                  </div>
                  {report.personality_tags && report.personality_tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {report.personality_tags.slice(0, 3).map((tag, i) => (
                        <span
                          key={i}
                          className="rounded-[2px] bg-[#d4a853]/12 px-1.5 py-0.5 text-[10px] text-[#d4a853]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </button>
                {isExpanded && (
                  <div className="mt-3 border-t border-[#2a3040] pt-3">
                    <SummaryCard {...{
                      personalityTags: report.personality_tags,
                      fiveElements: report.five_elements as never,
                      coreTraits: report.summary?.core_traits,
                      lifeTheme: report.summary?.life_theme,
                      calculationMeta: report.bazi?.calculation_meta as never,
                      onUnlock: report.report_type !== 'paid' ? () => router.push(`/report/${report.id}`) : undefined,
                      onShare: undefined,
                    } as any} />
                    {report.report_type === 'paid' && (
                      <button
                        onClick={() => router.push(`/report/${report.id}`)}
                        className="mt-2 w-full rounded bg-[#6a9955]/15 py-2 text-xs text-[#6a9955] transition-colors hover:bg-[#6a9955]/25"
                      >
                        查看完整报告
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
