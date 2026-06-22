'use client';

import { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import { Skeleton } from '@/components/common/Skeleton';
import { FiveElementsChart } from '@/components/report/FiveElementsChart';
import type { BaziCalculationMeta, FiveElements } from '@/lib/types';

interface SummaryCardProps {
  personalityTags?: string[] | undefined;
  fiveElements?: FiveElements | undefined;
  coreTraits?: string[] | undefined;
  lifeTheme?: string | undefined;
  calculationMeta?: BaziCalculationMeta | undefined;
  reportId?: number | undefined;
  isLoading?: boolean | undefined;
  onShare?: (() => void) | undefined;
  onUnlock?: (() => void) | undefined;
  pastTendencies?: string[] | undefined;
}

export function SummaryCard({
  personalityTags,
  fiveElements,
  coreTraits,
  lifeTheme,
  calculationMeta,
  isLoading,
  pastTendencies,
}: SummaryCardProps) {
  const captureRef = useRef<HTMLDivElement>(null);
  const [saving, setSaving] = useState(false);

  const handleSaveImage = async () => {
    if (!captureRef.current || saving) return;
    setSaving(true);
    try {
      const canvas = await html2canvas(captureRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#FFFFFF',
        logging: false,
      });
      const link = document.createElement('a');
      link.download = `星隅人格报告_${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch {
      // silently fail
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4 rounded-[16px] bg-[#FFFFFF] p-6 shadow-sm">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-3 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div
        ref={captureRef}
        className="overflow-hidden rounded-[16px] bg-[#FFFFFF] shadow-sm"
        style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans SC", sans-serif' }}
      >
        {/* Header */}
        <div className="relative px-7 pb-7 pt-10 text-center">
          <div className="absolute left-0 right-0 top-0 h-[3px] bg-gradient-to-r from-transparent via-[#9B7FBB]/40 to-transparent" />
          <div className="absolute left-4 right-4 top-3 flex justify-between text-[10px] tracking-[0.4em] text-[#9B7FBB]/20">
            <span>✦</span>
            <span>✦</span>
            <span>✦</span>
            <span>✦</span>
            <span>✦</span>
          </div>
          <div className="mx-auto mb-4 flex items-center justify-center gap-3">
            <span className="h-px w-10 bg-gradient-to-r from-transparent to-[#9B7FBB]/25" />
            <span className="text-[10px] tracking-[0.3em] text-[#9B7FBB]/60">星 隅</span>
            <span className="h-px w-10 bg-gradient-to-l from-transparent to-[#9B7FBB]/25" />
          </div>
          <h1 className="text-xl font-semibold tracking-wider text-[#1F1D2B]">人格认知报告</h1>
          <div className="mx-auto mt-3 h-px w-14 bg-[#9B7FBB]/20" />
          <p className="mt-3 text-[11px] tracking-widest text-[#8A8696]">摘 要 版</p>
        </div>

        {personalityTags && personalityTags.length > 0 && (
          <div className="border-t border-[rgba(0,0,0,0.04)] px-7 py-6">
            <div className="mb-4 flex items-center gap-2.5">
              <span className="h-3.5 w-[3px] rounded-full bg-[#9B7FBB]" />
              <h2 className="text-[11px] font-semibold tracking-wider text-[#6B6778]">你的人格</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {personalityTags.map((tag, i) => (
                <span
                  key={i}
                  className="inline-block rounded-[20px] border border-[#9B7FBB]/12 bg-[#9B7FBB]/6 px-3.5 py-1.5 text-xs font-medium leading-relaxed text-[#9B7FBB]"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {fiveElements && (
          <div className="border-t border-[rgba(0,0,0,0.04)] px-7 py-6">
            <div className="mb-5 flex items-center gap-2.5">
              <span className="h-3.5 w-[3px] rounded-full bg-[#9B7FBB]" />
              <h2 className="text-[11px] font-semibold tracking-wider text-[#6B6778]">五行能量</h2>
            </div>
            <FiveElementsChart data={fiveElements} />
          </div>
        )}

        {coreTraits && coreTraits.length > 0 && (
          <div className="border-t border-[rgba(0,0,0,0.04)] px-7 py-6">
            <div className="mb-4 flex items-center gap-2.5">
              <span className="h-3.5 w-[3px] rounded-full bg-[#9B7FBB]" />
              <h2 className="text-[11px] font-semibold tracking-wider text-[#6B6778]">核心特质</h2>
            </div>
            <ul className="space-y-2.5">
              {coreTraits.map((trait, i) => (
                <li key={i} className="flex items-start gap-3 text-sm leading-relaxed text-[#1F1D2B]/80">
                  <span className="mt-[5px] flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#9B7FBB]/10 text-[9px] text-[#9B7FBB]">{i + 1}</span>
                  {trait}
                </li>
              ))}
            </ul>
          </div>
        )}

        {pastTendencies && pastTendencies.length > 0 && (
          <div className="border-t border-[rgba(0,0,0,0.04)] px-7 py-6">
            <div className="mb-4 flex items-center gap-2.5">
              <span className="h-3.5 w-[3px] rounded-full bg-[#8A8696]" />
              <h2 className="text-[11px] font-semibold tracking-wider text-[#6B6778]">过去可能倾向</h2>
            </div>
            <ul className="space-y-2.5">
              {pastTendencies.map((t, i) => (
                <li key={i} className="flex items-start gap-3 text-sm leading-relaxed text-[#1F1D2B]/60 italic">
                  <span className="mt-[5px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#8A8696]/30" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
        )}

        {lifeTheme && (
          <div className="border-t border-[rgba(0,0,0,0.04)] px-7 py-6">
            <div className="mb-4 flex items-center gap-2.5">
              <span className="h-3.5 w-[3px] rounded-full bg-[#9B7FBB]" />
              <h2 className="text-[11px] font-semibold tracking-wider text-[#6B6778]">人生主题</h2>
            </div>
            <div className="relative rounded-[10px] bg-[#F8F6FF] px-5 py-4">
              <span className="absolute -left-1.5 -top-1.5 text-2xl leading-none text-[#9B7FBB]/15">❝</span>
              <p className="text-sm font-medium leading-relaxed text-[#9B7FBB]">{lifeTheme}</p>
              <span className="absolute -bottom-3 -right-1 text-2xl leading-none text-[#9B7FBB]/15">❞</span>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="border-t border-[rgba(0,0,0,0.04)] px-7 pb-6 pt-4 text-center">
          {calculationMeta?.enabled_true_solar_time && (
            <p className="mb-2 text-[10px] leading-relaxed text-[#8A8696]">
              已按出生地换算真太阳时：{calculationMeta.true_solar_time}
              （修正 {calculationMeta.true_solar_delta_minutes} 分钟）
            </p>
          )}
          <p className="text-[10px] text-[#B8B6C0]">本内容由 AI 生成，仅供娱乐参考</p>
        </div>
      </div>

      {/* Download icon — outside captureRef, positioned at bottom-right */}
      <button
        onClick={handleSaveImage}
        disabled={saving}
        className="absolute -bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-[#FFFFFF] text-[#9B7FBB] shadow-md transition-colors hover:bg-[#F8F6FF] active:scale-90 disabled:opacity-50"
        title="保存为图片"
      >
        {saving ? (
          <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        )}
      </button>
    </div>
  );
}
