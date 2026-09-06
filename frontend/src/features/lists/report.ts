import { toast } from 'sonner';

import { ApiError } from '@/lib/api';
import { DuplicateItemError } from './useListStore';

export function report(action: Promise<void>): void {
  action.catch((error: unknown) => {
    if (error instanceof DuplicateItemError || (error instanceof ApiError && error.isDuplicate)) {
      toast.error('Esse item já está na lista.');
      return;
    }

    toast.error('A mudança não foi salva. Tente de novo.');
  });
}
