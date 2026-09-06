import { ArrowRight, Clock, Loader2, Plus, Share2 } from 'lucide-react';
import { m } from 'motion/react';
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router';
import { toast } from 'sonner';

import { Mark } from '@/components/brand/Mark';
import { api, type ListSummaryPayload, type SharePayload } from '@/lib/api';
import { remainingLabel } from '@/lib/expiry';
import { accentStyle, iconById, listTypeById } from '@/lib/list-catalog';
import { fadeUp, staggerChildren } from '@/lib/motion';
import { useColdStartHint } from '@/lib/use-cold-start';
import { ShareDialog } from './ShareDialog';

interface ListHistoryProps {
  variant: 'page' | 'embedded';
}

export function ListHistory({ variant }: ListHistoryProps) {
  const [lists, setLists] = useState<ListSummaryPayload[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [sharingId, setSharingId] = useState<string | null>(null);
  const coldStart = useColdStartHint(lists === null && !failed);
  const embedded = variant === 'embedded';

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

  function updateSharedList(share: SharePayload) {
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
  }

  if (embedded && (failed || lists?.length === 0)) return null;

  return (
    <section className={embedded ? 'mt-10 border-t border-hairline pt-7' : 'py-6 sm:py-9'}>
      <div className="flex items-end justify-between gap-4">
        <div>
          {embedded ? (
            <h2 className="hand-title text-3xl text-ink">Listas recentes</h2>
          ) : (
            <h1 className="hand-title text-4xl text-ink sm:text-5xl">Minhas listas</h1>
          )}
          {embedded ? null : (
            <p className="mt-1.5 text-sm text-ink-soft">Tudo que você criou neste aparelho.</p>
          )}
        </div>

        {embedded ? (
          <Link
            to="/historico"
            className="inline-flex items-center gap-1.5 py-1 text-xs font-semibold whitespace-nowrap text-ink-soft transition-colors hover:text-ink"
          >
            Ver todas
            <ArrowRight className="size-3.5" />
          </Link>
        ) : (
          <Link
            to="/nova"
            className="grid size-10 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground transition-transform active:scale-95"
            aria-label="Criar nova lista"
          >
            <Plus className="size-[18px]" />
          </Link>
        )}
      </div>

      {failed ? (
        <div className="mt-12 text-center">
          <p className="text-sm text-ink-soft">O servidor não respondeu.</p>
          <button
            type="button"
            onClick={load}
            className="mt-3 text-sm font-semibold text-primary underline-offset-4 hover:underline"
          >
            Tentar de novo
          </button>
        </div>
      ) : null}

      {!failed && !lists ? (
        <div className="flex items-center justify-center gap-2 pt-10 text-ink-faint">
          <Loader2 className="size-4 animate-spin" />
          <span className="text-xs">
            {coldStart ? 'Acordando o servidor...' : 'Buscando suas listas...'}
          </span>
        </div>
      ) : null}

      {lists?.length === 0 ? (
        <div className="pt-14 text-center">
          <Mark animated className="mx-auto size-9 text-ink" />
          <h2 className="hand-title mt-4 text-3xl text-ink">Nenhuma lista ainda</h2>
          <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-ink-soft">
            As listas criadas neste aparelho ficam guardadas aqui.
          </p>
          <Link to="/nova" className="primary-action mt-5 px-6">
            <Plus className="size-4" />
            Criar a primeira
          </Link>
        </div>
      ) : null}

      {lists && lists.length > 0 ? (
        <m.ul
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: staggerChildren(0.025) } }}
          className="mt-5 overflow-hidden rounded-2xl border border-hairline bg-surface"
        >
          {(embedded ? lists.slice(0, 3) : lists).map((list) => {
            const Icon = iconById(list.icon);
            const expiry = remainingLabel(list.expires_at);
            const definition = listTypeById(list.list_type);

            return (
              <m.li
                key={list.id}
                variants={fadeUp}
                style={accentStyle(list.color)}
                className="history-row flex min-h-[4.5rem] items-center border-b border-hairline last:border-b-0"
              >
                <Link
                  to={`/lista/${list.id}`}
                  className="flex min-w-0 flex-1 items-center gap-3 px-3.5 py-3 sm:px-4"
                >
                  <span className="grid size-8 shrink-0 place-items-center text-accent-list">
                    <Icon className="size-[19px]" strokeWidth={2} />
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="hand-title block truncate text-[1.35rem] text-ink">
                      {list.title}
                    </span>
                    <span className="mt-0.5 flex min-w-0 items-center gap-1.5 text-[0.7rem] text-ink-faint">
                      <span>{definition.label}</span>
                      <span aria-hidden>·</span>
                      <span>{list.items_count === 1 ? '1 item' : `${list.items_count} itens`}</span>
                      {expiry ? (
                        <>
                          <span aria-hidden>·</span>
                          <Clock className="size-3 shrink-0" />
                          <span className="truncate">{expiry}</span>
                        </>
                      ) : null}
                    </span>
                  </span>
                </Link>

                <button
                  type="button"
                  onClick={() => setSharingId(list.id)}
                  aria-label={list.expired ? 'Gerar link novo' : 'Compartilhar lista'}
                  className="mr-2.5 grid size-9 shrink-0 place-items-center rounded-full text-ink-faint transition-colors hover:bg-muted hover:text-ink sm:mr-3"
                >
                  <Share2 className="size-4" />
                </button>
              </m.li>
            );
          })}
        </m.ul>
      ) : null}

      {sharingId ? (
        <ShareDialog
          listId={sharingId}
          open
          onOpenChange={(open) => {
            if (!open) setSharingId(null);
          }}
          onShared={updateSharedList}
        />
      ) : null}
    </section>
  );
}
