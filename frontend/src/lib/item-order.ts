import type { ListItemPayload } from './api';

export interface ItemMove {
  itemId: string;
  beforeId: string | null;
}

export function moveBefore(order: string[], { itemId, beforeId }: ItemMove): string[] {
  if (!order.includes(itemId) || itemId === beforeId) return order;
  const next = order.filter((id) => id !== itemId);
  const target = beforeId === null ? -1 : next.indexOf(beforeId);
  next.splice(target < 0 ? next.length : target, 0, itemId);
  return next;
}

export function applyItemOrder(
  items: ListItemPayload[],
  order: string[],
  moves: ItemMove[] = [],
): ListItemPayload[] {
  const ids = new Set(items.map((item) => item.id));
  const known = new Set(order);
  const base = [
    ...order.filter((id) => ids.has(id)),
    ...items.filter((item) => !known.has(item.id)).map((item) => item.id),
  ];
  const positions = new Map(moves.reduce(moveBefore, base).map((id, index) => [id, index + 1]));
  return items
    .map((item) => ({ ...item, position: positions.get(item.id) ?? item.position }))
    .sort((a, b) => a.position - b.position);
}
