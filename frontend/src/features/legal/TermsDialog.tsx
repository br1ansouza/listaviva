import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const CONTACT_URL = 'https://github.com/br1ansouza';
const REPO_URL = 'https://github.com/br1ansouza/listaviva';

function GithubMark({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      focusable="false"
    >
      <path d="M12 .5C5.73.5.5 5.73.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56 0-.28-.01-1.02-.02-2-3.2.7-3.88-1.54-3.88-1.54-.52-1.33-1.28-1.69-1.28-1.69-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.24 2.76.12 3.05.74.8 1.19 1.83 1.19 3.09 0 4.42-2.7 5.4-5.26 5.68.41.36.78 1.07.78 2.15 0 1.56-.02 2.81-.02 3.19 0 .31.21.68.8.56A11.51 11.51 0 0 0 23.5 12C23.5 5.73 18.27.5 12 .5Z" />
    </svg>
  );
}

interface TermsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TermsDialog({ open, onOpenChange }: TermsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="hand-title text-[1.75rem]">Termos de uso</DialogTitle>
          <DialogDescription>
            Projeto pessoal, gratuito e de código aberto. Em resumo, sem letra miúda:
          </DialogDescription>
        </DialogHeader>

        <ul className="flex flex-col gap-2.5 text-[0.86rem] text-ink-soft">
          <li>
            <strong className="font-semibold text-ink">Não existe conta.</strong> Sua identidade é
            um código aleatório guardado neste aparelho. Limpar os dados do navegador apaga o
            histórico, e não há como recuperá-lo.
          </li>
          <li>
            <strong className="font-semibold text-ink">Quem tem o link, edita.</strong> Enquanto a
            validade não vence, qualquer pessoa com o link entra na lista e mexe nela. Não escreva
            nada sensível.
          </li>
          <li>
            <strong className="font-semibold text-ink">As listas somem.</strong> Depois de expirar,
            a lista é apagada definitivamente do banco em até 90 dias.
          </li>
          <li>
            <strong className="font-semibold text-ink">Sem garantia.</strong> Roda em serviços
            gratuitos e pode ficar fora do ar ou perder dados. Use para a feira e o churrasco, não
            para o que você não pode perder.
          </li>
        </ul>

        <div className="mt-1 border-hairline border-t pt-3">
          <p className="text-[0.86rem] text-ink-soft">
            Achou um bug ou quer sugerir algo? Fala comigo:
          </p>

          <div className="mt-2.5 flex flex-wrap gap-2">
            <a
              href={CONTACT_URL}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex h-9 items-center gap-2 rounded-full border border-hairline bg-surface px-3.5 text-[0.82rem] font-medium text-ink transition-colors hover:border-ink/25"
            >
              <GithubMark className="size-4" />
              @br1ansouza
            </a>

            <a
              href={`${REPO_URL}/issues/new`}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex h-9 items-center rounded-full px-3.5 text-[0.82rem] font-medium text-ink-soft transition-colors hover:bg-muted hover:text-ink"
            >
              Abrir uma issue
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
