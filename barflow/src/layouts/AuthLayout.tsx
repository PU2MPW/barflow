import { Outlet, Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useAuth } from '../hooks/useAuth';

export function AuthLayout() {
  const { isAuthenticated, isLoading } = useAuthStore();
  const { loading } = useAuth();

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-bar-dark flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/pdv" replace />;
  }

  return <Outlet />;
}