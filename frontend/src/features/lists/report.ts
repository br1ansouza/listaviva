import { toast } from 'sonner';

import { ApiError } from '@/lib/api';
import { DuplicateItemError } from './useListStore';

export function report(action: Promise<void>): void {
  action.catch((error: unknown) => {
    if (error instanceof DuplicateItemError || (error instanceof ApiError && error.isDuplicate)) {
      toast.error('Esse item já está na lista.');
      return;
    }

    if (error instanceof ApiError && error.code === 'limite_de_itens') {
      toast.error('Esta lista chegou a 230 itens. Exclua um item para adicionar outro.');
      return;
    }

    if (error instanceof ApiError && error.status === 429) {
      toast.error('Muitas alterações em pouco tempo. Aguarde um pouco e tente novamente.');
      return;
    }

    toast.error('A mudança não foi salva. Tente de novo.');
  });
}
