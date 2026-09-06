import { Check } from 'lucide-react';
import { motion } from 'motion/react';

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
      className={cn('flex flex-wrap items-center gap-2.5', className)}
      role="radiogroup"
      aria-label="Cor da lista"
    >
      {LIST_COLORS.map((color) => {
        const selected = color.id === value;

        return (
          <motion.button
            key={color.id}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={color.label}
            onClick={() => onChange(color.id)}
            whileTap={{ scale: 0.88 }}
            transition={spring.snappy}
            className={cn(
              'grid size-9 place-items-center rounded-full ring-offset-2 ring-offset-paper transition-shadow',
              selected ? 'ring-2 ring-ink/35' : 'ring-1 ring-hairline hover:ring-ink/20',
            )}
            style={{ backgroundColor: color.token }}
          >
            {selected && (
              <motion.span
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={transition.fast}
              >
                <Check className="size-4 text-ink/70" strokeWidth={3} />
              </motion.span>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
