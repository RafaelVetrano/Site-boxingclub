import { create } from 'zustand';

export interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'USER' | 'ADMIN';
  avatar?: string | null;
  emailVerified: boolean;
}

interface AuthStore {
  user: AuthUser | null;
  isLoading: boolean;
  accessToken: string | null;
  setUser: (user: AuthUser | null) => void;
  setAccessToken: (token: string | null) => void;
  setLoading: (v: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isLoading: true,
  accessToken: null,
  setUser: (user) => set({ user, isLoading: false }),
  setAccessToken: (accessToken) => set({ accessToken }),
  setLoading: (isLoading) => set({ isLoading }),
  logout: () => set({ user: null, accessToken: null, isLoading: false }),
}));
