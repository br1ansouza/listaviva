import { ArrowLeft, History } from 'lucide-react';
import { m } from 'motion/react';
import type { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';

import { Mark } from '@/components/brand/Mark';
import { ThemeToggle } from '@/components/ThemeToggle';
import { spring, transition } from '@/lib/motion';

export function AppShell({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === '/';
  const isHistory = location.pathname.startsWith('/historico');

  function goBack() {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate('/');
  }

  return (
    <div className="paper-sheet min-h-dvh">
      <header className="site-header sticky top-0 z-40">
        <div className="mx-auto flex h-[4.25rem] w-full max-w-3xl items-center gap-2 px-4 sm:px-6">
          {!isHome && (
            <m.button
              type="button"
              onClick={goBack}
              whileTap={{ scale: 0.9 }}
              transition={spring.snappy}
              aria-label="Voltar"
              className="-ml-1 grid size-10 shrink-0 place-items-center rounded-full text-ink-soft transition-colors hover:bg-surface hover:text-ink"
            >
              <ArrowLeft className="size-[20px]" />
            </m.button>
          )}

          <Link to="/" className="flex items-center gap-2.5 text-ink" aria-label="Início">
            <span className="grid size-9 place-items-center rounded-xl bg-brand/10 text-ink">
              <Mark className="size-6" />
            </span>
            <span className="hand-title text-[1.85rem] leading-none">ListaViva</span>
          </Link>

          <div className="ml-auto flex items-center gap-2">
            {!isHistory && (
              <Link
                to="/historico"
                className="grid size-10 place-items-center rounded-full border border-hairline bg-surface/80 text-ink-soft shadow-sm transition-colors hover:border-ink/20 hover:text-ink"
                aria-label="Minhas listas"
              >
                <History className="size-[18px]" />
              </Link>
            )}
            <ThemeToggle />
          </div>
        </div>
      </header>

      <m.main
        key={location.pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={transition.fast}
        className="main-stage relative z-10 mx-auto w-full max-w-3xl px-4 pb-24 sm:px-6"
      >
        {children}
      </m.main>
    </div>
  );
}
