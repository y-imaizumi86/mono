// src/components/App.tsx

import { useState, useMemo } from 'react';
import { Reorder } from 'framer-motion';
import { useItems } from '@/hooks/useItems';
import { ShoppingItem } from './ui/ShoppingItem';
import { PullToRefresh } from './ui/PullToRefresh';
import { Plus } from 'lucide-react';
import type { Item } from '@/db/schema';
import { mutate } from 'swr';

interface Props {
  userEmail: string;
}

export const App = ({ userEmail }: Props) => {
  const { items, isLoading, addItem, updateItem, deleteItem, reorderItems } = useItems();
  const [activeTab, setActiveTab] = useState<'shared' | 'private'>('shared');
  const [inputText, setInputText] = useState('');

  const handleRefresh = async () => {
    await mutate('/api/items');
    await new Promise((resolve) => setTimeout(resolve, 500));
  };

  // shared と private でアイテムを分類
  const sharedItems = useMemo(() => items.filter((item) => item.listType === 'shared'), [items]);
  const privateItems = useMemo(
    () => items.filter((item) => item.listType === 'private' && item.ownerEmail === userEmail),
    [items, userEmail]
  );

  const filteredItems = activeTab === 'shared' ? sharedItems : privateItems;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    addItem(inputText, activeTab);
    setInputText('');
  };

  const handleReorder = (newFilteredOrder: Item[]) => {
    const currentAllItems = [...items];
    const newOrderIds = new Set(newFilteredOrder.map((i) => i.id));
    const hiddenItems = currentAllItems.filter((i) => !newOrderIds.has(i.id));
    const mergedItems = [...newFilteredOrder, ...hiddenItems];
    mutate('/api/items', mergedItems, false);
  };

  const handleOrderSave = () => {
    reorderItems(items);
  };

  if (isLoading) {
    return (
      <div className="flex h-60 animate-pulse items-center justify-center text-gray-400">
        読み込み中...
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col overflow-hidden pt-[68px]">
      {/* タブ切り替え */}
      <div className="flex-none px-4 pt-4 pb-2">
        <div className="flex gap-2 rounded-full bg-gray-100 p-1">
          <button
            onClick={() => setActiveTab('shared')}
            className={`flex-1 rounded-full py-2 text-sm font-medium transition-all ${
              activeTab === 'shared' ? 'bg-white shadow-sm' : 'text-gray-500'
            }`}
          >
            みんな ({sharedItems.length})
          </button>
          <button
            onClick={() => setActiveTab('private')}
            className={`flex-1 rounded-full py-2 text-sm font-medium transition-all ${
              activeTab === 'private' ? 'bg-white shadow-sm' : 'text-gray-500'
            }`}
          >
            自分だけ ({privateItems.length})
          </button>
        </div>
      </div>

      {/* スクロール可能なコンテナ */}
      <div className="flex-1 overflow-y-auto overscroll-contain px-4 pb-4">
        <PullToRefresh onRefresh={handleRefresh} className="min-h-full">
          {filteredItems.length === 0 ? (
            <div className="flex h-60 flex-col items-center justify-center text-gray-400 opacity-50">
              <div className="mb-2 text-4xl">🛒</div>
              <p className="text-sm font-medium">リストは空です</p>
            </div>
          ) : (
            <Reorder.Group axis="y" values={filteredItems} onReorder={handleReorder} layoutScroll>
              {filteredItems.map((item) => (
                <ShoppingItem
                  key={item.id}
                  item={item}
                  currentUserEmail={userEmail}
                  onUpdate={updateItem}
                  onDelete={deleteItem}
                  onOrderChange={handleOrderSave}
                />
              ))}
            </Reorder.Group>
          )}
        </PullToRefresh>
      </div>

      <form
        onSubmit={handleAdd}
        className="safe-area-bottom flex-none border-t border-gray-100 bg-white/80 p-4 backdrop-blur-md"
      >
        <div className="mx-auto flex max-w-md gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`${activeTab === 'shared' ? 'みんな' : '自分だけ'}のリストに追加...`}
            className="flex-1 rounded-full bg-gray-100 px-5 py-3 text-gray-800 shadow-inner transition-all placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-black/5 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-black text-white shadow-lg transition-transform active:scale-90 disabled:opacity-50 disabled:active:scale-100"
          >
            <Plus size={24} />
          </button>
        </div>
      </form>
    </div>
  );
};
