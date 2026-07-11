'use client';

import { useRef, useState, useCallback } from 'react';
import { Button } from '@/components/common/Button';
import { Sparkles, Plus, Minus } from 'lucide-react';
import type { FullReport } from '@/lib/types';

interface UserInfo {
  nickname?: string;
}

interface ReportPageViewerProps {
  report: FullReport;
  onShare?: () => void;
  variant?: 'viewer' | 'pdf';
  userInfo?: UserInfo;
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
    <div className="flex items-center gap-1.5 rounded-[4px] border border-[rgba(0,0,0,0.08)] bg-[#FFFFFF] px-3 py-1.5 shadow-sm">
      {Array.from({ length: total }, (_, i) => (
        <button
          key={i}
          onClick={() => onJump(i)}
          className={`rounded-[2px] transition-all ${
            i === current ? 'w-5 bg-[#9B7FBB]' : 'w-1.5 bg-[#C4C1CE] hover:bg-[#8A8696]'
          } h-1.5`}
          aria-label={`第 ${i + 1} 页`}
        />
      ))}
    </div>
  );
}

function GoldBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block text-center leading-none rounded-[3px] border border-[#9B7FBB]/25 bg-[#9B7FBB]/8 px-3 py-1 text-xs font-medium text-[#9B7FBB]">
      {children}
    </span>
  );
}

function TagPill({ children, variant = 'default' }: { children: React.ReactNode; variant?: 'default' | 'outline' }) {
  if (variant === 'outline') {
    return (
      <span className="inline-block text-center leading-none rounded-full border border-[rgba(0,0,0,0.08)] px-3 py-1 text-xs text-[#6B6778]">
        {children}
      </span>
    );
  }
  return (
    <span className="inline-block text-center leading-none rounded-full bg-[#9B7FBB]/8 px-3 py-1 text-xs font-medium text-[#9B7FBB]">
      {children}
    </span>
  );
}

function PastTendencyBlock({ children }: { children: React.ReactNode }) {
  if (!children) return null;
  return (
    <div className="rounded-[4px] border border-dashed border-[#8A8696]/30 bg-[#F8F8FA] px-4 py-3">
      <p className="text-[10px] font-medium tracking-wide text-[#8A8696]">过去可能倾向</p>
      <p className="mt-1 text-sm leading-relaxed text-[#1F1D2B]/60 italic">{children}</p>
    </div>
  );
}

function AdviceBlock({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-[4px] border-l-2 border-[#9B7FBB] bg-[#9B7FBB]/5 px-4 py-3">
      <p className="text-xs font-medium tracking-wide text-[#9B7FBB]/60">建议</p>
      <p className="mt-1 text-sm leading-relaxed text-[#1F1D2B]/75">{children}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    '稳中有进': 'text-[#8FCFA0] border-[#8FCFA0]/30 bg-[#8FCFA0]/10',
    '机会增多': 'text-[#7FB0C8] border-[#7FB0C8]/30 bg-[#7FB0C8]/10',
    '稳步增长': 'text-[#8FCFA0] border-[#8FCFA0]/30 bg-[#8FCFA0]/10',
    '桃花旺盛': 'text-[#E0978A] border-[#E0978A]/30 bg-[#E0978A]/10',
  };
  const colorClass = colors[status] ?? 'text-[#6B6778] border-[rgba(0,0,0,0.08)] bg-[#F8F8FA]';
  return (
    <span className={`inline-block text-center leading-none rounded-full border px-2.5 py-1 text-xs font-medium ${colorClass}`}>
      {status}
    </span>
  );
}

function CoverPage({ data, userInfo }: { data: Record<string, unknown>; userInfo?: UserInfo }) {
  return (
    <div className="flex h-full flex-col items-center justify-center text-center">
      <div className="absolute left-8 top-12">
        <div className="h-1 w-1 rounded-full bg-[#9B7FBB]/15" />
        <div className="mt-3 ml-3 h-0.5 w-0.5 rounded-full bg-[#9B7FBB]/8" />
      </div>
      <div className="absolute right-8 top-20">
        <div className="h-0.5 w-0.5 rounded-full bg-[#9B7FBB]/10" />
        <div className="mt-4 ml-2 h-1 w-1 rounded-full bg-[#9B7FBB]/6" />
      </div>

      <div className="mb-6 flex items-center gap-3">
        <div className="h-px w-12 bg-gradient-to-r from-transparent to-[#9B7FBB]/30" />
        <div className="flex gap-1">
          <div className="h-1 w-1 rounded-full bg-[#9B7FBB]" />
          <div className="h-1 w-1 rounded-full bg-[#9B7FBB]/50" />
          <div className="h-1 w-1 rounded-full bg-[#9B7FBB]/20" />
        </div>
        <div className="h-px w-12 bg-gradient-to-l from-transparent to-[#9B7FBB]/30" />
      </div>

      <GoldBadge>{data.day_master as string}</GoldBadge>

      <h1 className="mt-5 font-serif text-3xl font-bold leading-tight text-[#1F1D2B]">
        {data.title as string}
      </h1>
      <p className="mt-2 text-sm tracking-wide text-[#6B6778]">
        {data.subtitle as string}
      </p>

      {userInfo?.nickname && (
        <p className="mt-3 text-xs text-[#8A8696]">{userInfo.nickname}</p>
      )}

      <div className="my-6 h-px w-16 bg-gradient-to-r from-transparent via-[#9B7FBB]/25 to-transparent" />

      <div className="max-w-xs border-l-2 border-[#9B7FBB]/30 pl-4 text-left">
        <p className="font-serif text-base font-medium italic leading-relaxed text-[#9B7FBB]">
          「{data.life_theme as string}」
        </p>
      </div>

      <p className="mt-10 text-[11px] tracking-wide text-[#8A8696]">
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
      <div className="text-center">
        <span className="inline-block text-center leading-none rounded-full border border-[#9B7FBB]/20 bg-[#9B7FBB]/8 px-4 py-1 text-xs font-medium tracking-wide text-[#9B7FBB]">
          {data.type as string}
        </span>
        <p className="mt-2 text-sm text-[#6B6778]">{data.five_elements as string}</p>
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-[#9B7FBB]/12 to-transparent" />

      {traits && traits.length > 0 && (
        <div className="space-y-3">
          <h3 className="flex items-center gap-2 text-xs font-semibold tracking-wider text-[#6B6778]">
            <Sparkles className="h-3 w-3" />
            核心特质
          </h3>
          <ul className="space-y-2.5">
            {traits.map((trait, i) => (
              <li key={i} className="flex items-start gap-3 text-sm leading-relaxed text-[#1F1D2B]/80">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center leading-none rounded-full bg-[#9B7FBB]/10 text-[10px] font-semibold text-[#9B7FBB]">
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
          <div className="rounded-[4px] border-l-2 border-[#8FCFA0] bg-[#8FCFA0]/5 px-3.5 py-3">
            <p className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold tracking-wider text-[#8FCFA0]">
              <Plus className="h-3 w-3" />
              优势
            </p>
            <ul className="space-y-1">
              {strengths.map((s, i) => (
                <li key={i} className="text-xs leading-relaxed text-[#1F1D2B]/65">{s}</li>
              ))}
            </ul>
          </div>
        )}
        {growthAreas && growthAreas.length > 0 && (
          <div className="rounded-[4px] border-l-2 border-[#E0978A] bg-[#E0978A]/5 px-3.5 py-3">
            <p className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold tracking-wider text-[#E0978A]">
              <Minus className="h-3 w-3" />
              成长
            </p>
            <ul className="space-y-1">
              {growthAreas.map((g, i) => (
                <li key={i} className="text-xs leading-relaxed text-[#1F1D2B]/65">{g}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <PastTendencyBlock>{(data.past_tendency as string)}</PastTendencyBlock>
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
          <h3 className="text-xs font-semibold tracking-wide text-[#6B6778]">适合方向</h3>
          <div className="grid grid-cols-1 gap-2">
            {suitable.map((dir, i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded-[4px] border border-[rgba(0,0,0,0.06)] bg-[#F8F8FA] px-4 py-3"
              >
                <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center leading-none rounded-[3px] bg-[#9B7FBB]/10 text-sm text-[#9B7FBB]">
                  {['🎯', '📈', '💡'][i] ?? '✦'}
                </span>
                <span className="text-sm text-[#1F1D2B]/80">{dir}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {avoid && avoid.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-semibold tracking-wide text-[#8A8696]">建议规避</h3>
          <div className="flex flex-wrap gap-2">
            {avoid.map((dir, i) => (
              <span key={i} className="text-xs text-[#8A8696] line-through decoration-[#8A8696]/50">
                {dir}
              </span>
            ))}
          </div>
        </div>
      )}
      {(data.advice as string) && <AdviceBlock>{(data.advice as string)}</AdviceBlock>}
      <PastTendencyBlock>{(data.past_tendency as string)}</PastTendencyBlock>
    </div>
  );
}

function RelationshipsPage({ data }: { data: Record<string, unknown> }) {
  const compatibility = data.compatibility as string[];
  return (
    <div className="space-y-5">
      <div className="rounded-[4px] border border-[rgba(0,0,0,0.06)] bg-[#F8F8FA] p-4 text-center">
        <p className="text-[10px] font-semibold tracking-wide text-[#6B6778]">沟通风格</p>
        <p className="mt-1 text-sm font-medium text-[#1F1D2B]">{data.communication_style as string}</p>
      </div>
      {compatibility && compatibility.length > 0 && (
        <div className="space-y-2.5">
          <h3 className="text-xs font-semibold tracking-wide text-[#6B6778]">兼容类型</h3>
          <div className="flex flex-wrap gap-2">
            {compatibility.map((t, i) => (
              <TagPill key={i}>{t}</TagPill>
            ))}
          </div>
        </div>
      )}
      {(data.advice as string) && <AdviceBlock>{data.advice as string}</AdviceBlock>}
      <PastTendencyBlock>{(data.past_tendency as string)}</PastTendencyBlock>
    </div>
  );
}

function HealthPage({ data }: { data: Record<string, unknown> }) {
  const focusAreas = data.focus_areas as string[];
  return (
    <div className="space-y-5">
      {focusAreas && focusAreas.length > 0 && (
        <div className="space-y-2.5">
          <h3 className="text-xs font-semibold tracking-wide text-[#6B6778]">关注领域</h3>
          <div className="grid grid-cols-1 gap-2">
            {focusAreas.map((area, i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded-[4px] border border-[rgba(0,0,0,0.06)] bg-[#F8F8FA] px-4 py-3"
              >
                <span className="text-lg">{['🧘', '🏃', '🥗', '😴'][i] ?? '❤️'}</span>
                <span className="text-sm text-[#1F1D2B]/80">{area}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {(data.advice as string) && <AdviceBlock>{data.advice as string}</AdviceBlock>}
      <PastTendencyBlock>{(data.past_tendency as string)}</PastTendencyBlock>
    </div>
  );
}

function CurrentYearPage({ data }: { data: Record<string, unknown> }) {
  const year = new Date().getFullYear();

  // Backward compatibility: old format stores overall as string
  if (typeof data.overall !== 'number') {
    const items = [
      { label: '整体运势', key: 'overall' },
      { label: '事业', key: 'career' },
      { label: '财富', key: 'wealth' },
      { label: '感情', key: 'relationships' },
      { label: '健康', key: 'health' },
    ];
    const lucky = data.lucky_aspects as string[];
    return (
      <div className="space-y-4">
        <h3 className="text-center text-xs font-semibold tracking-wide text-[#6B6778]">{year} 年运势</h3>
        <div className="grid grid-cols-2 gap-3">
          {items.map(({ label, key }) => {
            const value = data[key] as string;
            return (
              <div key={key} className="rounded-[4px] border border-[rgba(0,0,0,0.06)] bg-[#F8F8FA] p-3.5 text-center">
                <p className="text-[10px] font-medium tracking-wide text-[#8A8696]">{label}</p>
                <div className="mt-2 flex justify-center"><StatusBadge status={value} /></div>
              </div>
            );
          })}
        </div>
        {(data.advice as string) && <AdviceBlock>{data.advice as string}</AdviceBlock>}
        {lucky && lucky.length > 0 && (
          <div>
            <p className="mb-2 text-[10px] font-semibold tracking-wide text-[#6B6778]">幸运领域</p>
            <div className="flex flex-wrap gap-2">
              {lucky.map((a, i) => (
                <span key={i} className="inline-block text-center leading-none rounded-full border border-[#9B7FBB]/20 bg-[#9B7FBB]/5 px-2.5 py-1 text-[11px] text-[#9B7FBB]">{a}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // New format: radar chart + cards
  const overall = data.overall as number;
  const lucky = data.lucky_aspects as string[];

  const chartLabels = ['整体运势', '事业', '财富', '感情', '健康'];
  const chartValues = [
    overall,
    (data.career as any)?.score ?? 0,
    (data.wealth as any)?.score ?? 0,
    (data.relationships as any)?.score ?? 0,
    (data.health as any)?.score ?? 0,
  ];

  const areas = [
    { key: 'career', label: '事业' },
    { key: 'wealth', label: '财富' },
    { key: 'relationships', label: '感情' },
    { key: 'health', label: '健康' },
  ];

  function rp(i: number, r: number, cx: number, cy: number) {
    const a = (2 * Math.PI * i) / 5 - Math.PI / 2;
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
  }

  return (
    <div className="space-y-4">
      <h3 className="text-center text-xs font-semibold tracking-wide text-[#6B6778]">{year} 年运势</h3>

      {/* Radar chart */}
      <div className="flex justify-center">
        <svg viewBox="0 0 260 260" className="h-[200px] w-[200px]">
          {[20, 40, 60, 80, 100].map((pct) => {
            const pts = Array.from({ length: 5 }, (_, i) => {
              const p = rp(i, 90 * pct / 100, 130, 130);
              return `${p.x},${p.y}`;
            }).join(' ');
            return <polygon key={pct} points={pts} fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth="1" />;
          })}
          {Array.from({ length: 5 }, (_, i) => {
            const p = rp(i, 90, 130, 130);
            return <line key={i} x1={130} y1={130} x2={p.x} y2={p.y} stroke="rgba(0,0,0,0.05)" strokeWidth="1" />;
          })}
          <polygon
            points={chartValues.map((v, i) => {
              const p = rp(i, (v / 100) * 90, 130, 130);
              return `${p.x},${p.y}`;
            }).join(' ')}
            fill="#9B7FBB" fillOpacity="0.15" stroke="#9B7FBB" strokeWidth="1.5"
          />
          {chartValues.map((v, i) => {
            const p = rp(i, (v / 100) * 90, 130, 130);
            return <circle key={i} cx={p.x} cy={p.y} r="3" fill="#9B7FBB" stroke="#FFFFFF" strokeWidth="1.5" />;
          })}
          {chartLabels.map((label, i) => {
            const p = rp(i, 106, 130, 130);
            const ta = i === 0 ? 'middle' : i <= 2 ? 'start' : 'end';
            return (
              <text key={i} x={p.x} y={p.y} textAnchor={ta} dominantBaseline="middle"
                className="text-[9px] fill-[#6B6778] font-medium">{label}</text>
            );
          })}
          {chartValues.map((v, i) => {
            const p = rp(i, (v / 100) * 90 - 12, 130, 130);
            return (
              <text key={`v${i}`} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle"
                className="text-[10px] fill-[#9B7FBB] font-bold">{v}</text>
            );
          })}
        </svg>
      </div>

      {/* Score cards */}
      <div className="grid grid-cols-2 gap-3">
        {areas.map(({ key, label }) => {
          const item = data[key] as any;
          if (!item || typeof item !== 'object') return null;
          const { score, label: badge, text } = item;
          const barColor = score >= 80 ? 'bg-[#8FCFA0]' : score >= 60 ? 'bg-[#C9A88D]' : 'bg-[#E0978A]';
          const scoreColor = score >= 80 ? 'text-[#8FCFA0]' : score >= 60 ? 'text-[#C9A88D]' : 'text-[#E0978A]';
          return (
            <div key={key} className="rounded-[8px] border border-[rgba(0,0,0,0.06)] bg-[#FFFFFF] p-3.5 shadow-sm">
              <div className="mb-1.5 flex items-center justify-between">
                <h4 className="text-xs font-semibold text-[#1F1D2B]">{label}</h4>
                <div className="flex items-center gap-1.5">
                  <span className={`text-base font-bold ${scoreColor}`}>{score}</span>
                  {badge && <span className="inline-block text-center leading-none rounded-full border border-[rgba(0,0,0,0.08)] bg-[#F8F8FA] px-2 py-1 text-[9px] text-[#6B6778]">{badge}</span>}
                </div>
              </div>
              <div className="mb-2 h-1 w-full rounded-full bg-[#F0F0F2]">
                <div className={`h-full rounded-full ${barColor}`} style={{ width: `${score}%` }} />
              </div>
              {text && <p className="text-[11px] leading-relaxed text-[#6B6778]">{text}</p>}
            </div>
          );
        })}
      </div>

      {(data.advice as string) && <AdviceBlock>{data.advice as string}</AdviceBlock>}
      {lucky && lucky.length > 0 && (
        <div>
          <p className="mb-2 text-[10px] font-semibold tracking-wide text-[#6B6778]">幸运领域</p>
          <div className="flex flex-wrap gap-2">
            {lucky.map((a, i) => (
              <span key={i} className="inline-block text-center leading-none rounded-full border border-[#9B7FBB]/20 bg-[#9B7FBB]/5 px-2.5 py-1 text-[11px] text-[#9B7FBB]">{a}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function DecadeTrendPage({ data }: { data: Record<string, unknown> }) {
  return (
    <div className="space-y-5">
      <div className="relative rounded-[4px] border border-[#9B7FBB]/15 bg-gradient-to-b from-[#9B7FBB]/5 to-transparent p-5 text-center">
        <div className="absolute left-1/2 top-0 h-1 w-8 -translate-x-1/2 rounded-b-[2px] bg-[#9B7FBB]" />
        <p className="text-[10px] font-semibold tracking-wide text-[#6B6778]">当前大运</p>
        <p className="mt-2 text-lg font-bold text-[#9B7FBB]">{data.age_range as string} 岁</p>
        {(data.gan_zhi as string) && (
          <p className="mt-1 text-xs text-[#6B6778]">
            大运干支：<span className="font-semibold text-[#9B7FBB]">{data.gan_zhi as string}</span>
            {data.element as string && <span className="ml-1">（{data.element as string}）</span>}
          </p>
        )}
        <p className="mt-2 text-sm text-[#1F1D2B]/70">{data.focus as string}</p>
      </div>
      {(data.advice as string) && <AdviceBlock>{data.advice as string}</AdviceBlock>}
    </div>
  );
}

function SelfImprovementPage({ data }: { data: Record<string, unknown> }) {
  const directions = data.directions as string[];
  const books = data.book_suggestions as string[];
  const focusStar = data.focus_star as string;
  const mindset = data.mindset_shift as string;
  return (
    <div className="space-y-5">
      {directions && directions.length > 0 && (
        <div className="space-y-2.5">
          <h3 className="text-xs font-semibold tracking-wide text-[#6B6778]">成长方向</h3>
          <ul className="space-y-2">
            {directions.map((d, i) => (
              <li key={i} className="flex items-center gap-3 text-sm text-[#1F1D2B]/80">
                <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center leading-none rounded-full bg-[#8FCFA0]/15 text-xs text-[#8FCFA0]">
                  ✓
                </span>
                {d}
              </li>
            ))}
          </ul>
        </div>
      )}
      {focusStar && (
        <div className="rounded-[4px] border border-[#9B7FBB]/12 bg-[#9B7FBB]/4 p-3.5">
          <h3 className="mb-1 text-xs font-semibold tracking-wide text-[#6B6778]">能量聚焦</h3>
          <p className="text-sm leading-relaxed text-[#1F1D2B]/70">{focusStar}</p>
        </div>
      )}
      {mindset && (
        <div className="rounded-[4px] border border-[#9B7FBB]/12 bg-[#9B7FBB]/4 p-3.5">
          <h3 className="mb-1 text-xs font-semibold tracking-wide text-[#6B6778]">心态转变</h3>
          <p className="text-sm leading-relaxed text-[#1F1D2B]/70">{mindset}</p>
        </div>
      )}
      {books && books.length > 0 && (
        <div className="space-y-2.5">
          <h3 className="text-xs font-semibold tracking-wide text-[#6B6778]">推荐阅读</h3>
          <div className="grid grid-cols-1 gap-2">
            {books.map((book, i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded-[4px] border border-[rgba(0,0,0,0.06)] bg-[#F8F8FA] px-4 py-3"
              >
                <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center leading-none rounded-[3px] bg-[#9B7FBB]/10 text-sm text-[#9B7FBB]">
                  📖
                </span>
                <span className="text-sm text-[#1F1D2B]/80">{book}</span>
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
  yong_shen_ji_shen: '用神忌神',
};

function isThreePartEntry(v: unknown): v is { meaning: string; your_chart: string; why_it_matters: string } {
  return (
    typeof v === 'object' &&
    v !== null &&
    'meaning' in v &&
    'your_chart' in v &&
    'why_it_matters' in v
  );
}

function GlossaryPage({ data }: { data: Record<string, unknown> }) {
  const entries = Object.entries(data).filter(([key]) => key !== 'id');
  return (
    <div className="space-y-3">
      {entries.map(([term, desc]) => {
        const label = GLOSSARY_ZH[term] ?? term;
        if (isThreePartEntry(desc)) {
          return (
            <div key={term} className="rounded-[4px] border border-[rgba(0,0,0,0.06)] bg-[#F8F8FA] px-4 py-3 space-y-2">
              <p className="text-xs font-semibold text-[#9B7FBB]">{label}</p>
              <p className="text-sm leading-relaxed text-[#1F1D2B]/65"><span className="font-medium text-[#1F1D2B]/80">定义</span> {desc.meaning}</p>
              <p className="text-sm leading-relaxed text-[#1F1D2B]/65"><span className="font-medium text-[#1F1D2B]/80">你的命盘</span> {desc.your_chart}</p>
              <p className="text-sm leading-relaxed text-[#9B7FBB]/80"><span className="font-medium text-[#9B7FBB]">对你意味着</span> {desc.why_it_matters}</p>
            </div>
          );
        }
        return (
          <div key={term} className="rounded-[4px] border border-[rgba(0,0,0,0.06)] bg-[#F8F8FA] px-4 py-3">
            <p className="text-xs font-semibold text-[#9B7FBB]">{label}</p>
            <p className="mt-1 text-sm leading-relaxed text-[#1F1D2B]/65">{desc as string}</p>
          </div>
        );
      })}
    </div>
  );
}

function FooterPage(_data: Record<string, unknown>) {
  return (
    <div className="flex h-full flex-col items-center justify-center text-center">
      <div className="w-12 border-t border-[rgba(0,0,0,0.06)]" />
      <p className="mt-4 text-xs leading-relaxed text-[#8A8696]">本内容由 AI 生成，仅供娱乐参考</p>
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

export function ReportPageViewer({ report, onShare, variant = 'viewer', userInfo }: ReportPageViewerProps) {
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

  if (variant === 'pdf') {
    return (
      <div className="w-full max-w-[800px] mx-auto bg-[#FFFFFF]">
        {PAGES.map((page, i) => {
          const data = (report[page.key as keyof FullReport] ?? {}) as Record<string, unknown>;
          return (
            <div key={page.key} className="p-6 pt-12" style={{ pageBreakInside: 'avoid' }}>
              {page.key !== 'cover' && page.key !== 'footer' && (
                <div className="relative mb-4 flex items-center border-b border-[rgba(0,0,0,0.06)] pb-3">
                  <span className="absolute -left-1 select-none text-[48px] font-bold leading-none text-[#9B7FBB]/6">
                    {String(i).padStart(2, '0')}
                  </span>
                  <span className="ml-14 text-xs font-medium tracking-wide text-[#6B6778]">
                    {page.title}
                  </span>
                </div>
              )}
              <div className="min-h-0 pt-4">
                {page.key === 'cover'
                  ? <CoverPage data={data} {...(userInfo ? { userInfo } : {})} />
                  : PAGE_RENDERERS[page.key]?.(data) ?? null}
              </div>
            </div>
          );
        })}
        <div className="text-center border-t border-[#EDE6DE] px-8 py-4">
          <p className="text-[9px] text-[#D4C0B0]">星隅出品 · AI 生成 · 仅供娱乐参考</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="scrollbar-hide h-[80vh] snap-y snap-mandatory overflow-y-auto"
      >
        {PAGES.map((page, i) => {
          const data = (report[page.key as keyof FullReport] ?? {}) as Record<string, unknown>;
          return (
            <div
              key={page.key}
              className="flex h-[80vh] snap-start snap-always flex-col justify-start p-6 pt-12"
            >
              {page.key !== 'cover' && page.key !== 'footer' && (
                <div className="relative mb-4 flex items-center border-b border-[rgba(0,0,0,0.06)] pb-3">
                  <span className="absolute -left-1 select-none text-[48px] font-bold leading-none text-[#9B7FBB]/6">
                    {String(i).padStart(2, '0')}
                  </span>
                  <span className="ml-14 text-xs font-medium tracking-wide text-[#6B6778]">
                    {page.title}
                  </span>
                  <div className="ml-auto flex gap-1">
                    {i > 0 && (
                      <button
                        onClick={() => jumpTo(i - 1)}
                        className="flex h-6 w-6 items-center justify-center leading-none rounded-[4px] text-xs text-[#8A8696] transition-colors hover:bg-[#F5F0FA] hover:text-[#1F1D2B]"
                        aria-label="上一页"
                      >
                        ‹
                      </button>
                    )}
                    {i < PAGES.length - 1 && (
                      <button
                        onClick={() => jumpTo(i + 1)}
                        className="flex h-6 w-6 items-center justify-center leading-none rounded-[4px] text-xs text-[#8A8696] transition-colors hover:bg-[#F5F0FA] hover:text-[#1F1D2B]"
                        aria-label="下一页"
                      >
                        ›
                      </button>
                    )}
                  </div>
                </div>
              )}
              <div className="flex-1 overflow-y-auto min-h-0">
                {page.key === 'cover'
                  ? <CoverPage data={data} {...(userInfo ? { userInfo } : {})} />
                  : PAGE_RENDERERS[page.key]?.(data) ?? null}
              </div>
            </div>
          );
        })}
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
        <DotProgress total={PAGES.length} current={currentPage} onJump={jumpTo} />
      </div>

      {/* {onShare && (
        <div className="sticky bottom-0 bg-gradient-to-t from-[#FFFFFF] via-[#FFFFFF]/90 to-transparent p-4 pt-8">
          <Button variant="outline" size="md" className="w-full" onClick={onShare}>
            分享报告
          </Button>
        </div>
      )} */}
    </div>
  );
}
