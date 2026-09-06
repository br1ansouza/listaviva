import { Clock, Loader2, Plus, Share2 } from 'lucide-react';
import { AnimatePresence, m } from 'motion/react';
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router';
import { toast } from 'sonner';

import { Mark } from '@/components/brand/Mark';
import { api, type ListSummaryPayload } from '@/lib/api';
import { remainingLabel } from '@/lib/expiry';
import { accentStyle, iconById, listTypeById } from '@/lib/list-catalog';
import { fadeUp, staggerChildren } from '@/lib/motion';
import { useColdStartHint } from '@/lib/use-cold-start';
import { ShareDialog } from './ShareDialog';

export function HistoryPage() {
  const [lists, setLists] = useState<ListSummaryPayload[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [sharingId, setSharingId] = useState<string | null>(null);
  const coldStart = useColdStartHint(lists === null && !failed);

  const load = useCallback(async () => {
    try {
      setLists(await api.myLists());
      setFailed(false);
    } catch {
      setFailed(true);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (failed) {
    return (
      <section className="pt-20 text-center">
        <h1 className="hand-title text-4xl text-ink">Não deu para carregar</h1>
        <p className="mx-auto mt-3 max-w-xs text-sm text-ink-soft">
          O servidor não respondeu. Tente de novo em instantes.
        </p>
        <button
          type="button"
          onClick={load}
          className="mt-6 text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          Tentar de novo
        </button>
      </section>
    );
  }

  if (!lists) {
    return (
      <div className="grid place-items-center pt-24 text-ink-faint">
        <Loader2 className="size-5 animate-spin" />
        {coldStart && (
          <p className="mt-4 max-w-xs text-center text-xs text-ink-faint">
            O servidor estava dormindo. A primeira conexão do dia pode levar até um minuto.
          </p>
        )}
      </div>
    );
  }

  if (lists.length === 0) {
    return (
      <section className="pt-20 text-center">
        <Mark animated className="mx-auto size-10 text-ink" />
        <h1 className="hand-title mt-5 text-4xl text-ink">Nenhuma lista ainda</h1>
        <p className="mx-auto mt-3 max-w-xs text-sm text-ink-soft">
          As listas que você criar neste aparelho aparecem aqui, mesmo depois do link expirar.
        </p>
        <Link
          to="/nova"
          className="mt-6 inline-flex h-11 items-center gap-2 rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground"
        >
          <Plus className="size-4" />
          Criar a primeira
        </Link>
      </section>
    );
  }

  return (
    <section className="py-6 sm:py-9">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="hand-title text-4xl text-ink sm:text-5xl">Minhas listas</h1>
          <p className="mt-1.5 text-sm text-ink-soft">Tudo que você criou neste aparelho.</p>
        </div>
        <Link
          to="/nova"
          className="grid size-10 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground shadow-sm transition-transform active:scale-95"
          aria-label="Criar nova lista"
        >
          <Plus className="size-[18px]" />
        </Link>
      </div>

      <m.ul
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: staggerChildren(0.04) } }}
        className="mt-6 space-y-2.5"
      >
        <AnimatePresence initial={false}>
          {lists.map((list) => {
            const Icon = iconById(list.icon);
            const expiry = remainingLabel(list.expires_at);
            const definition = listTypeById(list.list_type);

            return (
              <m.li key={list.id} variants={fadeUp} style={accentStyle(list.color)}>
                <div className="flex items-center gap-3 rounded-2xl border border-hairline border-l-[3px] border-l-accent-list bg-surface p-3 shadow-sm transition-shadow hover:shadow-md">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-accent-list-soft text-accent-list">
                    <Icon className="size-5" />
                  </span>

                  <Link to={`/lista/${list.id}`} className="min-w-0 flex-1">
                    <span className="hand-title block truncate text-2xl text-ink">
                      {list.title}
                    </span>
                    <span className="mt-0.5 flex items-center gap-1.5 text-xs text-ink-faint">
                      {definition.label}
                      <span aria-hidden>·</span>
                      {list.items_count === 1 ? '1 item' : `${list.items_count} itens`}
                      {expiry && (
                        <>
                          <span aria-hidden>·</span>
                          <Clock className="size-3" />
                          {expiry}
                        </>
                      )}
                    </span>
                  </Link>

                  <button
                    type="button"
                    onClick={() => setSharingId(list.id)}
                    aria-label={list.expired ? 'Gerar link novo' : 'Compartilhar lista'}
                    className="grid size-9 shrink-0 place-items-center rounded-full border border-hairline bg-surface-raised text-ink-soft transition-colors hover:border-ink/20 hover:text-ink"
                  >
                    <Share2 className="size-4" />
                  </button>
                </div>
              </m.li>
            );
          })}
        </AnimatePresence>
      </m.ul>

      {sharingId && (
        <ShareDialog
          listId={sharingId}
          open
          onOpenChange={(open) => {
            if (!open) setSharingId(null);
          }}
          onShared={(share) => {
            setLists((current) =>
              current
                ? current.map((list) =>
                    list.id === share.id
                      ? {
                          ...list,
                          share_token: share.share_token,
                          expires_at: share.expires_at,
                          expired: false,
                        }
                      : list,
                  )
                : current,
            );
            toast.success('Link novo gerado.');
          }}
        />
      )}
    </section>
  );
}
