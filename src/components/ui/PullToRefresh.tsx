import { animate, motion, useMotionValue, useTransform } from 'framer-motion';
import { ArrowDown, Loader2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface Props {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  className?: string;
}

export const PullToRefresh = ({ onRefresh, children, className = '' }: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const y = useMotionValue(0);
  const startY = useRef(0);
  const isPulling = useRef(false);

  const rotate = useTransform(y, [0, 80], [0, 180]);
  const opacity = useTransform(y, [0, 40], [0, 1]);
  const scale = useTransform(y, [0, 80], [0.8, 1]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scrollParent = container.closest('.overflow-y-auto') || document.body;

    const handleTouchStart = (e: TouchEvent) => {
      if (scrollParent.scrollTop <= 0 && !loading) {
        startY.current = e.touches[0].clientY;
      } else {
        isPulling.current = false;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (loading) return;

      const currentY = e.touches[0].clientY;
      const diff = currentY - startY.current;

      if (scrollParent.scrollTop <= 0 && diff > 0) {
        if (!isPulling.current) {
          isPulling.current = true;
        }

        const damped = Math.min(Math.pow(diff, 0.8), 150);
        y.set(damped);

        if (e.cancelable) {
          e.preventDefault();
        }
      } else {
        isPulling.current = false;
        y.set(0);
      }
    };

    const handleTouchEnd = async () => {
      if (!isPulling.current || loading) return;
      isPulling.current = false;

      const currentY = y.get();
      if (currentY > 80) {
        setLoading(true);
        await animate(y, 60, { type: 'spring', stiffness: 300, damping: 20 });

        try {
          await onRefresh();
        } finally {
          setLoading(false);
          animate(y, 0, { type: 'spring', stiffness: 300, damping: 20 });
        }
      } else {
        animate(y, 0, { type: 'spring', stiffness: 300, damping: 20 });
      }
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [loading, onRefresh, y]);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <motion.div
        style={{ y, opacity, x: '-50%' }}
        className="absolute top-0 left-1/2 z-0 flex w-full -translate-y-full items-center justify-center pt-4"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md">
          {loading ? (
            <Loader2 className="animate-spin text-black" size={20} />
          ) : (
            <motion.div style={{ rotate, scale }}>
              <ArrowDown className="text-gray-500" size={20} />
            </motion.div>
          )}
        </div>
      </motion.div>

      <motion.div style={{ y }} className="relative z-10">
        {children}
      </motion.div>
    </div>
  );
};
