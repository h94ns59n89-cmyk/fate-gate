'use client';

import { Logger } from '@/lib/logger';
import { Button } from '@/components/common/Button';
import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Logger.for('ui').error('Page error', { error: String(error) });
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gradient-brand p-8 text-center">
      <div className="text-6xl">😅</div>
      <h1 className="text-2xl font-bold text-white">页面出现异常</h1>
      <p className="text-sm text-white/60">请尝试刷新页面</p>
      <Button onClick={() => reset()}>重试</Button>
    </div>
  );
}
