import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';
import { useParams } from 'react-router';
import { toast } from 'sonner';

import { ConnectionState } from '@/components/ConnectionState';
import { useColdStartHint } from '@/lib/use-cold-start';
import { ExpiredList } from './ExpiredList';
import { ListSheet } from './ListSheet';
import { useListChannel } from './useListChannel';
import { useListStore } from './useListStore';

export function LiveRoomPage() {
  const { token } = useParams();
  const list = useListStore((state) => state.list);
  const status = useListStore((state) => state.status);
  const loadByToken = useListStore((state) => state.loadByToken);
  const reset = useListStore((state) => state.reset);
  const addItem = useListStore((state) => state.addItem);
  const toggleItem = useListStore((state) => state.toggleItem);
  const renameItem = useListStore((state) => state.renameItem);
  const removeItem = useListStore((state) => state.removeItem);
  const updateList = useListStore((state) => state.updateList);

  const connection = useListChannel(list?.id ?? null, token ?? null);
  const waiting = status === 'loading' || status === 'idle';
  const coldStart = useColdStartHint(waiting || connection !== 'live');

  useEffect(() => {
    if (token) loadByToken(token);
    return reset;
  }, [token, loadByToken, reset]);

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

  if (status === 'expired') return <ExpiredList />;

  if (!list) {
    return (
      <section className="pt-20 text-center">
        <h1 className="hand-title text-4xl text-ink">Link inválido</h1>
        <p className="mx-auto mt-3 max-w-xs text-sm text-ink-soft">
          Esse link não existe mais. Peça outro para quem criou a lista.
        </p>
      </section>
    );
  }

  return (
    <div className="pt-4">
      <ListSheet
        list={list}
        editable
        onAddItem={(content) => report(addItem(content))}
        onToggleItem={(itemId, done) => report(toggleItem(itemId, done))}
        onRenameItem={(itemId, content) => report(renameItem(itemId, content))}
        onRemoveItem={(itemId) => report(removeItem(itemId))}
        onRenameList={(title) => report(updateList({ title }))}
        onChangeIcon={(icon) => report(updateList({ icon }))}
        onChangeColor={(color) => report(updateList({ color }))}
      />

      <ConnectionState status={connection} coldStart={coldStart} />
    </div>
  );
}
