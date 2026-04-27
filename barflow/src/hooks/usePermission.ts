import { useAuthStore } from '../store/authStore';

export function usePermission() {
  const { user } = useAuthStore();

  const hasRole = (roles: string[]) => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  const isAdmin = () => hasRole(['admin']);
  const isManager = () => hasRole(['admin', 'manager']);
  const isWaiter = () => hasRole(['admin', 'manager', 'waiter']);
  const isKitchen = () => hasRole(['admin', 'manager', 'kitchen']);
  const isDelivery = () => hasRole(['admin', 'manager', 'delivery']);

  const canViewReports = isManager();
  const canManageMenu = isManager();
  const canManageTables = isManager();
  const canProcessPayments = hasRole(['admin', 'manager', 'waiter']);
  const canManageEmployees = isAdmin();
  const canManageSettings = isAdmin();
  const canVoidOrders = isManager();

  return {
    user,
    hasRole,
    isAdmin,
    isManager,
    isWaiter,
    isKitchen,
    isDelivery,
    canViewReports,
    canManageMenu,
    canManageTables,
    canProcessPayments,
    canManageEmployees,
    canManageSettings,
    canVoidOrders,
  };
}