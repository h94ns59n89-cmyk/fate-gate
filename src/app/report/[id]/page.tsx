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

  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [personalityTags, setPersonalityTags] = useState<string[]>();
  const [fiveElements, setFiveElements] = useState<FiveElements>();
  const [summary, setSummary] = useState<PersonalityTags>();
  const [pastTendencies, setPastTendencies] = useState<string[]>();
  const [fullReport, setFullReport] = useState<FullReport | null>(null);
  const [reportUserId, setReportUserId] = useState<number | null>(null);

  const reportId = parseInt(params?.id as string, 10);
  const validReport = !isNaN(reportId) && reportId > 0;

  const fetchReport = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const token = useUserStore.getState().token;
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch(`/api/v1/reports/${reportId}`, { headers });
      const json = await res.json();
      if (json.code === 0) {
        setPersonalityTags(json.data?.personality_tags);
        setFiveElements(json.data?.five_elements);
        setSummary(json.data?.summary);
        setPastTendencies(json.data?.summary?.past_tendencies);
        setReportUserId(json.data?.user_id ?? null);
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

  if (fullReport) {
    return (
      <div className="px-4 pb-8">
        <div className="mt-4">
          <ReportPageViewer report={fullReport} reportUserId={reportUserId} />
        </div>
      </div>
    );
  }

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
        <LeadGenWall context="完整人格报告" />
      </div>
    </div>
  );
}
