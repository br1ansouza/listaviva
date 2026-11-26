import { describe, expect, test } from 'bun:test';

import type { ListItemPayload } from './api';
import { formatQuantity, parseDecimal, shoppingValues } from './shopping';

function itemWith(metadata: Record<string, unknown> | null): ListItemPayload {
  return { metadata } as ListItemPayload;
}

describe('parseDecimal', () => {
  test('aceita vírgula ou ponto e escala para inteiro', () => {
    expect(parseDecimal('1,5', 3)).toBe(1500);
    expect(parseDecimal('89.90', 2)).toBe(8990);
    expect(parseDecimal(' 2 ', 3)).toBe(2000);
    expect(parseDecimal('3,', 2)).toBe(300);
  });

  test('recusa casas demais, sinais e texto', () => {
    expect(parseDecimal('1,2345', 3)).toBeNull();
    expect(parseDecimal('-1', 2)).toBeNull();
    expect(parseDecimal('abc', 2)).toBeNull();
    expect(parseDecimal('', 2)).toBeNull();
    expect(parseDecimal('1.2.3', 2)).toBeNull();
  });

  test('recusa valores fora do inteiro seguro', () => {
    expect(parseDecimal('99999999999999999999', 2)).toBeNull();
  });
});

describe('shoppingValues', () => {
  test('calcula o subtotal com quantidade fracionada', () => {
    expect(shoppingValues(itemWith({ quantity_millis: 1500, unit_price_cents: 8990 }))).toEqual({
      quantityMillis: 1500,
      priceCents: 8990,
      subtotal: 13485,
    });
  });

  test('arredonda o subtotal para o centavo', () => {
    expect(
      shoppingValues(itemWith({ quantity_millis: 333, unit_price_cents: 1000 })).subtotal,
    ).toBe(333);
    expect(shoppingValues(itemWith({ quantity_millis: 500, unit_price_cents: 799 })).subtotal).toBe(
      400,
    );
  });

  test('sem metadados vale uma unidade sem preço', () => {
    expect(shoppingValues(itemWith(null))).toEqual({
      quantityMillis: 1000,
      priceCents: null,
      subtotal: 0,
    });
  });

  test('descarta quantidade e preço inválidos', () => {
    expect(shoppingValues(itemWith({ quantity_millis: 0, unit_price_cents: -5 }))).toEqual({
      quantityMillis: 1000,
      priceCents: null,
      subtotal: 0,
    });
    expect(
      shoppingValues(itemWith({ quantity_millis: '2000', unit_price_cents: 1.5 })).quantityMillis,
    ).toBe(1000);
  });
});

describe('formatQuantity', () => {
  test('usa vírgula e omite zeros à direita', () => {
    expect(formatQuantity(1500)).toBe('1,5');
    expect(formatQuantity(2000)).toBe('2');
    expect(formatQuantity(24000)).toBe('24');
  });
});
