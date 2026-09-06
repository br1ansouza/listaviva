const STORAGE_KEY = 'listaviva:device-id';
const NAME_STORAGE_KEY = 'listaviva:device-name';
const NAME_ASKED_KEY = 'listaviva:device-name-asked';
const COOKIE_MAX_AGE_SECONDS = 400 * 24 * 60 * 60;

export const DEVICE_NAME_MAX_LENGTH = 15;

function readLocalStorage(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeLocalStorage(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    return;
  }
}

function readCookie(key: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${key}=([^;]*)`));

  return match?.[1] ? decodeURIComponent(match[1]) : null;
}

function writeCookie(key: string, value: string): void {
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';

  // biome-ignore lint/suspicious/noDocumentCookie: a Cookie Store API nao existe no Safari, que e justamente o navegador que este cookie serve
  document.cookie = `${key}=${encodeURIComponent(value)}; path=/; max-age=${COOKIE_MAX_AGE_SECONDS}; SameSite=Lax${secure}`;
}

function requestPersistentStorage(): void {
  navigator.storage?.persist?.().catch(() => undefined);
}

let cached: string | null = null;

export function deviceId(): string {
  if (cached) return cached;

  const stored = readLocalStorage(STORAGE_KEY) ?? readCookie(STORAGE_KEY) ?? crypto.randomUUID();

  writeLocalStorage(STORAGE_KEY, stored);
  writeCookie(STORAGE_KEY, stored);
  requestPersistentStorage();

  cached = stored;

  return stored;
}

export function truncateName(value: string): string {
  return [...new Intl.Segmenter().segment(value.trim())]
    .slice(0, DEVICE_NAME_MAX_LENGTH)
    .map((entry) => entry.segment)
    .join('');
}

export function readDeviceName(): string | null {
  return readLocalStorage(NAME_STORAGE_KEY) ?? readCookie(NAME_STORAGE_KEY);
}

export function storeDeviceName(name: string): string {
  const trimmed = truncateName(name);

  writeLocalStorage(NAME_STORAGE_KEY, trimmed);
  writeCookie(NAME_STORAGE_KEY, trimmed);
  markNameAsked();

  return trimmed;
}

export function markNameAsked(): void {
  writeLocalStorage(NAME_ASKED_KEY, '1');
  writeCookie(NAME_ASKED_KEY, '1');
}

export function wasNameAsked(): boolean {
  return (readLocalStorage(NAME_ASKED_KEY) ?? readCookie(NAME_ASKED_KEY)) === '1';
}
