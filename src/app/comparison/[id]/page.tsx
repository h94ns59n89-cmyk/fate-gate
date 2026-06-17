'use client';

import { useEffect, useState, Component, type ReactNode } from 'react';
import { useParams } from 'next/navigation';
import { ComparisonCard } from '@/components/comparison/ComparisonCard';
import { Button } from '@/components/common/Button';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { PayWall } from '@/components/report/PayWall';
import { useUserStore } from '@/stores/userStore';
import { Heart, Zap, AlertTriangle, MessageCircle, Sparkles, Target } from 'lucide-react';

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
      {/* Header with decorative line */}
      <div className="mb-6 text-center">
        <div className="mb-3 flex items-center justify-center gap-2">
          <div className="h-px w-8 bg-gradient-to-r from-transparent to-[#d4a853]/40" />
          <Sparkles className="h-3 w-3 text-[#d4a853]" />
          <div className="h-px w-8 bg-gradient-to-l from-transparent to-[#d4a853]/40" />
        </div>
        <h1 className="text-xl font-semibold text-[#d4d4d4]">合盘对比结果</h1>
        {typeof data.summary_tag === 'string' && (
          <p className="mb-1 mt-1 text-sm font-medium text-[#d4a853]">{String(data.summary_tag)}</p>
        )}
        <p className="text-xs text-[#7C8DB5]">你们的人格匹配度分析</p>
      </div>

      <ComparisonCard
        matchScore={data.match_score}
        userTag={data.user_tags?.[0] ?? '我'}
        targetTag={data.target_tags?.[0] ?? 'TA'}
        onShare={() => {}}
      />

      {dimsObj && (
        <div className="vscode-card mt-4 space-y-4">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-[#d4d4d4]">
            <Target className="h-3.5 w-3.5 text-[#7C8DB5]" />
            维度分析
          </h3>
          <div className="space-y-3">
            {Object.entries(dimsObj).map(([label, score], _idx) => {
              const labelZh: Record<string, string> = { communication: '沟通', emotional: '情感', values: '价值观', growth: '成长' };
              const rounded = Math.round(score);
              return (
              <div key={label} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-[#d4d4d4]/80">{labelZh[label.toLowerCase()] ?? label}</span>
                  <span className="text-xs font-semibold text-[#d4a853]">{rounded}%</span>
                </div>
                <div className="relative h-2 overflow-hidden rounded-full bg-[#2a3040]">
                  <div
                    className="h-full rounded-full transition-all duration-1000 ease-out"
                    style={{
                      width: `${rounded}%`,
                      background: 'linear-gradient(90deg, #d4a853 0%, #f0d78c 100%)',
                    }}
                  />
                  <div
                    className="absolute right-0 top-0 h-full w-2 rounded-full bg-[#d4a853]/30 blur-sm"
                    style={{ display: rounded > 80 ? 'block' : 'none' }}
                  />
                </div>
              </div>
            );
            })}
          </div>
        </div>
      )}

      {data.complementarity && (
        <div className="vscode-card mt-4 border-l-2 border-l-[#d4a853]/40">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-[#d4d4d4]">
            <Heart className="h-3.5 w-3.5 text-[#d4a853]" />
            互补性
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-[#d4d4d4]/80">{String(data.complementarity)}</p>
        </div>
      )}

      {(data.strengths?.length ?? 0) > 0 && (
        <div className="vscode-card mt-4 space-y-3">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-[#d4d4d4]">
            <Zap className="h-3.5 w-3.5 text-[#4CAF50]" />
            优势
          </h3>
          <ul className="space-y-2">
            {(data.strengths ?? []).map((s, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm leading-relaxed text-[#d4d4d4]/80">
                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#4CAF50]/15 text-[10px] text-[#4CAF50]">+</span>
                {typeof s === 'string' ? s : JSON.stringify(s)}
              </li>
            ))}
          </ul>
        </div>
      )}

      {(data.potential_conflicts?.length ?? 0) > 0 && (
        <div className="vscode-card mt-4 space-y-3">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-[#d4d4d4]">
            <AlertTriangle className="h-3.5 w-3.5 text-[#FF5722]" />
            潜在冲突
          </h3>
          <ul className="space-y-2">
            {(data.potential_conflicts ?? []).map((c, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm leading-relaxed text-[#d4d4d4]/80">
                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#FF5722]/15 text-[10px] text-[#FF5722]">~</span>
                {typeof c === 'string' ? c : JSON.stringify(c)}
              </li>
            ))}
          </ul>
        </div>
      )}

      {data.advice && (
        <div className="vscode-card mt-4 space-y-0">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-[#d4d4d4]">
            <MessageCircle className="h-3.5 w-3.5 text-[#7C8DB5]" />
            相处建议
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-[#d4d4d4]/80">{String(data.advice)}</p>
        </div>
      )}

      {/* Divider before disclaimer */}
      <div className="my-8 flex items-center gap-3">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#2a3040] to-transparent" />
        <span className="text-[10px] text-[#6a6a6a]">✦</span>
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#2a3040] to-transparent" />
      </div>
      <div className="text-center">
        <p className="text-xs text-[#6a6a6a]">本内容由 AI 生成，仅供娱乐参考</p>
      </div>
    </div>
      );
    })()}
    </SafeBoundary>
  );
}
