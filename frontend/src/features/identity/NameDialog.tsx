import { type FormEvent, useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { DEVICE_NAME_MAX_LENGTH, truncateName } from '@/lib/device';
import { useIdentity } from '@/lib/identity';

function nameLength(value: string): number {
  return [...new Intl.Segmenter().segment(value)].length;
}

export function NameDialog() {
  const asking = useIdentity((state) => state.asking);
  const storedName = useIdentity((state) => state.name);
  const save = useIdentity((state) => state.save);
  const skip = useIdentity((state) => state.skip);

  const [draft, setDraft] = useState(storedName ?? '');

  useEffect(() => {
    if (asking) setDraft(storedName ?? '');
  }, [asking, storedName]);

  function submit(event: FormEvent) {
    event.preventDefault();

    const trimmed = truncateName(draft);
    if (!trimmed) {
      skip();
      return;
    }

    save(trimmed);
  }

  return (
    <Dialog open={asking} onOpenChange={(open) => (open ? undefined : skip())}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold tracking-tight">
            Como te chamamos?
          </DialogTitle>
          <DialogDescription>
            O nome aparece nos itens que você escrever, para a turma saber quem anotou o quê. Fica
            só neste aparelho e dá para trocar depois.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="flex flex-col gap-3">
          <div className="relative">
            <input
              value={draft}
              onChange={(event) => setDraft(truncateName(event.target.value))}
              placeholder="Brian 🐧"
              aria-label="Seu nome"
              className="h-11 w-full rounded-xl border border-hairline bg-surface px-3 pr-14 text-[0.95rem] text-ink outline-none transition-colors focus:border-brand/60"
            />
            <span className="-translate-y-1/2 pointer-events-none absolute top-1/2 right-3 text-[0.7rem] text-ink-faint tabular-nums">
              {nameLength(draft)}/{DEVICE_NAME_MAX_LENGTH}
            </span>
          </div>

          <div className="flex items-center justify-end gap-2">
            <Button type="button" variant="ghost" onClick={skip}>
              Agora não
            </Button>
            <Button type="submit" disabled={!truncateName(draft)}>
              Salvar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
