import { AnimatePresence, m } from 'motion/react';

import { Mark } from '@/components/brand/Mark';
import type { CableStatus } from '@/lib/cable';
import { transition } from '@/lib/motion';

interface ConnectionStateProps {
  status: CableStatus;
  coldStart: boolean;
}

export function ConnectionState({ status, coldStart }: ConnectionStateProps) {
  const visible = status !== 'live';

  return (
    <AnimatePresence>
      {visible && (
        <m.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={transition.base}
          className="fixed inset-x-0 bottom-4 z-40 mx-auto flex w-fit max-w-[calc(100%-2rem)] items-center gap-2.5 rounded-full border border-hairline bg-surface-raised/95 px-4 py-2.5 shadow-lg backdrop-blur"
        >
          <Mark animated className="size-4 text-ink-soft" />
          <span className="text-xs text-ink-soft">
            {coldStart
              ? 'Acordando o servidor — pode levar até um minuto'
              : status === 'connecting'
                ? 'Conectando à sala...'
                : 'Reconectando...'}
          </span>
        </m.div>
      )}
    </AnimatePresence>
  );
}
