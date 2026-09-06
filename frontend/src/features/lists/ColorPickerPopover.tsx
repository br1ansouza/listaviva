import { Palette } from 'lucide-react';
import { m } from 'motion/react';
import { useState } from 'react';

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { colorToken, type ListColor } from '@/lib/list-catalog';
import { spring } from '@/lib/motion';
import { cn } from '@/lib/utils';
import { ColorPicker } from './ColorPicker';

interface ColorPickerPopoverProps {
  value: ListColor;
  onChange: (color: ListColor) => void;
  className?: string;
}

export function ColorPickerPopover({ value, onChange, className }: ColorPickerPopoverProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <m.button
          type="button"
          whileTap={{ scale: 0.9 }}
          transition={spring.snappy}
          aria-label="Escolher cor da lista"
          className={cn(
            'grid size-9 shrink-0 place-items-center rounded-full text-ink-soft transition-colors hover:text-ink',
            className,
          )}
        >
          <span className="relative grid place-items-center">
            <Palette className="size-[18px]" />
            <span
              aria-hidden
              className="absolute -right-1 -bottom-1 size-2.5 rounded-full ring-2 ring-surface"
              style={{ backgroundColor: colorToken(value) }}
            />
          </span>
        </m.button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-auto p-3">
        <ColorPicker
          value={value}
          onChange={(color) => {
            onChange(color);
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
