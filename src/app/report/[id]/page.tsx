'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { SummaryCard } from '@/components/report/SummaryCard';
import { ReportPageViewer } from '@/components/report/ReportPageViewer';
import { LeadGenWall } from '@/components/report/LeadGenWall';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Button } from '@/components/common/Button';
import { trackEvent, EVENTS } from '@/lib/analytics';
import { useUserStore } from '@/stores/userStore';
import type { FiveElements, PersonalityTags, FullReport } from '@/lib/types';

export default function ReportPage() {
  const params = useParams();
  const userId = useUserStore((s) => s.userId);

  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [personalityTags, setPersonalityTags] = useState<string[]>();
  const [fiveElements, setFiveElements] = useState<FiveElements>();
  const [summary, setSummary] = useState<PersonalityTags>();
  const [pastTendencies, setPastTendencies] = useState<string[]>();
  const [fullReport, setFullReport] = useState<FullReport | null>(null);

  const reportId = parseInt(params?.id as string, 10);
  const validReport = !isNaN(reportId) && reportId > 0;

  const fetchReport = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const res = await fetch(`/api/v1/reports/${reportId}`);
      const json = await res.json();
      if (json.code === 0) {
        setPersonalityTags(json.data?.personality_tags);
        setFiveElements(json.data?.five_elements);
        setSummary(json.data?.summary);
        setPastTendencies(json.data?.summary?.past_tendencies);
        if (json.data?.full_report) {
          setFullReport(json.data.full_report);
        }
      }
    } catch (e) {
      setFetchError(e instanceof Error ? e.message : '网络错误，加载失败');
    } finally {
      setLoading(false);
    }
  }, [reportId]);

  useEffect(() => {
    trackEvent(EVENTS.REPORT_VIEWED);
    if (!validReport) { setLoading(false); return; }
    fetchReport();
  }, [reportId, validReport, fetchReport]);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3">
        <LoadingSpinner size="lg" />
        <p className="text-sm text-[#6B6778]">加载中...</p>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4">
        <p className="text-sm text-[#E05A5A]">{fetchError}</p>
        <Button variant="outline" onClick={fetchReport}>重试</Button>
      </div>
    );
  }

  if (!validReport) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4">
        <p className="text-sm text-[#E05A5A]">报告不存在或已失效</p>
        <Button onClick={() => window.location.href = '/'}>重新测算</Button>
      </div>
    );
  }

  // Full report available — show ReportPageViewer
  if (fullReport) {
    return (
      <div className="px-4 pb-8">
        <ReportPageViewer report={fullReport} />
      </div>
    );
  }

  // Summary only — show summary + lead gen
  const inviteCodeSection = userId ? (
    <div className="rounded-[12px] border border-[rgba(0,0,0,0.06)] bg-[#F8F8FA] px-5 py-4">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#9B7FBB]/8 text-sm text-[#9B7FBB]">✦</div>
        <div className="flex-1">
          <p className="text-xs font-medium text-[#9B7FBB]">邀请好友对比人格</p>
          <p className="mt-0.5 text-[11px] text-[#6B6778]">你的邀请码：<span className="font-mono text-xs font-semibold text-[#1F1D2B]">u_{userId}</span></p>
        </div>
        <button
          onClick={() => navigator.clipboard.writeText(`u_${userId}`)}
          className="rounded-md border border-[#9B7FBB]/25 bg-[#9B7FBB]/8 px-3 py-1.5 text-xs font-medium text-[#9B7FBB] hover:bg-[#9B7FBB]/15 active:scale-95"
        >
          复制
        </button>
      </div>
      <p className="mt-2 text-[11px] leading-relaxed text-[#8A8696]">
        对方在「人格对比」页面输入你的邀请码即可把你们的人格放在一起比较
      </p>
    </div>
  ) : null;

  return (
    <div className="px-4 pb-8">
      <div className="space-y-6">
        <SummaryCard
          personalityTags={personalityTags}
          fiveElements={fiveElements}
          coreTraits={summary?.core_traits}
          lifeTheme={summary?.life_theme}
          pastTendencies={pastTendencies}
        />
        {inviteCodeSection}
        <LeadGenWall context="完整人格报告" />
      </div>
    </div>
  );
}
