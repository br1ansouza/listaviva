const STORAGE_KEY = 'listaviva:device-id';

function readStoredDeviceId(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function persistDeviceId(deviceId: string): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, deviceId);
  } catch {
    return;
  }
}

let cached: string | null = null;

export function deviceId(): string {
  if (cached) return cached;

  const stored = readStoredDeviceId();
  if (stored) {
    cached = stored;
    return stored;
  }

  const created = crypto.randomUUID();
  persistDeviceId(created);
  cached = created;

  return created;
}
