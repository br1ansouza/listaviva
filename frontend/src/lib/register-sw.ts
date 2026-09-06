const IS_PRODUCTION = process.env.NODE_ENV === 'production';

async function unregisterAll(): Promise<void> {
  const registrations = await navigator.serviceWorker.getRegistrations();
  await Promise.all(registrations.map((registration) => registration.unregister()));

  if ('caches' in window) {
    const keys = await caches.keys();
    await Promise.all(keys.map((key) => caches.delete(key)));
  }
}

export function registerServiceWorker(): void {
  if (!('serviceWorker' in navigator)) return;

  if (!IS_PRODUCTION) {
    unregisterAll().catch(() => undefined);
    return;
  }

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => undefined);
  });
}
