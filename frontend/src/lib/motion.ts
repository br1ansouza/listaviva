import type { Transition, Variants } from 'motion/react';

export const duration = {
  instant: 0.12,
  fast: 0.18,
  base: 0.26,
  slow: 0.42,
} as const;

export const easing = {
  out: [0.22, 1, 0.36, 1],
  inOut: [0.65, 0, 0.35, 1],
} as const;

export const spring = {
  snappy: { type: 'spring', stiffness: 520, damping: 34, mass: 0.6 },
  soft: { type: 'spring', stiffness: 260, damping: 28, mass: 0.9 },
} satisfies Record<string, Transition>;

export const transition = {
  fast: { duration: duration.fast, ease: easing.out },
  base: { duration: duration.base, ease: easing.out },
  slow: { duration: duration.slow, ease: easing.out },
} satisfies Record<string, Transition>;

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: transition.base },
  exit: { opacity: 0, y: -6, transition: transition.fast },
};

export const sheetItem: Variants = {
  hidden: { opacity: 0, x: -5 },
  visible: { opacity: 1, x: 0, transition: transition.fast },
  exit: { opacity: 0, x: 5, transition: transition.fast },
};

export const staggerChildren = (stagger = 0.035): Transition => ({
  staggerChildren: stagger,
  delayChildren: 0.04,
});
