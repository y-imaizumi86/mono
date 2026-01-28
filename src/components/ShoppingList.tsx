// src/components/ShoppingList.tsx

import { useState, useEffect } from 'react';
import { client } from '@/lib/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Trash2 } from 'lucide-react';

// DBの型定義（一旦手動定義）
type Item = {
  id: number;
  label: string;
  isCompleted: boolean;
};

export const ShoppingList = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);

  // 初回データ取得
  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    const res = await client.api.items.$get();
    if (res.ok) {
      const data = await res.json();
      setItems(data);
    }
  };

  const addItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || loading) return;

    setLoading(true);
    // Hono RPCで追加
    const res = await client.api.items.$post({
      json: { label: inputValue },
    });

    if (res.ok) {
      const newItem = await res.json();
      setItems([newItem, ...items]); // リストの先頭に追加
      setInputValue('');
    }
    setLoading(false);
  };

  const toggleItem = async (id: number, currentStatus: boolean) => {
    // UIを先に更新（楽観的更新もどき）して体感速度を上げる
    setItems(items.map((i) => (i.id === id ? { ...i, isCompleted: !currentStatus } : i)));

    // APIコール
    await client.api.items[':id'].$patch({
      param: { id: id.toString() },
      json: { isCompleted: !currentStatus },
    });
  };

  // ▼▼▼ 追加: 削除 ▼▼▼
  const deleteItem = async (id: number) => {
    // UIから先に消す
    setItems(items.filter((i) => i.id !== id));

    // APIコール
    await client.api.items[':id'].$delete({
      param: { id: id.toString() },
    });
  };

  return (
    <div className="space-y-6">
      {/* 入力フォーム */}
      <form onSubmit={addItem} className="flex gap-2">
        <Input
          type="text"
          placeholder="買うもの..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="font-mono"
          autoFocus
        />
        <Button type="submit" disabled={loading}>
          ADD
        </Button>
      </form>

      {/* リスト表示 */}
      <ul className="space-y-2">
        {items.map((item) => (
          <li
            key={item.id}
            className="group border-border flex items-center justify-between border-b py-3 last:border-0"
          >
            <div className="flex items-center gap-3">
              <Checkbox
                checked={item.isCompleted}
                onCheckedChange={() => toggleItem(item.id, item.isCompleted)}
              />
              <span
                className={`font-mono transition-colors ${
                  item.isCompleted ? 'text-muted-foreground line-through' : ''
                }`}
              >
                {item.label}
              </span>
            </div>

            {/* 削除ボタン（見た目だけ） */}
            <button
              onClick={() => deleteItem(item.id)}
              className="text-muted-foreground hover:text-destructive opacity-0 transition-opacity group-hover:opacity-100"
            >
              <Trash2 className="size-4" />
            </button>
          </li>
        ))}

        {items.length === 0 && (
          <li className="text-muted-foreground py-8 text-center font-mono text-sm">
            No items yet.
          </li>
        )}
      </ul>
    </div>
  );
};
