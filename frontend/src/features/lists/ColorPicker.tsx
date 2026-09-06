import { Check } from 'lucide-react';
import { m } from 'motion/react';

import { LIST_COLORS, type ListColor } from '@/lib/list-catalog';
import { spring, transition } from '@/lib/motion';
import { cn } from '@/lib/utils';

interface ColorPickerProps {
  value: ListColor;
  onChange: (color: ListColor) => void;
  className?: string;
}

export function ColorPicker({ value, onChange, className }: ColorPickerProps) {
  return (
    <div
      className={cn('flex flex-wrap items-center gap-2 sm:gap-2.5', className)}
      role="radiogroup"
      aria-label="Cor da lista"
    >
      {LIST_COLORS.map((color) => {
        const selected = color.id === value;

        return (
          <m.button
            key={color.id}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={color.label}
            title={color.label}
            onClick={() => onChange(color.id)}
            tabIndex={selected ? 0 : -1}
            onKeyDown={(event) => {
              const directions: Record<string, number> = {
                ArrowRight: 1,
                ArrowDown: 1,
                ArrowLeft: -1,
                ArrowUp: -1,
              };
              const direction = directions[event.key];
              if (direction === undefined && event.key !== 'Home' && event.key !== 'End') return;
              event.preventDefault();
              const index = LIST_COLORS.findIndex((entry) => entry.id === color.id);
              const nextIndex =
                event.key === 'Home'
                  ? 0
                  : event.key === 'End'
                    ? LIST_COLORS.length - 1
                    : (index + (direction ?? 0) + LIST_COLORS.length) % LIST_COLORS.length;
              const next = LIST_COLORS[nextIndex];
              if (!next) return;
              onChange(next.id);
              const buttons =
                event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>(
                  '[role="radio"]',
                );
              buttons?.[nextIndex]?.focus();
            }}
            whileTap={{ scale: 0.88 }}
            transition={spring.snappy}
            className={cn(
              'grid size-8 place-items-center rounded-full border-2 border-surface-raised shadow-sm ring-offset-2 ring-offset-surface transition-[background-color,border-color,box-shadow,transform] sm:size-9',
              selected ? 'ring-2 ring-ink/45' : 'hover:scale-105 hover:ring-2 hover:ring-ink/15',
            )}
            style={{ backgroundColor: color.token }}
          >
            {selected && (
              <m.span
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={transition.fast}
              >
                <Check
                  className="size-4 text-[oklch(0.16_0.02_158)] drop-shadow-sm"
                  strokeWidth={3.25}
                />
              </m.span>
            )}
          </m.button>
        );
      })}
    </div>
  );
}
