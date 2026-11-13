import { Clock, Loader2, Share2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { ConnectionState } from '@/components/ConnectionState';
import { AppHeaderActions } from '@/components/layout/AppShell';
import { remainingLabel } from '@/lib/expiry';
import type { ListColor, ListIconId } from '@/lib/list-catalog';
import { useColdStartHint } from '@/lib/use-cold-start';
import { ExpiredList } from './ExpiredList';
import { ListSheet } from './ListSheet';
import { report } from './report';
import { ShareDialog } from './ShareDialog';
import { useListChannel } from './useListChannel';
import { useListStore } from './useListStore';

export function ListPage() {
  const { id } = useParams();
  const list = useListStore((state) => state.list);
  const status = useListStore((state) => state.status);
  const loadById = useListStore((state) => state.loadById);
  const reset = useListStore((state) => state.reset);
  const addItem = useListStore((state) => state.addItem);
  const toggleItem = useListStore((state) => state.toggleItem);
  const renameItem = useListStore((state) => state.renameItem);
  const updateList = useListStore((state) => state.updateList);
  const [shareOpen, setShareOpen] = useState(false);
  const connection = useListChannel(list?.id ?? null, null);
  const waiting = status === 'loading' || status === 'idle';
  const coldStart = useColdStartHint(waiting || connection !== 'live');

  useEffect(() => {
    if (id) loadById(id);
    return reset;
  }, [id, loadById, reset]);

  if (waiting) {
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

  if (status === 'expired') return <ExpiredList isCreator />;

  if (!list) {
    return (
      <section className="pt-20 text-center">
        <h1 className="hand-title text-4xl text-ink">Lista indisponível</h1>
        <p className="mx-auto mt-3 max-w-xs text-sm text-ink-soft">
          Ela pode ter sido apagada, ou este dispositivo não tem acesso a ela.
        </p>
      </section>
    );
  }

  const expiry = remainingLabel(list.expires_at);

  return (
    <div className="flex min-h-0 flex-1 flex-col pt-1 sm:block sm:pt-4">
      <ListSheet
        list={list}
        editable
        customizable={list.is_creator}
        onAddItem={(content) => report(addItem(content))}
        onToggleItem={(itemId, done) => report(toggleItem(itemId, done))}
        onRenameItem={(itemId, content) => report(renameItem(itemId, content))}
        onRenameList={(title) => report(updateList({ title }))}
        onChangeIcon={(icon: ListIconId) => report(updateList({ icon }))}
        onChangeColor={(color: ListColor) => report(updateList({ color }))}
      />

      {list.is_creator && (
        <AppHeaderActions>
          <button
            type="button"
            onClick={() => setShareOpen(true)}
            aria-label={list.share_token ? 'Compartilhar de novo' : 'Compartilhar'}
            title={list.share_token ? 'Compartilhar de novo' : 'Compartilhar'}
            aria-haspopup="dialog"
            className="grid size-10 shrink-0 place-items-center rounded-full text-primary transition-colors hover:bg-primary/10"
          >
            <Share2 className="size-[18px]" />
          </button>

          {expiry && (
            <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-xs text-ink-faint">
              <Clock className="size-3.5" />
              {expiry}
            </span>
          )}
        </AppHeaderActions>
      )}

      <ConnectionState status={connection} coldStart={coldStart} />

      <ShareDialog
        listId={list.id}
        open={shareOpen}
        onOpenChange={setShareOpen}
        onShared={(share) => useListStore.setState({ list: { ...list, ...share } })}
      />
    </div>
  );
}
