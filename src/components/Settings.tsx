// src/components/Settings.tsx

import { useState, useEffect } from 'react';
import { authClient } from '../lib/auth-client';

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

  // 設定を開いた時に家族情報を取得
  useEffect(() => {
    if (isOpen) {
      fetch('/api/family')
        .then((res) => res.json())
        .then((data) => {
          const familyData = data as FamilyData;
          setInviteCode(familyData.inviteCode);
          setFamilyName(familyData.name);
        });
    }
  }, [isOpen]);

  // 家族に参加する処理
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
      window.location.reload(); // リロードしてリストを更新
    } else {
      alert('コードが間違っているか、無効です');
    }
  };

  const handleLogout = async () => {
    await authClient.signOut();
    window.location.href = '/';
  };

  const handleLeave = async () => {
    if (
      !confirm('本当にこの家族から抜けますか？\n（抜けると、新しい自分だけのリストが作成されます）')
    )
      return;

    const res = await fetch('/api/family/leave', {
      method: 'POST',
    });

    if (res.ok) {
      alert('家族から抜けました。新しいリストを作成します。');
      window.location.reload();
    }
  };

  return (
    <>
      {/* 画面右上の歯車アイコンボタン */}
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 text-gray-400 transition-colors hover:text-gray-600"
      >
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      </button>

      {/* モーダル */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="animate-in fade-in zoom-in w-full max-w-sm rounded-xl bg-white p-6 shadow-xl duration-200">
            <h2 className="mb-6 text-xl font-bold text-gray-800">設定</h2>

            {/* 自分の情報 */}
            <div className="mb-8 rounded-lg border border-gray-100 bg-gray-50 p-4">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="mb-1 text-xs font-medium tracking-wider text-gray-500 uppercase">
                    現在の家族
                  </p>
                  <p className="text-lg font-bold text-gray-800">{familyName}</p>
                </div>
                <button
                  onClick={handleLeave}
                  className="text-xs text-red-500 underline hover:text-red-700"
                >
                  退出する
                </button>
              </div>

              <p className="mb-1 text-xs font-medium tracking-wider text-gray-500 uppercase">
                あなたの招待コード
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 rounded border border-gray-200 bg-white px-3 py-2 text-center font-mono text-xl font-bold tracking-widest text-blue-600 select-all">
                  {inviteCode || '...'}
                </code>
              </div>
              <p className="mt-2 text-xs text-gray-400">このコードをパートナーに伝えてください</p>
            </div>

            {/* 相手の家族に参加 */}
            <div className="mb-8">
              <p className="mb-2 text-sm font-bold text-gray-700">招待コードを入力して参加</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="コードを入力"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-center font-mono uppercase focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                  maxLength={6}
                />
                <button
                  onClick={handleJoin}
                  disabled={inputCode.length < 6}
                  className="rounded-lg bg-blue-600 px-4 py-2 font-bold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  参加
                </button>
              </div>
            </div>

            {/* アクションボタン */}
            <div className="flex justify-between border-t border-gray-100 pt-6">
              <button
                onClick={handleLogout}
                className="text-sm font-medium text-red-500 hover:text-red-600"
              >
                ログアウト
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
