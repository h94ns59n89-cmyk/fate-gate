'use client';

import { useParams, useSearchParams } from 'next/navigation';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { ReportPageViewer } from '@/components/report/ReportPageViewer';
import { SummaryCard } from '@/components/report/SummaryCard';
import { PayWall } from '@/components/report/PayWall';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Button } from '@/components/common/Button';
import { trackEvent, EVENTS } from '@/lib/analytics';
import { useUserStore } from '@/stores/userStore';
import type { BaziCalculationMeta, FullReport, FiveElements, PersonalityTags } from '@/lib/types';

interface BaziPayload {
  b: Record<string, unknown>;
  f: FiveElements;
  d: string;
  de?: string;
  m?: BaziCalculationMeta;
  t: string[];
  c: string[];
  l: string;
  fs?: string;
}

export default function ReportPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const userId = useUserStore((s) => s.userId);

  const [loading, setLoading] = useState(true);
  const [paid, setPaid] = useState(false);
  const [report, setReport] = useState<FullReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const [personalityTags, setPersonalityTags] = useState<string[]>();
  const [fiveElements, setFiveElements] = useState<FiveElements>();
  const [summary, setSummary] = useState<PersonalityTags>();
  const [baziMeta, setBaziMeta] = useState<BaziCalculationMeta>();

  const baziData: BaziPayload | null = useMemo(() => {
    const raw = searchParams?.get('data');
    if (!raw) return null;
    try {
      return JSON.parse(decodeURIComponent(raw)) as BaziPayload;
    } catch {
      return null;
    }
  }, [searchParams]);

  const reportId = useMemo(() => {
    const id = parseInt(params?.id as string, 10);
    return isNaN(id) ? 0 : id;
  }, [params?.id]);

  useEffect(() => {
    trackEvent(EVENTS.REPORT_VIEWED);
    let cancelled = false;
    let intervalId: number | undefined;

    const stop = () => {
      if (intervalId) { window.clearInterval(intervalId); intervalId = undefined; }
    };

    const loadReport = async () => {
      try {
        const res = await fetch(`/api/v1/reports/${reportId}`);
        const data = await res.json();
        if (cancelled) return;
        if (data.code === 0) {
          setPersonalityTags(data.data?.personality_tags);
          setFiveElements(data.data?.five_elements);
          setSummary(data.data?.summary);
          setBaziMeta(data.data?.bazi?.calculation_meta);
          if (data.data?.full_report) {
            setReport(data.data.full_report);
            if (data.data.report_type === 'paid') setPaid(true);
          }
          if (data.data?.status === 'pending') {
            return;
          }
        }
        stop();
        setLoading(false);
      } catch {
        if (!cancelled) setLoading(false);
        stop();
      }
    };

    if (reportId > 0) {
      loadReport().then(() => {
        if (cancelled || intervalId) return;
        intervalId = window.setInterval(loadReport, 3000);
        window.setTimeout(() => {
          if (!cancelled) { stop(); setLoading(false); }
        }, 30000);
      });
    } else {
      setLoading(false);
    }

    return () => { cancelled = true; stop(); };
  }, [reportId]);

  const generateReport = useCallback(async () => {
    if (!baziData) return;
    setGenerating(true);
    try {
      const res = await fetch('/api/v1/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bazi_data: {
            dayMaster: baziData.d,
            dayMasterElement: baziData.de,
            pillars: baziData.b,
            fiveElements: baziData.f,
            shishen: {},
            dayun: {},
            calculationMeta: baziData.m,
          },
        }),
      });
      const data = await res.json();
      if (data.code === 0 && data.data?.report) {
        setReport(data.data.report);
        setPaid(true);
      } else {
        setError('报告生成失败，请稍后重试');
      }
    } catch {
      setError('报告生成失败，请稍后重试');
    } finally {
      setGenerating(false);
    }
  }, [baziData]);

  const handlePaySuccess = useCallback(async () => {
    trackEvent(EVENTS.PAY_SUCCESS);
    setTransitioning(true);
    try {
      const res = await fetch(`/api/v1/reports/${reportId}`);
      const data = await res.json();
      if (data.code === 0 && data.data?.full_report) {
        setReport(data.data.full_report);
        setPaid(true);
      } else if (baziData) {
        generateReport();
      } else {
        setPaid(true);
      }
    } catch {
      if (baziData) {
        generateReport();
      } else {
        setPaid(true);
      }
    } finally {
      setTransitioning(false);
    }
  }, [baziData, generateReport, reportId]);

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4">
        <p className="text-sm text-[#f44747]">{error}</p>
        <Button onClick={() => window.location.reload()}>重试</Button>
      </div>
    );
  }

  if (loading || generating || transitioning) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3">
        <LoadingSpinner size="lg" />
        <p className="text-sm text-[#858585]">
          {generating ? '正在生成报告...' : transitioning ? '正在更新...' : '加载中...'}
        </p>
      </div>
    );
  }

  const invalidReport = reportId <= 0 && !baziData;
  if (reportId <= 0 && baziData) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4">
        <p className="text-sm text-[#d4a853]">报告数据异常</p>
        <p className="text-xs text-[#858585]">未获取到有效的报告编号，请尝试重新生成</p>
        <Button onClick={generateReport} loading={generating}>重新生成报告</Button>
        <Button variant="ghost" size="sm" onClick={() => window.location.href = '/'}>返回首页</Button>
      </div>
    );
  }
  if (invalidReport) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4">
        <p className="text-sm text-[#f44747]">报告不存在或已失效</p>
        <Button onClick={() => window.location.href = '/'}>重新测算</Button>
      </div>
    );
  }

  const inviteCodeSection = userId ? (
    <div className="mt-6 rounded-card border border-[#d4a853]/20 bg-[#d4a853]/5 px-5 py-4">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#d4a853]/15 text-sm text-[#d4a853]">✦</div>
        <div className="flex-1">
          <p className="text-xs font-medium text-[#d4a853]">邀请好友对比人格</p>
          <p className="mt-0.5 text-[11px] text-[#858585]">你的邀请码：<span className="font-mono text-xs font-semibold text-[#d4d4d4]">u_{userId}</span></p>
        </div>
        <button
          onClick={() => navigator.clipboard.writeText(`u_${userId}`)}
          className="rounded-md border border-[#d4a853]/30 bg-[#d4a853]/10 px-3 py-1.5 text-xs font-medium text-[#d4a853] hover:bg-[#d4a853]/20 active:scale-95"
        >
          复制
        </button>
      </div>
      <p className="mt-2 text-[11px] leading-relaxed text-[#6a6a6a]">
        对方在「人格对比」页面输入你的邀请码即可把你们的八字放在一起比较
      </p>
    </div>
  ) : null;

  if (paid && report) {
    return (
      <div className="min-h-screen pt-14">
        <div className="px-4 pb-[68px]">
          <ReportPageViewer report={report} onShare={() => trackEvent(EVENTS.SUMMARY_SHARED)} />
          {inviteCodeSection}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-14">
      <div className="px-4 pb-[110px]">
        <SummaryCard
          personalityTags={personalityTags}
          fiveElements={fiveElements}
          coreTraits={summary?.core_traits}
          lifeTheme={summary?.life_theme}
          calculationMeta={baziMeta}
          onShare={() => trackEvent(EVENTS.SUMMARY_SHARED)}
        />
        {inviteCodeSection}
      </div>
      <div className="fixed bottom-[68px] left-0 right-0 z-50 border-t border-[#2a3040] bg-[#0B0E14]">
        <PayWall reportId={reportId} userId={userId ?? 0} compact onSuccess={handlePaySuccess} />
      </div>
    </div>
  );
}
