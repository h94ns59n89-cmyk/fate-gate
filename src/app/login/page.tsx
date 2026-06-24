'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUserStore } from '@/stores/userStore';
import { Logo } from '@/components/common/Logo';

export default function LoginPage() {
  const router = useRouter();
  const loginStore = useUserStore((s) => s.loginWithPassword);
  const currentUserId = useUserStore((s) => s.userId);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) { setError('请输入用户名和密码'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, guest_user_id: currentUserId }),
      });
      const json = await res.json();
      if (json.code === 0 && json.data) {
        const d = json.data;
        loginStore(d.token, d.user_id, { id: d.user_id, nickname: d.nickname, avatar_url: d.avatar_url, is_new_user: false, has_report: true, report_count: 0 });
        router.push('/');
      } else {
        setError(json.message || '登录失败');
      }
    } catch {
      setError('网络错误');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-[#FAF8F5] to-[#F5F0FA] p-4">
      {/* Background illustration */}
      <div className="pointer-events-none absolute inset-0 select-none" aria-hidden="true">
        <svg className="absolute left-[5%] top-[8%] h-36 w-36 text-[#9B7FBB]/6" viewBox="0 0 120 120" fill="none">
          <rect x="20" y="15" width="8" height="8" rx="2" fill="currentColor" opacity="0.5" />
          <rect x="85" y="55" width="6" height="6" rx="1.5" fill="currentColor" opacity="0.4" />
          <rect x="55" y="85" width="5" height="5" rx="1" fill="currentColor" opacity="0.3" />
          <rect x="15" y="65" width="4" height="4" rx="1" fill="currentColor" opacity="0.3" />
          <circle cx="45" cy="40" r="2" fill="currentColor" opacity="0.4" />
          <circle cx="95" cy="20" r="1.5" fill="currentColor" opacity="0.3" />
          <path d="M24 19 Q 45 35 45 40 Q 60 55 85 58" stroke="currentColor" strokeWidth="0.4" opacity="0.25" fill="none" />
          <path d="M45 40 Q 55 70 55 87" stroke="currentColor" strokeWidth="0.4" opacity="0.2" fill="none" />
        </svg>
        <svg className="absolute bottom-[12%] right-[5%] h-28 w-28 text-[#C9A88D]/10" viewBox="0 0 100 100" fill="none">
          <circle cx="50" cy="50" r="18" stroke="currentColor" strokeWidth="0.4" opacity="0.3" />
          <circle cx="50" cy="50" r="8" stroke="currentColor" strokeWidth="0.3" opacity="0.2" />
          <rect x="46" y="12" width="8" height="8" rx="2" fill="currentColor" opacity="0.4" />
          <rect x="70" y="46" width="6" height="6" rx="1.5" fill="currentColor" opacity="0.3" />
          <rect x="24" y="44" width="5" height="5" rx="1" fill="currentColor" opacity="0.3" />
          <circle cx="50" cy="30" r="1.5" fill="currentColor" opacity="0.4" />
          <circle cx="35" cy="50" r="1" fill="currentColor" opacity="0.3" />
          <circle cx="65" cy="50" r="1" fill="currentColor" opacity="0.3" />
        </svg>
        <svg className="absolute right-[15%] top-[22%] h-20 w-20 text-[#D4C0B0]/12" viewBox="0 0 80 80" fill="none">
          <path d="M20 20 Q35 15 40 25 Q45 35 60 30" stroke="currentColor" strokeWidth="0.4" opacity="0.3" fill="none" />
          <path d="M20 20 Q15 35 25 40 Q35 45 30 60" stroke="currentColor" strokeWidth="0.4" opacity="0.3" fill="none" />
          <circle cx="40" cy="25" r="1.5" fill="currentColor" opacity="0.4" />
          <circle cx="25" cy="40" r="1" fill="currentColor" opacity="0.3" />
          <rect x="60" y="60" width="4" height="4" rx="1" fill="currentColor" opacity="0.3" />
        </svg>
        {/* Subtle glowing orbs */}
        <div className="absolute left-[20%] top-[30%] h-40 w-40 rounded-full bg-[#9B7FBB]/4 blur-3xl" />
        <div className="absolute right-[15%] bottom-[25%] h-32 w-32 rounded-full bg-[#C9A88D]/5 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-sm">
        <div className="mb-8 text-center">
          <Logo size="md" />
        </div>

        <div className="rounded-[16px] bg-[#FFFFFF]/95 p-6 shadow-sm backdrop-blur-sm">
          <h1 className="mb-1 text-center text-lg font-semibold text-[#1F1D2B]">登录</h1>
          <p className="mb-6 text-center text-xs leading-relaxed text-[#6B6778]">
            登录后可永久保存您的专属报告
          </p>

          <div className="mb-6 rounded-[8px] bg-[#FAF8F5] px-4 py-3 text-center">
            <p className="text-xs italic leading-relaxed text-[#8A8696]">
              世间人人皆是独一无二的星辰，30秒照见独一无二的你
            </p>
          </div>

          {error && (
            <div className="mb-4 rounded-[6px] bg-[#FDE8E8] px-3 py-2 text-xs text-[#C0392B]">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="用户名"
              className="w-full rounded-[8px] border border-[rgba(0,0,0,0.12)] px-3 py-2.5 text-sm outline-none transition-colors focus:border-[#9B7FBB]"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="密码"
              className="w-full rounded-[8px] border border-[rgba(0,0,0,0.12)] px-3 py-2.5 text-sm outline-none transition-colors focus:border-[#9B7FBB]"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-[8px] bg-[#9B7FBB] py-2.5 text-sm font-medium text-[#FFFFFF] transition-colors hover:bg-[#8A6EAA] disabled:opacity-50"
            >
              {loading ? '登录中...' : '登录'}
            </button>
          </form>

          <p className="mt-4 text-center text-xs text-[#8A8696]">
            没有账号？请联系管理员创建
          </p>

          <div className="mt-4 text-center">
            <Link
              href="/"
              className="text-xs text-[#9B7FBB] transition-colors hover:text-[#8A6EAA]"
            >
              以游客身份继续浏览 →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
