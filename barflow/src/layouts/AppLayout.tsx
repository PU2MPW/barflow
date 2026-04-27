import { type ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useAuthStore } from '../store/authStore';
import {
  ShoppingCart,
  UtensilsCrossed,
  Table2,
  Truck,
  Users,
  Package,
  Receipt,
  CalendarClock,
  BarChart3,
  Settings,
  LogOut,
  ChefHat,
  QrCode,
  ChevronLeft,
  Menu,
  Building2,
  TrendingUp,
} from 'lucide-react';
import { useState } from 'react';

interface LayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: LayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { user } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    { path: '/pdv', icon: ShoppingCart, label: 'PDV', roles: ['admin', 'manager', 'waiter'] },
    { path: '/menu', icon: UtensilsCrossed, label: 'Cardápio', roles: ['admin', 'manager'] },
    { path: '/tables', icon: Table2, label: 'Mesas', roles: ['admin', 'manager', 'waiter'] },
    { path: '/kds', icon: ChefHat, label: 'Cozinha', roles: ['admin', 'manager', 'kitchen'] },
    { path: '/delivery', icon: Truck, label: 'Delivery', roles: ['admin', 'manager', 'delivery'] },
    { path: '/tabs', icon: Receipt, label: 'Comandas', roles: ['admin', 'manager', 'waiter'] },
    { path: '/customers', icon: Users, label: 'Clientes', roles: ['admin', 'manager'] },
    { path: '/inventory', icon: Package, label: 'Estoque', roles: ['admin', 'manager'] },
    { path: '/reservations', icon: CalendarClock, label: 'Reservas', roles: ['admin', 'manager', 'waiter'] },
    { path: '/digital-menu', icon: QrCode, label: 'Cardápio Digital', roles: ['admin', 'manager'] },
    { path: '/dashboard', icon: BarChart3, label: 'Dashboard', roles: ['admin', 'manager'] },
    { path: '/dashboard/advanced', icon: TrendingUp, label: 'BI Analytics', roles: ['admin', 'manager'] },
    { path: '/companies', icon: Building2, label: 'Unidades', roles: ['admin'] },
    { path: '/settings', icon: Settings, label: 'Configurações', roles: ['admin'] },
  ];

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-bar-dark">
      <aside
        className={`bg-bar-darker border-r border-gray-800 transition-all duration-300 flex flex-col ${
          collapsed ? 'w-16' : 'w-64'
        }`}
      >
        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
          {!collapsed && (
            <h1 className="text-xl font-bold text-primary-500">BarFlow</h1>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
          >
            {collapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-2">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              const canAccess = item.roles.includes(user?.role || '');

              if (!canAccess) return null;

              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-primary-500/20 text-primary-500'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800'
                    }`}
                  >
                    <item.icon size={20} />
                    {!collapsed && <span className="font-medium">{item.label}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-gray-800">
          <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'}`}>
            <div className="w-10 h-10 rounded-full bg-primary-500/20 flex items-center justify-center">
              <span className="text-primary-500 font-semibold">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
              </div>
            )}
          </div>
          <button
            onClick={handleLogout}
            className={`mt-3 w-full flex items-center gap-3 px-3 py-2 text-gray-400 hover:text-red-400 hover:bg-gray-800 rounded-lg transition-colors ${
              collapsed ? 'justify-center' : ''
            }`}
          >
            <LogOut size={20} />
            {!collapsed && <span>Sair</span>}
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-hidden">{children}</main>
    </div>
  );
}