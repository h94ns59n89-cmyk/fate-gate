'use client';

import React from 'react';
import { Logger } from '@/lib/logger';
import { Button } from '@/components/common/Button';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    Logger.for('ui').error('ErrorBoundary caught', { error: String(error) });
    this.props.onError?.(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div
          role="alert"
          className="flex min-h-[400px] flex-col items-center justify-center gap-4 p-8 text-center"
        >
          <div className="text-3xl">😅</div>
          <h2 className="text-base font-semibold text-[#d4d4d4]">页面出现异常</h2>
          <p className="text-sm text-[#858585]">请尝试刷新页面</p>
          <Button onClick={() => window.location.reload()}>刷新页面</Button>
        </div>
      );
    }

    return this.props.children;
  }
}
