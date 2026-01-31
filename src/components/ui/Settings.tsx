// src/components/ui/Settings.tsx

import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, LogOut, Users, X, Copy, Check } from 'lucide-react';
import { authClient } from '@/lib/auth-client';

interface FamilyData {
  name: string;
  inviteCode: string;
}

interface JoinResponse {
  familyName: string;
}

export const Settings = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [familyName, setFamilyName] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetch('/api/family')
        .then((res) => {
          if (res.ok) return res.json() as Promise<FamilyData>;
          return null;
        })
        .then((data) => {
          if (data) {
            setInviteCode(data.inviteCode);
            setFamilyName(data.name);
          }
        });
    }
  }, [isOpen]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleJoin = async () => {
    if (!confirm('現在のリストから抜けて、新しい家族に参加しますか？')) return;

    const res = await fetch('/api/family/join', {
      method: 'POST',
      body: JSON.stringify({ inviteCode: inputCode }),
      headers: { 'Content-Type': 'application/json' },
    });

    if (res.ok) {
      const data = (await res.json()) as JoinResponse;
      alert(`${data.familyName}に参加しました！`);
      window.location.reload();
    } else {
      alert('コードが無効です');
    }
  };

  const handleLogout = async () => {
    await authClient.signOut();
    window.location.href = '/';
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-800"
      >
        <SettingsIcon size={20} />
      </button>

      {isOpen && (
        <div className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm duration-200">
          <div className="animate-in zoom-in-95 w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl duration-200">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">設定</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-full p-1 hover:bg-gray-100"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <div className="mb-6 rounded-xl border border-gray-100 bg-gray-50 p-4">
              <div className="mb-2 flex items-center gap-2 text-xs font-bold tracking-wider text-gray-500 uppercase">
                <Users size={12} />
                現在の家族
              </div>
              <p className="mb-4 text-lg font-bold text-gray-800">
                {familyName || '読み込み中...'}
              </p>

              <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase">招待コード</p>
                  <p className="font-mono text-xl font-bold tracking-widest text-black">
                    {inviteCode || '...'}
                  </p>
                </div>
                <button
                  onClick={copyToClipboard}
                  className="rounded-md p-2 transition-colors hover:bg-gray-100"
                >
                  {copied ? (
                    <Check size={18} className="text-green-500" />
                  ) : (
                    <Copy size={18} className="text-gray-400" />
                  )}
                </button>
              </div>
              <p className="mt-2 text-center text-xs text-gray-400">
                このコードをパートナーに伝えてください
              </p>
            </div>

            <div className="mb-8">
              <p className="mb-2 text-sm font-bold text-gray-700">別の家族に参加する</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="招待コード (6桁)"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-center font-mono uppercase focus:border-black focus:ring-1 focus:ring-black focus:outline-none"
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                  maxLength={6}
                />
                <button
                  onClick={handleJoin}
                  disabled={inputCode.length < 6}
                  className="rounded-lg bg-black px-4 py-2 font-bold text-white transition-opacity disabled:opacity-30"
                >
                  参加
                </button>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4">
              <button
                onClick={handleLogout}
                className="flex w-full items-center justify-center gap-2 rounded-xl py-3 font-bold text-red-500 transition-colors hover:bg-red-50"
              >
                <LogOut size={18} />
                ログアウト
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
