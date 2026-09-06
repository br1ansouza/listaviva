import { History } from 'lucide-react';
import { motion } from 'motion/react';
import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router';

import { Mark } from '@/components/brand/Mark';
import { ThemeToggle } from '@/components/ThemeToggle';
import { transition } from '@/lib/motion';

export function AppShell({ children }: { children: ReactNode }) {
  const location = useLocation();
  const isHistory = location.pathname.startsWith('/historico');

  return (
    <div className="paper-sheet min-h-dvh">
      <header className="relative z-10 mx-auto flex w-full max-w-2xl items-center gap-3 px-4 pt-5 pb-2 sm:px-6">
        <Link to="/" className="flex items-center gap-2.5 text-ink" aria-label="Início">
          <Mark className="size-7" />
          <span className="hand-title text-3xl leading-none">ListaViva</span>
        </Link>

        <div className="ml-auto flex items-center gap-2">
          {!isHistory && (
            <Link
              to="/historico"
              className="grid size-10 place-items-center rounded-full border border-hairline bg-surface/70 text-ink-soft transition-colors hover:text-ink"
              aria-label="Minhas listas"
            >
              <History className="size-[18px]" />
            </Link>
          )}
          <ThemeToggle />
        </div>
      </header>

      <motion.main
        key={location.pathname}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={transition.base}
        className="relative z-10 mx-auto w-full max-w-2xl px-4 pb-24 sm:px-6"
      >
        {children}
      </motion.main>
    </div>
  );
}
