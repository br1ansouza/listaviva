import { ArrowRight, History } from 'lucide-react';
import { m } from 'motion/react';
import { Link } from 'react-router';

import { Mark } from '@/components/brand/Mark';
import { fadeUp, staggerChildren, transition } from '@/lib/motion';

export function HomePage() {
  return (
    <m.section
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: staggerChildren(0.06) } }}
      className="pt-10 sm:pt-16"
    >
      <m.div variants={fadeUp} className="flex justify-center">
        <Mark animated className="size-16 text-ink" />
      </m.div>

      <m.h1 variants={fadeUp} className="hand-title mt-6 text-center text-5xl text-ink sm:text-6xl">
        Uma lista, todo mundo junto
      </m.h1>

      <m.p
        variants={fadeUp}
        className="mx-auto mt-4 max-w-sm text-center text-[0.95rem] leading-relaxed text-ink-soft"
      >
        Crie a lista, mande o link no WhatsApp e vejam os itens sendo riscados ao vivo. Sem conta,
        sem instalar nada.
      </m.p>

      <m.div variants={fadeUp} className="mt-9 flex flex-col items-center gap-3">
        <Link
          to="/nova"
          className="group inline-flex h-12 items-center gap-2 rounded-full bg-primary px-7 text-[0.95rem] font-medium text-primary-foreground shadow-sm transition-transform active:scale-[0.97]"
        >
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
          className="inline-flex items-center gap-1.5 text-sm text-ink-soft transition-colors hover:text-ink"
        >
          <History className="size-4" />
          Minhas listas
        </Link>
      </m.div>
    </m.section>
  );
}
