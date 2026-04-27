import { useEffect } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useAuth } from '../hooks/useAuth';
import { AppLayout } from './AppLayout';
import { useCompanyStore } from '../store/companyStore';
import { useTabsStore } from '../store/tabsStore';

export function ProtectedLayout() {
  const { isAuthenticated, isLoading } = useAuthStore();
  const { loading } = useAuth();
  const { synced, loading: companyLoading, syncFromSupabase } = useCompanyStore();
  const { syncFromSupabase: syncTabs } = useTabsStore();

  useEffect(() => {
    if (isAuthenticated && !synced && !companyLoading) {
      syncFromSupabase();
      syncTabs();
    }
  }, [isAuthenticated, synced, companyLoading, syncFromSupabase, syncTabs]);

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-bar-dark flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
}