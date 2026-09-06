const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

export function remainingLabel(expiresAt: string | null): string | null {
  if (!expiresAt) return null;

  const remaining = new Date(expiresAt).getTime() - Date.now();
  if (remaining <= 0) return 'expirada';

  if (remaining >= DAY) {
    const days = Math.round(remaining / DAY);
    return days === 1 ? 'expira em 1 dia' : `expira em ${days} dias`;
  }

  if (remaining >= HOUR) {
    const hours = Math.round(remaining / HOUR);
    return hours === 1 ? 'expira em 1 hora' : `expira em ${hours} horas`;
  }

  const minutes = Math.max(1, Math.round(remaining / MINUTE));
  return minutes === 1 ? 'expira em 1 minuto' : `expira em ${minutes} minutos`;
}
