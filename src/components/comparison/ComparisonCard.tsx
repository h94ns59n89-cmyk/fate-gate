'use client';

import { Button } from '@/components/common/Button';

interface ComparisonCardProps {
  userTag?: string;
  targetTag?: string;
  matchScore?: number;
  onCompare?: () => void;
}

function AvatarCircle({ label, side }: { label: string | undefined; side: 'left' | 'right' }) {
  const initial = (label ?? '?').charAt(0);
  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`
        flex h-14 w-14 items-center justify-center rounded-full
        border-2 text-lg font-semibold
        ${side === 'left'
          ? 'border-[#9B7FBB]/40 bg-[#9B7FBB]/10 text-[#9B7FBB]'
          : 'border-[#7FB0C8]/40 bg-[#7FB0C8]/10 text-[#7FB0C8]'}
      `}>
        {initial}
      </div>
      <span className={`rounded-[3px] px-2.5 py-1 text-xs font-medium ${
        side === 'left'
          ? 'bg-[#9B7FBB]/12 text-[#9B7FBB]'
          : 'bg-[#F8F8FA] text-[#1F1D2B]/70'
      }`}>
        {label ?? (side === 'left' ? '我' : 'TA')}
      </span>
    </div>
  );
}

export function ComparisonCard({
  userTag,
  targetTag,
  matchScore,
  onCompare,
}: ComparisonCardProps) {
  return (
    <div className="vscode-card space-y-5 text-center">
      <h3 className="text-sm font-semibold text-[#1F1D2B]">人格对比</h3>

      <div className="flex items-center justify-center gap-6">
        <AvatarCircle label={userTag} side="left" />

        <div className="flex flex-col items-center">
          <div className="relative">
            <div className="bg-gradient-to-b from-[#9B7FBB] to-[#BBA3D5] bg-clip-text text-4xl font-bold text-transparent">
              {matchScore ?? '?'}%
            </div>
            <div className="absolute -inset-3 rounded-full bg-[#9B7FBB]/5 blur-xl" />
          </div>
          <span className="mt-1 text-[11px] font-medium tracking-wider text-[#6B6778]">匹配度</span>
        </div>

        <AvatarCircle label={targetTag} side="right" />
      </div>

      <div className="flex gap-2">
        {onCompare && (
          <Button variant="outline" size="md" className="flex-1" onClick={onCompare}>
            创建对比
          </Button>
        )}
        {/* {onShare && (
          <Button size="md" className="flex-1" onClick={onShare}>
            分享对比
          </Button>
        )} */}
      </div>
    </div>
  );
}
