import { Component, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  failed: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { failed: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { failed: true };
  }

  render() {
    if (!this.state.failed) return this.props.children;

    return (
      <section className="pt-20 text-center">
        <h1 className="hand-title text-5xl text-ink">A folha rasgou</h1>
        <p className="mx-auto mt-3 max-w-xs text-sm text-ink-soft">
          Algo deu errado ao abrir esta tela. Suas listas continuam salvas.
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-6 inline-block text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          Recarregar
        </button>
      </section>
    );
  }
}
