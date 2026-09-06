import { ArrowRight, Check, History } from 'lucide-react';
import { m } from 'motion/react';
import { Link } from 'react-router';

import { fadeUp, staggerChildren, transition } from '@/lib/motion';

export function HomePage() {
  return (
    <m.section
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: staggerChildren(0.06) } }}
      className="py-7 sm:py-12"
    >
      <m.div
        variants={fadeUp}
        className="surface-panel relative overflow-hidden px-5 py-9 sm:px-10 sm:py-12"
      >
        <div className="relative grid items-center gap-9 md:grid-cols-[1.08fr_0.92fr] md:gap-8">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-brand/20 bg-brand/8 px-3 py-1.5 text-xs font-semibold text-brand">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-brand opacity-50" />
                <span className="relative inline-flex size-2 rounded-full bg-brand" />
              </span>
              todo mundo na mesma página
            </span>

            <h1 className="mt-5 max-w-lg text-[2.65rem] leading-[0.98] font-bold tracking-[-0.045em] text-ink sm:text-[3.45rem]">
              Combine agora.{' '}
              <span className="hand-title block pt-2 text-[1.12em] tracking-normal text-brand">
                Resolva junto.
              </span>
            </h1>

            <p className="mt-5 max-w-md text-[0.98rem] leading-7 text-ink-soft">
              Crie uma lista, compartilhe no grupo e acompanhe cada item sendo riscado em tempo
              real. Sem conta, sem burocracia.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link to="/nova" className="primary-action group px-6">
                Criar lista
                <m.span
                  aria-hidden
                  className="grid place-items-center"
                  initial={{ x: 0 }}
                  whileHover={{ x: 3 }}
                  transition={transition.fast}
                >
                  <ArrowRight className="size-4" />
                </m.span>
              </Link>

              <Link
                to="/historico"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold text-ink-soft transition-colors hover:bg-muted hover:text-ink"
              >
                <History className="size-4" />
                Minhas listas
              </Link>
            </div>
          </div>

          <div
            aria-hidden
            className="relative mx-auto w-full max-w-[19rem] rotate-[1.5deg] rounded-[1.4rem] border border-hairline bg-surface-raised p-3 shadow-[var(--shadow-panel)]"
          >
            <span className="absolute -top-3 left-1/2 h-6 w-20 -translate-x-1/2 rotate-[-2deg] bg-[color-mix(in_oklab,var(--list-butter-soft)_82%,transparent)] opacity-90 shadow-sm" />
            <div className="rounded-xl bg-[var(--list-mint-soft)] px-4 py-3.5">
              <div className="flex items-center justify-between gap-3">
                <span className="hand-title text-[1.65rem] text-ink">Churrasco sábado</span>
                <span className="rounded-full bg-[var(--list-mint)] px-2 py-1 text-[0.58rem] font-bold tracking-wider whitespace-nowrap text-white uppercase dark:text-paper">
                  ao vivo
                </span>
              </div>
              <p className="mt-0.5 text-[0.65rem] text-ink-faint">3 pessoas editando</p>
            </div>

            <div className="list-rules mt-2 py-1">
              {[
                ['Carvão', true],
                ['Pão de alho', true],
                ['Gelo', false],
                ['Caixa de som', false],
              ].map(([item, done]) => (
                <div key={String(item)} className="flex h-rule items-center gap-3 px-3">
                  <span
                    className={`grid size-5 place-items-center rounded-md border ${
                      done ? 'border-[var(--list-mint)] bg-[var(--list-mint)]' : 'border-ink/20'
                    }`}
                  >
                    {done ? (
                      <Check className="size-3 text-white dark:text-paper" strokeWidth={3} />
                    ) : null}
                  </span>
                  <span className={`text-sm ${done ? 'text-ink-faint line-through' : 'text-ink'}`}>
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </m.div>
    </m.section>
  );
}
