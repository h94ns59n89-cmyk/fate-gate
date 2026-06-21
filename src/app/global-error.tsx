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
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#F8F8FA] p-8 text-center">
          <div className="text-6xl">😅</div>
          <h1 className="text-2xl font-bold text-[#1F1D2B]">系统异常</h1>
          <p className="text-sm text-[#6B6778]">抱歉，系统出现异常，请稍后重试</p>
          <button
            onClick={() => reset()}
            className="rounded-xl bg-[#9B7FBB] px-6 py-3 font-medium text-white"
          >
            重试
          </button>
        </div>
      </body>
    </html>
  );
}
