import { useState, useEffect } from 'react';

// 型定義（APIから返ってくるデータと同じ形）
interface Item {
  id: number;
  label: string;
  isCompleted: boolean;
}

export const App = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // 1. 初回ロード時にリストを取得 (GET)
  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const res = await fetch('/api/items');
      if (res.ok) {
        const data = await res.json() as Item[];
        setItems(data);
      }
    } catch (error) {
      console.error('Failed to fetch items', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 2. アイテム追加 (POST)
  const addItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const res = await fetch('/api/items', {
      method: 'POST',
      body: JSON.stringify({ label: inputValue }),
      headers: { 'Content-Type': 'application/json' },
    });

    if (res.ok) {
      const newItem = await res.json() as Item;
      setItems((prev) => [newItem, ...prev]);
      setInputValue('');
    }
  };

  // 3. 完了状態の切り替え (PATCH)
  const toggleItem = async (id: number, currentStatus: boolean) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isCompleted: !currentStatus } : item))
    );

    await fetch(`/api/items/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ isCompleted: !currentStatus }),
      headers: { 'Content-Type': 'application/json' },
    });
  };

  // 4. 削除 (DELETE)
  const deleteItem = async (id: number) => {
    // 見た目から消す
    setItems((prev) => prev.filter((item) => item.id !== id));

    await fetch(`/api/items/${id}`, {
      method: 'DELETE',
    });
  };

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500">読み込み中...</div>;
  }

  return (
    <div className="mx-auto w-full max-w-md overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
      {/* 入力エリア */}
      <form onSubmit={addItem} className="border-b border-gray-100 bg-gray-50 p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="牛乳を買う..."
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 transition-all focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!inputValue.trim()}
            className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            追加
          </button>
        </div>
      </form>

      {/* リストエリア */}
      <ul className="max-h-[60vh] divide-y divide-gray-100 overflow-y-auto">
        {items.length === 0 ? (
          <li className="p-8 text-center text-sm text-gray-400">まだアイテムがありません</li>
        ) : (
          items.map((item) => (
            <li
              key={item.id}
              className={`group flex items-center justify-between p-4 transition-colors hover:bg-gray-50 ${
                item.isCompleted ? 'bg-gray-50/50' : ''
              }`}
            >
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <button
                  onClick={() => toggleItem(item.id, item.isCompleted)}
                  className={`flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded border transition-colors ${
                    item.isCompleted
                      ? 'border-blue-500 bg-blue-500 text-white'
                      : 'border-gray-300 hover:border-blue-400'
                  }`}
                >
                  {item.isCompleted && (
                    <svg
                      className="h-3.5 w-3.5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </button>
                <span
                  className={`cursor-pointer truncate transition-all select-none ${
                    item.isCompleted ? 'text-gray-400 line-through' : 'text-gray-700'
                  }`}
                  onClick={() => toggleItem(item.id, item.isCompleted)}
                >
                  {item.label}
                </span>
              </div>

              <button
                onClick={() => deleteItem(item.id)}
                className="p-2 text-gray-400 opacity-0 transition-all group-hover:opacity-100 hover:text-red-500"
                aria-label="削除"
              >
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                </svg>
              </button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
};
