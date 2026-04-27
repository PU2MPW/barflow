import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, UserRole } from '../types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
  hasPermission: (requiredRoles: UserRole[]) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,

      setUser: (user) => set({ 
        user, 
        isAuthenticated: !!user 
      }),

      setLoading: (isLoading) => set({ isLoading }),

      logout: () => set({ 
        user: null, 
        isAuthenticated: false 
      }),

      hasPermission: (requiredRoles: UserRole[]) => {
        const user = get().user;
        if (!user) return false;
        if (user.role === 'admin') return true;
        return requiredRoles.includes(user.role);
      },
    }),
    {
      name: 'barflow-auth',
    }
  )
);