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
  onShare,
  onUnlock,
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
      <div className="space-y-4 rounded-[12px] bg-[#FFFFFF] p-5 shadow-sm">
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
    <div className="space-y-5">
      <div
        ref={captureRef}
        className="overflow-hidden rounded-[12px] bg-[#FFFFFF] shadow-sm"
        style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans SC", sans-serif' }}
      >
        {/* Decorative header */}
        <div className="relative bg-gradient-to-b from-[#F8F6FF] to-[#FFFFFF] px-6 pb-6 pt-8 text-center">
          <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-[#9B7FBB]/30 to-transparent" />
          <div className="mx-auto mb-3 flex items-center justify-center gap-3">
            <span className="h-px w-8 bg-gradient-to-r from-transparent to-[#9B7FBB]/30" />
            <span className="text-xs tracking-[0.3em] text-[#9B7FBB]">✦ 星隅 ✦</span>
            <span className="h-px w-8 bg-gradient-to-l from-transparent to-[#9B7FBB]/30" />
          </div>
          <h1 className="text-xl font-semibold tracking-wide text-[#1F1D2B]">人格认知报告</h1>
          <div className="mx-auto mt-2 h-px w-12 bg-[#9B7FBB]/25" />
          <p className="mt-3 text-[11px] tracking-wider text-[#8A8696]">摘要版 · 基于八字命理分析</p>
        </div>

        {personalityTags && (
          <div className="border-t border-[rgba(0,0,0,0.04)] px-6 py-5">
            <div className="mb-3 flex items-center gap-2">
              <span className="h-3 w-[3px] rounded-full bg-[#9B7FBB]" />
              <h2 className="text-xs font-semibold tracking-wide text-[#6B6778]">你的人格</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {personalityTags.map((tag, i) => (
                <span
                  key={i}
                  className="inline-block rounded-[20px] bg-[#9B7FBB]/8 px-3.5 py-1.5 text-xs font-medium text-[#9B7FBB]"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {fiveElements && (
          <div className="border-t border-[rgba(0,0,0,0.04)] px-6 py-5">
            <div className="mb-4 flex items-center gap-2">
              <span className="h-3 w-[3px] rounded-full bg-[#9B7FBB]" />
              <h2 className="text-xs font-semibold tracking-wide text-[#6B6778]">五行能量</h2>
            </div>
            <FiveElementsChart data={fiveElements} />
          </div>
        )}

        {coreTraits && (
          <div className="border-t border-[rgba(0,0,0,0.04)] px-6 py-5">
            <div className="mb-3 flex items-center gap-2">
              <span className="h-3 w-[3px] rounded-full bg-[#9B7FBB]" />
              <h2 className="text-xs font-semibold tracking-wide text-[#6B6778]">核心特质</h2>
            </div>
            <ul className="space-y-2">
              {coreTraits.map((trait, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm leading-relaxed text-[#1F1D2B]/80">
                  <span className="mt-[5px] h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#9B7FBB]/50" />
                  {trait}
                </li>
              ))}
            </ul>
          </div>
        )}

        {pastTendencies && pastTendencies.length > 0 && (
          <div className="border-t border-[rgba(0,0,0,0.04)] px-6 py-5">
            <div className="mb-3 flex items-center gap-2">
              <span className="h-3 w-[3px] rounded-full bg-[#8A8696]" />
              <h2 className="text-xs font-semibold tracking-wide text-[#6B6778]">过去可能倾向</h2>
            </div>
            <ul className="space-y-2">
              {pastTendencies.map((t, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm leading-relaxed text-[#1F1D2B]/60 italic">
                  <span className="mt-[5px] h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#8A8696]/40" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
        )}

        {lifeTheme && (
          <div className="border-t border-[rgba(0,0,0,0.04)] px-6 py-5">
            <div className="mb-3 flex items-center gap-2">
              <span className="h-3 w-[3px] rounded-full bg-[#9B7FBB]" />
              <h2 className="text-xs font-semibold tracking-wide text-[#6B6778]">人生主题</h2>
            </div>
            <div className="rounded-[8px] border-l-2 border-[#9B7FBB]/30 bg-[#F8F6FF] px-4 py-3">
              <p className="text-sm font-medium leading-relaxed text-[#9B7FBB]">{lifeTheme}</p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="border-t border-[rgba(0,0,0,0.04)] px-6 pb-6 pt-4 text-center">
          {calculationMeta?.enabled_true_solar_time && (
            <p className="mb-2 text-[10px] leading-relaxed text-[#8A8696]">
              已按出生地换算真太阳时：{calculationMeta.true_solar_time}
              （修正 {calculationMeta.true_solar_delta_minutes} 分钟）
            </p>
          )}
          <p className="text-[10px] text-[#B8B6C0]">
            本内容由 AI 生成，仅供娱乐参考
          </p>
        </div>
      </div>

      {/* Action buttons outside capture area */}
      <div className="flex gap-2">
        {onUnlock && (
          <button
            onClick={onUnlock}
            className="flex-1 rounded-[8px] bg-[#9B7FBB] py-2.5 text-sm font-medium text-[#FFFFFF] transition-colors hover:bg-[#8A6EAA] active:scale-[0.98]"
          >
            查看完整报告
          </button>
        )}
        <button
          onClick={handleSaveImage}
          disabled={saving}
          className="flex items-center justify-center gap-1.5 rounded-[8px] border border-[#9B7FBB]/25 bg-[#F8F6FF] px-4 py-2.5 text-sm font-medium text-[#9B7FBB] transition-colors hover:bg-[#9B7FBB]/10 active:scale-[0.98] disabled:opacity-50"
        >
          {saving ? '保存中...' : '保存为图片'}
        </button>
        {onShare && (
          <button
            onClick={onShare}
            className="flex items-center justify-center gap-1.5 rounded-[8px] border border-[rgba(0,0,0,0.1)] bg-[#FFFFFF] px-4 py-2.5 text-sm font-medium text-[#6B6778] transition-colors hover:bg-[#F8F8FA] active:scale-[0.98]"
          >
            分享
          </button>
        )}
      </div>
    </div>
  );
}
