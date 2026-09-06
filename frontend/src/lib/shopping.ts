import type { ListItemPayload } from './api';

export type ShoppingChanges = { quantity_millis?: number; unit_price_cents?: number | null };

const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
export const formatMoney = (cents: number): string => currency.format(cents / 100);

export function shoppingValues(item: ListItemPayload) {
  const quantity = item.metadata?.quantity_millis;
  const price = item.metadata?.unit_price_cents;
  const quantityMillis =
    typeof quantity === 'number' &&
    Number.isInteger(quantity) &&
    quantity > 0 &&
    quantity <= 9_999_999
      ? quantity
      : 1000;
  const priceCents =
    typeof price === 'number' && Number.isInteger(price) && price >= 0 && price <= 99_999_999
      ? price
      : null;
  return {
    quantityMillis,
    priceCents,
    subtotal: Math.round((quantityMillis * (priceCents ?? 0)) / 1000),
  };
}

export function parseDecimal(value: string, decimals: number): number | null {
  const normalized = value.trim().replace(',', '.');
  if (!new RegExp(`^\\d+(?:\\.\\d{0,${decimals}})?$`).test(normalized)) return null;
  const [whole, fraction = ''] = normalized.split('.');
  const scaled = Number(whole) * 10 ** decimals + Number(fraction.padEnd(decimals, '0'));
  return Number.isSafeInteger(scaled) ? scaled : null;
}
