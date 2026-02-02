// src/components/App.tsx

import { useState, useMemo } from 'react';
import { Reorder } from 'framer-motion';
import { useItems } from '@/hooks/useItems';
import { TabSwitcher } from './ui/TabSwitcher';
import { ShoppingItem } from './ui/ShoppingItem';
import { Plus } from 'lucide-react';
import type { Item } from '@/db/schema';
import { mutate } from 'swr';

interface Props {
  userId: string;
  memberCount: number;
}

export const App = ({ userId, memberCount }: Props) => {
  const { items, isLoading, addItem, updateItem, deleteItem, reorderItems } = useItems();
  const [activeTab, setActiveTab] = useState<'family' | 'private'>('family');
  const [inputText, setInputText] = useState('');

  const isSolo = memberCount <= 1;

  const filteredItems = useMemo(() => {
    if (isSolo) return items;
    return items.filter((item) => {
      if (activeTab === 'family') return item.type === 'family';
      return item.type === 'private';
    });
  }, [items, activeTab, isSolo]);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const type = isSolo ? 'family' : activeTab;
    addItem(inputText, type);

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
    <div className="mt-4 pb-24">
      {!isSolo && <TabSwitcher activeTab={activeTab} onTabChange={setActiveTab} />}

      {filteredItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400 opacity-50">
          <div className="mb-2 text-4xl">🛒</div>
          <p className="text-sm font-medium">リストは空です</p>
        </div>
      ) : (
        <Reorder.Group axis="y" values={filteredItems} onReorder={handleReorder}>
          {filteredItems.map((item) => (
            <ShoppingItem
              key={item.id}
              item={item}
              currentUserId={userId}
              onUpdate={updateItem}
              onDelete={deleteItem}
              onOrderChange={handleOrderSave}
            />
          ))}
        </Reorder.Group>
      )}

      <form
        onSubmit={handleAdd}
        className="safe-area-bottom fixed right-0 bottom-0 left-0 z-50 border-t border-gray-100 bg-white/80 p-4 backdrop-blur-md"
      >
        <div className="mx-auto flex max-w-md gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={
              isSolo
                ? '買うものを入力...'
                : `${activeTab === 'family' ? 'みんな' : '自分'}のリストに追加...`
            }
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
