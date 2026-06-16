'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface UsePollingOptions {
  interval?: number;
  maxAttempts?: number;
  enabled?: boolean;
}

export function usePolling<T>(
  fetcher: () => Promise<T>,
  shouldStop: (data: T) => boolean,
  options: UsePollingOptions = {},
) {
  const { interval = 3000, maxAttempts = 10, enabled = true } = options;
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [attempts, setAttempts] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const poll = async () => {
      try {
        const result = await fetcher();
        setData(result);
        setAttempts((prev) => prev + 1);

        if (shouldStop(result) || attempts >= maxAttempts) {
          stop();
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
        stop();
      }
    };

    poll();
    intervalRef.current = setInterval(poll, interval);

    return () => stop();
  }, [fetcher, shouldStop, interval, maxAttempts, enabled, attempts, stop]);

  return { data, error, attempts, stop };
}
