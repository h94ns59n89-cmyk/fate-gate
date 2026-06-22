'use client';

import { Skeleton } from '@/components/common/Skeleton';
import { Button } from '@/components/common/Button';
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
  if (isLoading) {
    return (
      <div className="vscode-card space-y-4">
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
    <div className="vscode-card space-y-5">
      {personalityTags && (
        <div className="space-y-3">
          <h2 className="text-base font-semibold text-[#1F1D2B]">你的人格</h2>
          <div className="flex flex-wrap gap-1.5">
            {personalityTags.map((tag, i) => (
              <div
                key={i}
                className="inline-block rounded-[3px] bg-[#9B7FBB]/10 px-2.5 py-1 text-xs font-medium text-[#9B7FBB]"
              >
                {tag}
              </div>
            ))}
          </div>
        </div>
      )}

      {fiveElements && (
        <div className="space-y-2.5">
          <h3 className="text-xs font-medium text-[#6B6778] tracking-wide">五行能量</h3>
          <FiveElementsChart data={fiveElements} />
        </div>
      )}

      {coreTraits && (
        <div className="space-y-2.5">
          <h3 className="text-xs font-medium text-[#6B6778] tracking-wide">核心特质</h3>
          <ul className="space-y-1">
            {coreTraits.map((trait, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-[#1F1D2B]/80">
                <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-[#9B7FBB]" />
                {trait}
              </li>
            ))}
          </ul>
        </div>
      )}

      {pastTendencies && pastTendencies.length > 0 && (
        <div className="space-y-2.5">
          <h3 className="text-xs font-medium text-[#6B6778] tracking-wide">过去可能倾向</h3>
          <ul className="space-y-1.5">
            {pastTendencies.map((t, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-[#1F1D2B]/70 italic">
                <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-[#8A8696]" />
                {t}
              </li>
            ))}
          </ul>
        </div>
      )}

      {lifeTheme && (
        <div className="-mx-5 -mb-5 mt-5 border-t border-[rgba(0,0,0,0.06)] px-5 py-4">
          <p className="text-xs text-[#6B6778] tracking-wide">人生主题</p>
          <p className="mt-0.5 text-sm font-medium text-[#9B7FBB]">{lifeTheme}</p>
        </div>
      )}

      {calculationMeta?.enabled_true_solar_time && (
        <p className="text-xs leading-5 text-[#6B6778]">
          已按出生地换算真太阳时：{calculationMeta.true_solar_time}
          （修正 {calculationMeta.true_solar_delta_minutes} 分钟）
        </p>
      )}

      <div className="flex gap-2">
        {onShare && (
          <Button variant="outline" size="md" className="flex-1" onClick={onShare}>
            分享
          </Button>
        )}
        {onUnlock && (
          <Button size="md" className="flex-1" onClick={onUnlock}>
            解锁完整报告 ¥9.9
          </Button>
        )}
      </div>
    </div>
  );
}
