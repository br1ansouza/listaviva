import { CalendarX } from 'lucide-react';
import { Link } from 'react-router';

export function ExpiredList({ isCreator = false }: { isCreator?: boolean }) {
  return (
    <section className="pt-20 text-center">
      <CalendarX className="mx-auto size-8 text-ink-faint" />
      <h1 className="hand-title mt-4 text-4xl text-ink">Essa lista expirou</h1>
      <p className="mx-auto mt-3 max-w-xs text-sm text-ink-soft">
        {isCreator
          ? 'O link não vale mais, mas a lista continua no seu histórico. Dá para gerar um link novo por lá.'
          : 'O link tinha prazo e ele acabou. Peça um link novo para quem criou a lista.'}
      </p>

      <Link
        to={isCreator ? '/historico' : '/'}
        className="mt-6 inline-block text-sm font-medium text-primary underline-offset-4 hover:underline"
      >
        {isCreator ? 'Abrir meu histórico' : 'Criar a minha lista'}
      </Link>
    </section>
  );
}
