import { ArrowDown, ArrowUp, Loader2, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { ListItemPayload } from '@/lib/api';

interface ItemActionsDialogProps {
  item: ListItemPayload;
  index: number;
  count: number;
  onClose: () => void;
  onMove: (direction: 'up' | 'down') => Promise<void>;
  onRemove: () => Promise<void>;
}

export function ItemActionsDialog({
  item,
  index,
  count,
  onClose,
  onMove,
  onRemove,
}: ItemActionsDialogProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [pending, setPending] = useState<'up' | 'down' | 'delete' | null>(null);

  async function act(action: 'up' | 'down' | 'delete') {
    if (pending) return;
    setPending(action);
    try {
      if (action === 'delete') {
        await onRemove();
        onClose();
      } else await onMove(action);
    } catch {
      toast.error(
        action === 'delete'
          ? 'Não foi possível excluir o item. Tente novamente.'
          : 'A ordem não foi salva. Tente novamente.',
      );
    } finally {
      setPending(null);
    }
  }

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !pending) onClose();
      }}
    >
      <DialogContent
        className="max-sm:top-auto max-sm:bottom-[max(0.75rem,env(safe-area-inset-bottom))] max-sm:translate-y-0 sm:max-w-sm"
        showCloseButton={!pending}
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          document.getElementById(`item-actions-${item.id}`)?.focus({ preventScroll: true });
        }}
      >
        <DialogHeader className="pr-5 text-left">
          <DialogTitle>{confirmDelete ? 'Excluir este item?' : 'Organizar item'}</DialogTitle>
          <DialogDescription className="break-words">{item.content}</DialogDescription>
        </DialogHeader>
        {confirmDelete ? (
          <>
            <p className="text-sm text-ink-soft">
              O item será removido da lista para todos os participantes. Essa ação não pode ser
              desfeita.
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled={pending !== null}
                onClick={() => setConfirmDelete(false)}
                className="min-h-12 rounded-xl border border-hairline px-4 text-sm font-medium text-ink transition-colors hover:bg-muted disabled:opacity-40"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={pending !== null}
                onClick={() => void act('delete')}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-destructive px-4 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-40"
              >
                {pending === 'delete' ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Trash2 className="size-4" />
                )}
                Excluir item
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled={pending !== null || index === 0}
                onClick={() => void act('up')}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-hairline px-3 text-sm font-medium text-ink transition-colors hover:bg-muted disabled:opacity-35"
              >
                {pending === 'up' ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <ArrowUp className="size-4" />
                )}
                Mover acima
              </button>
              <button
                type="button"
                disabled={pending !== null || index === count - 1}
                onClick={() => void act('down')}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-hairline px-3 text-sm font-medium text-ink transition-colors hover:bg-muted disabled:opacity-35"
              >
                {pending === 'down' ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <ArrowDown className="size-4" />
                )}
                Mover abaixo
              </button>
            </div>
            <p className="text-center text-xs tabular-nums text-ink-faint" role="status">
              Posição {index + 1} de {count}
            </p>
            <button
              type="button"
              disabled={pending !== null}
              onClick={() => setConfirmDelete(true)}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-destructive/20 px-4 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-40"
            >
              <Trash2 className="size-4" /> Excluir…
            </button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
