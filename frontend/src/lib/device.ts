const STORAGE_KEY = 'listaviva:device-id';
const COOKIE_MAX_AGE_SECONDS = 400 * 24 * 60 * 60;

function readLocalStorage(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function writeLocalStorage(deviceId: string): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, deviceId);
  } catch {
    return;
  }
}

function readCookie(): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${STORAGE_KEY}=([^;]*)`));

  return match?.[1] ? decodeURIComponent(match[1]) : null;
}

function writeCookie(deviceId: string): void {
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';

  document.cookie = `${STORAGE_KEY}=${encodeURIComponent(deviceId)}; path=/; max-age=${COOKIE_MAX_AGE_SECONDS}; SameSite=Lax${secure}`;
}

function requestPersistentStorage(): void {
  navigator.storage?.persist?.().catch(() => undefined);
}

let cached: string | null = null;

export function deviceId(): string {
  if (cached) return cached;

  const stored = readLocalStorage() ?? readCookie() ?? crypto.randomUUID();

  writeLocalStorage(stored);
  writeCookie(stored);
  requestPersistentStorage();

  cached = stored;

  return stored;
}
