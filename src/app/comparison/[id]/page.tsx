'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ComparisonCard } from '@/components/comparison/ComparisonCard';
import { Button } from '@/components/common/Button';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { PayWall } from '@/components/report/PayWall';
import { useUserStore } from '@/stores/userStore';

interface ComparisonData {
  id: number;
  match_score: number;
  dimensions: string;
  advice: string;
  share_image_url: string | null;
  is_paid: boolean;
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

  if (!data.is_paid) {
    return (
      <div className="min-h-screen px-4 pb-24 pt-14">
        <div className="mb-6 text-center">
          <h1 className="mb-1 text-base font-semibold text-[#d4d4d4]">简人格对比</h1>
          <p className="text-xs text-[#858585]">解锁完整合盘分析</p>
        </div>
        {userId && (
          <PayWall
            reportId={data.id}
            userId={userId}
            price={990}
            onSuccess={fetchComparison}
          />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 pb-24 pt-14">
      <div className="mb-6 text-center">
        <h1 className="mb-1 text-base font-semibold text-[#d4d4d4]">合盘对比结果</h1>
        <p className="text-xs text-[#858585]">你们的简人格匹配度分析</p>
      </div>

      <ComparisonCard matchScore={data.match_score} onShare={() => {}} />

      {data.dimensions && (
        <div className="vscode-card mt-4 space-y-3">
          <h3 className="text-sm font-semibold text-[#d4d4d4]">维度分析</h3>
          <div className="space-y-2 text-sm text-[#d4d4d4]/80">
            {(() => {
              try {
                const dims = typeof data.dimensions === 'string' ? JSON.parse(data.dimensions) : data.dimensions;
                return Array.isArray(dims) ? dims.map((d: { label?: string; score?: number; desc?: string }, i: number) => (
                  <div key={i} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span>{d.label ?? `维度${i + 1}`}</span>
                      <span className="text-[#d4a853]">{d.score ?? 0}%</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-[#3c3c3c]">
                      <div className="h-full rounded-full bg-[#d4a853]" style={{ width: `${d.score ?? 0}%` }} />
                    </div>
                    {d.desc && <p className="text-xs text-[#858585]">{d.desc}</p>}
                  </div>
                )) : null;
              } catch {
                return <p className="text-xs text-[#858585]">维度数据加载失败</p>;
              }
            })()}
          </div>
        </div>
      )}

      {data.advice && (
        <div className="vscode-card mt-4 space-y-2">
          <h3 className="text-sm font-semibold text-[#d4d4d4]">相处建议</h3>
          <p className="text-sm leading-relaxed text-[#d4d4d4]/80">
            {(() => {
              try {
                const adv = typeof data.advice === 'string' ? JSON.parse(data.advice) : data.advice;
                return adv.text ?? adv;
              } catch {
                return data.advice;
              }
            })()}
          </p>
        </div>
      )}

      <div className="mt-6 text-center">
        <p className="text-xs text-[#6a6a6a]">本内容由 AI 生成，仅供娱乐参考</p>
      </div>
    </div>
  );
}
