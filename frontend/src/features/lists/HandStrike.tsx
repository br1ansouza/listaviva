import { m } from 'motion/react';

import { duration, easing } from '@/lib/motion';

const STRIKE_HIDDEN = 'inset(-100% 102% -100% -2%)';
const STRIKE_DRAWN = 'inset(-100% -2% -100% -2%)';

export function HandStrike({ active }: { active: boolean }) {
  return (
    <m.svg
      aria-hidden
      viewBox="0 0 100 10"
      preserveAspectRatio="none"
      className="pointer-events-none absolute inset-x-0 top-1/2 h-[0.55em] w-full -translate-y-1/2 overflow-visible text-ink-soft"
      initial={false}
      animate={{ clipPath: active ? STRIKE_DRAWN : STRIKE_HIDDEN, opacity: active ? 1 : 0 }}
      transition={{
        clipPath: { duration: active ? duration.base : duration.fast, ease: easing.out },
        opacity: { duration: duration.instant },
      }}
    >
      <path
        d="M0.8 6.1 C 18 3.4, 33 7.6, 49 5.2 S 78 3.1, 99.2 5.6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </m.svg>
  );
}
