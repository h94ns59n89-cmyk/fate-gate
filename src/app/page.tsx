'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/common/Logo';
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
  const [effectiveUserId, setEffectiveUserId] = useState<number | null>(null);
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
    setEffectiveUserId(uid);
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
    <div className="relative min-h-screen">
      <div className="star-field" />
      <div className="fixed inset-0 bg-gradient-to-b from-[#0B0E14]/60 via-[#111827]/40 to-[#0B0E14]/80 pointer-events-none z-[1]" />

      <div className="relative z-10 px-4 pb-[52px] pt-16">
        {step === 'input' && (
          <>
            <div className="mb-10 text-center">
              <div className="mb-4 flex justify-center">
                <Logo size="lg" showText={false} />
              </div>
              <h1 className="font-serif text-3xl font-bold tracking-wider text-[#d4a853]">
                星隅
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-[#858585]">
                输入出生信息，AI 基于八字命理
                <br />
                分析你独一无二的人格
              </p>
              <div className="mt-3 flex items-center justify-center gap-2 text-xs text-[#6a6a6a]">
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#d4a853]/15 text-[10px] text-[#d4a853]">✦</span>
                已有 <span className="font-medium text-[#d4a853]">12,458</span> 人完成测算
              </div>
            </div>

            <div className="mx-auto max-w-md">
              <div className="glass-card">
                <BirthForm onSubmit={handleSubmit} loading={loading} />
              </div>
            </div>

            {error && (
              <p className="mt-4 text-center text-sm text-[#f44747]">{error}</p>
            )}
          </>
        )}

        {step === 'generating' && (
          <div className="flex flex-col items-center justify-center gap-6 py-24">
            <Logo size="md" showText={false} />
            <LoadingSpinner size="lg" />
            <div className="text-center">
              <p className="text-sm text-[#d4d4d4]">正在排盘计算...</p>
              <p className="mt-1 text-xs text-[#6a6a6a]">基于你的出生信息进行命理分析</p>
            </div>
          </div>
        )}

        {step === 'result' && (
          <div className="mx-auto max-w-md">
            <div className="mb-6 text-center">
              <p className="text-xs font-medium tracking-wider text-[#858585]">你的人格</p>
              <div className="mt-1 flex items-center justify-center gap-2">
                <span className="h-px w-6 bg-[#d4a853]/30" />
                <span className="text-xs text-[#d4a853]">基于八字命理分析</span>
                <span className="h-px w-6 bg-[#d4a853]/30" />
              </div>
            </div>
            <SummaryCard
              personalityTags={result!.personalityTags}
              fiveElements={result!.fiveElements}
              coreTraits={result!.coreTraits}
              lifeTheme={result!.lifeTheme}
              calculationMeta={result!.calculationMeta}
              onShare={handleShare}
              onUnlock={handleUnlock}
            />
            {result!.reportId > 0 && effectiveUserId != null && (
              <div className="mt-6 rounded-card border border-[#d4a853]/20 bg-[#d4a853]/5 px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#d4a853]/15 text-sm text-[#d4a853]">✦</div>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-[#d4a853]">邀请好友对比人格</p>
                    <p className="mt-0.5 text-[11px] text-[#858585]">你的邀请码：<span className="font-mono text-xs font-semibold text-[#d4d4d4]">u_{effectiveUserId}</span></p>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`u_${effectiveUserId}`);
                      trackEvent(EVENTS.SUMMARY_SHARED);
                    }}
                    className="rounded-md border border-[#d4a853]/30 bg-[#d4a853]/10 px-3 py-1.5 text-xs font-medium text-[#d4a853] hover:bg-[#d4a853]/20 active:scale-95"
                  >
                    复制
                  </button>
                </div>
                <p className="mt-2 text-[11px] leading-relaxed text-[#6a6a6a]">
                  对方在「人格对比」页面输入你的邀请码即可把你们的八字放在一起比较
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <QuizModal
        open={showQuiz}
        onComplete={handleQuizComplete}
        onClose={() => setShowQuiz(false)}
        onSkip={() => {
          setShowQuiz(false);
          const pending = pendingFormRef.current;
          if (pending) {
            runCalculate({
              birthDate: pending.birthDate,
              birthHour: 12,
              birthMinute: pending.birthMinute,
              birthPlace: pending.birthPlace,
              isSolarCalendar: pending.isSolarCalendar,
            });
            pendingFormRef.current = null;
          }
        }}
      />

      {showShare && result && <div className="fixed inset-0 z-50 flex items-end justify-center">
        <div className="absolute inset-0 bg-black/70" onClick={() => setShowShare(false)} />
        <div className="relative w-full max-w-md rounded-t-card border-t border-[#2a3040] bg-[#111827] px-5 pb-8 pt-5 shadow-modal">
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
        </div>}
    </div>
  );
}
