import { Clock, Loader2, Share2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { toast } from 'sonner';
import { remainingLabel } from '@/lib/expiry';
import type { ListColor, ListIconId } from '@/lib/list-catalog';
import { ListSheet } from './ListSheet';
import { ShareDialog } from './ShareDialog';
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

  useEffect(() => {
    if (id) loadById(id);
    return reset;
  }, [id, loadById, reset]);

  function report(action: Promise<void>) {
    action.catch(() => toast.error('A mudança não foi salva. Tente de novo.'));
  }

  if (status === 'loading' || status === 'idle') {
    return (
      <div className="grid place-items-center pt-24 text-ink-faint">
        <Loader2 className="size-5 animate-spin" />
      </div>
    );
  }

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
        <div className="mt-10 flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShareOpen(true)}
            className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-primary text-sm font-medium text-primary-foreground transition-transform active:scale-[0.98]"
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

      <ShareDialog
        listId={list.id}
        open={shareOpen}
        onOpenChange={setShareOpen}
        onShared={(share) => useListStore.setState({ list: { ...list, ...share } })}
      />
    </div>
  );
}
