import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import { AuthLayout } from './layouts/AuthLayout';
import { ProtectedLayout } from './layouts/ProtectedLayout';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { PDVPage } from './pages/PDVPage';
import { DashboardPage } from './pages/DashboardPage';
import { AdvancedDashboardPage } from './pages/AdvancedDashboardPage';
import { TablesPage } from './pages/TablesPage';
import { KDSPage } from './pages/KDSPage';
import { MenuPage } from './pages/MenuPage';
import { CustomersPage } from './pages/CustomersPage';
import { TabsPage } from './pages/TabsPage';
import { SyncSettingsPage } from './pages/SyncSettingsPage';
import { DeliveryPage } from './pages/DeliveryPage';
import { MultiCompanyPage } from './pages/MultiCompanyPage';
import { OfflineIndicator } from './hooks/useOffline';
import { Toaster } from 'sonner';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster 
          position="top-right" 
          toastOptions={{
            style: {
              background: '#1F2937',
              color: '#fff',
              border: '1px solid #374151',
            },
          }}
        />
        <OfflineIndicator />
        <Routes>
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>

          <Route element={<ProtectedLayout />}>
            <Route path="/pdv" element={<PDVPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/dashboard/advanced" element={<AdvancedDashboardPage />} />
            <Route path="/tables" element={<TablesPage />} />
            <Route path="/kds" element={<KDSPage />} />
            <Route path="/menu" element={<MenuPage />} />
            <Route path="/customers" element={<CustomersPage />} />
            <Route path="/delivery" element={<DeliveryPage />} />
            <Route path="/tabs" element={<TabsPage />} />
            <Route path="/inventory" element={<DashboardPage />} />
            <Route path="/reservations" element={<DashboardPage />} />
            <Route path="/digital-menu" element={<DashboardPage />} />
            <Route path="/companies" element={<MultiCompanyPage />} />
            <Route path="/settings" element={<SyncSettingsPage />} />
            <Route path="/" element={<Navigate to="/pdv" replace />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;