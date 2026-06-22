'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/stores/userStore';
import { Logo } from '@/components/common/Logo';

export default function LoginPage() {
  const router = useRouter();
  const loginStore = useUserStore((s) => s.loginWithPassword);
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
        body: JSON.stringify({ username, password }),
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
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#FAF8F5] to-[#F5F0FA] p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Logo size="md" />
        </div>

        <div className="rounded-[16px] bg-[#FFFFFF] p-6 shadow-sm">
          <h1 className="mb-1 text-center text-lg font-semibold text-[#1F1D2B]">登录</h1>
          <p className="mb-6 text-center text-xs leading-relaxed text-[#6B6778]">
            登录后可永久保存您的专属报告
          </p>

          <div className="mb-6 rounded-[8px] bg-[#FAF8F5] px-4 py-3 text-center">
            <p className="text-xs italic leading-relaxed text-[#8A8696]">
              「星隅，世间人人皆是独一无二的星辰。
              <br />
              于八字命理的微光中，照见你本来的模样。」
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
            <a
              href="/"
              className="text-xs text-[#9B7FBB] transition-colors hover:text-[#8A6EAA]"
            >
              以游客身份继续浏览 →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
