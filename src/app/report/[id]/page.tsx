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
    if (reportId > 0) {
      fetch(`/api/v1/reports/${reportId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.code === 0) {
            setPersonalityTags(data.data?.personality_tags);
            setFiveElements(data.data?.five_elements);
            setSummary(data.data?.summary);
            setBaziMeta(data.data?.bazi?.calculation_meta);
            if (data.data?.full_report) {
              setReport(data.data.full_report);
              if (data.data.report_type === 'paid') {
                setPaid(true);
              }
            }
          }
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
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
        <p className="text-sm text-[#858585]">{generating ? '正在生成报告...' : '加载中...'}</p>
      </div>
    );
  }

  if (paid && report) {
    return (
      <div className="min-h-screen pt-14">
        <div className="px-4 pb-[60px]">
          <ReportPageViewer report={report} onShare={() => trackEvent(EVENTS.SUMMARY_SHARED)} />
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
      </div>
      <div className="fixed bottom-[44px] left-0 right-0 z-50 border-t border-[#2a3040] bg-[#0B0E14]">
        <PayWall reportId={reportId} userId={userId ?? 0} compact onSuccess={handlePaySuccess} />
      </div>
    </div>
  );
}
