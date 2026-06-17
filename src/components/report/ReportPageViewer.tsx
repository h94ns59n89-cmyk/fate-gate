'use client';

import { useRef, useState, useCallback } from 'react';
import { Button } from '@/components/common/Button';
import { Sparkles, Plus, Minus } from 'lucide-react';
import type { FullReport } from '@/lib/types';

interface ReportPageViewerProps {
  report: FullReport;
  onShare?: () => void;
}

const PAGES = [
  { key: 'cover', title: '封面' },
  { key: 'personality', title: '人格分析' },
  { key: 'career', title: '事业发展' },
  { key: 'relationships', title: '感情模式' },
  { key: 'health', title: '健康提示' },
  { key: 'current_year', title: '流年运势' },
  { key: 'decade_trend', title: '大运趋势' },
  { key: 'self_improvement', title: '成长建议' },
  { key: 'glossary', title: '术语解释' },
  { key: 'footer', title: '免责声明' },
];

function DotProgress({ total, current, onJump }: { total: number; current: number; onJump: (i: number) => void }) {
  return (
    <div className="flex items-center gap-1.5 rounded-[4px] border border-[#2a3040] bg-[#111827] px-3 py-1.5">
      {Array.from({ length: total }, (_, i) => (
        <button
          key={i}
          onClick={() => onJump(i)}
          className={`rounded-[2px] transition-all ${
            i === current ? 'w-5 bg-[#d4a853]' : 'w-1.5 bg-[#858585]/40 hover:bg-[#858585]/60'
          } h-1.5`}
          aria-label={`第 ${i + 1} 页`}
        />
      ))}
    </div>
  );
}

function GoldBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block rounded-[3px] border border-[#d4a853]/30 bg-[#d4a853]/10 px-3 py-1 text-xs font-medium text-[#d4a853]">
      {children}
    </span>
  );
}

function TagPill({ children, variant = 'default' }: { children: React.ReactNode; variant?: 'default' | 'outline' }) {
  if (variant === 'outline') {
    return (
      <span className="inline-block rounded-full border border-[#2a3040] px-3 py-1 text-xs text-[#858585]">
        {children}
      </span>
    );
  }
  return (
    <span className="inline-block rounded-full bg-[#d4a853]/15 px-3 py-1 text-xs font-medium text-[#d4a853]">
      {children}
    </span>
  );
}

function AdviceBlock({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-[4px] border-l-2 border-[#d4a853] bg-[#d4a853]/5 px-4 py-3">
      <p className="text-xs font-medium tracking-wide text-[#d4a853]/60">建议</p>
      <p className="mt-1 text-sm leading-relaxed text-[#d4d4d4]/90">{children}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    '稳中有进': 'text-[#4CAF50] border-[#4CAF50]/30 bg-[#4CAF50]/10',
    '机会增多': 'text-[#2196F3] border-[#2196F3]/30 bg-[#2196F3]/10',
    '稳步增长': 'text-[#4CAF50] border-[#4CAF50]/30 bg-[#4CAF50]/10',
    '桃花旺盛': 'text-[#FF5722] border-[#FF5722]/30 bg-[#FF5722]/10',
  };
  const colorClass = colors[status] ?? 'text-[#858585] border-[#2a3040] bg-[#1a1f2e]';
  return (
    <span className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium ${colorClass}`}>
      {status}
    </span>
  );
}

function CoverPage({ data }: { data: Record<string, unknown> }) {
  return (
    <div className="flex h-full flex-col items-center justify-center text-center">
      {/* Decorative constellation dots */}
      <div className="absolute left-8 top-12">
        <div className="h-1 w-1 rounded-full bg-[#d4a853]/20" />
        <div className="mt-3 ml-3 h-0.5 w-0.5 rounded-full bg-[#d4a853]/10" />
      </div>
      <div className="absolute right-8 top-20">
        <div className="h-0.5 w-0.5 rounded-full bg-[#d4a853]/15" />
        <div className="mt-4 ml-2 h-1 w-1 rounded-full bg-[#d4a853]/8" />
      </div>

      {/* Decorative top: dots + line */}
      <div className="mb-6 flex items-center gap-3">
        <div className="h-px w-12 bg-gradient-to-r from-transparent to-[#d4a853]/40" />
        <div className="flex gap-1">
          <div className="h-1 w-1 rounded-full bg-[#d4a853]" />
          <div className="h-1 w-1 rounded-full bg-[#d4a853]/50" />
          <div className="h-1 w-1 rounded-full bg-[#d4a853]/20" />
        </div>
        <div className="h-px w-12 bg-gradient-to-l from-transparent to-[#d4a853]/40" />
      </div>

      <GoldBadge>{data.day_master as string}</GoldBadge>

      <h1 className="mt-5 font-serif text-3xl font-bold leading-tight text-[#d4d4d4]">
        {data.title as string}
      </h1>
      <p className="mt-2 text-sm tracking-wide text-[#7C8DB5]">
        {data.subtitle as string}
      </p>

      <div className="my-6 h-px w-16 bg-gradient-to-r from-transparent via-[#d4a853]/30 to-transparent" />

      {/* Life theme as blockquote */}
      <div className="max-w-xs border-l-2 border-[#d4a853]/40 pl-4 text-left">
        <p className="font-serif text-base font-medium italic leading-relaxed text-[#d4a853]">
          「{data.life_theme as string}」
        </p>
      </div>

      <p className="mt-10 text-[11px] tracking-wide text-[#6a6a6a]">
        生成于 {new Date(data.generated_at as string).toLocaleDateString('zh-CN')}
      </p>
    </div>
  );
}

function PersonalityPage({ data }: { data: Record<string, unknown> }) {
  const traits = data.core_traits as string[];
  const strengths = data.strengths as string[];
  const growthAreas = data.growth_areas as string[];
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <span className="inline-block rounded-full border border-[#d4a853]/20 bg-[#d4a853]/10 px-4 py-1 text-xs font-medium tracking-wide text-[#d4a853]">
          {data.type as string}
        </span>
        <p className="mt-2 text-sm text-[#7C8DB5]">{data.five_elements as string}</p>
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-[#d4a853]/15 to-transparent" />

      {traits && traits.length > 0 && (
        <div className="space-y-3">
          <h3 className="flex items-center gap-2 text-xs font-semibold tracking-wider text-[#7C8DB5]">
            <Sparkles className="h-3 w-3" />
            核心特质
          </h3>
          <ul className="space-y-2.5">
            {traits.map((trait, i) => (
              <li key={i} className="flex items-start gap-3 text-sm leading-relaxed text-[#d4d4d4]/90">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#d4a853]/12 text-[10px] font-semibold text-[#d4a853]">
                  {i + 1}
                </span>
                {trait}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        {strengths && strengths.length > 0 && (
          <div className="rounded-[4px] border-l-2 border-[#4CAF50] bg-[#4CAF50]/5 px-3.5 py-3">
            <p className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold tracking-wider text-[#4CAF50]">
              <Plus className="h-3 w-3" />
              优势
            </p>
            <ul className="space-y-1">
              {strengths.map((s, i) => (
                <li key={i} className="text-xs leading-relaxed text-[#d4d4d4]/75">{s}</li>
              ))}
            </ul>
          </div>
        )}
        {growthAreas && growthAreas.length > 0 && (
          <div className="rounded-[4px] border-l-2 border-[#FF5722] bg-[#FF5722]/5 px-3.5 py-3">
            <p className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold tracking-wider text-[#FF5722]">
              <Minus className="h-3 w-3" />
              成长
            </p>
            <ul className="space-y-1">
              {growthAreas.map((g, i) => (
                <li key={i} className="text-xs leading-relaxed text-[#d4d4d4]/75">{g}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

function CareerPage({ data }: { data: Record<string, unknown> }) {
  const suitable = data.suitable_directions as string[];
  const avoid = data.avoid_directions as string[];
  return (
    <div className="space-y-5">
      {suitable && suitable.length > 0 && (
        <div className="space-y-2.5">
          <h3 className="text-xs font-semibold tracking-wide text-[#858585]">适合方向</h3>
          <div className="grid grid-cols-1 gap-2">
            {suitable.map((dir, i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded-[4px] border border-[#2a3040] bg-[#1a1f2e]
 px-4 py-3"
              >
                <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-[3px] bg-[#d4a853]/15 text-sm text-[#d4a853]">
                  {['🎯', '📈', '💡'][i] ?? '✦'}
                </span>
                <span className="text-sm text-[#d4d4d4]/90">{dir}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {avoid && avoid.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-semibold tracking-wide text-[#6a6a6a]">建议规避</h3>
          <div className="flex flex-wrap gap-2">
            {avoid.map((dir, i) => (
              <span key={i} className="text-xs text-[#6a6a6a] line-through decoration-[#6a6a6a]/50">
                {dir}
              </span>
            ))}
          </div>
        </div>
      )}
      {(data.advice as string) && <AdviceBlock>{(data.advice as string)}</AdviceBlock>}
    </div>
  );
}

function RelationshipsPage({ data }: { data: Record<string, unknown> }) {
  const compatibility = data.compatibility as string[];
  return (
    <div className="space-y-5">
      <div className="rounded-[4px] border border-[#2a3040] bg-[#1a1f2e]
 p-4 text-center">
        <p className="text-[10px] font-semibold tracking-wide text-[#858585]">沟通风格</p>
        <p className="mt-1 text-sm font-medium text-[#d4d4d4]">{data.communication_style as string}</p>
      </div>
      {compatibility && compatibility.length > 0 && (
        <div className="space-y-2.5">
          <h3 className="text-xs font-semibold tracking-wide text-[#858585]">兼容类型</h3>
          <div className="flex flex-wrap gap-2">
            {compatibility.map((t, i) => (
              <TagPill key={i}>{t}</TagPill>
            ))}
          </div>
        </div>
      )}
      {(data.advice as string) && <AdviceBlock>{data.advice as string}</AdviceBlock>}
    </div>
  );
}

function HealthPage({ data }: { data: Record<string, unknown> }) {
  const focusAreas = data.focus_areas as string[];
  return (
    <div className="space-y-5">
      {focusAreas && focusAreas.length > 0 && (
        <div className="space-y-2.5">
          <h3 className="text-xs font-semibold tracking-wide text-[#858585]">关注领域</h3>
          <div className="grid grid-cols-1 gap-2">
            {focusAreas.map((area, i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded-[4px] border border-[#2a3040] bg-[#1a1f2e]
 px-4 py-3"
              >
                <span className="text-lg">{['🧘', '🏃', '🥗', '😴'][i] ?? '❤️'}</span>
                <span className="text-sm text-[#d4d4d4]/90">{area}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {(data.advice as string) && <AdviceBlock>{data.advice as string}</AdviceBlock>}
    </div>
  );
}

function CurrentYearPage({ data }: { data: Record<string, unknown> }) {
  const items = [
    { label: '整体运势', key: 'overall' },
    { label: '事业', key: 'career' },
    { label: '财富', key: 'wealth' },
    { label: '感情', key: 'relationships' },
  ];
  return (
    <div className="space-y-4">
      <h3 className="text-center text-xs font-semibold tracking-wide text-[#858585]">
        {new Date().getFullYear()} 年运势
      </h3>
      <div className="grid grid-cols-2 gap-3">
        {items.map(({ label, key }) => {
          const value = data[key] as string;
          return (
            <div
              key={key}
              className="rounded-[4px] border border-[#2a3040] bg-[#1a1f2e]
 p-3.5 text-center"
            >
              <p className="text-[10px] font-medium tracking-wide text-[#6a6a6a]">{label}</p>
              <div className="mt-2 flex justify-center">
                <StatusBadge status={value} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DecadeTrendPage({ data }: { data: Record<string, unknown> }) {
  return (
    <div className="space-y-5">
      <div className="relative rounded-[4px] border border-[#d4a853]/20 bg-gradient-to-b from-[#d4a853]/5 to-transparent p-5 text-center">
        <div className="absolute left-1/2 top-0 h-1 w-8 -translate-x-1/2 rounded-b-[2px] bg-[#d4a853]" />
        <p className="text-[10px] font-semibold tracking-wide text-[#858585]">当前大运</p>
        <p className="mt-2 text-lg font-bold text-[#d4a853]">{data.age_range as string} 岁</p>
        <p className="mt-1 text-sm text-[#d4d4d4]/80">{data.focus as string}</p>
      </div>
      {(data.advice as string) && <AdviceBlock>{data.advice as string}</AdviceBlock>}
    </div>
  );
}

function SelfImprovementPage({ data }: { data: Record<string, unknown> }) {
  const directions = data.directions as string[];
  const books = data.book_suggestions as string[];
  return (
    <div className="space-y-5">
      {directions && directions.length > 0 && (
        <div className="space-y-2.5">
          <h3 className="text-xs font-semibold tracking-wide text-[#858585]">成长方向</h3>
          <ul className="space-y-2">
            {directions.map((d, i) => (
              <li key={i} className="flex items-center gap-3 text-sm text-[#d4d4d4]/90">
                <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[#4CAF50]/15 text-xs text-[#4CAF50]">
                  ✓
                </span>
                {d}
              </li>
            ))}
          </ul>
        </div>
      )}
      {books && books.length > 0 && (
        <div className="space-y-2.5">
          <h3 className="text-xs font-semibold tracking-wide text-[#858585]">推荐阅读</h3>
          <div className="grid grid-cols-1 gap-2">
            {books.map((book, i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded-[4px] border border-[#2a3040] bg-[#1a1f2e]
 px-4 py-3"
              >
                <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[3px] bg-[#d4a853]/15 text-sm text-[#d4a853]">
                  📖
                </span>
                <span className="text-sm text-[#d4d4d4]/90">{book}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const GLOSSARY_ZH: Record<string, string> = {
  day_master: '日主',
  five_elements: '五行',
  shishen: '十神',
  heavenly_stem: '天干',
  earthly_branch: '地支',
  hidden_stems: '藏干',
  dayun: '大运',
  liunian: '流年',
  nayin: '纳音',
  shensha: '神煞',
  kongwang: '空亡',
  yong_shen: '用神',
  xi_shen: '喜神',
  ji_shen: '忌神',
};

function GlossaryPage({ data }: { data: Record<string, unknown> }) {
  const entries = Object.entries(data).filter(([key]) => key !== 'id');
  return (
    <div className="space-y-3">
      {entries.map(([term, desc]) => (
        <div key={term} className="rounded-[4px] border border-[#2a3040] bg-[#1a1f2e]
 px-4 py-3">
          <p className="text-xs font-semibold text-[#d4a853]">{GLOSSARY_ZH[term] ?? term}</p>
          <p className="mt-1 text-sm leading-relaxed text-[#d4d4d4]/70">{desc as string}</p>
        </div>
      ))}
    </div>
  );
}

function FooterPage({ data }: { data: Record<string, unknown> }) {
  return (
    <div className="flex h-full flex-col items-center justify-center text-center">
      <div className="w-12 border-t border-[#2a3040]" />
      <p className="mt-4 text-xs leading-relaxed text-[#6a6a6a]">{data.disclaimer as string}</p>
      <p className="mt-2 text-[10px] text-[#6a6a6a]/60">版本 {data.version as string}</p>
    </div>
  );
}

const PAGE_RENDERERS: Record<string, (data: Record<string, unknown>) => React.ReactNode> = {
  cover: (d) => <CoverPage data={d} />,
  personality: (d) => <PersonalityPage data={d} />,
  career: (d) => <CareerPage data={d} />,
  relationships: (d) => <RelationshipsPage data={d} />,
  health: (d) => <HealthPage data={d} />,
  current_year: (d) => <CurrentYearPage data={d} />,
  decade_trend: (d) => <DecadeTrendPage data={d} />,
  self_improvement: (d) => <SelfImprovementPage data={d} />,
  glossary: (d) => <GlossaryPage data={d} />,
  footer: (d) => <FooterPage data={d} />,
};

export function ReportPageViewer({ report, onShare }: ReportPageViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentPage, setCurrentPage] = useState(0);

  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;
    const { scrollTop, clientHeight } = containerRef.current;
    setCurrentPage(Math.min(Math.round(scrollTop / clientHeight), PAGES.length - 1));
  }, []);

  const jumpTo = useCallback((i: number) => {
    containerRef.current?.children[i]?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  return (
    <div className="relative">
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="scrollbar-hide h-[80vh] snap-y snap-mandatory overflow-y-auto"
      >
        {PAGES.map((page, i) => {
          const data = (report[page.key as keyof FullReport] ?? {}) as Record<string, unknown>;
          const render = PAGE_RENDERERS[page.key];
          return (
            <div
              key={page.key}
              className="flex h-[80vh] snap-start snap-always flex-col justify-start p-6 pt-12"
            >
              {page.key !== 'cover' && page.key !== 'footer' && (
                <div className="relative mb-4 flex items-center border-b border-[#2a3040]/60 pb-3">
                  <span className="absolute -left-1 select-none text-[48px] font-bold leading-none text-[#d4a853]/6">
                    {String(i).padStart(2, '0')}
                  </span>
                  <span className="ml-9 text-xs font-medium tracking-wide text-[#7C8DB5]">
                    {page.title}
                  </span>
                  <div className="ml-auto flex gap-1">
                    {i > 0 && (
                      <button
                        onClick={() => jumpTo(i - 1)}
                        className="flex h-6 w-6 items-center justify-center rounded-[4px] text-xs text-[#6a6a6a] transition-colors hover:bg-[#1a1f2e] hover:text-[#d4d4d4]"
                        aria-label="上一页"
                      >
                        ‹
                      </button>
                    )}
                    {i < PAGES.length - 1 && (
                      <button
                        onClick={() => jumpTo(i + 1)}
                        className="flex h-6 w-6 items-center justify-center rounded-[4px] text-xs text-[#6a6a6a] transition-colors hover:bg-[#1a1f2e] hover:text-[#d4d4d4]"
                        aria-label="下一页"
                      >
                        ›
                      </button>
                    )}
                  </div>
                </div>
              )}
              <div className={`flex-1 ${page.key === 'cover' || page.key === 'footer' ? '' : ''}`}>
                {render ? render(data) : null}
              </div>
            </div>
          );
        })}
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
        <DotProgress total={PAGES.length} current={currentPage} onJump={jumpTo} />
      </div>

      {onShare && (
        <div className="sticky bottom-0 bg-gradient-to-t from-[#0B0E14] via-[#0B0E14]/90 to-transparent p-4 pt-8">
          <Button variant="outline" size="md" className="w-full" onClick={onShare}>
            分享报告
          </Button>
        </div>
      )}
    </div>
  );
}
