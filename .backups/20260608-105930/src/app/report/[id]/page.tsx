'use client';

import { useParams, useSearchParams } from 'next/navigation';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { ReportPageViewer } from '@/components/report/ReportPageViewer';
import { PayWall } from '@/components/report/PayWall';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Button } from '@/components/common/Button';
import { trackEvent, EVENTS } from '@/lib/analytics';
import { useUserStore } from '@/stores/userStore';
import type { BaziCalculationMeta, FullReport, FiveElements } from '@/lib/types';

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
          if (data.code === 0 && data.data?.full_report) {
            setReport(data.data.full_report);
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

  const handlePaySuccess = useCallback(() => {
    if (baziData) {
      generateReport();
    } else {
      setPaid(true);
    }
    trackEvent(EVENTS.PAY_SUCCESS);
  }, [baziData, generateReport]);

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4">
        <p className="text-sm text-[#f44747]">{error}</p>
        <Button onClick={() => window.location.reload()}>重试</Button>
      </div>
    );
  }

  if (loading || generating) {
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
        <div className="px-4 pb-24">
          <ReportPageViewer report={report} onShare={() => trackEvent(EVENTS.SUMMARY_SHARED)} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-14">
      <div className="px-4 pb-24">
        <div className="space-y-4">
          <div className="vscode-card">
            <h1 className="mb-2 text-base font-semibold text-[#d4d4d4]">命理人格报告</h1>
            <p className="text-sm text-[#858585]">
              {baziData?.d ? `${baziData.d}型 · 已生成免费摘要` : '已生成免费摘要'}
              ，解锁查看完整 10 页深度分析
            </p>
          </div>
          <PayWall reportId={reportId} userId={userId ?? 0} onSuccess={handlePaySuccess} />
        </div>
      </div>
    </div>
  );
}
