'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/common/Logo';

export default function AdminLoginPage() {
  const router = useRouter();
  const [token, setToken] = useState('');
  const [loginError, setLoginError] = useState('');

  const handleLogin = async () => {
    setLoginError('');
    if (!token) { setLoginError('请输入管理密码'); return; }
    try {
      const res = await fetch('/api/v1/admin/verify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token }) });
      const json = await res.json();
      if (json.code === 0) {
        try { localStorage.setItem('admin_auth', JSON.stringify({ name: '管理员', loggedIn: true, token })); } catch {}
        router.push('/admin');
      } else {
        setLoginError(json.message || '密码错误');
      }
    } catch {
      setLoginError('验证请求失败，请稍后再试');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F5F4F7] p-4">
      <div className="flex flex-col items-center">
        <Logo />
        <div className="mt-6 w-full max-w-sm rounded-[12px] bg-[#FFFFFF] p-6 shadow-lg">
          <h1 className="mb-5 text-center text-lg font-semibold text-[#1F1D2B]">管理员登录</h1>
          {loginError && (
            <div className="mb-3 rounded-[8px] bg-[#FDE8E8] px-3 py-2 text-xs text-[#C0392B]">{loginError}</div>
          )}
          <input
            type="password"
            value={token}
            onChange={(e) => { setToken(e.target.value); setLoginError(''); }}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            placeholder="输入管理密码"
            className="mb-3 w-full rounded-[8px] border border-[rgba(0,0,0,0.12)] px-3 py-2.5 text-sm outline-none focus:border-[#9B7FBB]"
          />
          <button
            onClick={handleLogin}
            className="w-full rounded-[8px] bg-[#9B7FBB] py-2.5 text-sm font-medium text-[#FFFFFF] hover:bg-[#8A6EAA]"
          >
            登录
          </button>
        </div>
      </div>
    </div>
  );
}
