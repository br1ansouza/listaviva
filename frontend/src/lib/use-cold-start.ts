import { useEffect, useState } from 'react';

const COLD_START_HINT_DELAY = 3_500;

export function useColdStartHint(waiting: boolean): boolean {
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    if (!waiting) {
      setShowHint(false);
      return;
    }

    const timer = setTimeout(() => setShowHint(true), COLD_START_HINT_DELAY);

    return () => clearTimeout(timer);
  }, [waiting]);

  return showHint;
}
