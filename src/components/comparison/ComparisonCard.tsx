'use client';

import { Button } from '@/components/common/Button';

interface ComparisonCardProps {
  userTag?: string;
  targetTag?: string;
  matchScore?: number;
  onShare?: () => void;
  onCompare?: () => void;
}

export function ComparisonCard({
  userTag,
  targetTag,
  matchScore,
  onShare,
  onCompare,
}: ComparisonCardProps) {
  return (
    <div className="vscode-card space-y-5">
      <h3 className="text-center text-sm font-semibold text-[#d4d4d4]">简人格对比</h3>

      <div className="flex items-center justify-center gap-5">
        <div className="text-center">
          <div className="mb-1.5 text-2xl">👤</div>
          <div className="rounded-[3px] bg-[#d4a853]/15 px-2.5 py-1 text-xs text-[#d4a853]">
            {userTag ?? '你的简人格'}
          </div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-[#d4a853]">{matchScore ?? '?'}%</div>
          <div className="text-xs text-[#858585]">匹配度</div>
        </div>
        <div className="text-center">
          <div className="mb-1.5 text-2xl">👥</div>
          <div className="rounded-[3px] bg-[#2d2d2d] px-2.5 py-1 text-xs text-[#d4d4d4]/70">
            {targetTag ?? 'TA的简人格'}
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        {onCompare && (
          <Button variant="outline" size="md" className="flex-1" onClick={onCompare}>
            创建对比
          </Button>
        )}
        {onShare && (
          <Button size="md" className="flex-1" onClick={onShare}>
            分享对比
          </Button>
        )}
      </div>
    </div>
  );
}
