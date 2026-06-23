import { useMutation } from '@tanstack/react-query';
import { api } from './client';
import { useAuthStore } from '@/stores/authStore';
import type { AuthUser } from '@/stores/authStore';

interface LoginPayload { email: string; password: string }
interface LoginResponse { accessToken: string; user: AuthUser }

interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

interface PatchMePayload {
  firstName?: string;
  lastName?: string;
  avatar?: string | null;
}

export function useLogin() {
  const { setUser, setAccessToken } = useAuthStore();
  return useMutation({
    mutationFn: (payload: LoginPayload) =>
      api.post<LoginResponse>('/auth/login', payload).then((r) => r.data),
    onSuccess: (data) => {
      setAccessToken(data.accessToken);
      setUser(data.user);
    },
  });
}

export function useAdminLogin() {
  const { setUser, setAccessToken } = useAuthStore();
  return useMutation({
    mutationFn: (payload: LoginPayload) =>
      api.post<LoginResponse>('/auth/admin/login', payload).then((r) => r.data),
    onSuccess: (data) => {
      setAccessToken(data.accessToken);
      setUser(data.user);
    },
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: (payload: RegisterPayload) =>
      api.post('/auth/register', payload).then((r) => r.data),
  });
}

export function useLogout() {
  const { logout } = useAuthStore();
  return useMutation({
    mutationFn: () => api.post('/auth/logout').then((r) => r.data),
    onSettled: () => logout(),
  });
}

export function useVerifyEmail() {
  const { setUser, setAccessToken } = useAuthStore();
  return useMutation({
    mutationFn: (token: string) =>
      api.post<{ accessToken: string; user: AuthUser }>('/auth/verify-email', { token }).then((r) => r.data),
    onSuccess: (data) => {
      setAccessToken(data.accessToken);
      setUser(data.user);
    },
  });
}

export function useResendVerification() {
  return useMutation({
    mutationFn: (email: string) =>
      api.post('/auth/resend-verification', { email }).then((r) => r.data),
  });
}

export function useResendByToken() {
  return useMutation({
    mutationFn: (token: string) =>
      api.post('/auth/resend-by-token', { token }).then((r) => r.data),
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (email: string) =>
      api.post('/auth/forgot-password', { email }).then((r) => r.data),
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: ({ token, password }: { token: string; password: string }) =>
      api.post('/auth/reset-password', { token, password }).then((r) => r.data),
  });
}

export function usePatchMe() {
  const { setUser } = useAuthStore();
  return useMutation({
    mutationFn: (payload: PatchMePayload) =>
      api.patch<AuthUser>('/users/me', payload).then((r) => r.data),
    onSuccess: (data) => setUser(data),
  });
}
