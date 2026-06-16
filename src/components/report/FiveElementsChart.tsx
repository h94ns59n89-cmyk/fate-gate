'use client';

import type { FiveElements } from '@/lib/types';

interface FiveElementsChartProps {
  data: FiveElements;
}

const elementMeta = {
  wood: { label: '木', color: '#4CAF50', order: 0 },
  fire: { label: '火', color: '#FF5722', order: 1 },
  earth: { label: '土', color: '#FFC107', order: 2 },
  metal: { label: '金', color: '#E0E0E0', order: 3 },
  water: { label: '水', color: '#2196F3', order: 4 },
};

export function FiveElementsChart({ data }: FiveElementsChartProps) {
  const entries = Object.entries(data).sort(
    ([a], [b]) =>
      (elementMeta[a as keyof typeof elementMeta]?.order ?? 0) -
      (elementMeta[b as keyof typeof elementMeta]?.order ?? 0),
  );

  return (
    <div className="space-y-2" role="group" aria-label="五行能量图">
      {entries.map(([key, value]) => {
        const meta = elementMeta[key as keyof typeof elementMeta];
        return (
          <div key={key} className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#d4d4d4]/80">{meta?.label}</span>
              <span className="text-xs text-[#858585]">{value.score}%</span>
            </div>
            <div
              role="progressbar"
              aria-valuenow={value.score}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`${meta?.label}能量 ${value.score}%`}
              className="h-1.5 overflow-hidden rounded-[2px] bg-[#3c3c3c]"
            >
              <div
                className="h-full rounded-[2px] transition-all duration-1000"
                style={{ width: `${value.score}%`, backgroundColor: meta?.color }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
