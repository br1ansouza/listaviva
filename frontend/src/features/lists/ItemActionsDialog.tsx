import { Loader2, Trash2 } from 'lucide-react';
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
  onClose: () => void;
  onRemove: () => Promise<void>;
}

export function ItemActionsDialog({ item, onClose, onRemove }: ItemActionsDialogProps) {
  const [pending, setPending] = useState(false);

  async function act() {
    if (pending) return;
    setPending(true);
    try {
      await onRemove();
      onClose();
    } catch {
      toast.error('Não foi possível excluir o item. Tente novamente.');
    } finally {
      setPending(false);
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
          <DialogTitle>Excluir este item?</DialogTitle>
          <DialogDescription className="break-words">{item.content}</DialogDescription>
        </DialogHeader>

        <p className="text-sm text-ink-soft">
          O item será removido da lista para todos os participantes. Essa ação não pode ser
          desfeita.
        </p>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            disabled={pending}
            onClick={onClose}
            className="min-h-12 rounded-xl border border-hairline px-4 text-sm font-medium text-ink transition-colors hover:bg-muted disabled:opacity-40"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => void act()}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-destructive px-4 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            {pending ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
            Excluir item
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
