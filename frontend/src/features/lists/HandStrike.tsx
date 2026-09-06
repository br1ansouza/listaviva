import { motion } from 'motion/react';

import { duration, easing } from '@/lib/motion';

export function HandStrike({ active }: { active: boolean }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 100 10"
      preserveAspectRatio="none"
      className="pointer-events-none absolute inset-x-0 top-1/2 h-[0.55em] -translate-y-1/2 overflow-visible text-ink-soft"
    >
      <motion.path
        d="M0.8 6.1 C 18 3.4, 33 7.6, 49 5.2 S 78 3.1, 99.2 5.6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        initial={false}
        animate={{ pathLength: active ? 1 : 0, opacity: active ? 1 : 0 }}
        transition={{
          pathLength: { duration: active ? duration.base : duration.fast, ease: easing.out },
          opacity: { duration: duration.instant },
        }}
      />
    </svg>
  );
}
