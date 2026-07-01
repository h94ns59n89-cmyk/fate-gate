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
  const isGuest = useUserStore((s) => s.isGuest);
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

  const handleUnlock = useCallback(() => {
    trackEvent(EVENTS.PAY_CLICKED);
    if (!result) return;
    if (isGuest) {
      router.push('/login');
      return;
    }
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
  }, [result, router, isGuest]);

  return (
    <div className="relative">
      <div className="star-field" />

      <div className="relative z-10 px-4 pt-4 md:pt-0">
        {step === 'input' && (
          <>
            <div className="mb-10 text-center">
              {/* Decorative dots */}
              <div className="absolute left-6 top-20">
                <div className="h-1 w-1 rounded-full bg-[#9B7FBB]/12" />
                <div className="ml-4 mt-2 h-0.5 w-0.5 rounded-full bg-[#9B7FBB]/6" />
              </div>
              <div className="absolute right-6 top-24">
                <div className="h-0.5 w-0.5 rounded-full bg-[#9B7FBB]/8" />
                <div className="ml-2 mt-3 h-1 w-1 rounded-full bg-[#9B7FBB]/5" />
              </div>

              <h1 className="font-serif text-3xl font-bold tracking-wider text-[#9B7FBB]">
                星隅
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-[#6B6778]">
                古典人格认知工具 · 30 秒获取你的五行人格报告
              </p>
              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-[#8A8696]">
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#9B7FBB]/10 text-[10px] text-[#9B7FBB]">✦</span>
                已有 <span className="font-medium text-[#9B7FBB]">12,458</span> 人完成探索
              </div>
            </div>

            <div className="mx-auto max-w-md">
              <div className="mb-4 rounded-[8px] bg-[#F8F8FA] px-4 py-3 text-xs">
                <p className="mb-1 text-[10px] text-[#8A8696]/60">使用示例</p>
                <p className="text-[#6B6778]">1990年5月15日 · 辰时 · 0分 · 北京</p>
                <p className="mt-0.5 text-[10px] text-[#8A8696]/50">支持公历/农历 · 城市级地址即可</p>
              </div>
              <div className="vscode-card">
                <BirthForm onSubmit={handleSubmit} loading={loading} onQuizClick={() => setShowQuiz(true)} />
              </div>
            </div>

            {error && (
              <p className="mt-4 text-center text-sm text-[#E05A5A]">{error}</p>
            )}
          </>
        )}

        {step === 'generating' && (
          <div className="flex flex-col items-center justify-center gap-6 py-24">
            <LoadingSpinner size="lg" />
            <div className="text-center">
              <p className="text-sm text-[#1F1D2B]">正在排盘计算...</p>
              <p className="mt-1 text-xs text-[#8A8696]">基于你的出生信息进行命理分析</p>
            </div>
          </div>
        )}

        {step === 'result' && (
          <div className="mx-auto max-w-md">
            <div className="mb-6 text-center">
              <p className="text-xs font-medium tracking-wider text-[#6B6778]">你的人格</p>
              <div className="mt-1 flex items-center justify-center gap-2">
                <span className="h-px w-6 bg-[#9B7FBB]/25" />
                <span className="text-xs text-[#9B7FBB]">基于八字命理分析</span>
                <span className="h-px w-6 bg-[#9B7FBB]/25" />
              </div>
            </div>
            <SummaryCard
              personalityTags={result!.personalityTags}
              fiveElements={result!.fiveElements}
              coreTraits={result!.coreTraits}
              lifeTheme={result!.lifeTheme}
              calculationMeta={result!.calculationMeta}
            />
            {result!.reportId > 0 && (
              <button
                onClick={handleUnlock}
                className="mt-4 w-full rounded-[10px] bg-[#9B7FBB]/8 py-3 text-sm font-medium text-[#9B7FBB] transition-colors hover:bg-[#9B7FBB]/15 active:scale-[0.98]"
              >
                获取完整报告 →
              </button>
            )}
            {result!.reportId > 0 && effectiveUserId != null && (
              <div className="mt-6 rounded-[10px] border border-[rgba(0,0,0,0.06)] bg-[#F8F8FA] px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#9B7FBB]/8 text-sm text-[#9B7FBB]">✦</div>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-[#9B7FBB]">邀请好友对比人格</p>
                    <p className="mt-0.5 text-[11px] text-[#6B6778]">你的邀请码：<span className="font-mono text-xs font-semibold text-[#1F1D2B]">u_{effectiveUserId}</span></p>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`u_${effectiveUserId}`);
                      trackEvent(EVENTS.SUMMARY_SHARED);
                    }}
                    className="rounded-md border border-[#9B7FBB]/25 bg-[#9B7FBB]/8 px-3 py-1.5 text-xs font-medium text-[#9B7FBB] transition-colors hover:bg-[#9B7FBB]/15 active:scale-[0.97]"
                  >
                    复制
                  </button>
                </div>
              </div>
            )}
            <div className="mt-6 rounded-[10px] bg-[#FFFFFF] p-5 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="text-base text-[#9B7FBB]">⟷</span>
                <p className="text-sm font-semibold text-[#1F1D2B]">想知道你和TA的匹配度？</p>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-[#6B6778]">
                输入对方出生信息，生成双人人格对比报告，包含：
              </p>
              <ul className="mt-2 space-y-1 text-[11px] text-[#8A8696]">
                <li>匹配度百分比 · 四维度分析（沟通/情感/价值观/成长）</li>
                <li>相处建议</li>
              </ul>
              <button
                onClick={() => router.push('/comparison')}
                className="mt-4 w-full rounded-[10px] bg-[#9B7FBB] py-2.5 text-sm font-medium text-[#FFFFFF] transition-colors hover:bg-[#8A6EAA] active:scale-[0.98]"
              >
                开始对比 →
              </button>
            </div>
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
        <div className="absolute inset-0 bg-black/30" onClick={() => setShowShare(false)} />
        <div className="relative w-full max-w-md rounded-t-card border-t border-[rgba(0,0,0,0.06)] bg-[#FFFFFF] px-5 pb-8 pt-5 shadow-modal">
          <div className="mb-4 text-center">
            <h3 className="text-sm font-semibold text-[#1F1D2B]">分享你的人格</h3>
            <p className="mt-1 text-xs text-[#6B6778]">让朋友也来测一测</p>
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
