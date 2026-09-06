import { useEffect, useState } from 'react';

import { type CableStatus, subscribeToList } from '@/lib/cable';
import { type ListEvent, useListStore } from './useListStore';

export function useListChannel(listId: string | null, shareToken: string | null): CableStatus {
  const [status, setStatus] = useState<CableStatus>('connecting');
  const applyRemoteEvent = useListStore((state) => state.applyRemoteEvent);

  useEffect(() => {
    if (!listId) return;

    return subscribeToList({
      listId,
      shareToken,
      onStatus: setStatus,
      onMessage: (message) => applyRemoteEvent(message as ListEvent),
    });
  }, [listId, shareToken, applyRemoteEvent]);

  return status;
}
