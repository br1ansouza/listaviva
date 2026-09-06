import { deviceId } from './device';

const BASE_URL = (process.env.PUBLIC_API_URL ?? 'http://localhost:3000').replace(/\/$/, '');

export interface ListItemPayload {
  id: string;
  list_id: string;
  content: string;
  done: boolean;
  position: number;
  metadata: Record<string, unknown> | null;
  updated_by_device_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface ListPayload {
  id: string;
  title: string;
  list_type: string;
  icon: string;
  color: string;
  share_token: string | null;
  expires_at: string | null;
  expired: boolean;
  is_creator: boolean;
  created_at: string;
  updated_at: string;
  items: ListItemPayload[];
}

export interface ListSummaryPayload extends Omit<ListPayload, 'items'> {
  items_count: number;
}

export interface SharePayload extends ListPayload {
  share_url: string;
  whatsapp_url: string;
}

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, code: string) {
    super(`${status} ${code}`);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }

  get isExpired(): boolean {
    return this.status === 410;
  }

  get isForbidden(): boolean {
    return this.status === 403;
  }

  get isNotFound(): boolean {
    return this.status === 404;
  }
}

export class NetworkError extends Error {
  constructor() {
    super('rede_indisponivel');
    this.name = 'NetworkError';
  }
}

interface RequestOptions {
  method?: string;
  body?: unknown;
  shareToken?: string | null;
  signal?: AbortSignal;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Device-Id': deviceId(),
  };

  if (options.shareToken) headers['X-Share-Token'] = options.shareToken;

  let response: Response;

  try {
    response = await fetch(`${BASE_URL}/api${path}`, {
      method: options.method ?? 'GET',
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      signal: options.signal,
    });
  } catch {
    throw new NetworkError();
  }

  if (response.status === 204) return undefined as T;

  const text = await response.text();
  const data = text ? (JSON.parse(text) as unknown) : null;

  if (!response.ok) {
    const code =
      data && typeof data === 'object' && 'error' in data
        ? String(data.error)
        : 'erro_desconhecido';
    throw new ApiError(response.status, code);
  }

  return data as T;
}

export interface ListDraft {
  title: string;
  list_type: string;
  icon: string;
  color: string;
}

export const api = {
  createList: (list: ListDraft) =>
    request<ListPayload>('/lists', { method: 'POST', body: { list } }),

  getList: (id: string, shareToken?: string | null) =>
    request<ListPayload>(`/lists/${id}`, { shareToken }),

  updateList: (id: string, list: Partial<ListDraft>, shareToken?: string | null) =>
    request<ListPayload>(`/lists/${id}`, { method: 'PATCH', body: { list }, shareToken }),

  myLists: () => request<ListSummaryPayload[]>('/lists/mine'),

  shareList: (id: string, expiresIn: string) =>
    request<SharePayload>(`/lists/${id}/share`, {
      method: 'POST',
      body: { expires_in: expiresIn },
    }),

  listByToken: (token: string) => request<ListPayload>(`/lists/by_token/${token}`),

  createItem: (
    listId: string,
    item: { content: string; metadata?: Record<string, unknown> },
    shareToken?: string | null,
  ) =>
    request<ListItemPayload>(`/lists/${listId}/items`, {
      method: 'POST',
      body: { item },
      shareToken,
    }),

  updateItem: (
    listId: string,
    itemId: string,
    item: { content?: string; done?: boolean; metadata?: Record<string, unknown> },
    shareToken?: string | null,
  ) =>
    request<ListItemPayload>(`/lists/${listId}/items/${itemId}`, {
      method: 'PATCH',
      body: { item },
      shareToken,
    }),

  deleteItem: (listId: string, itemId: string, shareToken?: string | null) =>
    request<void>(`/lists/${listId}/items/${itemId}`, { method: 'DELETE', shareToken }),
};

export const apiBaseUrl = BASE_URL;
