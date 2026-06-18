import { create } from 'zustand';
import type { Toast } from '@/components/ui';

interface ToastStore {
  toasts: Toast[];
  add: (toast: Omit<Toast, 'id'>) => void;
  remove: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  add: (toast) => {
    const id = Math.random().toString(36).slice(2);
    const full: Toast = { duration: 3200, ...toast, id };
    set((s) => ({ toasts: [...s.toasts, full] }));
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
    }, full.duration);
  },
  remove: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

export function useToast() {
  const { add } = useToastStore();
  return {
    success: (title: string, message?: string) => add({ type: 'success', title, message }),
    error:   (title: string, message?: string) => add({ type: 'error',   title, message, duration: 4200 }),
    info:    (title: string, message?: string) => add({ type: 'info',    title, message }),
  };
}
