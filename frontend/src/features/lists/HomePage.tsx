import { ArrowRight, Check, History, PartyPopper } from 'lucide-react';
import { m } from 'motion/react';
import { lazy, Suspense, useState } from 'react';
import { Link } from 'react-router';

import { fadeUp, staggerChildren, transition } from '@/lib/motion';
import { cn } from '@/lib/utils';

const TermsDialog = lazy(() =>
  import('@/features/legal/TermsDialog').then((module) => ({ default: module.TermsDialog })),
);

export function HomePage() {
  const [termsOpen, setTermsOpen] = useState(false);
  const [checked, setChecked] = useState([true, true, false, false]);
  const completed = checked.filter(Boolean).length;

  return (
    <m.section
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: staggerChildren(0.06) } }}
      className="flex flex-1 flex-col py-9 sm:pt-8 sm:pb-5"
    >
      <m.div variants={fadeUp} className="relative">
        <div className="grid items-center gap-12 md:grid-cols-[1.15fr_0.85fr] md:gap-14">
          <div>
            <span className="inline-flex items-center gap-2.5 text-[0.68rem] font-semibold tracking-[0.16em] text-ink-soft uppercase">
              <span className="size-1.5 rounded-full bg-brand" />
              Menos mensagem. Mais ação.
            </span>

            <h1 className="mt-6 text-[clamp(2.65rem,5.5vw,3.75rem)] leading-[1.04] font-semibold tracking-[-0.055em] text-ink">
              Combine agora.{' '}
              <span className="hand-title block pt-2 text-[1.16em] tracking-normal text-brand">
                Resolva junto.
              </span>
            </h1>

            <p className="mt-6 max-w-sm text-[0.95rem] leading-7 text-ink-soft">
              Crie uma lista, compartilhe no grupo e acompanhe cada item sendo riscado em tempo
              real. Sem conta, sem burocracia.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
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
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl px-4 text-sm font-medium text-ink-soft transition-colors hover:bg-muted hover:text-ink"
              >
                <History className="size-4" />
                Minhas listas
              </Link>
            </div>
          </div>

          <div className="mx-auto w-full max-w-[21rem] md:pt-4">
            <div className="demo-sheet rotate-[-2deg] px-5 pt-5 pb-3">
              <div className="flex items-center justify-between text-ink-faint">
                <PartyPopper className="size-5 text-[var(--list-butter)]" strokeWidth={1.5} />
                <span className="text-[0.6rem] font-semibold tracking-[0.16em] uppercase">
                  Lista de exemplo
                </span>
              </div>
              <h2 className="hand-title mt-4 text-[2rem] text-ink">Churrasco sábado</h2>
              <p className="mt-1 text-xs text-ink-faint">Cada um leva um pouco.</p>

              <div className="list-rules mt-5">
                {['Carvão', 'Pão de alho', 'Gelo', 'Caixa de som'].map((item, index) => (
                  <button
                    key={item}
                    type="button"
                    aria-pressed={checked[index]}
                    onClick={() =>
                      setChecked((current) =>
                        current.map((done, i) => (i === index ? !done : done)),
                      )
                    }
                    className="group flex h-rule w-full items-center gap-3 rounded-md px-1 text-left hover:bg-muted/50"
                  >
                    <span
                      className={cn(
                        'grid size-5 place-items-center rounded-md border transition-colors',
                        checked[index]
                          ? 'border-brand bg-brand/15 text-brand'
                          : 'border-ink-faint/50 text-transparent group-hover:border-brand',
                      )}
                    >
                      <Check className="size-3" strokeWidth={2.5} />
                    </span>
                    <span
                      className={cn(
                        'text-sm',
                        checked[index] ? 'text-ink-faint line-through' : 'text-ink',
                      )}
                    >
                      {item}
                    </span>
                  </button>
                ))}
              </div>
              <div className="mt-5 flex items-center justify-between text-[0.65rem] text-ink-faint">
                <span>{completed === 4 ? 'Tudo pronto. Bora?' : 'Tá tomando forma.'}</span>
                <span className="tabular-nums" aria-live="polite">
                  {completed} de 4
                </span>
              </div>
              <div className="progress-track mt-2 mb-2 rounded-full" aria-hidden>
                <div className="progress-fill" style={{ transform: `scaleX(${completed / 4})` }} />
              </div>
            </div>
            <p className="mt-6 text-center text-xs text-ink-faint">Experimente riscar um item.</p>
          </div>
        </div>
      </m.div>
      <m.div
        variants={fadeUp}
        className="mt-14 grid gap-5 border-t border-hairline pt-6 sm:mt-8 sm:grid-cols-3 sm:gap-8"
      >
        {[
          ['01', 'Do seu jeito', 'Compras, planos ou o próximo rolê.'],
          ['02', 'Um link e pronto', 'Manda no grupo. Todo mundo entra.'],
          ['03', 'Riscou, resolveu', 'Cada mudança aparece na hora.'],
        ].map(([number, title, description]) => (
          <div key={number} className="flex items-start gap-3">
            <span className="pt-0.5 font-mono text-[0.65rem] text-ink-faint">{number}</span>
            <div>
              <h2 className="text-sm font-medium text-ink">{title}</h2>
              <p className="mt-1 text-xs leading-5 text-ink-faint">{description}</p>
            </div>
          </div>
        ))}
      </m.div>
      <m.footer
        variants={fadeUp}
        className="mt-auto flex flex-wrap items-center justify-between gap-x-4 gap-y-2 pt-10 text-[0.68rem] leading-5 text-ink-faint"
      >
        <span>Feito por Brian, sem cadastro e sem anúncio.</span>
        <button
          type="button"
          onClick={() => setTermsOpen(true)}
          className="rounded-full underline underline-offset-4 transition-colors hover:text-ink"
        >
          Termos de uso e contato
        </button>
      </m.footer>

      {termsOpen && (
        <Suspense fallback={null}>
          <TermsDialog open={termsOpen} onOpenChange={setTermsOpen} />
        </Suspense>
      )}
    </m.section>
  );
}
