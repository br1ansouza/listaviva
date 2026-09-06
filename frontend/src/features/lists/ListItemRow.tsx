import { Check, X } from 'lucide-react';
import { m } from 'motion/react';
import { useEffect, useRef, useState } from 'react';

import type { ListItemPayload } from '@/lib/api';
import { sheetItem, spring } from '@/lib/motion';
import { cn } from '@/lib/utils';
import { HandStrike } from './HandStrike';

interface ListItemRowProps {
  item: ListItemPayload;
  readOnly?: boolean;
  onToggle: (done: boolean) => void;
  onRename: (content: string) => void;
  onRemove: () => void;
}

export function ListItemRow({
  item,
  readOnly = false,
  onToggle,
  onRename,
  onRemove,
}: ListItemRowProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(item.content);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!editing) setDraft(item.content);
  }, [editing, item.content]);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  function commit() {
    const trimmed = draft.trim();
    setEditing(false);

    if (!trimmed) {
      setDraft(item.content);
      return;
    }

    if (trimmed !== item.content) onRename(trimmed);
  }

  return (
    <m.li
      variants={sheetItem}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="group flex items-center gap-3 pr-1"
      style={{ minHeight: 'var(--rule-height)' }}
    >
      <m.button
        type="button"
        disabled={readOnly}
        onClick={() => onToggle(!item.done)}
        whileTap={readOnly ? undefined : { scale: 0.85 }}
        transition={spring.snappy}
        aria-pressed={item.done}
        aria-label={item.done ? 'Desmarcar item' : 'Marcar item como feito'}
        className={cn(
          'grid size-[22px] shrink-0 place-items-center rounded-md border transition-colors',
          item.done ? 'border-transparent bg-accent-list' : 'border-ink/25 bg-transparent',
          readOnly && 'cursor-default opacity-70',
        )}
      >
        <m.span
          initial={false}
          animate={{ opacity: item.done ? 1 : 0, scale: item.done ? 1 : 0.6 }}
          transition={spring.snappy}
        >
          <Check className="size-3.5 text-ink" strokeWidth={3.5} />
        </m.span>
      </m.button>

      {editing ? (
        <input
          ref={inputRef}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={commit}
          onKeyDown={(event) => {
            if (event.key === 'Enter') commit();
            if (event.key === 'Escape') {
              setDraft(item.content);
              setEditing(false);
            }
          }}
          maxLength={500}
          className="min-w-0 flex-1 bg-transparent text-[0.95rem] leading-[var(--rule-height)] text-ink outline-none"
        />
      ) : (
        <button
          type="button"
          disabled={readOnly}
          onClick={() => setEditing(true)}
          className="min-w-0 flex-1 text-left"
        >
          <span
            className={cn(
              'relative inline-block max-w-full truncate align-middle text-[0.95rem] leading-[var(--rule-height)]',
              item.done ? 'text-ink-faint' : 'text-ink',
            )}
          >
            {item.content}
            <HandStrike active={item.done} />
          </span>
        </button>
      )}

      {!readOnly && (
        <button
          type="button"
          onClick={onRemove}
          aria-label="Remover item"
          className="grid size-7 shrink-0 place-items-center rounded-full text-ink-faint opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
        >
          <X className="size-4" />
        </button>
      )}
    </m.li>
  );
}
