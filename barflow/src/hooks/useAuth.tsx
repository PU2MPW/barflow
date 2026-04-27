import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useAuthStore } from '../store/authStore';
import type { User } from '../types';

interface AuthContextType {
  session: any;
  user: any;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, name: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_USERS = [
  { id: '1', email: 'admin@barflow.com', password: 'admin123', name: 'Administrador', role: 'admin' as const },
  { id: '2', email: 'gerente@barflow.com', password: 'gerente123', name: 'Gerente', role: 'manager' as const },
  { id: '3', email: 'garcom@barflow.com', password: 'garcom123', name: 'Garçom', role: 'waiter' as const },
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const { user, setUser, setLoading, isLoading } = useAuthStore();
  const [session, setSession] = useState<any>(null);
  const [loading, setLoadingState] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('barflow-demo-user');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      setUser(parsed);
      setSession({ user: parsed });
    }
    setLoading(false);
    setLoadingState(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    const foundUser = DEMO_USERS.find(u => u.email === email && u.password === password);
    
    if (!foundUser) {
      return { error: new Error('Credenciais inválidas') };
    }

    const userProfile: User = {
      id: foundUser.id,
      email: foundUser.email,
      name: foundUser.name,
      role: foundUser.role,
      company_id: '',
      created_at: new Date().toISOString(),
    };
    
    localStorage.setItem('barflow-demo-user', JSON.stringify(userProfile));
    setUser(userProfile);
    setSession({ user: userProfile });
    return { error: null };
  };

  const signUp = async (email: string, password: string, name: string) => {
    DEMO_USERS.push({
      id: String(DEMO_USERS.length + 1),
      email,
      password,
      name,
      role: 'manager',
    });
    return signIn(email, password);
  };

  const signOut = async () => {
    localStorage.removeItem('barflow-demo-user');
    setUser(null);
    setSession(null);
  };

  const resetPassword = async (_email: string) => {
    return { error: null };
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user ?? user,
        loading: loading || isLoading,
        signIn,
        signUp,
        signOut,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}