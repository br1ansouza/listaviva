import { apiBaseUrl } from './api';
import { deviceId } from './device';

export type CableStatus = 'connecting' | 'live' | 'reconnecting';

interface CableMessage {
  type?: string;
  identifier?: string;
  message?: unknown;
}

interface SubscribeOptions {
  listId: string;
  shareToken?: string | null;
  onMessage: (message: unknown) => void;
  onStatus: (status: CableStatus) => void;
  onRejected?: () => void;
}

const FIRST_RETRY_DELAY = 1_000;
const MAX_RETRY_DELAY = 15_000;

function cableUrl(shareToken?: string | null): string {
  const base = apiBaseUrl.replace(/^http/, 'ws');
  const params = new URLSearchParams({ device_id: deviceId() });

  if (shareToken) params.set('share_token', shareToken);

  return `${base}/cable?${params.toString()}`;
}

export function subscribeToList({
  listId,
  shareToken,
  onMessage,
  onStatus,
  onRejected,
}: SubscribeOptions): () => void {
  const identifier = JSON.stringify({ channel: 'ListChannel', list_id: listId });

  let socket: WebSocket | null = null;
  let retryDelay = FIRST_RETRY_DELAY;
  let retryTimer: ReturnType<typeof setTimeout> | null = null;
  let closed = false;

  function connect() {
    if (closed) return;

    socket = new WebSocket(cableUrl(shareToken));

    socket.addEventListener('message', (event) => {
      const data = JSON.parse(event.data as string) as CableMessage;

      if (data.type === 'welcome') {
        socket?.send(JSON.stringify({ command: 'subscribe', identifier }));
        return;
      }

      if (data.type === 'confirm_subscription') {
        retryDelay = FIRST_RETRY_DELAY;
        onStatus('live');
        return;
      }

      if (data.type === 'reject_subscription') {
        closed = true;
        onRejected?.();
        socket?.close();
        return;
      }

      if (data.type === undefined && data.message !== undefined) onMessage(data.message);
    });

    socket.addEventListener('close', () => {
      if (closed) return;

      onStatus('reconnecting');
      retryTimer = setTimeout(connect, retryDelay);
      retryDelay = Math.min(retryDelay * 2, MAX_RETRY_DELAY);
    });

    socket.addEventListener('error', () => socket?.close());
  }

  onStatus('connecting');
  connect();

  return () => {
    closed = true;
    if (retryTimer) clearTimeout(retryTimer);
    socket?.close();
  };
}
