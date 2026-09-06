import { m } from 'motion/react';
import { useState } from 'react';

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { iconById, LIST_ICON_IDS, type ListIconId } from '@/lib/list-catalog';
import { spring } from '@/lib/motion';
import { cn } from '@/lib/utils';

interface IconPickerProps {
  value: ListIconId;
  onChange: (icon: ListIconId) => void;
  className?: string;
}

export function IconPicker({ value, onChange, className }: IconPickerProps) {
  const [open, setOpen] = useState(false);
  const Current = iconById(value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <m.button
          type="button"
          whileTap={{ scale: 0.9 }}
          transition={spring.snappy}
          aria-label="Escolher ícone da lista"
          className={cn(
            'grid size-12 shrink-0 place-items-center rounded-2xl border border-hairline bg-accent-list/60 text-ink',
            'transition-colors hover:bg-accent-list',
            className,
          )}
        >
          <Current className="size-6" strokeWidth={2} />
        </m.button>
      </PopoverTrigger>

      <PopoverContent align="start" className="w-[17.5rem] p-2">
        <div className="grid grid-cols-6 gap-1">
          {LIST_ICON_IDS.map((id) => {
            const Icon = iconById(id);
            const selected = id === value;

            return (
              <button
                key={id}
                type="button"
                aria-label={id}
                aria-pressed={selected}
                onClick={() => {
                  onChange(id);
                  setOpen(false);
                }}
                className={cn(
                  'grid aspect-square place-items-center rounded-lg text-ink-soft transition-colors',
                  selected ? 'bg-accent-list/70 text-ink' : 'hover:bg-muted hover:text-ink',
                )}
              >
                <Icon className="size-[18px]" />
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
