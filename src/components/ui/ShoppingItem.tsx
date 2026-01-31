// src/components/ui/ShoppingItem.tsx

import { Reorder, motion, useAnimate, useDragControls, useMotionValue } from 'framer-motion';
import { GripVertical, Trash2, Lock, Unlock, Check } from 'lucide-react';
import { useState } from 'react';
import type { Item } from '@/db/schema';
import { useRaisedShadow } from '@/hooks/useRaisedShadow';

interface Props {
  item: Item;
  currentUserId: string;
  onUpdate: (id: string, updates: Partial<Item>) => void;
  onDelete: (id: string) => void;
}

export const ShoppingItem = ({ item, currentUserId, onUpdate, onDelete }: Props) => {
  const dragControls = useDragControls();

  const y = useMotionValue(0);
  const boxShadow = useRaisedShadow(y);

  const [scope, animate] = useAnimate();
  const [isOpen, setIsOpen] = useState(false);
  const [isReordering, setIsReordering] = useState(false);

  const canChangeType = item.createdById === currentUserId;
  const buttonWidth = canChangeType ? 120 : 60;

  const handleDragEnd = async (_: any, info: any) => {
    if (isReordering) return;

    const offset = info.offset.x;
    const velocity = info.velocity.x;

    if (offset < -50 || velocity < -500) {
      await animate(
        scope.current,
        { x: -buttonWidth },
        { type: 'spring', bounce: 0, duration: 0.3 }
      );
      setIsOpen(true);
    } else {
      await animate(scope.current, { x: 0 }, { type: 'spring', bounce: 0, duration: 0.3 });
      setIsOpen(false);
    }
  };

  const closeSwipe = () => {
    animate(scope.current, { x: 0 });
    setIsOpen(false);
  };

  return (
    <Reorder.Item
      value={item}
      id={item.id}
      dragListener={false}
      dragControls={dragControls}
      onDragEnd={() => setIsReordering(false)}
      transition={{ type: 'spring', stiffness: 600, damping: 50 }}
      style={{ boxShadow, y, position: 'relative' }}
      className="mb-3 touch-pan-y rounded-xl select-none"
    >
      <div className="absolute inset-y-0 right-0 flex items-center pr-2">
        <div className="flex items-center gap-2">
          {canChangeType && (
            <button
              onClick={() => {
                onUpdate(item.id, { type: item.type === 'family' ? 'private' : 'family' });
                closeSwipe();
              }}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-400 text-white shadow-sm transition-transform active:scale-90"
            >
              {item.type === 'family' ? <Lock size={18} /> : <Unlock size={18} />}
            </button>
          )}
          <button
            onClick={() => onDelete(item.id)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500 text-white shadow-sm transition-transform active:scale-90"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      <motion.div
        ref={scope}
        drag={isReordering ? false : 'x'}
        dragConstraints={{ left: -buttonWidth, right: 0 }}
        dragElastic={{ right: 0.05 }}
        onDragEnd={handleDragEnd}
        onClick={(e) => {
          if (isOpen) {
            e.stopPropagation();
            closeSwipe();
          }
        }}
        className="relative z-10 flex items-center justify-between rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
      >
        <div className="flex flex-1 items-center gap-3 overflow-hidden">
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              if (isOpen) {
                e.stopPropagation();
                return;
              }
              onUpdate(item.id, { isCompleted: !item.isCompleted });
            }}
            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
              item.isCompleted
                ? 'border-green-500 bg-green-500'
                : 'border-gray-300 hover:border-green-400'
            }`}
          >
            {item.isCompleted && <Check size={14} className="text-white" />}
          </button>

          <div className="flex flex-col overflow-hidden">
            <span
              className={`truncate font-medium transition-all ${item.isCompleted ? 'text-gray-400 line-through' : 'text-gray-800'}`}
            >
              {item.text}
            </span>
            {item.type === 'private' && (
              <span className="mt-0.5 flex items-center gap-1 text-[10px] text-gray-400">
                <Lock size={10} /> 自分だけ
              </span>
            )}
          </div>
        </div>

        <div
          className="cursor-grab touch-none p-2 text-gray-300 hover:text-gray-500 active:cursor-grabbing"
          onPointerDown={(e) => {
            setIsReordering(true);
            dragControls.start(e);
          }}
          onPointerUp={() => {
            setTimeout(() => setIsReordering(false), 50);
          }}
          onPointerCancel={() => {
            setTimeout(() => setIsReordering(false), 50);
          }}
        >
          <GripVertical size={20} />
        </div>
      </motion.div>
    </Reorder.Item>
  );
};
