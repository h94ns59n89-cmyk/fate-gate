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
        backgroundColor: '#FAF8F5',
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
      <div className="space-y-4 rounded-[16px] bg-[#FAF8F5] p-6">
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
        className="overflow-hidden rounded-[16px] bg-[#FAF8F5]"
        style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif' }}
      >
        {/* Warm decorative top border */}
        <div className="h-1 bg-gradient-to-r from-[#E8D5C4] via-[#D4C0B0] to-[#E8D5C4]" />

        {/* Header */}
        <div className="relative px-8 pb-6 pt-10 text-center">
          {/* Corner decorations */}
          <div className="absolute left-6 top-6 text-[#D4C0B0]/30 text-xs">✦</div>
          <div className="absolute right-6 top-6 text-[#D4C0B0]/30 text-xs">✦</div>

          <div className="mx-auto mb-3 flex items-center justify-center gap-2">
            <span className="h-px w-6 bg-[#D4C0B0]/30" />
            <span className="text-[9px] tracking-[0.25em] text-[#B8A89A]">星 隅</span>
            <span className="h-px w-6 bg-[#D4C0B0]/30" />
          </div>

          <h1 className="text-2xl font-bold tracking-wider text-[#4A3F3A]" style={{ fontFamily: '"Noto Serif SC", "STSong", serif' }}>
            人格认知报告
          </h1>
          <div className="mx-auto mt-3 h-px w-16 bg-gradient-to-r from-transparent via-[#D4C0B0]/50 to-transparent" />
          <p className="mt-3 text-[10px] tracking-[0.3em] text-[#B8A89A]">摘 要 版</p>
        </div>

        {personalityTags && personalityTags.length > 0 && (
          <div className="px-8 py-5">
            <div className="mb-4 flex items-center gap-2">
              <span className="h-3 w-[2px] rounded-full bg-[#C9A88D]" />
              <h2 className="text-[10px] font-semibold tracking-wider text-[#B8A89A]">你的人格</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {personalityTags.map((tag, i) => (
                <span
                  key={i}
                  className="inline-block rounded-[20px] bg-[#EDE6DE] px-4 py-1.5 text-xs font-medium leading-relaxed text-[#6B5D53]"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {fiveElements && (
          <>
            <div className="mx-8 h-px bg-[#EDE6DE]" />
            <div className="px-8 py-5">
              <div className="mb-4 flex items-center gap-2">
                <span className="h-3 w-[2px] rounded-full bg-[#C9A88D]" />
                <h2 className="text-[10px] font-semibold tracking-wider text-[#B8A89A]">五行能量</h2>
              </div>
              <FiveElementsChart data={fiveElements} />
            </div>
          </>
        )}

        {coreTraits && coreTraits.length > 0 && (
          <>
            <div className="mx-8 h-px bg-[#EDE6DE]" />
            <div className="px-8 py-5">
              <div className="mb-4 flex items-center gap-2">
                <span className="h-3 w-[2px] rounded-full bg-[#C9A88D]" />
                <h2 className="text-[10px] font-semibold tracking-wider text-[#B8A89A]">核心特质</h2>
              </div>
              <ul className="space-y-3">
                {coreTraits.map((trait, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm leading-relaxed text-[#4A3F3A]/80">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#EDE6DE] text-[9px] text-[#B8A89A]">{i + 1}</span>
                    <span className="pt-0.5">{trait}</span>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}

        {pastTendencies && pastTendencies.length > 0 && (
          <>
            <div className="mx-8 h-px bg-[#EDE6DE]" />
            <div className="px-8 py-5">
              <div className="mb-4 flex items-center gap-2">
                <span className="h-3 w-[2px] rounded-full bg-[#C9A88D]" />
                <h2 className="text-[10px] font-semibold tracking-wider text-[#B8A89A]">过去可能倾向</h2>
              </div>
              <ul className="space-y-2.5">
                {pastTendencies.map((t, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm leading-relaxed text-[#4A3F3A]/60 italic">
                    <span className="mt-[5px] h-[3px] w-[3px] shrink-0 rounded-full bg-[#D4C0B0]/50" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}

        {lifeTheme && (
          <>
            <div className="mx-8 h-px bg-[#EDE6DE]" />
            <div className="px-8 py-5">
              <div className="mb-4 flex items-center gap-2">
                <span className="h-3 w-[2px] rounded-full bg-[#C9A88D]" />
                <h2 className="text-[10px] font-semibold tracking-wider text-[#B8A89A]">人生主题</h2>
              </div>
              <div className="relative rounded-[10px] bg-[#EDE6DE]/40 px-5 py-4 text-center">
                <span className="absolute left-3 top-2 font-serif text-2xl leading-none text-[#D4C0B0]/40">&ldquo;</span>
                <p className="text-sm font-medium leading-relaxed tracking-wide text-[#8A7A6C]">{lifeTheme}</p>
                <span className="absolute bottom-0 right-3 font-serif text-2xl leading-none text-[#D4C0B0]/40">&rdquo;</span>
              </div>
            </div>
          </>
        )}

        {/* Footer */}
        <div className="mt-2 border-t border-[#EDE6DE] px-8 pb-6 pt-4 text-center">
          {calculationMeta?.enabled_true_solar_time && (
            <p className="mb-2 text-[9px] leading-relaxed text-[#B8A89A]">
              按出生地换算真太阳时：{calculationMeta.true_solar_time}（修正 {calculationMeta.true_solar_delta_minutes} 分钟）
            </p>
          )}
          <div className="flex items-center justify-center gap-2">
            <span className="h-px w-4 bg-[#EDE6DE]" />
            <span className="text-[9px] text-[#D4C0B0]">星隅出品</span>
            <span className="h-px w-4 bg-[#EDE6DE]" />
          </div>
          <p className="mt-1 text-[8px] text-[#D4C0B0]/60">AI 生成 · 仅供娱乐参考</p>
          {personalityTags?.some(t => t.includes('(')) && (
            <p className="mt-0.5 text-[7px] text-[#D4C0B0]/40">MBTI 类型为 AI 据八字特征生成的分析标签，非标准 MBTI 测评结果</p>
          )}
        </div>
      </div>

      {/* Download icon */}
      <button
        onClick={handleSaveImage}
        disabled={saving}
        className="absolute -bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-[#FAF8F5] text-[#C9A88D] shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition-colors hover:bg-[#EDE6DE] active:scale-90 disabled:opacity-50"
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
