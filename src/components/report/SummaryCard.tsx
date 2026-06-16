'use client';

import { Skeleton } from '@/components/common/Skeleton';
import { Button } from '@/components/common/Button';
import { FiveElementsChart } from '@/components/report/FiveElementsChart';
import type { BaziCalculationMeta, FiveElements } from '@/lib/types';

interface SummaryCardProps {
  personalityTags?: string[];
  fiveElements?: FiveElements;
  coreTraits?: string[];
  lifeTheme?: string;
  calculationMeta?: BaziCalculationMeta | undefined;
  reportId?: number;
  isLoading?: boolean;
  onShare?: () => void;
  onUnlock?: () => void;
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
          <h2 className="text-base font-semibold text-[#d4d4d4]">你的简人格</h2>
          <div className="flex flex-wrap gap-1.5">
            {personalityTags.map((tag, i) => (
              <div
                key={i}
                className="inline-block rounded-[3px] bg-[#d4a853]/15 px-2.5 py-1 text-xs font-medium text-[#d4a853]"
              >
                {tag}
              </div>
            ))}
          </div>
        </div>
      )}

      {fiveElements && (
        <div className="space-y-2.5">
          <h3 className="text-xs font-medium text-[#858585] tracking-wide">五行能量</h3>
          <FiveElementsChart data={fiveElements} />
        </div>
      )}

      {coreTraits && (
        <div className="space-y-2.5">
          <h3 className="text-xs font-medium text-[#858585] tracking-wide">核心特质</h3>
          <ul className="space-y-1">
            {coreTraits.map((trait, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-[#d4d4d4]/90">
                <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-[#d4a853]" />
                {trait}
              </li>
            ))}
          </ul>
        </div>
      )}

      {lifeTheme && (
        <div className="-mx-5 -mb-5 mt-5 border-t border-[#3c3c3c] px-5 py-4">
          <p className="text-xs text-[#858585] tracking-wide">人生主题</p>
          <p className="mt-0.5 text-sm font-medium text-[#d4a853]">{lifeTheme}</p>
        </div>
      )}

      {calculationMeta?.enabled_true_solar_time && (
        <p className="text-xs leading-5 text-[#858585]">
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
