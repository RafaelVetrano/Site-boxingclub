import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from './client';
import type { Order, ClassSchedule, ClassCategory, Product } from './hooks';

// ── Types ─────────────────────────────────────────────────────────

export interface AdminUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'USER' | 'ADMIN';
  avatar?: string | null;
  emailVerified: boolean;
  createdAt: string;
  subscription?: {
    status: string;
    plan: { name: string };
  } | null;
}

export interface AdminUserDetail extends AdminUser {
  orders: Order[];
  subscription?: {
    id: string;
    status: string;
    startDate: string;
    nextBilling: string;
    plan: { name: string };
  } | null;
}

export interface AdminStats {
  totalUsers: number;
  revenue: number;
  activeSchedule: number;
  activeProducts: number;
  activeSubscriptions: number;
  recentOrders: Order[];
  recentUsers: AdminUser[];
}

export interface AdminUsersResponse {
  data: AdminUser[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface AdminOrdersResponse {
  data: Array<Order & { user: { id: string; firstName: string; lastName: string; email: string } | null }>;
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface AdminOrderFilters {
  status?: string;
  paymentMethod?: string;
  from?: string;
  to?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface AdminUsersFilters {
  search?: string;
  role?: 'USER' | 'ADMIN';
  page?: number;
  limit?: number;
}

// ── Stats ─────────────────────────────────────────────────────────

export function useAdminStats() {
  return useQuery<AdminStats>({
    queryKey: ['admin', 'stats'],
    queryFn: () => api.get('/admin/stats').then((r) => r.data),
    refetchInterval: 30_000,
  });
}

// ── Users ─────────────────────────────────────────────────────────

export function useAdminUsers(filters?: AdminUsersFilters) {
  return useQuery<AdminUsersResponse>({
    queryKey: ['admin', 'users', filters],
    queryFn: () => api.get('/admin/users', { params: filters }).then((r) => r.data),
  });
}

export function useAdminUser(id: string) {
  return useQuery<AdminUserDetail>({
    queryKey: ['admin', 'users', id],
    queryFn: () => api.get(`/admin/users/${id}`).then((r) => r.data),
    enabled: !!id,
  });
}

export function useUpdateUserRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, role }: { id: string; role: 'USER' | 'ADMIN' }) =>
      api.patch(`/admin/users/${id}/role`, { role }).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/admin/users/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
}

// ── Orders (admin) ─────────────────────────────────────────────────

export function useAdminOrders(filters?: AdminOrderFilters) {
  return useQuery<AdminOrdersResponse>({
    queryKey: ['admin', 'orders', filters],
    queryFn: () => api.get('/orders', { params: filters }).then((r) => r.data),
  });
}

export function useUpdateOrderStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, note }: { id: string; status: string; note?: string }) =>
      api.patch(`/orders/${id}/status`, { status, note }).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'orders'] });
      qc.invalidateQueries({ queryKey: ['admin', 'stats'] });
    },
  });
}

// ── Schedule CRUD ─────────────────────────────────────────────────

export function useCreateSchedule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { day: number; time: string; categoryId: string; teacher?: string; notes?: string }) =>
      api.post<ClassSchedule>('/schedule', data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['schedule'] });
    },
  });
}

export function useUpdateSchedule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; day?: number; time?: string; categoryId?: string; teacher?: string; notes?: string }) =>
      api.patch<ClassSchedule>(`/schedule/${id}`, data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['schedule'] });
    },
  });
}

export function useDeleteSchedule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/schedule/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['schedule'] });
    },
  });
}

// ── Categories CRUD ───────────────────────────────────────────────

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { id?: string; label: string; color: string }) =>
      api.post<ClassCategory>('/categories', data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; label?: string; color?: string }) =>
      api.patch<ClassCategory>(`/categories/${id}`, data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/categories/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

// ── Products CRUD (admin) ─────────────────────────────────────────

export function useAdminCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (formData: FormData) =>
      api.post<Product>('/products', formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useAdminUpdateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, formData }: { id: string; formData: FormData }) =>
      api.patch<Product>(`/products/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useAdminDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/products/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] });
    },
  });
}
