import { Check, Copy, Link2, MessageCircle } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { api, type SharePayload } from '@/lib/api';
import { cn } from '@/lib/utils';

const DURATIONS = [
  { id: '8h', label: '8 horas', hint: 'Para resolver hoje' },
  { id: '1d', label: '1 dia', hint: 'Um dia inteiro' },
  { id: '1w', label: '1 semana', hint: 'Para algo mais longo' },
];

interface ShareDialogProps {
  listId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onShared: (share: SharePayload) => void;
}

export function ShareDialog({ listId, open, onOpenChange, onShared }: ShareDialogProps) {
  const [share, setShare] = useState<SharePayload | null>(null);
  const [pending, setPending] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function generate(expiresIn: string) {
    if (pending) return;
    setPending(expiresIn);

    try {
      const result = await api.shareList(listId, expiresIn);
      setShare(result);
      onShared(result);
    } catch {
      toast.error('Não deu para gerar o link agora.');
    } finally {
      setPending(null);
    }
  }

  async function copy() {
    if (!share) return;

    try {
      await navigator.clipboard.writeText(share.share_url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error('Seu navegador bloqueou a cópia. Selecione o link à mão.');
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) setShare(null);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="hand-title text-3xl">Compartilhar lista</DialogTitle>
          <DialogDescription>
            {share
              ? 'Quem abrir o link edita a lista junto com você, ao vivo.'
              : 'Por quanto tempo o link deve funcionar?'}
          </DialogDescription>
        </DialogHeader>

        {share ? (
          <div className="min-w-0 space-y-3">
            <div className="flex min-w-0 items-center gap-2 rounded-xl border border-hairline bg-muted/60 px-3 py-2.5">
              <Link2 className="size-4 shrink-0 text-ink-faint" />
              <span className="min-w-0 flex-1 truncate text-sm text-ink-soft">
                {share.share_url}
              </span>
              <button
                type="button"
                onClick={copy}
                aria-label="Copiar link"
                className="grid size-8 shrink-0 place-items-center rounded-lg text-ink-soft transition-colors hover:bg-surface hover:text-ink"
              >
                {copied ? <Check className="size-4 text-primary" /> : <Copy className="size-4" />}
              </button>
            </div>

            <a
              href={share.whatsapp_url}
              target="_blank"
              rel="noreferrer"
              className="primary-action w-full px-5"
            >
              <MessageCircle className="size-4" />
              Enviar no WhatsApp
            </a>
          </div>
        ) : (
          <div className="grid min-w-0 gap-2">
            {DURATIONS.map((duration) => (
              <button
                key={duration.id}
                type="button"
                onClick={() => generate(duration.id)}
                disabled={pending !== null}
                className={cn(
                  'flex items-center justify-between rounded-xl border border-hairline bg-surface px-4 py-3 text-left transition-colors',
                  'hover:border-accent-list/30 hover:bg-accent-list-soft disabled:opacity-60',
                  pending === duration.id && 'border-accent-list/40 bg-accent-list-soft',
                )}
              >
                <span className="text-sm font-medium text-ink">{duration.label}</span>
                <span className="text-xs text-ink-faint">{duration.hint}</span>
              </button>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
