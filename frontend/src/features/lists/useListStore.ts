import { create } from 'zustand';

import {
  ApiError,
  api,
  type ListItemPayload,
  type ListPayload,
  MAX_ITEMS_PER_LIST,
} from '@/lib/api';
import { readDeviceName } from '@/lib/device';
import type { ShoppingChanges } from '@/lib/shopping';

export type ListStatus =
  | 'idle'
  | 'loading'
  | 'ready'
  | 'expired'
  | 'forbidden'
  | 'missing'
  | 'error';

export interface ListEvent {
  event:
    | 'list_updated'
    | 'item_created'
    | 'item_updated'
    | 'item_destroyed'
    | 'access_changed'
    | 'items_reordered';
  payload: Record<string, unknown>;
}

const ARRIVAL_HIGHLIGHT_MS = 2_600;

export class DuplicateItemError extends Error {
  constructor() {
    super('item_duplicado');
    this.name = 'DuplicateItemError';
  }
}

export function normalizeContent(content: string): string {
  return content.replace(/\s+/g, ' ').trim();
}

function duplicateOf(
  items: ListItemPayload[],
  content: string,
  ignoreItemId?: string,
): ListItemPayload | undefined {
  const target = normalizeContent(content).toLocaleLowerCase();

  return items.find(
    (item) =>
      item.id !== ignoreItemId && normalizeContent(item.content).toLocaleLowerCase() === target,
  );
}

interface ListState {
  list: ListPayload | null;
  status: ListStatus;
  shareToken: string | null;
  arrivingItemIds: string[];
  itemRenderKeys: Record<string, string>;
  orderUpdatedAt: string | null;
  loadById: (id: string) => Promise<void>;
  loadByToken: (token: string) => Promise<void>;
  addItem: (content: string) => Promise<void>;
  toggleItem: (itemId: string, done: boolean) => Promise<void>;
  renameItem: (itemId: string, content: string) => Promise<void>;
  updateShoppingItem: (itemId: string, changes: ShoppingChanges) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  moveItem: (itemId: string, direction: 'up' | 'down') => Promise<void>;
  updateList: (changes: { title?: string; icon?: string; color?: string }) => Promise<void>;
  applyRemoteEvent: (event: ListEvent) => void;
  reset: () => void;
}

function sortItems(items: ListItemPayload[]): ListItemPayload[] {
  return [...items].sort(
    (a, b) => a.position - b.position || a.created_at.localeCompare(b.created_at),
  );
}

function withItem(
  items: ListItemPayload[],
  item: ListItemPayload,
  replacedId?: string,
): ListItemPayload[] {
  const others = items.filter((current) => current.id !== item.id && current.id !== replacedId);

  return sortItems([...others, item]);
}

function optimisticTwinId(
  items: ListItemPayload[],
  item: ListItemPayload,
  participantId: string,
): string | undefined {
  if (item.created_by_id !== participantId) return undefined;

  return items.find((current) => current.id.startsWith('temp-') && current.content === item.content)
    ?.id;
}

function statusFromError(error: unknown): ListStatus {
  if (error instanceof ApiError) {
    if (error.isExpired) return 'expired';
    if (error.isForbidden) return 'forbidden';
    if (error.isNotFound) return 'missing';
  }

  return 'error';
}

export const useListStore = create<ListState>((set, get) => ({
  list: null,
  status: 'idle',
  shareToken: null,
  arrivingItemIds: [],
  itemRenderKeys: {},
  orderUpdatedAt: null,

  reset: () =>
    set({
      list: null,
      status: 'idle',
      shareToken: null,
      arrivingItemIds: [],
      itemRenderKeys: {},
      orderUpdatedAt: null,
    }),

  loadById: async (id) => {
    set({ status: 'loading' });

    try {
      const list = await api.getList(id, get().shareToken);
      set({ list: { ...list, items: sortItems(list.items) }, status: 'ready' });
    } catch (error) {
      set({ status: statusFromError(error) });
    }
  },

  loadByToken: async (token) => {
    set({ status: 'loading', shareToken: token });

    try {
      const list = await api.listByToken(token);
      set({ list: { ...list, items: sortItems(list.items) }, status: 'ready' });
    } catch (error) {
      set({ status: statusFromError(error) });
    }
  },

  addItem: async (content) => {
    const { list, shareToken } = get();
    if (!list) return;

    const normalized = normalizeContent(content);
    if (!normalized) return;
    if (duplicateOf(list.items, normalized)) throw new DuplicateItemError();
    if (list.items.length >= MAX_ITEMS_PER_LIST) throw new ApiError(422, 'limite_de_itens');

    const optimisticId = `temp-${crypto.randomUUID()}`;
    const now = new Date().toISOString();
    const optimistic: ListItemPayload = {
      id: optimisticId,
      list_id: list.id,
      content: normalized,
      done: false,
      position: (list.items.at(-1)?.position ?? 0) + 1,
      metadata: null,
      created_by_id: list.participant_id,
      updated_by_id: list.participant_id,
      created_by_name: readDeviceName(),
      updated_by_name: readDeviceName(),
      created_at: now,
      updated_at: now,
    };

    set({ list: { ...list, items: [...list.items, optimistic] } });

    try {
      const saved = await api.createItem(list.id, { content: normalized }, shareToken);
      const current = get().list;
      if (!current || current.id !== list.id) return;

      set({
        list: { ...current, items: withItem(current.items, saved, optimisticId) },
        itemRenderKeys: { ...get().itemRenderKeys, [saved.id]: optimisticId },
      });
    } catch (error) {
      const current = get().list;
      if (current) {
        set({
          list: { ...current, items: current.items.filter((item) => item.id !== optimisticId) },
        });
      }
      throw error;
    }
  },

  toggleItem: async (itemId, done) => {
    const { list, shareToken } = get();
    if (!list || itemId.startsWith('temp-')) return;

    const previous = list.items;
    set({
      list: {
        ...list,
        items: list.items.map((item) => (item.id === itemId ? { ...item, done } : item)),
      },
    });

    try {
      await api.updateItem(list.id, itemId, { done }, shareToken);
    } catch (error) {
      const current = get().list;
      if (current) set({ list: { ...current, items: previous } });
      throw error;
    }
  },

  renameItem: async (itemId, content) => {
    const { list, shareToken } = get();
    if (!list || itemId.startsWith('temp-')) return;

    const normalized = normalizeContent(content);
    if (!normalized) return;
    if (duplicateOf(list.items, normalized, itemId)) throw new DuplicateItemError();

    const previous = list.items;
    set({
      list: {
        ...list,
        items: list.items.map((item) =>
          item.id === itemId ? { ...item, content: normalized } : item,
        ),
      },
    });

    try {
      await api.updateItem(list.id, itemId, { content: normalized }, shareToken);
    } catch (error) {
      const current = get().list;
      if (current) set({ list: { ...current, items: previous } });
      throw error;
    }
  },

  updateShoppingItem: async (itemId, changes) => {
    const { list, shareToken } = get();
    if (!list || itemId.startsWith('temp-')) return;
    const saved = await api.updateItem(list.id, itemId, { metadata: changes }, shareToken);
    if (get().list?.id === list.id && get().list?.items.some((item) => item.id === itemId)) {
      get().applyRemoteEvent({ event: 'item_updated', payload: { ...saved } });
    }
  },

  moveItem: async (itemId, direction) => {
    const { list, shareToken } = get();
    if (!list || itemId.startsWith('temp-')) return;
    const order = await api.moveItem(list.id, itemId, direction, shareToken);
    if (get().list?.id === list.id) {
      get().applyRemoteEvent({ event: 'items_reordered', payload: { ...order } });
    }
  },

  removeItem: async (itemId) => {
    const { list, shareToken } = get();
    if (!list) return;

    const previous = list.items;
    set({ list: { ...list, items: list.items.filter((item) => item.id !== itemId) } });

    if (itemId.startsWith('temp-')) return;

    try {
      await api.deleteItem(list.id, itemId, shareToken);
    } catch (error) {
      const current = get().list;
      if (current) set({ list: { ...current, items: previous } });
      throw error;
    }
  },

  updateList: async (changes) => {
    const { list, shareToken } = get();
    if (!list) return;

    const previous = list;
    set({ list: { ...list, ...changes } });

    try {
      const saved = await api.updateList(list.id, changes, shareToken);
      const current = get().list;
      set({ list: { ...saved, items: current ? current.items : saved.items } });
    } catch (error) {
      set({ list: previous });
      throw error;
    }
  },

  applyRemoteEvent: ({ event, payload }) => {
    const list = get().list;
    if (!list) return;
    if (event === 'access_changed') return;

    if (event === 'items_reordered') {
      if (!Array.isArray(payload.order) || typeof payload.order_updated_at !== 'string') return;
      const previousOrderAt = get().orderUpdatedAt;
      if (previousOrderAt && previousOrderAt >= payload.order_updated_at) return;
      const order = payload.order;
      const positions = new Map(order.map((id, index) => [id, index + 1]));
      set({
        orderUpdatedAt: payload.order_updated_at,
        list: {
          ...list,
          items: sortItems(
            list.items.map((item, index) => ({
              ...item,
              position: positions.get(item.id) ?? order.length + index + 1,
            })),
          ),
        },
      });
      return;
    }

    if (event === 'list_updated') {
      set({ list: { ...list, ...(payload as Partial<ListPayload>) } });
      return;
    }

    if (event === 'item_destroyed') {
      set({ list: { ...list, items: list.items.filter((item) => item.id !== payload.id) } });
      return;
    }

    const item = payload as unknown as ListItemPayload;
    const currentItem = list.items.find((current) => current.id === item.id);
    if (currentItem && currentItem.updated_at > item.updated_at) return;
    const exists = list.items.some((current) => current.id === item.id);
    const twinId = optimisticTwinId(list.items, item, list.participant_id);

    if (!exists && item.created_by_id !== list.participant_id) {
      set({ arrivingItemIds: [...get().arrivingItemIds, item.id] });
      setTimeout(() => {
        set({ arrivingItemIds: get().arrivingItemIds.filter((id) => id !== item.id) });
      }, ARRIVAL_HIGHLIGHT_MS);
    }

    set({
      list: {
        ...list,
        items: withItem(
          list.items,
          currentItem ? { ...item, position: currentItem.position } : item,
          twinId,
        ),
      },
      itemRenderKeys: twinId
        ? { ...get().itemRenderKeys, [item.id]: twinId }
        : get().itemRenderKeys,
    });
  },
}));
