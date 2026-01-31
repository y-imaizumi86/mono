// src/hooks/useRaisedShadow.ts

import { animate, useMotionValue, type MotionValue } from 'framer-motion';
import { useEffect } from 'react';

const INACTIVE_SHADOW = '0px 0px 0px rgba(0,0,0,0.8)';
const ACTIVE_SHADOW = '0px 10px 25px rgba(0,0,0,0.2)';

export const useRaisedShadow = (value: MotionValue<number>) => {
  const boxShadow = useMotionValue(INACTIVE_SHADOW);

  useEffect(() => {
    let isActive = false;
    value.onChange((latest) => {
      const wasActive = isActive;
      if (latest !== 0) {
        isActive = true;
        if (isActive !== wasActive) {
          // ドラッグ中（動きがある時）の影
          animate(boxShadow, ACTIVE_SHADOW);
        }
      } else {
        isActive = false;
        if (isActive !== wasActive) {
          // 静止時（置いた時）の影
          animate(boxShadow, INACTIVE_SHADOW, { duration: 0.1 });
        }
      }
    });
  }, [value, boxShadow]);

  return boxShadow;
};
