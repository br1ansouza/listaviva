import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

import type { ListItemPayload } from '@/lib/api';
import { formatMoney, parseDecimal, type ShoppingChanges, shoppingValues } from '@/lib/shopping';

function DecimalField({
  value,
  decimals,
  max,
  label,
  readOnly,
  onSave,
}: {
  value: number | null;
  decimals: number;
  max: number;
  label: string;
  readOnly: boolean;
  onSave: (value: number | null) => Promise<void>;
}) {
  const display =
    value === null
      ? ''
      : (value / 10 ** decimals).toLocaleString('pt-BR', {
          useGrouping: false,
          minimumFractionDigits: decimals === 2 ? 2 : 0,
          maximumFractionDigits: decimals,
        });
  const [draft, setDraft] = useState(display);
  const [saving, setSaving] = useState(false);
  const focused = useRef(false);
  const cancelled = useRef(false);
  useEffect(() => {
    if (!focused.current) setDraft(display);
  }, [display]);

  async function commit() {
    focused.current = false;
    if (cancelled.current) {
      cancelled.current = false;
      setDraft(display);
      return;
    }
    const next =
      draft.trim() === '' ? (decimals === 3 ? 1000 : null) : parseDecimal(draft, decimals);
    if (
      (next === null && draft.trim() !== '') ||
      (next !== null && (next > max || next < (decimals === 3 ? 1 : 0)))
    ) {
      toast.error(
        decimals === 3
          ? 'Use uma quantidade entre 0,001 e 9.999,999.'
          : 'Use um preço entre R$ 0,00 e R$ 999.999,99.',
      );
      setDraft(display);
      return;
    }
    setDraft(
      next === null
        ? ''
        : (next / 10 ** decimals).toLocaleString('pt-BR', {
            useGrouping: false,
            minimumFractionDigits: decimals === 2 ? 2 : 0,
            maximumFractionDigits: decimals,
          }),
    );
    if (next !== value) {
      setSaving(true);
      try {
        await onSave(next);
      } catch {
        setDraft(display);
        toast.error('O valor não foi salvo. Tente novamente.');
      } finally {
        setSaving(false);
      }
    }
  }

  return (
    <input
      aria-label={label}
      inputMode="decimal"
      value={draft}
      placeholder="—"
      readOnly={readOnly || saving}
      aria-busy={saving}
      maxLength={12}
      onFocus={() => {
        focused.current = true;
      }}
      onChange={(event) => setDraft(event.target.value)}
      onBlur={commit}
      onKeyDown={(event) => {
        if (event.key === 'Enter') event.currentTarget.blur();
        if (event.key === 'Escape') {
          cancelled.current = true;
          event.currentTarget.blur();
        }
      }}
      className="h-9 w-full min-w-0 rounded-lg border border-transparent bg-muted/35 px-2 text-right text-sm tabular-nums text-ink outline-none transition-colors hover:border-hairline focus:border-accent-list/60 focus:bg-surface read-only:bg-transparent"
    />
  );
}

export function ShoppingFields({
  item,
  readOnly,
  onChange,
}: {
  item: ListItemPayload;
  readOnly: boolean;
  onChange: (changes: ShoppingChanges) => Promise<void>;
}) {
  const { quantityMillis, priceCents, subtotal } = shoppingValues(item);
  return (
    <div className="shopping-fields">
      <div className="min-w-0">
        <span className="shopping-field-label sm:hidden">Qtd.</span>
        <DecimalField
          value={quantityMillis}
          decimals={3}
          max={9_999_999}
          label={`Quantidade de ${item.content}`}
          readOnly={readOnly}
          onSave={(value) => onChange({ quantity_millis: value ?? 1000 })}
        />
      </div>
      <div className="min-w-0">
        <span className="shopping-field-label sm:hidden">Preço un. (R$)</span>
        <DecimalField
          value={priceCents}
          decimals={2}
          max={99_999_999}
          label={`Preço unitário de ${item.content}`}
          readOnly={readOnly}
          onSave={(value) => onChange({ unit_price_cents: value })}
        />
      </div>
      <div className="min-w-0 text-right">
        <span className="shopping-field-label sm:hidden">Subtotal</span>
        <output
          className="flex min-h-9 items-center justify-end text-xs font-medium tabular-nums text-ink-soft"
          aria-label={`Subtotal de ${item.content}`}
        >
          {priceCents === null ? '—' : formatMoney(subtotal)}
        </output>
      </div>
    </div>
  );
}
