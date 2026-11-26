import { afterEach, beforeAll, beforeEach, describe, expect, spyOn, test } from 'bun:test';

import { api, type ListItemPayload, type ListPayload, NetworkError } from '@/lib/api';
import { DuplicateItemError, useListStore } from './useListStore';

const ME = 'participant-me';
const OTHER = 'participant-other';

function item(id: string, overrides: Partial<ListItemPayload> = {}): ListItemPayload {
  return {
    id,
    list_id: 'list-a',
    content: id,
    done: false,
    position: 1,
    metadata: null,
    created_by_id: OTHER,
    updated_by_id: OTHER,
    created_by_name: 'Ana',
    updated_by_name: 'Ana',
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

function listWith(items: ListItemPayload[], overrides: Partial<ListPayload> = {}): ListPayload {
  return {
    id: 'list-a',
    title: 'Mercado',
    list_type: 'shopping',
    icon: 'shopping-cart',
    color: 'mint',
    favorite: false,
    share_token: null,
    expires_at: null,
    expired: false,
    is_creator: true,
    participant_id: ME,
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
    items,
    ...overrides,
  };
}

function deferred<T>() {
  let resolve: (value: T) => void = () => undefined;
  let reject: (reason: unknown) => void = () => undefined;
  const promise = new Promise<T>((onResolve, onReject) => {
    resolve = onResolve;
    reject = onReject;
  });
  return { promise, resolve, reject };
}

const store = () => useListStore.getState();
const contents = () => store().list?.items.map((entry) => entry.content);

function open(list: ListPayload) {
  useListStore.setState({ list, status: 'ready' });
}

beforeAll(() => {
  Object.assign(globalThis, { document: { cookie: '' } });
});

beforeEach(() => {
  store().reset();
});

afterEach(() => {
  for (const method of Object.values(api)) {
    (method as { mockRestore?: () => void }).mockRestore?.();
  }
});

describe('eventos remotos', () => {
  test('item criado por outra pessoa entra na lista e é destacado', () => {
    open(listWith([item('a')]));

    store().applyRemoteEvent({ event: 'item_created', payload: { ...item('b', { position: 2 }) } });

    expect(contents()).toEqual(['a', 'b']);
    expect(store().arrivingItemIds).toEqual(['b']);
  });

  test('atualização mais antiga que o estado local é ignorada', () => {
    open(listWith([item('a', { done: true, updated_at: '2026-01-02T00:00:00.000Z' })]));

    store().applyRemoteEvent({
      event: 'item_updated',
      payload: { ...item('a', { done: false, updated_at: '2026-01-01T00:00:00.000Z' }) },
    });

    expect(store().list?.items[0]?.done).toBe(true);
  });

  test('atualização remota não desfaz a ordem local', () => {
    open(listWith([item('a', { position: 1 }), item('b', { position: 2 })]));

    store().applyRemoteEvent({
      event: 'item_updated',
      payload: {
        ...item('b', { position: 0, done: true, updated_at: '2026-01-03T00:00:00.000Z' }),
      },
    });

    expect(contents()).toEqual(['a', 'b']);
    expect(store().list?.items[1]?.done).toBe(true);
  });

  test('item removido sai da lista', () => {
    open(listWith([item('a'), item('b', { position: 2 })]));

    store().applyRemoteEvent({ event: 'item_destroyed', payload: { id: 'a' } });

    expect(contents()).toEqual(['b']);
  });

  test('reordenação antiga não sobrescreve uma mais nova', () => {
    open(listWith([item('a', { position: 1 }), item('b', { position: 2 })]));

    store().applyRemoteEvent({
      event: 'items_reordered',
      payload: { order: ['b', 'a'], order_updated_at: '2026-01-02T00:00:00.000000Z' },
    });
    store().applyRemoteEvent({
      event: 'items_reordered',
      payload: { order: ['a', 'b'], order_updated_at: '2026-01-01T00:00:00.000000Z' },
    });

    expect(contents()).toEqual(['b', 'a']);
  });
});

describe('adicionar item', () => {
  test('resposta antes do broadcast deixa um item só', async () => {
    open(listWith([]));
    const saved = item('real', { content: 'Gelo', created_by_id: ME });
    spyOn(api, 'createItem').mockResolvedValue(saved);

    await store().addItem('Gelo');
    store().applyRemoteEvent({ event: 'item_created', payload: { ...saved } });

    expect(store().list?.items.map((entry) => entry.id)).toEqual(['real']);
  });

  test('broadcast antes da resposta deixa um item só e mantém a chave de render', async () => {
    open(listWith([]));
    const saved = item('real', { content: 'Gelo', created_by_id: ME });
    const pending = deferred<ListItemPayload>();
    spyOn(api, 'createItem').mockReturnValue(pending.promise);

    const adding = store().addItem('Gelo');
    const optimisticId = store().list?.items[0]?.id ?? '';
    store().applyRemoteEvent({ event: 'item_created', payload: { ...saved } });
    pending.resolve(saved);
    await adding;

    expect(optimisticId.startsWith('temp-')).toBe(true);
    expect(store().list?.items.map((entry) => entry.id)).toEqual(['real']);
    expect(store().itemRenderKeys.real).toBe(optimisticId);
    expect(store().arrivingItemIds).toEqual([]);
  });

  test('falha remove só o item otimista', async () => {
    open(listWith([item('a')]));
    spyOn(api, 'createItem').mockRejectedValue(new NetworkError());

    await expect(store().addItem('Gelo')).rejects.toBeInstanceOf(NetworkError);

    expect(contents()).toEqual(['a']);
  });

  test('recusa repetido sem chamar a API', async () => {
    open(listWith([item('a', { content: 'Carvão' })]));
    const create = spyOn(api, 'createItem');

    await expect(store().addItem('  carvão ')).rejects.toBeInstanceOf(DuplicateItemError);

    expect(create).not.toHaveBeenCalled();
  });
});

describe('rollback', () => {
  test('toggle que falha volta atrás sem apagar o que chegou no meio', async () => {
    open(listWith([item('a')]));
    const pending = deferred<ListItemPayload>();
    spyOn(api, 'updateItem').mockReturnValue(pending.promise);

    const toggling = store().toggleItem('a', true);
    store().applyRemoteEvent({ event: 'item_created', payload: { ...item('b', { position: 2 }) } });
    pending.reject(new NetworkError());
    await expect(toggling).rejects.toBeInstanceOf(NetworkError);

    expect(contents()).toEqual(['a', 'b']);
    expect(store().list?.items[0]?.done).toBe(false);
  });

  test('exclusão que falha devolve o item ao mesmo lugar', async () => {
    open(
      listWith([
        item('a', { position: 1 }),
        item('b', { position: 2 }),
        item('c', { position: 3 }),
      ]),
    );
    spyOn(api, 'deleteItem').mockRejectedValue(new NetworkError());

    await expect(store().removeItem('b')).rejects.toBeInstanceOf(NetworkError);

    expect(contents()).toEqual(['a', 'b', 'c']);
  });

  test('falha depois de trocar de lista não escreve na lista nova', async () => {
    open(listWith([item('a')]));
    const pending = deferred<ListItemPayload>();
    spyOn(api, 'updateItem').mockReturnValue(pending.promise);

    const toggling = store().toggleItem('a', true);
    store().reset();
    open(listWith([item('z', { list_id: 'list-b' })], { id: 'list-b' }));
    pending.reject(new NetworkError());
    await expect(toggling).rejects.toBeInstanceOf(NetworkError);

    expect(store().list?.id).toBe('list-b');
    expect(contents()).toEqual(['z']);
  });

  test('edição da capa que falha reverte só o campo alterado', async () => {
    open(listWith([item('a')]));
    const pending = deferred<ListPayload>();
    spyOn(api, 'updateList').mockReturnValue(pending.promise);

    const updating = store().updateList({ color: 'coral' });
    store().applyRemoteEvent({ event: 'list_updated', payload: { title: 'Feira' } });
    pending.reject(new NetworkError());
    await expect(updating).rejects.toBeInstanceOf(NetworkError);

    expect(store().list?.color).toBe('mint');
    expect(store().list?.title).toBe('Feira');
  });
});

describe('ressincronizar', () => {
  test('traz o que foi perdido e preserva o item ainda não salvo', async () => {
    open(listWith([item('a'), item('temp-1', { content: 'Rascunho', position: 2 })]));
    spyOn(api, 'getList').mockResolvedValue(
      listWith([item('a', { done: true }), item('b', { position: 2 })]),
    );

    await store().refresh();

    expect(contents()).toEqual(['a', 'b', 'Rascunho']);
    expect(store().list?.items[0]?.done).toBe(true);
  });

  test('usa o token quando a lista foi aberta pelo link', async () => {
    open(listWith([item('a')], { is_creator: false }));
    useListStore.setState({ shareToken: 'token' });
    const byToken = spyOn(api, 'listByToken').mockResolvedValue(listWith([item('a')]));

    await store().refresh();

    expect(byToken).toHaveBeenCalledWith('token');
  });

  test('falha de rede mantém a lista na tela', async () => {
    open(listWith([item('a')]));
    spyOn(api, 'getList').mockRejectedValue(new NetworkError());

    await store().refresh();

    expect(contents()).toEqual(['a']);
    expect(store().status).toBe('ready');
  });
});
