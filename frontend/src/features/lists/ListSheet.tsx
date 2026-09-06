import { AnimatePresence, m } from 'motion/react';

import { TooltipProvider } from '@/components/ui/tooltip';
import type { ListItemPayload, ListPayload } from '@/lib/api';
import { deviceId } from '@/lib/device';
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
  const arrivingItemIds = useListStore((state) => state.arrivingItemIds);
  const myDeviceId = deviceId();

  function authorLabel(item: ListItemPayload): string {
    const author = item.created_by_name?.trim();
    const editor = item.updated_by_name?.trim();
    const base = author ? `Anotado por ${author}` : 'Anotado por outra pessoa';

    if (editor && editor !== author && item.updated_by_device_id !== item.created_by_device_id) {
      return `${base} · editado por ${editor}`;
    }

    return base;
  }

  return (
    <section style={accentStyle(list.color)} className="pt-2 sm:pt-5">
      <div className="overflow-hidden rounded-[1.4rem] border border-hairline bg-surface shadow-[var(--shadow-panel)]">
        <div className="h-1 bg-accent-list" />

        <div className="bg-accent-list-soft px-4 py-4 sm:px-5">
          <div className="flex items-center gap-3">
            {editable && onChangeIcon ? (
              <IconPicker
                value={list.icon as ListIconId}
                onChange={onChangeIcon}
                className="size-11 rounded-xl"
              />
            ) : (
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-accent-list text-accent-list-foreground">
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
                className="hand-title min-w-0 flex-1 bg-transparent text-[2rem] text-ink outline-none"
              />
            ) : (
              <h1 className="hand-title min-w-0 flex-1 truncate text-[2rem] text-ink">
                {list.title}
              </h1>
            )}

            {editable && onChangeColor ? (
              <ColorPickerPopover value={list.color as ListColor} onChange={onChangeColor} />
            ) : null}
          </div>

          <div className="mt-2 flex items-center justify-between gap-3 pl-0.5 text-[0.68rem] font-medium text-ink-faint">
            <span>{definition.label}</span>
            <span>{remaining === 0 ? 'tudo riscado' : `${remaining} por fazer`}</span>
          </div>
        </div>

        <TooltipProvider delayDuration={200}>
          <div className="bg-surface px-3 sm:px-5">
            <div className="list-rules sheet-scroll max-h-[70svh] overflow-y-auto sm:max-h-[55svh]">
              <m.ul
                initial="hidden"
                animate="visible"
                variants={{ visible: { transition: staggerChildren(0.03) } }}
              >
                <AnimatePresence initial={false}>
                  {list.items.map((item) => (
                    <ListItemRow
                      key={item.id}
                      item={item}
                      readOnly={readOnly}
                      byOther={
                        item.created_by_device_id !== null &&
                        item.created_by_device_id !== myDeviceId
                      }
                      authorLabel={authorLabel(item)}
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
              <div className="list-rules">
                <ItemComposer placeholder={definition.itemPlaceholder} onAdd={onAddItem} />
              </div>
            )}
          </div>
        </TooltipProvider>
      </div>
    </section>
  );
}
