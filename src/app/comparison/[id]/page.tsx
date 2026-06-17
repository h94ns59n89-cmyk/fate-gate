'use client';

import { useEffect, useState, Component, type ReactNode } from 'react';
import { useParams } from 'next/navigation';
import { ComparisonCard } from '@/components/comparison/ComparisonCard';
import { Button } from '@/components/common/Button';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { PayWall } from '@/components/report/PayWall';
import { useUserStore } from '@/stores/userStore';

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
            <p className="text-sm text-[#f44747] mb-2">渲染异常: {String(this.state.error?.message)}</p>
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
  const userId = useUserStore((s) => s.userId);
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
            <p className="text-sm text-[#f44747]">{error ?? '对比不存在'}</p>
            <Button variant="outline" onClick={fetchComparison}>重试</Button>
          </div>
        );
      }

      const dimsObj = data.dimensions && typeof data.dimensions === 'object'
        ? (data.dimensions as Record<string, number>)
        : null;

      if (!data.is_paid) {
        return (
          <div className="min-h-screen px-4 pb-[110px] pt-14">
            <div className="mb-6 text-center">
              <h1 className="mb-1 text-xl font-semibold text-[#d4d4d4]">人格对比</h1>
              {typeof data.summary_tag === 'string' && (
                <p className="mb-2 text-sm font-medium text-[#d4a853]">{String(data.summary_tag)}</p>
              )}
              <p className="text-xs text-[#858585]">解锁完整合盘分析</p>
            </div>

            {dimsObj && (
              <ComparisonCard
                matchScore={data.match_score}
                userTag={data.user_tags?.[0] ?? '我'}
                targetTag={data.target_tags?.[0] ?? 'TA'}
                onShare={() => {}}
              />
            )}

            {userId && (
              <div className="fixed bottom-[44px] left-0 right-0 z-50 border-t border-[#2a3040] bg-[#0B0E14]">
                <PayWall
                  reportId={data.id}
                  userId={userId}
                  price={990}
                  productType="COMPARISON"
                  compact
                  onSuccess={fetchComparison}
                />
              </div>
            )}
          </div>
        );
      }

      return (
    <div className="min-h-screen px-4 pb-[100px] pt-14">
      <div className="mb-6 text-center">
        <h1 className="mb-1 text-xl font-semibold text-[#d4d4d4]">合盘对比结果</h1>
        {typeof data.summary_tag === 'string' && (
          <p className="mb-1 text-sm font-medium text-[#d4a853]">{String(data.summary_tag)}</p>
        )}
        <p className="text-xs text-[#858585]">你们的人格匹配度分析</p>
      </div>

      <ComparisonCard
        matchScore={data.match_score}
        userTag={data.user_tags?.[0] ?? '我'}
        targetTag={data.target_tags?.[0] ?? 'TA'}
        onShare={() => {}}
      />

      {dimsObj && (
        <div className="vscode-card mt-4 space-y-3">
          <h3 className="text-sm font-semibold text-[#d4d4d4]">维度分析</h3>
          <div className="space-y-2 text-sm text-[#d4d4d4]/80">
            {Object.entries(dimsObj).map(([label, score]) => {
              const labelZh: Record<string, string> = { communication: '沟通', emotional: '情感', values: '价值观', growth: '成长' };
              return (
              <div key={label} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="capitalize">{labelZh[label.toLowerCase()] ?? label}</span>
                  <span className="text-[#d4a853]">{Math.round(score)}%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-[#2a3040]">
                  <div className="h-full rounded-full bg-[#d4a853]" style={{ width: `${Math.round(score)}%` }} />
                </div>
              </div>
            );
            })}
          </div>
        </div>
      )}

      {(data.complementarity || (data.strengths?.length ?? 0) > 0 || (data.potential_conflicts?.length ?? 0) > 0 || data.advice) && (
        <div className="vscode-card mt-4 space-y-3">
          {data.complementarity && (
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-[#d4d4d4]">互补性</h3>
              <p className="text-sm leading-relaxed text-[#d4d4d4]/80">{String(data.complementarity)}</p>
            </div>
          )}

          {Array.isArray(data.strengths) && data.strengths.length > 0 && (
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-[#d4d4d4]">优势</h3>
              <ul className="list-inside list-disc space-y-0.5 text-sm text-[#d4d4d4]/80">
                {data.strengths.map((s, i) => (
                  <li key={i}>{typeof s === 'string' ? s : JSON.stringify(s)}</li>
                ))}
              </ul>
            </div>
          )}

          {Array.isArray(data.potential_conflicts) && data.potential_conflicts.length > 0 && (
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-[#d4d4d4]">潜在冲突</h3>
              <ul className="list-inside list-disc space-y-0.5 text-sm text-[#d4d4d4]/80">
                {data.potential_conflicts.map((c, i) => (
                  <li key={i}>{typeof c === 'string' ? c : JSON.stringify(c)}</li>
                ))}
              </ul>
            </div>
          )}

          {data.advice && (
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-[#d4d4d4]">相处建议</h3>
              <p className="text-sm leading-relaxed text-[#d4d4d4]/80">{String(data.advice)}</p>
            </div>
          )}
        </div>
      )}

      <div className="mt-6 text-center">
        <p className="text-xs text-[#6a6a6a]">本内容由 AI 生成，仅供娱乐参考</p>
      </div>
    </div>
      );
    })()}
    </SafeBoundary>
  );
}
