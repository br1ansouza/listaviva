import { Link } from 'react-router';

export function NotFoundPage() {
  return (
    <section className="pt-20 text-center">
      <h1 className="hand-title text-5xl text-ink">Página em branco</h1>
      <p className="mx-auto mt-3 max-w-xs text-sm text-ink-soft">
        Esse endereço não existe — ou a folha já foi arrancada do caderno.
      </p>
      <Link
        to="/"
        className="mt-6 inline-block text-sm font-medium text-primary underline-offset-4 hover:underline"
      >
        Voltar para o início
      </Link>
    </section>
  );
}
