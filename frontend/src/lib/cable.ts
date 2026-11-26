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
  onConfirmed?: () => void;
}

const FIRST_RETRY_DELAY = 1_000;
const MAX_RETRY_DELAY = 15_000;
const STALE_AFTER = 10_000;
const STALE_CHECK_INTERVAL = 3_000;

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
  onConfirmed,
}: SubscribeOptions): () => void {
  const identifier = JSON.stringify({ channel: 'ListChannel', list_id: listId });

  let socket: WebSocket | null = null;
  let retryDelay = FIRST_RETRY_DELAY;
  let retryTimer: ReturnType<typeof setTimeout> | null = null;
  let closed = false;
  let lastActivity = Date.now();

  function dropIfStale() {
    if (closed || socket?.readyState !== WebSocket.OPEN) return;
    if (Date.now() - lastActivity > STALE_AFTER) socket.close();
  }

  function connect() {
    if (closed) return;

    const current = new WebSocket(cableUrl(shareToken));
    socket = current;
    lastActivity = Date.now();

    current.addEventListener('message', (event) => {
      lastActivity = Date.now();
      let data: CableMessage;
      try {
        data = JSON.parse(event.data as string) as CableMessage;
      } catch {
        return;
      }

      if (data.type === 'welcome') {
        socket?.send(JSON.stringify({ command: 'subscribe', identifier }));
        return;
      }

      if (data.type === 'confirm_subscription') {
        retryDelay = FIRST_RETRY_DELAY;
        onStatus('live');
        onConfirmed?.();
        return;
      }

      if (data.type === 'reject_subscription') {
        closed = true;
        onRejected?.();
        socket?.close();
        return;
      }

      if (data.type === undefined && data.message !== undefined) {
        const message = data.message;
        if (
          message &&
          typeof message === 'object' &&
          'event' in message &&
          message.event === 'access_revoked'
        ) {
          closed = true;
          onRejected?.();
          socket?.close();
          return;
        }
        onMessage(message);
      }
    });

    current.addEventListener('close', () => {
      if (closed || socket !== current) return;

      onStatus('reconnecting');
      retryTimer = setTimeout(connect, retryDelay);
      retryDelay = Math.min(retryDelay * 2, MAX_RETRY_DELAY);
    });

    current.addEventListener('error', () => current.close());
  }

  function onVisible() {
    if (document.visibilityState === 'visible') dropIfStale();
  }

  onStatus('connecting');
  connect();
  const staleTimer = setInterval(dropIfStale, STALE_CHECK_INTERVAL);
  document.addEventListener('visibilitychange', onVisible);
  window.addEventListener('online', dropIfStale);

  return () => {
    closed = true;
    if (retryTimer) clearTimeout(retryTimer);
    clearInterval(staleTimer);
    document.removeEventListener('visibilitychange', onVisible);
    window.removeEventListener('online', dropIfStale);
    socket?.close();
  };
}
