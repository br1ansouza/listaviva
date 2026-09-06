import { create } from 'zustand';

import { ApiError, api, type ListItemPayload, type ListPayload } from '@/lib/api';

export type ListStatus =
  | 'idle'
  | 'loading'
  | 'ready'
  | 'expired'
  | 'forbidden'
  | 'missing'
  | 'error';

export interface ListEvent {
  event: 'list_updated' | 'item_created' | 'item_updated' | 'item_destroyed';
  payload: Record<string, unknown>;
}

interface ListState {
  list: ListPayload | null;
  status: ListStatus;
  shareToken: string | null;
  loadById: (id: string) => Promise<void>;
  loadByToken: (token: string) => Promise<void>;
  addItem: (content: string) => Promise<void>;
  toggleItem: (itemId: string, done: boolean) => Promise<void>;
  renameItem: (itemId: string, content: string) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  updateList: (changes: { title?: string; icon?: string; color?: string }) => Promise<void>;
  applyRemoteEvent: (event: ListEvent) => void;
  reset: () => void;
}

function sortItems(items: ListItemPayload[]): ListItemPayload[] {
  return [...items].sort(
    (a, b) => a.position - b.position || a.created_at.localeCompare(b.created_at),
  );
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

  reset: () => set({ list: null, status: 'idle', shareToken: null }),

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

    const optimisticId = `temp-${crypto.randomUUID()}`;
    const now = new Date().toISOString();
    const optimistic: ListItemPayload = {
      id: optimisticId,
      list_id: list.id,
      content,
      done: false,
      position: (list.items.at(-1)?.position ?? 0) + 1,
      metadata: null,
      updated_by_device_id: null,
      created_at: now,
      updated_at: now,
    };

    set({ list: { ...list, items: [...list.items, optimistic] } });

    try {
      const saved = await api.createItem(list.id, { content }, shareToken);
      const current = get().list;
      if (!current) return;

      set({
        list: {
          ...current,
          items: sortItems(current.items.map((item) => (item.id === optimisticId ? saved : item))),
        },
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

    const previous = list.items;
    set({
      list: {
        ...list,
        items: list.items.map((item) => (item.id === itemId ? { ...item, content } : item)),
      },
    });

    try {
      await api.updateItem(list.id, itemId, { content }, shareToken);
    } catch (error) {
      const current = get().list;
      if (current) set({ list: { ...current, items: previous } });
      throw error;
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

    if (event === 'list_updated') {
      set({ list: { ...list, ...(payload as Partial<ListPayload>) } });
      return;
    }

    if (event === 'item_destroyed') {
      set({ list: { ...list, items: list.items.filter((item) => item.id !== payload.id) } });
      return;
    }

    const item = payload as unknown as ListItemPayload;
    const exists = list.items.some((current) => current.id === item.id);

    set({
      list: {
        ...list,
        items: sortItems(
          exists
            ? list.items.map((current) => (current.id === item.id ? item : current))
            : [...list.items, item],
        ),
      },
    });
  },
}));
