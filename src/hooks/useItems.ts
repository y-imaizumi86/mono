import type { Item } from '@/db/schema';
import useSWR, { mutate } from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json() as Promise<Item[]>);

export const useItems = () => {
  const { data, error, isLoading } = useSWR<Item[]>('/api/items', fetcher);

  const items = data || [];

  const addItem = async (text: string, type: 'family' | 'private' = 'family') => {
    const tempId = crypto.randomUUID();

    const tempItem = {
      id: tempId,
      text,
      isCompleted: false,
      type,
      order: 0,
      familyId: 'temp',
      createdById: 'temp',
      createdAt: new Date(),
    };

    mutate('/api/items', [...items, tempItem], false);

    try {
      await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, type }),
      });

      mutate('/api/items');
    } catch (e) {
      console.error(e);
      mutate('/api/items');
    }
  };

  const updateItem = async (id: string, updates: Partial<Item>) => {
    const newItems = items.map((item) => (item.id === id ? { ...item, ...updates } : item));
    mutate('/api/items', newItems, false);

    await fetch(`/api/items/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });

    mutate('/api/items');
  };

  const deleteItem = async (id: string) => {
    const newItems = items.filter((item: any) => item.id !== id);
    mutate('/api/items', newItems, false);

    await fetch(`/api/items/${id}`, {
      method: 'DELETE',
    });

    mutate('/api/items');
  };

  const reorderItems = async (sortedItems: Item[]) => {
    mutate('/api/items', sortedItems, false);

    const updates = sortedItems.map((item, index) => ({
      id: item.id,
      order: index,
    }));

    try {
      await fetch('/api/items/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates }),
      });
    } catch (e) {
      console.error('Reorder failed', e);
      mutate('/api/items');
    }
  };

  return {
    items,
    isLoading,
    isError: error,
    addItem,
    updateItem,
    deleteItem,
    reorderItems,
  };
};
