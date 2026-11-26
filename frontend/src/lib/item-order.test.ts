import { describe, expect, test } from 'bun:test';

import type { ListItemPayload } from './api';
import { applyItemOrder, moveBefore } from './item-order';

function item(id: string, position: number): ListItemPayload {
  return {
    id,
    list_id: 'list',
    content: id,
    done: false,
    position,
    metadata: null,
    created_by_id: null,
    updated_by_id: null,
    created_by_name: null,
    updated_by_name: null,
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
  };
}

const ids = (items: ListItemPayload[]) => items.map((entry) => entry.id);

describe('moveBefore', () => {
  test('coloca o item antes do alvo', () => {
    expect(moveBefore(['a', 'b', 'c'], { itemId: 'c', beforeId: 'a' })).toEqual(['c', 'a', 'b']);
  });

  test('manda para o fim quando o alvo é nulo ou desconhecido', () => {
    expect(moveBefore(['a', 'b', 'c'], { itemId: 'a', beforeId: null })).toEqual(['b', 'c', 'a']);
    expect(moveBefore(['a', 'b', 'c'], { itemId: 'a', beforeId: 'x' })).toEqual(['b', 'c', 'a']);
  });

  test('ignora item desconhecido e movimento para antes de si mesmo', () => {
    const order = ['a', 'b'];

    expect(moveBefore(order, { itemId: 'x', beforeId: 'a' })).toBe(order);
    expect(moveBefore(order, { itemId: 'a', beforeId: 'a' })).toBe(order);
  });
});

describe('applyItemOrder', () => {
  test('ordena pelos ids confirmados e renumera as posições', () => {
    const ordered = applyItemOrder([item('a', 1), item('b', 2), item('c', 3)], ['c', 'a', 'b']);

    expect(ids(ordered)).toEqual(['c', 'a', 'b']);
    expect(ordered.map((entry) => entry.position)).toEqual([1, 2, 3]);
  });

  test('itens fora da ordem confirmada vão para o fim', () => {
    expect(ids(applyItemOrder([item('novo', 9), item('a', 1), item('b', 2)], ['b', 'a']))).toEqual([
      'b',
      'a',
      'novo',
    ]);
  });

  test('ignora ids confirmados de itens que já saíram', () => {
    expect(ids(applyItemOrder([item('a', 1), item('b', 2)], ['b', 'apagado', 'a']))).toEqual([
      'b',
      'a',
    ]);
  });

  test('reaplica movimentos pendentes sobre a ordem confirmada', () => {
    const ordered = applyItemOrder(
      [item('a', 1), item('b', 2), item('c', 3)],
      ['a', 'b', 'c'],
      [
        { itemId: 'c', beforeId: 'a' },
        { itemId: 'a', beforeId: null },
      ],
    );

    expect(ids(ordered)).toEqual(['c', 'b', 'a']);
  });
});
