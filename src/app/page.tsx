'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { BirthForm } from '@/components/input/BirthForm';
import { QuizModal } from '@/components/input/QuizModal';
import { SummaryCard } from '@/components/report/SummaryCard';
import { ShareCard } from '@/components/share/ShareCard';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { trackEvent, EVENTS } from '@/lib/analytics';
import { useBaziCalculator } from '@/hooks/useBaziCalculator';
import { useUserStore } from '@/stores/userStore';
import type { BaziResult } from '@/hooks/useBaziCalculator';
import type { TimeGuessResult } from '@/lib/types';

export default function LandingPage() {
  const router = useRouter();
  const [step, setStep] = useState<'input' | 'generating' | 'result'>('input');
  const [result, setResult] = useState<BaziResult | null>(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const pendingFormRef = useRef<{
    birthDate: string;
    birthMinute: string;
    birthPlace: string;
    isSolarCalendar: boolean;
  } | null>(null);
  const { calculate, loading, error } = useBaziCalculator();
  const userId = useUserStore((s) => s.userId);
  const initGuest = useUserStore((s) => s.initGuest);

  useEffect(() => {
    trackEvent(EVENTS.LANDING_VIEW);
    initGuest();
  }, [initGuest]);

  const runCalculate = useCallback(async (params: {
    birthDate: string;
    birthHour: number;
    birthMinute?: string;
    birthPlace?: string;
    isSolarCalendar?: boolean;
  }) => {
    const uid = userId ?? await initGuest();
    setStep('generating');

    const data = await calculate({
      birthDate: params.birthDate,
      birthHour: params.birthHour,
      birthMinute: params.birthMinute ? parseInt(params.birthMinute) : null,
      birthPlace: params.birthPlace || null,
      isSolarCalendar: params.isSolarCalendar ?? true,
      userId: uid,
    });

    if (data) {
      setResult(data);
      trackEvent(EVENTS.SUMMARY_GENERATED);
      setStep('result');
    } else {
      setStep('input');
    }
  }, [calculate, initGuest, userId]);

  const handleSubmit = async (formData: {
    birthDate: string;
    birthHour: string;
    birthMinute: string;
    birthPlace: string;
    isSolarCalendar: boolean;
  }) => {
    if (!formData.birthHour) {
      pendingFormRef.current = {
        birthDate: formData.birthDate,
        birthMinute: formData.birthMinute,
        birthPlace: formData.birthPlace,
        isSolarCalendar: formData.isSolarCalendar,
      };
      setShowQuiz(true);
      return;
    }

    runCalculate({
      birthDate: formData.birthDate,
      birthHour: parseInt(formData.birthHour),
      birthMinute: formData.birthMinute,
      birthPlace: formData.birthPlace,
      isSolarCalendar: formData.isSolarCalendar,
    });
  };

  const handleQuizComplete = useCallback((guess: TimeGuessResult) => {
    setShowQuiz(false);
    const pending = pendingFormRef.current;
    if (pending) {
      runCalculate({
        birthDate: pending.birthDate,
        birthHour: guess.hour,
        birthMinute: pending.birthMinute,
        birthPlace: pending.birthPlace,
        isSolarCalendar: pending.isSolarCalendar,
      });
      pendingFormRef.current = null;
    }
  }, [runCalculate]);

  const handleShare = useCallback(async () => {
    trackEvent(EVENTS.SUMMARY_SHARED);
    if (navigator.share) {
      try {
        await navigator.share({
           title: '我的人格',
           text: '测一测你的人格，和 MBTI 一样有趣！',
          url: window.location.href,
        });
      } catch {
        setShowShare(true);
      }
    } else {
      setShowShare(true);
    }
  }, []);

  const handleUnlock = useCallback(() => {
    trackEvent(EVENTS.PAY_CLICKED);
    if (!result) return;
    if (result.reportId > 0) {
      router.push(`/report/${result.reportId}`);
    } else {
      const payload = {
        b: result.bazi,
        f: result.fiveElements,
        d: result.dayMaster,
        de: result.dayMasterElement,
        m: result.calculationMeta,
        t: result.personalityTags,
        c: result.coreTraits,
        l: result.lifeTheme,
        fs: result.fiveElementsSummary,
      };
      router.push(`/report/0?data=${encodeURIComponent(JSON.stringify(payload))}`);
    }
  }, [result, router]);

  return (
    <div className="min-h-screen">
      <div className="px-4 pb-[52px] pt-14">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-2xl font-semibold text-[#d4d4d4]">
            {step === 'result' ? '你的人格' : '你本无可复制'}
          </h1>
          <p className="text-sm text-[#858585]">
            {step === 'input' && '30秒出结果 · 和 MBTI 一样有趣'}
            {step === 'generating' && '正在分析你的人格...'}
            {step === 'result' && '基于八字命理分析'}
          </p>
          {step === 'input' && (
            <p className="mt-2 text-xs text-[#6a6a6a]">
              已有 <span className="text-[#d4a853]">12,458</span> 人完成测算
            </p>
          )}
          {step === 'input' && error && (
            <p className="mt-2 text-sm text-[#f44747]">{error}</p>
          )}
        </div>

        {step === 'input' && (
          <BirthForm onSubmit={handleSubmit} loading={loading} />
        )}

        {step === 'generating' && (
          <div className="flex flex-col items-center justify-center gap-3 py-20">
            <LoadingSpinner size="lg" />
            <div role="status" aria-live="polite" className="text-sm text-[#858585]">
              正在排盘计算...
            </div>
          </div>
        )}

        {step === 'result' && result && (
          <SummaryCard
            personalityTags={result.personalityTags}
            fiveElements={result.fiveElements}
            coreTraits={result.coreTraits}
            lifeTheme={result.lifeTheme}
            calculationMeta={result.calculationMeta}
            onShare={handleShare}
            onUnlock={handleUnlock}
          />
        )}
      </div>

      <QuizModal
        open={showQuiz}
        onComplete={handleQuizComplete}
        onClose={() => setShowQuiz(false)}
      />

      {showShare && result && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div className="absolute inset-0 bg-black/70" onClick={() => setShowShare(false)} />
          <div className="relative w-full max-w-md rounded-t-[6px] border-t border-[#2a3040] bg-[#111827] px-5 pb-8 pt-5 shadow-modal">
            <div className="mb-4 text-center">
              <h3 className="text-sm font-semibold text-[#d4d4d4]">分享你的人格</h3>
              <p className="mt-1 text-xs text-[#858585]">让朋友也来测一测</p>
            </div>
            <ShareCard
              {...(result.reportId > 0 ? { imageUrl: `/api/v1/og/summary?reportId=${result.reportId}` } : {})}
              onShare={() => {
                const url = result.reportId > 0
                  ? `${window.location.origin}/report/${result.reportId}`
                  : window.location.href;
                navigator.clipboard.writeText(url);
                setShowShare(false);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
