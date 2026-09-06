import { create } from 'zustand';

import { markNameAsked, readDeviceName, storeDeviceName, wasNameAsked } from './device';

interface IdentityState {
  name: string | null;
  asking: boolean;
  save: (name: string) => void;
  skip: () => void;
  openEditor: () => void;
  closeEditor: () => void;
}

export const useIdentity = create<IdentityState>((set) => ({
  name: readDeviceName(),
  asking: !wasNameAsked(),

  save: (name) => set({ name: storeDeviceName(name) || null, asking: false }),

  skip: () => {
    markNameAsked();
    set({ asking: false });
  },

  openEditor: () => set({ asking: true }),
  closeEditor: () => set({ asking: false }),
}));
