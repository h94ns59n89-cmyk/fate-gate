'use client';

export default function GlobalError({
  error: _error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#1A1A2E] p-8 text-center">
          <div className="text-6xl">😅</div>
          <h1 className="text-2xl font-bold text-white">系统异常</h1>
          <p className="text-sm text-white/60">抱歉，系统出现异常，请稍后重试</p>
          <button
            onClick={() => reset()}
            className="rounded-xl bg-[#D4A853] px-6 py-3 font-medium text-[#1A1A2E]"
          >
            重试
          </button>
        </div>
      </body>
    </html>
  );
}
