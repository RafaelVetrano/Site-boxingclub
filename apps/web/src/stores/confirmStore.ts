import { create } from 'zustand';

interface ConfirmOptions {
  title?: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
}

interface ConfirmStore {
  isOpen: boolean;
  options: ConfirmOptions | null;
  resolve: ((v: boolean) => void) | null;
  open: (opts: ConfirmOptions) => Promise<boolean>;
  answer: (v: boolean) => void;
}

export const useConfirmStore = create<ConfirmStore>((set, get) => ({
  isOpen: false,
  options: null,
  resolve: null,
  open: (opts) =>
    new Promise<boolean>((resolve) => {
      set({ isOpen: true, options: opts, resolve });
    }),
  answer: (v) => {
    get().resolve?.(v);
    set({ isOpen: false, options: null, resolve: null });
  },
}));
