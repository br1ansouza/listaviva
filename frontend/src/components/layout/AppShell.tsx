import { ArrowLeft, History, UserRound } from 'lucide-react';
import { m } from 'motion/react';
import { lazy, type ReactNode, Suspense, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';

import { Mark } from '@/components/brand/Mark';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useIdentity } from '@/lib/identity';
import { spring, transition } from '@/lib/motion';
import { cn } from '@/lib/utils';

const NameDialog = lazy(() =>
  import('@/features/identity/NameDialog').then((module) => ({ default: module.NameDialog })),
);

export function AppShell({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === '/';
  const isHistory = location.pathname.startsWith('/historico');
  const isListRoute = /^\/(lista|l)\//.test(location.pathname);
  const name = useIdentity((state) => state.name);
  const asking = useIdentity((state) => state.asking);
  const openEditor = useIdentity((state) => state.openEditor);
  const [nameDialogMounted, setNameDialogMounted] = useState(asking);
  const initial = name ? [...new Intl.Segmenter().segment(name)][0]?.segment : null;

  useEffect(() => {
    if (asking) setNameDialogMounted(true);
  }, [asking]);

  function goBack() {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate('/');
  }

  return (
    <div className={cn('paper-sheet min-h-dvh', isListRoute && 'list-stage')}>
      <header className="site-header sticky top-0 z-40">
        <div
          className={cn(
            'mx-auto flex w-full max-w-5xl items-center gap-2 px-5 sm:h-[4.25rem] sm:px-8',
            isListRoute ? 'h-12' : 'h-[4.25rem]',
          )}
        >
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

          <Link
            to="/"
            className={cn('flex items-center gap-2.5 text-ink', isListRoute && 'max-sm:hidden')}
            aria-label="Início"
          >
            <span className="grid size-9 place-items-center rounded-xl border border-hairline bg-surface text-ink">
              <Mark className="size-6" />
            </span>
            <span
              className={cn(
                'text-[1.1rem] leading-none font-semibold tracking-[-0.045em]',
                !isHome && 'max-[380px]:hidden',
              )}
            >
              ListaViva<span className="text-brand">.</span>
            </span>
          </Link>

          <div className={cn('ml-auto flex items-center gap-2', isListRoute && 'max-sm:hidden')}>
            {!isHistory && (
              <Link
                to="/historico"
                className="grid size-10 place-items-center rounded-full border border-hairline bg-surface/80 text-ink-soft shadow-sm transition-colors hover:border-ink/20 hover:text-ink"
                aria-label="Minhas listas"
              >
                <History className="size-[18px]" />
              </Link>
            )}
            <m.button
              type="button"
              onClick={openEditor}
              whileTap={{ scale: 0.9 }}
              transition={spring.snappy}
              aria-label={name ? `Você é ${name}. Trocar nome` : 'Escolher seu nome'}
              className="grid size-10 place-items-center rounded-full border border-hairline bg-surface/80 text-ink-soft shadow-sm transition-colors hover:border-ink/20 hover:text-ink"
            >
              {initial ? (
                <span className="text-[0.9rem] font-semibold leading-none">{initial}</span>
              ) : (
                <UserRound className="size-[18px]" />
              )}
            </m.button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <m.main
        key={location.pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={transition.fast}
        className={cn(
          'main-stage relative z-10 mx-auto w-full px-5 sm:px-8 sm:pb-12',
          isHome || location.pathname === '/nova' ? 'max-w-5xl' : 'max-w-3xl',
          isHome
            ? 'flex flex-col pb-0 sm:pb-0'
            : isListRoute
              ? 'flex min-h-0 flex-col pb-4 sm:block'
              : 'pb-24',
        )}
      >
        {children}
      </m.main>

      {nameDialogMounted && (
        <Suspense fallback={null}>
          <NameDialog />
        </Suspense>
      )}
    </div>
  );
}
