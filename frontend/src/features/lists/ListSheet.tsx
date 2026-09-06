import { AnimatePresence, m } from 'motion/react';
import { useMemo } from 'react';

import { TooltipProvider } from '@/components/ui/tooltip';
import type { ListItemPayload, ListPayload } from '@/lib/api';
import { deviceId } from '@/lib/device';
import { listAuthors } from '@/lib/list-authors';
import {
  accentStyle,
  iconById,
  type ListColor,
  type ListIconId,
  listTypeById,
} from '@/lib/list-catalog';
import { staggerChildren } from '@/lib/motion';
import { ColorPickerPopover } from './ColorPickerPopover';
import { IconPicker } from './IconPicker';
import { ItemComposer } from './ItemComposer';
import { ListItemRow } from './ListItemRow';
import { useListStore } from './useListStore';

interface ListSheetProps {
  list: ListPayload;
  readOnly?: boolean;
  editable?: boolean;
  customizable?: boolean;
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
  customizable = false,
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
  const arrivingItemIds = useListStore((state) => state.arrivingItemIds);
  const itemRenderKeys = useListStore((state) => state.itemRenderKeys);
  const myDeviceId = deviceId();
  const authors = useMemo(() => listAuthors(list.items, list.color), [list.items, list.color]);

  function byOther(item: ListItemPayload): boolean {
    return item.created_by_device_id !== null && item.created_by_device_id !== myDeviceId;
  }

  function authorName(item: ListItemPayload): string | null {
    return (
      item.created_by_name?.trim() ||
      authors.get(item.created_by_device_id ?? '')?.fallbackName ||
      null
    );
  }

  function authorLabel(item: ListItemPayload): string {
    const author = authorName(item);
    const editor = item.updated_by_name?.trim();
    const base = author ? `Anotado por ${author}` : 'Anotado por outra pessoa';

    if (editor && editor !== author && item.updated_by_device_id !== item.created_by_device_id) {
      return `${base} · editado por ${editor}`;
    }

    return base;
  }

  return (
    <section
      style={accentStyle(list.color)}
      className="flex min-h-0 flex-1 flex-col pt-2 sm:block sm:pt-5"
    >
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[1.4rem] border border-hairline bg-surface shadow-[var(--shadow-panel)] sm:block">
        <div className="h-[3px] shrink-0 bg-accent-list" />

        <div className="shrink-0 border-b border-hairline bg-surface-raised/50 px-4 py-4 sm:px-5 sm:py-5">
          <div className="flex items-center gap-3">
            {customizable && onChangeIcon ? (
              <IconPicker
                value={list.icon as ListIconId}
                onChange={onChangeIcon}
                className="size-11 rounded-xl"
              />
            ) : (
              <span className="grid size-11 shrink-0 place-items-center rounded-xl border border-accent-list/20 bg-accent-list-soft text-accent-list">
                <Icon className="size-5" />
              </span>
            )}

            {editable && onRenameList ? (
              <input
                key={list.title}
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
                className="hand-title min-w-0 flex-1 bg-transparent text-[1.65rem] text-ellipsis text-ink outline-none sm:text-[2rem]"
              />
            ) : (
              <h1 className="hand-title min-w-0 flex-1 truncate text-[1.65rem] text-ink sm:text-[2rem]">
                {list.title}
              </h1>
            )}

            {customizable && onChangeColor ? (
              <ColorPickerPopover value={list.color as ListColor} onChange={onChangeColor} />
            ) : null}
          </div>

          <div className="mt-3 flex items-center justify-between gap-3 pl-0.5 text-[0.68rem] font-medium text-ink-faint">
            <span>{definition.label}</span>
            <span>{remaining === 0 ? 'tudo riscado' : `${remaining} por fazer`}</span>
          </div>
        </div>

        <div
          className="progress-track shrink-0"
          role="progressbar"
          aria-label="Itens concluídos"
          aria-valuenow={list.items.length - remaining}
          aria-valuemin={0}
          aria-valuemax={list.items.length || 1}
        >
          <div
            className="progress-fill"
            style={{
              transform: `scaleX(${list.items.length ? (list.items.length - remaining) / list.items.length : 0})`,
            }}
          />
        </div>

        <TooltipProvider delayDuration={200}>
          <div className="flex min-h-0 flex-1 flex-col bg-surface px-3 sm:block sm:px-5">
            <div className="list-rules sheet-scroll min-h-0 flex-1 overflow-y-auto sm:max-h-[55svh] sm:flex-none">
              <m.ul
                initial="hidden"
                animate="visible"
                variants={{ visible: { transition: staggerChildren(0.03) } }}
              >
                <AnimatePresence initial={false}>
                  {list.items.map((item) => (
                    <ListItemRow
                      key={itemRenderKeys[item.id] ?? item.id}
                      item={item}
                      readOnly={readOnly}
                      byOther={byOther(item)}
                      authorStyle={authors.get(item.created_by_device_id ?? '')?.style}
                      authorLabel={authorLabel(item)}
                      authorName={authorName(item)}
                      arriving={arrivingItemIds.includes(item.id)}
                      onToggle={(done) => onToggleItem(item.id, done)}
                      onRename={(content) => onRenameItem(item.id, content)}
                      onRemove={() => onRemoveItem(item.id)}
                    />
                  ))}
                </AnimatePresence>
              </m.ul>
            </div>

            {readOnly ? null : (
              <div className="list-rules shrink-0">
                <ItemComposer placeholder={definition.itemPlaceholder} onAdd={onAddItem} />
              </div>
            )}
          </div>
        </TooltipProvider>
      </div>
    </section>
  );
}
