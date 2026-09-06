import { AnimatePresence, m } from 'motion/react';

import type { ListPayload } from '@/lib/api';
import {
  accentStyle,
  iconById,
  type ListColor,
  type ListIconId,
  listTypeById,
} from '@/lib/list-catalog';
import { staggerChildren } from '@/lib/motion';
import { ColorPicker } from './ColorPicker';
import { IconPicker } from './IconPicker';
import { ItemComposer } from './ItemComposer';
import { ListItemRow } from './ListItemRow';

interface ListSheetProps {
  list: ListPayload;
  readOnly?: boolean;
  editable?: boolean;
  onAddItem: (content: string) => void;
  onToggleItem: (itemId: string, done: boolean) => void;
  onRenameItem: (itemId: string, content: string) => void;
  onRemoveItem: (itemId: string) => void;
  onRenameList?: (title: string) => void;
  onChangeIcon?: (icon: ListIconId) => void;
  onChangeColor?: (color: ListColor) => void;
}

export function ListSheet({
  list,
  readOnly = false,
  editable = false,
  onAddItem,
  onToggleItem,
  onRenameItem,
  onRemoveItem,
  onRenameList,
  onChangeIcon,
  onChangeColor,
}: ListSheetProps) {
  const Icon = iconById(list.icon);
  const definition = listTypeById(list.list_type);
  const remaining = list.items.filter((item) => !item.done).length;

  return (
    <section style={accentStyle(list.color)} className="pt-2">
      <div className="flex items-center gap-3 rounded-2xl bg-accent-list/70 px-3 py-2.5">
        {editable && onChangeIcon ? (
          <IconPicker
            value={list.icon as ListIconId}
            onChange={onChangeIcon}
            className="size-10 rounded-xl border-transparent bg-surface/50"
          />
        ) : (
          <Icon className="size-6 shrink-0 text-ink" />
        )}

        {editable && onRenameList ? (
          <input
            defaultValue={list.title}
            maxLength={120}
            aria-label="Título da lista"
            onBlur={(event) => {
              const trimmed = event.target.value.trim();
              if (!trimmed) {
                event.target.value = list.title;
                return;
              }
              if (trimmed !== list.title) onRenameList(trimmed);
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter') event.currentTarget.blur();
            }}
            className="hand-title min-w-0 flex-1 bg-transparent text-3xl text-ink outline-none"
          />
        ) : (
          <h1 className="hand-title min-w-0 flex-1 truncate text-3xl text-ink">{list.title}</h1>
        )}
      </div>

      <p className="mt-1.5 px-1 text-right text-xs text-ink-faint">
        {remaining === 0 ? 'tudo feito' : `${remaining} restantes`}
      </p>

      {editable && onChangeColor ? (
        <ColorPicker
          value={list.color as ListColor}
          onChange={onChangeColor}
          className="mt-3 px-1"
        />
      ) : null}

      <m.ul
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: staggerChildren(0.03) } }}
        className="mt-4"
      >
        <AnimatePresence initial={false}>
          {list.items.map((item) => (
            <ListItemRow
              key={item.id}
              item={item}
              readOnly={readOnly}
              onToggle={(done) => onToggleItem(item.id, done)}
              onRename={(content) => onRenameItem(item.id, content)}
              onRemove={() => onRemoveItem(item.id)}
            />
          ))}
        </AnimatePresence>
      </m.ul>

      {readOnly ? null : (
        <ItemComposer placeholder={definition.itemPlaceholder} onAdd={onAddItem} />
      )}
    </section>
  );
}
