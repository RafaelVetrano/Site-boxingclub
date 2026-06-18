import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from './client';
import { useCartStore } from '@/stores/cartStore';

// ── Types ────────────────────────────────────────────────────────

export interface Plan {
  id: string;
  name: string;
  price: number;
  originalPrice?: number | null;
  period: string;
  cycleMonths: number;
  tagline: string;
  features: string[];
  accent: string;
  highlight: boolean;
  badge?: string | null;
  active: boolean;
}

export interface ClassCategory {
  id: string;
  label: string;
  color: string;
}

export interface ClassSchedule {
  id: string;
  day: number;
  time: string;
  categoryId: string;
  teacher: string;
  notes: string;
  category: ClassCategory;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  images: string[];
  glyph: string;
  active: boolean;
  createdAt: string;
}

export interface CartItemServer {
  productId: string;
  name: string;
  price: number;
  qty: number;
  stock: number;
  glyph: string;
  image: string | null;
}

export interface CartResponse {
  items: CartItemServer[];
  subtotal: number;
}

export interface OrderItem {
  id: string;
  productId: string | null;
  name: string;
  price: number;
  qty: number;
  glyph: string | null;
  image: string | null;
}

export interface StatusHistoryEntry {
  status: string;
  at: string;
  note: string | null;
}

export interface Order {
  id: string;
  number: number;
  userId: string;
  total: number;
  paymentMethod: string;
  status: string;
  statusReason: string | null;
  statusHistory: StatusHistoryEntry[];
  mpPreferenceId: string | null;
  mpPaymentId: string | null;
  date: string;
  deliveredAt: string | null;
  items: OrderItem[];
  initPoint?: string | null;
  sandboxInitPoint?: string | null;
}

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  status: 'PENDING' | 'ACTIVE' | 'CANCELLED' | 'PAUSED' | 'EXPIRED';
  startDate: string;
  nextBilling: string;
  cancelledAt: string | null;
  mpPreapprovalId: string | null;
  plan: Plan;
}

// ── Hooks ─────────────────────────────────────────────────────────

export function usePlans() {
  return useQuery<Plan[]>({
    queryKey: ['plans'],
    queryFn: () => api.get('/plans').then((r) => r.data),
  });
}

export function useSchedule() {
  return useQuery<ClassSchedule[]>({
    queryKey: ['schedule'],
    queryFn: () => api.get('/schedule').then((r) => r.data),
    staleTime: 0,
  });
}

export function useCategories() {
  return useQuery<ClassCategory[]>({
    queryKey: ['categories'],
    queryFn: () => api.get('/categories').then((r) => r.data),
    staleTime: 0,
  });
}

export interface ProductFilters {
  search?: string;
  category?: string;
}

export function useProducts(filters?: ProductFilters) {
  return useQuery<Product[]>({
    queryKey: ['products', filters],
    queryFn: () =>
      api.get('/products', { params: filters }).then((r) => {
        const d = r.data;
        return Array.isArray(d) ? d : d.data ?? [];
      }),
  });
}

// ── Cart hooks ────────────────────────────────────────────────────

export function useCart(enabled = true) {
  return useQuery<CartResponse>({
    queryKey: ['cart'],
    queryFn: () => api.get('/cart').then((r) => r.data),
    enabled,
    staleTime: 30_000,
  });
}

export function useAddToCart() {
  const { setItems } = useCartStore();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ product, qty = 1 }: { product: Product; qty?: number }) => {
      await api.post('/cart/items', { productId: product.id, qty });
    },
    onMutate: ({ product, qty = 1 }) => {
      const current = useCartStore.getState().items;
      const existing = current.find((i) => i.productId === product.id);
      const optimistic = existing
        ? current.map((i) => (i.productId === product.id ? { ...i, qty: i.qty + qty } : i))
        : [
            ...current,
            {
              productId: product.id,
              name: product.name,
              price: Number(product.price),
              qty,
              glyph: product.glyph,
              image: product.images?.[0] ?? null,
            },
          ];
      setItems(optimistic);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cart'] });
    },
    onError: () => {
      qc.invalidateQueries({ queryKey: ['cart'] });
    },
  });
}

export function useUpdateCartItem() {
  const { setItems } = useCartStore();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, qty }: { productId: string; qty: number }) => {
      if (qty <= 0) return api.delete(`/cart/items/${productId}`);
      return api.patch(`/cart/items/${productId}`, { qty });
    },
    onMutate: ({ productId, qty }) => {
      const current = useCartStore.getState().items;
      if (qty <= 0) {
        setItems(current.filter((i) => i.productId !== productId));
      } else {
        setItems(current.map((i) => (i.productId === productId ? { ...i, qty } : i)));
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cart'] });
    },
  });
}

export function useRemoveCartItem() {
  const { setItems } = useCartStore();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) => api.delete(`/cart/items/${productId}`),
    onMutate: (productId) => {
      const current = useCartStore.getState().items;
      setItems(current.filter((i) => i.productId !== productId));
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cart'] });
    },
  });
}

export function useClearCart() {
  const { setItems } = useCartStore();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: () => api.delete('/cart'),
    onMutate: () => setItems([]),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cart'] });
    },
  });
}

// ── Order hooks ───────────────────────────────────────────────────

export function useCreateOrder() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: () => api.post<Order>('/orders').then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['orders', 'me'] });
      qc.invalidateQueries({ queryKey: ['cart'] });
    },
  });
}

export function useMyOrders() {
  return useQuery<Order[]>({
    queryKey: ['orders', 'me'],
    queryFn: () => api.get('/orders/me').then((r) => r.data),
  });
}

export function useMyOrder(id: string) {
  return useQuery<Order>({
    queryKey: ['orders', 'me', id],
    queryFn: () => api.get(`/orders/me/${id}`).then((r) => r.data),
    enabled: !!id,
  });
}

// ── Subscription hooks ────────────────────────────────────────────

export function useMySubscription() {
  return useQuery<Subscription | null>({
    queryKey: ['subscriptions', 'me'],
    queryFn: () => api.get('/subscriptions/me').then((r) => r.data),
  });
}

export function useCreateSubscription() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (planId: string) =>
      api.post<{ subscriptionId: string; initPoint: string }>('/subscriptions', { planId }).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['subscriptions', 'me'] });
    },
  });
}

export function useCancelSubscription() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.delete('/subscriptions/me').then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['subscriptions', 'me'] });
    },
  });
}
