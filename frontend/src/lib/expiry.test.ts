import { describe, expect, test } from 'bun:test';

import { remainingLabel } from './expiry';

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

const inFuture = (ms: number) => new Date(Date.now() + ms + 500).toISOString();

describe('remainingLabel', () => {
  test('lista nunca compartilhada não tem rótulo', () => {
    expect(remainingLabel(null)).toBeNull();
  });

  test('link vencido', () => {
    expect(remainingLabel(new Date(Date.now() - MINUTE).toISOString())).toBe('expirada');
  });

  test('dias, com singular e plural', () => {
    expect(remainingLabel(inFuture(DAY))).toBe('expira em 1 dia');
    expect(remainingLabel(inFuture(7 * DAY))).toBe('expira em 7 dias');
  });

  test('horas, com singular e plural', () => {
    expect(remainingLabel(inFuture(HOUR))).toBe('expira em 1 hora');
    expect(remainingLabel(inFuture(8 * HOUR))).toBe('expira em 8 horas');
  });

  test('minutos, nunca menos que um', () => {
    expect(remainingLabel(inFuture(30 * MINUTE))).toBe('expira em 30 minutos');
    expect(remainingLabel(inFuture(1000))).toBe('expira em 1 minuto');
  });
});
