'use client';

import { useEffect, useState, Component, type ReactNode } from 'react';
import { useParams } from 'next/navigation';
import { ComparisonCard } from '@/components/comparison/ComparisonCard';
import { Button } from '@/components/common/Button';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { LeadGenWall } from '@/components/report/LeadGenWall';
import { Sparkles, Target } from 'lucide-react';

class SafeBoundary extends Component<{ children: ReactNode; fallback?: ReactNode }, { hasError: boolean; error: Error | null }> {
  constructor(props: { children: ReactNode; fallback?: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  componentDidCatch(error: Error) {
    console.error('[SafeBoundary] Caught:', error.message, JSON.stringify(error));
  }
  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="text-center">
            <p className="text-sm text-[#E05A5A] mb-2">渲染异常: {String(this.state.error?.message)}</p>
            <Button variant="outline" onClick={() => this.setState({ hasError: false, error: null })}>重试</Button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

interface ComparisonData {
  id: number;
  status: string;
  match_score: number;
  dimensions: string;
  advice: string;
  complementarity: string;
  strengths: string[];
  potential_conflicts: string[];
  share_image_url: string | null;
  is_paid: boolean;
  target_tags?: string[];
  user_tags?: string[];
  summary_tag?: string | null;
}

export default function ComparisonResultPage() {
  const params = useParams();
  const [data, setData] = useState<ComparisonData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchComparison = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/comparisons/${params.id}`);
      const json = await res.json();
      if (json.code !== 0) throw new Error(json.message);
      console.log('[comparison] data keys:', Object.keys(json.data ?? {}), 'advice type:', typeof json.data?.advice);
      setData(json.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComparison();
  }, [params.id]);

  return (
    <SafeBoundary>
    {(() => {
      if (loading) {
        return (
          <div className="flex min-h-screen items-center justify-center">
            <LoadingSpinner size="lg" />
          </div>
        );
      }

      if (error || !data) {
        return (
          <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4">
            <p className="text-sm text-[#E05A5A]">{error ?? '对比不存在'}</p>
            <Button variant="outline" onClick={fetchComparison}>重试</Button>
          </div>
        );
      }

      const dimsObj = data.dimensions && typeof data.dimensions === 'object'
        ? (data.dimensions as Record<string, number>)
        : null;

      const isCompleted = data.status === 'COMPLETED';

      return (
    <div className="px-4 pb-8">
      {/* Header with decorative line */}
      <div className="mb-6 text-center">
        <div className="mb-3 flex items-center justify-center gap-2">
          <div className="h-px w-8 bg-gradient-to-r from-transparent to-[#9B7FBB]/30" />
          <Sparkles className="h-3 w-3 text-[#9B7FBB]" />
          <div className="h-px w-8 bg-gradient-to-l from-transparent to-[#9B7FBB]/30" />
        </div>
        <h1 className="text-xl font-semibold text-[#1F1D2B]">合盘对比结果</h1>
        {typeof data.summary_tag === 'string' && (
          <p className="mb-1 mt-1 text-sm font-medium text-[#9B7FBB]">{String(data.summary_tag)}</p>
        )}
        <p className="text-xs text-[#6B6778]">你们的人格匹配度分析</p>
      </div>

      <ComparisonCard
        matchScore={data.match_score}
        userTag={data.user_tags?.[0] ?? '我'}
        targetTag={data.target_tags?.[0] ?? 'TA'}
        onShare={() => {
          const url = window.location.href;
          navigator.clipboard.writeText(url).catch(() => {});
        }}
      />

      {/* Summary: score overview, always visible */}
      {isCompleted && (
        <div className="vscode-card mt-4 space-y-2">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-[#1F1D2B]">
            <Target className="h-3.5 w-3.5 text-[#8A8696]" />
            匹配摘要
          </h3>
          <p className="text-sm leading-relaxed text-[#1F1D2B]/70">
            {data.match_score >= 80
              ? '双方契合度很高，在多个维度上表现出较强的互补与共鸣。'
              : data.match_score >= 60
              ? '双方有一定的契合基础，部分维度存在互补空间。'
              : '双方差异较大，但差异本身也是成长的机会。'}
          </p>
          {dimsObj && (
            <div className="mt-2 grid grid-cols-2 gap-2">
              {Object.entries(dimsObj).map(([label, score]) => {
                const labelZh: Record<string, string> = { communication: '沟通', emotional: '情感', values: '价值观', growth: '成长' };
                return (
                  <div key={label} className="flex items-center justify-between rounded-[8px] bg-[#F8F8FA] px-3 py-2">
                    <span className="text-xs text-[#6B6778]">{labelZh[label.toLowerCase()] ?? label}</span>
                    <span className="text-xs font-semibold text-[#9B7FBB]">{Math.round(score)}%</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* LeadGen: unlock full analysis */}
      <div className="my-8">
        <LeadGenWall context="完整合盘分析报告" />
      </div>

      {/* Divider before disclaimer */}
      <div className="my-8 flex items-center gap-3">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[rgba(0,0,0,0.06)] to-transparent" />
        <span className="text-[10px] text-[#8A8696]">✦</span>
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[rgba(0,0,0,0.06)] to-transparent" />
      </div>
      <div className="text-center">
        <p className="text-xs text-[#8A8696]">本内容由 AI 生成，仅供娱乐参考</p>
      </div>
    </div>
      );
    })()}
    </SafeBoundary>
  );
}
