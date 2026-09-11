import { ArrowRight, Clock, Loader2, Plus, Share2, Star } from 'lucide-react';
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
  const [savingFavoriteIds, setSavingFavoriteIds] = useState<string[]>([]);
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

  async function toggleFavorite(list: ListSummaryPayload) {
    if (savingFavoriteIds.includes(list.id)) return;

    const previous = lists;
    const favorite = !list.favorite;
    setSavingFavoriteIds((current) => [...current, list.id]);
    setLists((current) =>
      current
        ? [...current.map((item) => (item.id === list.id ? { ...item, favorite } : item))].sort(
            (a, b) => Number(b.favorite) - Number(a.favorite),
          )
        : current,
    );

    try {
      await api.updateList(list.id, { favorite });
    } catch {
      setLists(previous);
      toast.error('Não foi possível atualizar o favorito.');
    } finally {
      setSavingFavoriteIds((current) => current.filter((id) => id !== list.id));
    }
  }

  if (embedded && (failed || lists?.length === 0)) return null;

  return (
    <section
      className={
        embedded
          ? 'mt-10 min-w-0 border-t border-hairline pt-7 lg:mt-6 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-8'
          : 'py-6 sm:py-9'
      }
    >
      <div className="flex items-end justify-between gap-4">
        <div>
          {embedded ? (
            <h2 className="text-lg font-semibold tracking-tight text-ink lg:text-base">
              Listas recentes
            </h2>
          ) : (
            <>
              <p className="section-label mb-3">Seu espaço</p>
              <h1 className="page-title text-ink">Minhas listas</h1>
            </>
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
            className="primary-action shrink-0 gap-2 px-3 sm:px-4"
            aria-label="Criar nova lista"
          >
            <Plus className="size-[18px]" />
            <span className="hidden text-sm sm:inline">Nova lista</span>
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
        <div className="surface-panel mt-8 px-5 py-14 text-center">
          <Mark animated className="mx-auto size-9 text-ink" />
          <h2 className="mt-4 text-xl font-semibold tracking-tight text-ink">
            Espaço para seus planos
          </h2>
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
          className="mt-7 overflow-hidden rounded-2xl border border-hairline bg-surface shadow-[var(--shadow-panel)]"
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
                className="history-row group flex min-h-22 items-center border-b border-hairline last:border-b-0"
              >
                <Link
                  to={`/lista/${list.id}`}
                  className="flex min-w-0 flex-1 items-center gap-3 px-4 py-4 sm:gap-4 sm:px-5"
                >
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-accent-list/15 bg-accent-list-soft text-accent-list">
                    <Icon className="size-[19px]" strokeWidth={2} />
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[0.95rem] font-medium tracking-[-0.015em] text-ink">
                      {list.title}
                    </span>
                    <span className="mt-1.5 flex min-w-0 flex-wrap items-center gap-1.5 text-[0.7rem] text-ink-faint">
                      <span>{definition.label}</span>
                      <span aria-hidden>·</span>
                      <span>{list.items_count === 1 ? '1 item' : `${list.items_count} itens`}</span>
                      {expiry ? (
                        <>
                          <span aria-hidden>·</span>
                          <span className="inline-flex items-center gap-1 whitespace-nowrap">
                            <Clock className="size-3 shrink-0" />
                            {expiry}
                          </span>
                        </>
                      ) : null}
                    </span>
                  </span>
                </Link>

                <button
                  type="button"
                  onClick={() => toggleFavorite(list)}
                  disabled={savingFavoriteIds.includes(list.id)}
                  aria-pressed={list.favorite}
                  aria-label={
                    list.favorite
                      ? `Remover ${list.title} dos favoritos`
                      : `Favoritar ${list.title}`
                  }
                  className="grid size-9 shrink-0 place-items-center rounded-full text-ink-faint transition-[color,background-color,transform] hover:bg-muted hover:text-amber-500 active:scale-90 disabled:opacity-50"
                >
                  <Star
                    className={
                      list.favorite ? 'size-[18px] fill-amber-400 text-amber-500' : 'size-[18px]'
                    }
                    strokeWidth={2.2}
                  />
                </button>

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
