import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { ChevronDown, GripVertical } from 'lucide-react';
import { m } from 'motion/react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { TooltipProvider } from '@/components/ui/tooltip';
import {
  type ListItemPayload,
  type ListPayload,
  MAX_ITEMS_PER_LIST,
  MAX_LIST_TITLE_LENGTH,
} from '@/lib/api';
import { listAuthors } from '@/lib/list-authors';
import {
  accentStyle,
  iconById,
  type ListColor,
  type ListIconId,
  listTypeById,
} from '@/lib/list-catalog';
import { formatMoney, shoppingValues } from '@/lib/shopping';
import { ColorPickerPopover } from './ColorPickerPopover';
import { IconPicker } from './IconPicker';
import { ItemActionsDialog } from './ItemActionsDialog';
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
  onRenameList?: (title: string) => void;
  onChangeIcon?: (icon: ListIconId) => void;
  onChangeColor?: (color: ListColor) => void;
}

const SHOPPING_EXPANDED_KEY = 'listaviva:shopping-expanded:';

function readShoppingExpanded(listId: string): boolean {
  try {
    return localStorage.getItem(`${SHOPPING_EXPANDED_KEY}${listId}`) === 'true';
  } catch {
    return false;
  }
}

export function ListSheet({
  list,
  readOnly = false,
  editable = false,
  customizable = false,
  onAddItem,
  onToggleItem,
  onRenameItem,
  onRenameList,
  onChangeIcon,
  onChangeColor,
}: ListSheetProps) {
  const Icon = iconById(list.icon);
  const definition = listTypeById(list.list_type);
  const remaining = list.items.filter((item) => !item.done).length;
  const arrivingItemIds = useListStore((state) => state.arrivingItemIds);
  const itemRenderKeys = useListStore((state) => state.itemRenderKeys);
  const myParticipantId = list.participant_id;
  const authors = useMemo(() => listAuthors(list.items, list.color), [list.items, list.color]);
  const updateShoppingItem = useListStore((state) => state.updateShoppingItem);
  const moveItem = useListStore((state) => state.moveItem);
  const removeItem = useListStore((state) => state.removeItem);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedItem = list.items.find((item) => item.id === selectedId);
  const [dragged, setDragged] = useState<{ id: string; height: number } | null>(null);
  const activeItem = list.items.find((item) => item.id === dragged?.id);
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 280, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function startDrag({ active }: DragStartEvent) {
    setDragged({ id: String(active.id), height: active.rect.current.initial?.height ?? 46 });
  }

  function finishDrag({ active, over }: DragEndEvent) {
    setDragged(null);
    if (!over || active.id === over.id) return;
    const ids = list.items.map((item) => item.id);
    const from = ids.indexOf(String(active.id));
    const to = ids.indexOf(String(over.id));
    if (from < 0 || to < 0) return;
    const ordered = arrayMove(ids, from, to);
    const beforeId = ordered[to + 1] ?? null;
    void moveItem(String(active.id), beforeId).catch(() => {
      toast.error('A ordem não foi salva. Tente arrastar novamente.');
    });
  }
  const shopping = list.list_type === 'shopping';
  const [shoppingExpanded, setShoppingExpanded] = useState(() => readShoppingExpanded(list.id));
  const total = shopping
    ? list.items.reduce((sum, item) => sum + shoppingValues(item).subtotal, 0)
    : 0;
  const unpriced = shopping
    ? list.items.filter((item) => shoppingValues(item).priceCents === null).length
    : 0;

  useEffect(() => {
    setShoppingExpanded(readShoppingExpanded(list.id));
  }, [list.id]);

  function toggleShoppingDetails() {
    const next = !shoppingExpanded;
    setShoppingExpanded(next);
    try {
      localStorage.setItem(`${SHOPPING_EXPANDED_KEY}${list.id}`, String(next));
    } catch {
      // A preferência continua válida durante esta visita se o armazenamento estiver indisponível.
    }
  }

  function byOther(item: ListItemPayload): boolean {
    return item.created_by_id !== null && item.created_by_id !== myParticipantId;
  }

  function authorName(item: ListItemPayload): string | null {
    return (
      item.created_by_name?.trim() || authors.get(item.created_by_id ?? '')?.fallbackName || null
    );
  }

  function authorLabel(item: ListItemPayload): string {
    const author = authorName(item);
    const editor = item.updated_by_name?.trim();
    const base = author ? `Anotado por ${author}` : 'Anotado por outra pessoa';

    if (editor && editor !== author && item.updated_by_id !== item.created_by_id) {
      return `${base} · editado por ${editor}`;
    }

    return base;
  }

  return (
    <section
      style={accentStyle(list.color)}
      className="flex min-h-0 flex-1 flex-col sm:block sm:pt-5"
    >
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[1.4rem] border border-hairline bg-surface shadow-[var(--shadow-panel)] sm:block">
        <div className="h-[3px] shrink-0 bg-accent-list" />

        <div className="shrink-0 border-b border-hairline bg-surface-raised/50 px-3 py-2 sm:px-5 sm:py-5">
          <div className="flex items-center gap-2 sm:gap-3">
            {customizable && onChangeIcon ? (
              <IconPicker
                value={list.icon as ListIconId}
                onChange={onChangeIcon}
                className="size-10 rounded-xl sm:size-11"
              />
            ) : (
              <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-accent-list/20 bg-accent-list-soft text-accent-list sm:size-11">
                <Icon className="size-5" />
              </span>
            )}

            {editable && onRenameList ? (
              <input
                key={list.title}
                defaultValue={list.title}
                maxLength={MAX_LIST_TITLE_LENGTH}
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

            {shopping ? (
              <m.button
                type="button"
                onClick={toggleShoppingDetails}
                disabled={dragged !== null}
                aria-expanded={shoppingExpanded}
                aria-label={
                  shoppingExpanded
                    ? 'Ocultar quantidades e valores'
                    : 'Mostrar quantidades e valores'
                }
                whileTap={{ scale: 0.9 }}
                className="grid size-10 shrink-0 place-items-center rounded-full text-ink-soft transition-colors hover:bg-muted hover:text-ink"
              >
                <m.span
                  animate={{ rotate: shoppingExpanded ? 180 : 0 }}
                  transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
                >
                  <ChevronDown className="size-5" strokeWidth={2.25} />
                </m.span>
              </m.button>
            ) : null}
          </div>

          <div className="mt-1 flex items-center justify-between gap-3 pl-0.5 text-[0.68rem] font-medium text-ink-faint sm:mt-3">
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
          <div className="flex min-h-0 flex-1 flex-col bg-surface px-2 sm:block sm:px-5">
            {!readOnly && list.items.length > 0 ? (
              <p className="shrink-0 py-1 text-center text-[0.65rem] text-ink-faint sm:hidden">
                Segure e arraste para organizar · ⋯ para excluir
              </p>
            ) : null}
            {shopping ? (
              <div
                className="collapse-panel max-sm:hidden"
                data-expanded={shoppingExpanded}
                aria-hidden
              >
                <div className="min-h-0 overflow-hidden">
                  <div className="shopping-heading grid border-b border-hairline py-3 text-[0.65rem] font-semibold uppercase tracking-wide text-ink-faint">
                    <span>Produto</span>
                    <div className="shopping-fields">
                      <span>Qtd.</span>
                      <span>Preço un. (R$)</span>
                      <span>Subtotal</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
            <div
              className={`${shopping ? '' : 'list-rules '}sheet-scroll min-h-0 flex-1 overflow-y-auto sm:max-h-[55svh] sm:flex-none`}
            >
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={startDrag}
                onDragEnd={finishDrag}
                onDragCancel={() => setDragged(null)}
                accessibility={{
                  screenReaderInstructions: {
                    draggable:
                      'Pressione espaço para pegar o item, use as setas para mover, espaço para soltar ou Escape para cancelar.',
                  },
                  announcements: {
                    onDragStart: ({ active }) =>
                      `Arrastando ${list.items.find((item) => item.id === active.id)?.content ?? 'item'}.`,
                    onDragOver: ({ over }) =>
                      over
                        ? `Posição ${list.items.findIndex((item) => item.id === over.id) + 1} de ${list.items.length}.`
                        : undefined,
                    onDragEnd: () => 'Item solto.',
                    onDragCancel: () => 'Movimento cancelado.',
                  },
                }}
              >
                <SortableContext
                  items={list.items.map((item) => item.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <ul>
                    {list.items.map((item) => (
                      <ListItemRow
                        key={itemRenderKeys[item.id] ?? item.id}
                        item={item}
                        readOnly={readOnly}
                        byOther={byOther(item)}
                        authorStyle={authors.get(item.created_by_id ?? '')?.style}
                        authorLabel={authorLabel(item)}
                        authorName={authorName(item)}
                        arriving={arrivingItemIds.includes(item.id)}
                        onToggle={(done) => onToggleItem(item.id, done)}
                        onRename={(content) => onRenameItem(item.id, content)}
                        onActions={() => setSelectedId(item.id)}
                        shopping={shopping}
                        shoppingExpanded={shoppingExpanded}
                        onShoppingChange={(changes) => updateShoppingItem(item.id, changes)}
                      />
                    ))}
                  </ul>
                </SortableContext>
                <DragOverlay dropAnimation={null}>
                  {activeItem && dragged ? (
                    <div
                      style={{ ...accentStyle(list.color), height: dragged.height }}
                      className="flex items-center gap-3 rounded-xl border border-accent-list/50 bg-surface px-4 text-ink shadow-xl"
                    >
                      <GripVertical className="size-5 shrink-0 text-accent-list" />
                      <span className="truncate text-[0.95rem]">{activeItem.content}</span>
                    </div>
                  ) : null}
                </DragOverlay>
              </DndContext>
            </div>

            {readOnly ? null : (
              <div className="list-rules shrink-0">
                <ItemComposer
                  placeholder={definition.itemPlaceholder}
                  onAdd={onAddItem}
                  atLimit={list.items.length >= MAX_ITEMS_PER_LIST}
                />
              </div>
            )}
          </div>
        </TooltipProvider>
        {shopping ? (
          <div
            className="collapse-panel shrink-0"
            data-expanded={shoppingExpanded}
            inert={!shoppingExpanded}
          >
            <div className="min-h-0 overflow-hidden">
              <div className="flex items-center justify-between gap-4 border-t border-hairline bg-surface-raised/60 px-4 py-2 sm:px-6 sm:py-4">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-ink">Total da lista</p>
                  <p className="text-xs text-ink-faint sm:mt-1">
                    {unpriced
                      ? `${unpriced} ${unpriced === 1 ? 'produto sem preço' : 'produtos sem preço'}`
                      : 'Quantidade × preço de cada produto'}
                  </p>
                </div>
                <output
                  aria-label="Total da lista"
                  className="text-right text-xl font-semibold tracking-tight tabular-nums text-ink sm:text-2xl"
                >
                  {formatMoney(total)}
                </output>
              </div>
            </div>
          </div>
        ) : null}
      </div>
      {!readOnly && selectedItem ? (
        <ItemActionsDialog
          key={selectedItem.id}
          item={selectedItem}
          onClose={() => setSelectedId(null)}
          onRemove={() => removeItem(selectedItem.id)}
        />
      ) : null}
    </section>
  );
}
