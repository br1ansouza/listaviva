import { Clock, Loader2, Share2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { toast } from 'sonner';
import { ConnectionState } from '@/components/ConnectionState';
import { remainingLabel } from '@/lib/expiry';
import type { ListColor, ListIconId } from '@/lib/list-catalog';
import { useColdStartHint } from '@/lib/use-cold-start';
import { ExpiredList } from './ExpiredList';
import { ListSheet } from './ListSheet';
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
  const removeItem = useListStore((state) => state.removeItem);
  const updateList = useListStore((state) => state.updateList);
  const [shareOpen, setShareOpen] = useState(false);
  const connection = useListChannel(list?.id ?? null, null);
  const waiting = status === 'loading' || status === 'idle';
  const coldStart = useColdStartHint(waiting || connection !== 'live');

  useEffect(() => {
    if (id) loadById(id);
    return reset;
  }, [id, loadById, reset]);

  function report(action: Promise<void>) {
    action.catch(() => toast.error('A mudança não foi salva. Tente de novo.'));
  }

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
    <div className="pt-4">
      <ListSheet
        list={list}
        editable={list.is_creator}
        onAddItem={(content) => report(addItem(content))}
        onToggleItem={(itemId, done) => report(toggleItem(itemId, done))}
        onRenameItem={(itemId, content) => report(renameItem(itemId, content))}
        onRemoveItem={(itemId) => report(removeItem(itemId))}
        onRenameList={(title) => report(updateList({ title }))}
        onChangeIcon={(icon: ListIconId) => report(updateList({ icon }))}
        onChangeColor={(color: ListColor) => report(updateList({ color }))}
      />

      {list.is_creator && (
        <div className="mt-5 flex flex-wrap items-center gap-3 px-1">
          <button
            type="button"
            onClick={() => setShareOpen(true)}
            className="primary-action flex-1 px-6"
          >
            <Share2 className="size-4" />
            {list.share_token ? 'Compartilhar de novo' : 'Compartilhar'}
          </button>

          {expiry && (
            <span className="inline-flex items-center gap-1.5 text-xs text-ink-faint">
              <Clock className="size-3.5" />
              {expiry}
            </span>
          )}
        </div>
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
