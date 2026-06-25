'use client';

import { useState, useEffect, useCallback } from 'react';
import { Logo } from '@/components/common/Logo';

export default function AdminUsersPage() {
  const [token, setToken] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [users, setUsers] = useState<{ id: number; username: string; nickname: string; created_at: string }[]>([]);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newNickname, setNewNickname] = useState('');
  const [creatingUser, setCreatingUser] = useState(false);
  const [msg, setMsg] = useState('');

  const addMsg = useCallback((m: string) => {
    setMsg(m);
    setTimeout(() => setMsg(''), 3000);
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch('/api/v1/admin/users/list', { headers: { 'Authorization': `Bearer ${token}` } });
      const json = await res.json();
      if (json.code === 0) {
        setUsers(json.data.users);
      }
    } catch {
      addMsg('加载用户列表失败');
    }
  }, [token, addMsg]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('admin_auth');
      if (raw) { const t = JSON.parse(raw).token; if (t) { setToken(t); setAuthenticated(true); } }
    } catch {}
  }, []);

  useEffect(() => {
    if (authenticated) fetchUsers();
  }, [authenticated, fetchUsers]);

  const handleLogin = async () => {
    try {
      const res = await fetch('/api/v1/admin/verify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token }) });
      const json = await res.json();
      if (json.code === 0) {
        setAuthenticated(true);
        try { localStorage.setItem('admin_auth', JSON.stringify({ name: '管理员', loggedIn: true, token })); } catch {}
      } else {
        addMsg('密码错误');
      }
    } catch {
      addMsg('验证请求失败');
    }
  };

  const handleCreateUser = async () => {
    if (!newUsername || !newPassword) { addMsg('请输入用户名和密码'); return; }
    setCreatingUser(true);
    try {
      const res = await fetch('/api/v1/admin/users/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, username: newUsername, password: newPassword, nickname: newNickname || undefined }),
      });
      const json = await res.json();
      if (json.code === 0) {
        addMsg(`✅ 用户 ${json.data.username} 创建成功`);
        setNewUsername(''); setNewPassword(''); setNewNickname('');
        fetchUsers();
      } else {
        addMsg(`❌ ${json.message}`);
      }
    } catch {
      addMsg('❌ 创建用户请求异常');
    } finally {
      setCreatingUser(false);
    }
  };

  if (!authenticated) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#F5F4F7] p-4">
        <div className="mb-6">
          <Logo />
        </div>
        <div className="w-full max-w-sm rounded-[12px] bg-[#FFFFFF] p-6 shadow-lg">
          <h1 className="mb-5 text-center text-lg font-semibold text-[#1F1D2B]">管理员登录</h1>
          <input
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
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
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F4F7]">
      <div className="mx-auto max-w-5xl px-4 py-6">
        {msg && (
          <div className="mb-4 rounded-[8px] bg-[#FFFFFF] px-4 py-2 text-xs text-[#6B6778] shadow-sm">
            {msg}
          </div>
        )}

        <div className="space-y-6">
          <div className="rounded-[10px] bg-[#FFFFFF] p-4 shadow-sm">
            <h3 className="mb-3 text-xs font-semibold text-[#6B6778]">创建新用户</h3>
            <div className="flex flex-wrap gap-2">
              <input
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder="用户名"
                className="min-w-[160px] flex-1 rounded-[6px] border border-[rgba(0,0,0,0.12)] px-3 py-2 text-xs outline-none focus:border-[#9B7FBB]"
              />
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="密码"
                className="min-w-[120px] flex-1 rounded-[6px] border border-[rgba(0,0,0,0.12)] px-3 py-2 text-xs outline-none focus:border-[#9B7FBB]"
              />
              <input
                value={newNickname}
                onChange={(e) => setNewNickname(e.target.value)}
                placeholder="昵称 (选填)"
                className="min-w-[120px] flex-1 rounded-[6px] border border-[rgba(0,0,0,0.12)] px-3 py-2 text-xs outline-none focus:border-[#9B7FBB]"
              />
              <button
                onClick={handleCreateUser}
                disabled={creatingUser}
                className="rounded-[6px] bg-[#9B7FBB] px-5 py-2 text-xs font-medium text-[#FFFFFF] transition-colors hover:bg-[#8A6EAA] disabled:opacity-50"
              >
                {creatingUser ? '创建中...' : '创建用户'}
              </button>
            </div>
          </div>

          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-[#1F1D2B]">
                用户列表
                <span className="ml-2 text-xs font-normal text-[#8A8696]">{users.length} 人</span>
              </h2>
              <button
                onClick={fetchUsers}
                className="rounded-[6px] border border-[rgba(0,0,0,0.1)] bg-[#FFFFFF] px-3 py-1.5 text-xs font-medium text-[#6B6778] hover:bg-[#F8F8FA]"
              >
                刷新
              </button>
            </div>
            {users.length === 0 ? (
              <div className="rounded-[10px] bg-[#FFFFFF] px-4 py-12 text-center text-sm text-[#8A8696] shadow-sm">
                暂无用户，请创建一个
              </div>
            ) : (
              <div className="space-y-2">
                {users.map((u) => (
                  <div key={u.id} className="flex items-center justify-between rounded-[10px] bg-[#FFFFFF] px-4 py-3 shadow-sm">
                    <div>
                      <span className="text-sm font-medium text-[#1F1D2B]">{u.nickname}</span>
                      <span className="ml-2 text-xs text-[#8A8696]">@{u.username}</span>
                    </div>
                    <span className="text-xs text-[#B8B6C0]">ID: {u.id}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
