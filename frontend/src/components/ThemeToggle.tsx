import { Moon, Sun } from 'lucide-react';
import { AnimatePresence, m } from 'motion/react';

import { spring, transition } from '@/lib/motion';
import { useTheme } from '@/lib/theme';
import { cn } from '@/lib/utils';

export function ThemeToggle({ className }: { className?: string }) {
  const theme = useTheme((state) => state.theme);
  const toggle = useTheme((state) => state.toggle);
  const isDark = theme === 'dark';

  return (
    <m.button
      type="button"
      onClick={toggle}
      whileTap={{ scale: 0.92 }}
      transition={spring.snappy}
      aria-label={isDark ? 'Usar tema claro' : 'Usar tema escuro'}
      className={cn(
        'relative grid size-10 place-items-center rounded-full border border-hairline bg-surface/70 text-ink-soft',
        'transition-colors hover:text-ink',
        className,
      )}
    >
      <AnimatePresence initial={false} mode="wait">
        <m.span
          key={theme}
          initial={{ opacity: 0, rotate: -35, scale: 0.7 }}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          exit={{ opacity: 0, rotate: 35, scale: 0.7 }}
          transition={transition.fast}
          className="absolute grid place-items-center"
        >
          {isDark ? <Moon className="size-[18px]" /> : <Sun className="size-[18px]" />}
        </m.span>
      </AnimatePresence>
    </m.button>
  );
}
