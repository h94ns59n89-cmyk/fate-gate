'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
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
  const isGuest = useUserStore((s) => s.isGuest);
  const userLoading = useUserStore((s) => s.isLoading);

  const fetchReports = useCallback(async () => {
    try {
      const state = useUserStore.getState();
      const token = state.token;
      if (!token) return;
      const res = await fetch(`/api/v1/users/me/reports`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`获取报告列表失败 (${res.status})`);
      const data = await res.json();
      if (data.code === 0 && data.data?.items) {
        setReports(data.data.items);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : '获取报告列表失败');
      setReports([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const itemKey = (r: ReportItem) => `${r.kind === 'comparison' ? 'c' : 'p'}_${r.id}`;

  useEffect(() => {
    trackEvent(EVENTS.USER_RETURN);
    if (userLoading) return;
    if (isGuest) {
      setLoading(false);
      return;
    }
    fetchReports();
  }, [userLoading, isGuest, fetchReports]);

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
        <p className="text-sm text-[#E05A5A]">{error}</p>
        <Button onClick={() => fetchReports()}>重试</Button>
      </div>
    );
  }

  return (
    <div className="px-4">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[#1F1D2B]">我的报告</h1>
          <p className="mt-0.5 text-xs text-[#6B6778]">共 {reports.length} 份报告</p>
        </div>
        <div />
      </div>

      {!isGuest && userId && (
        <div className="mb-6 flex items-center justify-between rounded-[10px] border border-[rgba(0,0,0,0.06)] bg-[#F8F8FA] px-5 py-3.5">
          <div>
            <p className="text-[11px] tracking-[0.03em] text-[#6B6778]">邀请码</p>
            <p className="mt-0.5 font-mono text-sm font-semibold text-[#9B7FBB]">u_{userId}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigator.clipboard.writeText(`u_${userId}`)}
              className="rounded-md border border-[#9B7FBB]/25 bg-[#9B7FBB]/8 px-3 py-1 text-xs font-medium text-[#9B7FBB] transition-colors hover:bg-[#9B7FBB]/15 active:scale-[0.97]"
            >
              复制
            </button>
            <Link href="/comparison">
              <button className="rounded-md border border-[#9B7FBB]/25 bg-[#9B7FBB]/8 px-3 py-1 text-xs font-medium text-[#9B7FBB] transition-colors hover:bg-[#9B7FBB]/15 active:scale-[0.97]">
                合盘
              </button>
            </Link>
          </div>
        </div>
      )}

      {isGuest ? (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="mb-6 text-center">
            <p className="text-base font-medium text-[#1F1D2B]">您还未登录</p>
            <p className="mt-1 text-xs text-[#6B6778]">登录后可查看您的专属报告</p>
          </div>
          <Link href="/login">
            <Button>前往登录</Button>
          </Link>
          <div className="mt-8 w-full max-w-xs">
            <div className="mb-3 flex items-center gap-3">
              <span className="h-px flex-1 bg-gradient-to-r from-transparent to-[#9B7FBB]/20" />
              <span className="text-[10px] tracking-[0.06em] text-[#8A8696]">没有账号？</span>
              <span className="h-px flex-1 bg-gradient-to-r from-[#9B7FBB]/20 to-transparent" />
            </div>
            <div className="rounded-[10px] border border-[rgba(0,0,0,0.06)] bg-[#F8F8FA] px-5 py-4">
              <p className="text-xs text-[#6B6778]">
                添加助理微信
                <span className="ml-1 font-mono font-semibold text-[#9B7FBB]">janeai01</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText('janeai01');
                    toast.success('微信号已复制');
                  }}
                  className="ml-1.5 inline-block rounded border border-[#9B7FBB]/25 px-1.5 py-[1px] text-[10px] font-medium text-[#9B7FBB] transition-colors hover:bg-[#9B7FBB]/8 active:scale-[0.97]"
                >
                  复制
                </button>
                获取账号
              </p>
            </div>
          </div>
        </div>
      ) : reports.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 py-20">
          <p className="text-sm text-[#8A8696]">还没有生成过报告</p>
          <Link href="/">
            <Button>开始测试</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {reports.map((report) => {
            const isExpanded = expandedId === report.id;
            const key = itemKey(report);
            if (report.kind === 'comparison') {
              return (
                <div key={key} className="vscode-card overflow-hidden">
                  <div className="flex items-center gap-2 py-0.5">
                    <Link href={`/comparison/${report.id}`} className="flex flex-1 items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-[#9B7FBB]">✦</span>
                        <span className="text-xs text-[#6B6778]">{new Date(report.created_at).toLocaleDateString('zh-CN')}</span>
                        <span className="text-xs text-[#7CB87C]">合盘</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {typeof report.summary_tag === 'string' && (
                          <span className="text-[10px] text-[#9B7FBB]">{report.summary_tag}</span>
                        )}
                        {report.match_score != null && (
                          <span className="text-xs font-semibold text-[#9B7FBB]">{report.match_score}%</span>
                        )}
                      </div>
                    </Link>
                  </div>
                </div>
              );
            }
            return (
              <div key={key} className="vscode-card overflow-hidden">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : report.id)}
                    className="flex flex-1 items-center justify-between text-left"
                  >
                    <div className="flex items-center gap-2">
                      <svg
                       className={`size-3 text-[#8A8696] transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                    <span className="text-xs text-[#6B6778]">
                      {new Date(report.created_at).toLocaleDateString('zh-CN')}
                    </span>
                    <span className={`text-xs ${report.status === 'completed' ? 'text-[#7CB87C]' : 'text-[#9B7FBB]'}`}>
                      {report.status === 'completed' ? '已完成' : '生成中'}
                    </span>
                  </div>
                  {report.personality_tags && report.personality_tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {report.personality_tags.slice(0, 3).map((tag, i) => (
                        <span
                          key={i}
                          className="rounded-[2px] bg-[#9B7FBB]/10 px-1.5 py-0.5 text-[10px] text-[#9B7FBB]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </button>
                  </div>
                  {isExpanded && (
                    <div className="mt-3 border-t border-[rgba(0,0,0,0.06)] pt-3">
                      <SummaryCard {...{
                        personalityTags: report.personality_tags,
                        fiveElements: report.five_elements as never,
                        coreTraits: report.summary?.core_traits,
                        lifeTheme: report.summary?.life_theme,
                        calculationMeta: report.bazi?.calculation_meta as never,
                      } as any} />
                      <button
                        onClick={() => router.push(`/report/${report.id}`)}
                        className="mt-2 w-full rounded-[8px] border border-[#9B7FBB]/20 bg-[#9B7FBB]/6 py-2.5 text-sm font-medium text-[#9B7FBB] transition-colors hover:bg-[#9B7FBB]/15"
                      >
                        查看完整报告
                      </button>
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
