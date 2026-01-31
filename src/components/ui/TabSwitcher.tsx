// src/components/ui/TabSwitcher.tsx

import { motion } from 'framer-motion';

interface Props {
  activeTab: 'family' | 'private';
  onTabChange: (tab: 'family' | 'private') => void;
}

export const TabSwitcher = ({ activeTab, onTabChange }: Props) => {
  return (
    <div className="relative mb-6 flex rounded-xl bg-gray-200/50 p-1">
      {(['family', 'private'] as const).map((tab) => (
        <button
          key={tab}
          onClick={() => onTabChange(tab)}
          className={`relative z-10 flex-1 rounded-lg py-2 text-sm font-bold transition-colors duration-200 ${
            activeTab === tab ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          {tab === 'family' ? '🏠 みんなで' : '🔒 自分だけ'}

          {activeTab === tab && (
            <motion.div
              layoutId="activeTabBackground"
              className="absolute inset-0 -z-10 rounded-lg bg-white shadow-sm"
              transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
            />
          )}
        </button>
      ))}
    </div>
  );
};
