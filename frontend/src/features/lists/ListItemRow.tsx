import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Check, MoreHorizontal } from 'lucide-react';
import { m } from 'motion/react';
import { type CSSProperties, useEffect, useRef, useState } from 'react';

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import type { ListItemPayload } from '@/lib/api';
import { easing, spring } from '@/lib/motion';
import { formatQuantity, type ShoppingChanges, shoppingValues } from '@/lib/shopping';
import { cn } from '@/lib/utils';
import { HandStrike } from './HandStrike';
import { ShoppingFields } from './ShoppingFields';

interface ListItemRowProps {
  item: ListItemPayload;
  readOnly?: boolean;
  byOther?: boolean;
  authorLabel?: string;
  authorName?: string | null;
  authorStyle?: CSSProperties;
  arriving?: boolean;
  onToggle: (done: boolean) => void;
  onRename: (content: string) => void;
  onActions: () => void;
  shopping?: boolean;
  shoppingExpanded?: boolean;
  onShoppingChange?: (changes: ShoppingChanges) => Promise<void>;
}

export function ListItemRow({
  item,
  readOnly = false,
  byOther = false,
  authorLabel,
  authorName,
  authorStyle,
  arriving = false,
  onToggle,
  onRename,
  onActions,
  shopping = false,
  shoppingExpanded = false,
  onShoppingChange,
}: ListItemRowProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(item.content);
  const inputRef = useRef<HTMLInputElement>(null);
  const actionable = !readOnly && !item.id.startsWith('temp-');
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: item.id,
    disabled: !actionable || editing,
  });
  const { quantityMillis } = shoppingValues(item);
  const showQuantity = shopping && !shoppingExpanded && quantityMillis > 1000;

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
    <li
      ref={setNodeRef}
      data-item-id={item.id}
      data-dragging={isDragging || undefined}
      className={cn(
        'group relative items-center gap-x-3 pr-1 pl-3',
        shopping
          ? cn('shopping-item', !shoppingExpanded && 'shopping-item-collapsed')
          : byOther
            ? 'attributed-item sm:flex'
            : 'flex',
      )}
      style={{
        ...authorStyle,
        minHeight: 'var(--rule-height)',
        transform: CSS.Translate.toString(transform),
        transition: transition
          ? `${transition}, padding-block 240ms cubic-bezier(0.22, 1, 0.36, 1), row-gap 240ms cubic-bezier(0.22, 1, 0.36, 1)`
          : undefined,
        opacity: isDragging ? 0.25 : 1,
      }}
    >
      {byOther ? (
        <span
          aria-hidden
          className="-translate-y-1/2 absolute top-1/2 left-0 h-6 w-[3px] rounded-full bg-[var(--author-color)]"
        />
      ) : null}

      {arriving && (
        <m.span
          aria-hidden
          initial={{ opacity: 0.55 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 1.6, ease: easing.out }}
          className="pointer-events-none absolute inset-x-1 inset-y-1 rounded-md bg-[var(--author-background)]"
        />
      )}

      <m.button
        type="button"
        disabled={readOnly}
        onClick={() => onToggle(!item.done)}
        whileTap={readOnly ? undefined : { scale: 0.85 }}
        transition={spring.snappy}
        aria-pressed={item.done}
        aria-label={item.done ? 'Desmarcar item' : 'Marcar item como feito'}
        className={cn(
          'item-check grid size-[22px] shrink-0 place-items-center rounded-md border transition-colors',
          item.done
            ? 'border-accent-list bg-accent-list'
            : 'border-ink/25 bg-surface/70 hover:border-accent-list/70',
          readOnly && 'cursor-default opacity-70',
        )}
      >
        <m.span
          initial={false}
          animate={{ opacity: item.done ? 1 : 0, scale: item.done ? 1 : 0.6 }}
          transition={spring.snappy}
        >
          <Check className="size-3.5 text-accent-list-foreground" strokeWidth={3.5} />
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
          className="item-content min-w-0 flex-1 bg-transparent text-[0.95rem] text-ink outline-none"
        />
      ) : (
        <button
          type="button"
          disabled={readOnly}
          ref={setActivatorNodeRef}
          {...attributes}
          {...listeners}
          aria-label={`${item.content}. Segure para arrastar ou toque para editar`}
          onClick={() => setEditing(true)}
          onContextMenu={(event) => event.preventDefault()}
          className={cn(
            'item-content min-w-0 flex-1 text-left',
            showQuantity && 'flex items-baseline gap-1.5',
          )}
        >
          <span
            className={cn(
              'relative inline-block min-w-0 max-w-full truncate align-middle text-[0.95rem]',
              item.done ? 'text-ink-faint' : 'text-ink',
            )}
          >
            {item.content}
            <HandStrike active={item.done} />
          </span>
          {showQuantity ? (
            <span className="shrink-0 text-[0.72rem] font-medium tabular-nums text-ink-faint">
              {formatQuantity(quantityMillis)}x
            </span>
          ) : null}
        </button>
      )}

      {byOther ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <button type="button" aria-label={authorLabel} className="author-badge">
              <span
                aria-hidden
                className="size-1.5 shrink-0 rounded-full bg-[var(--author-color)]"
              />
              <span className="truncate">{authorName ?? 'Outra pessoa'}</span>
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" align="end">
            {authorLabel}
          </TooltipContent>
        </Tooltip>
      ) : null}

      {shopping && onShoppingChange ? (
        <ShoppingFields
          expanded={shoppingExpanded}
          item={item}
          readOnly={readOnly || item.id.startsWith('temp-')}
          onChange={onShoppingChange}
        />
      ) : null}

      {!readOnly && (
        <button
          type="button"
          onClick={onActions}
          id={`item-actions-${item.id}`}
          disabled={!actionable}
          aria-label={`Opções de ${item.content}`}
          aria-haspopup="dialog"
          className="item-remove grid size-7 shrink-0 place-items-center rounded-full text-ink-faint opacity-45 transition-[opacity,color,background-color] hover:bg-muted hover:text-ink group-hover:opacity-100 focus-visible:opacity-100 sm:opacity-0"
        >
          <MoreHorizontal className="size-4" />
        </button>
      )}
    </li>
  );
}
