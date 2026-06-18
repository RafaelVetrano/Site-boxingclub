import { create } from 'zustand';

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  qty: number;
  glyph?: string;
  image?: string | null;
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  open: () => void;
  close: () => void;
  setItems: (items: CartItem[]) => void;
  itemCount: () => number;
  total: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  setItems: (items) => set({ items }),
  itemCount: () => get().items.reduce((s, i) => s + i.qty, 0),
  total: () => get().items.reduce((s, i) => s + i.price * i.qty, 0),
}));
