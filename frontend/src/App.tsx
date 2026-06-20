import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MainLayout } from './presentation/layouts/MainLayout';
import { AuthLayout } from './presentation/layouts/AuthLayout';
import { DashboardPage } from './presentation/pages/DashboardPage';
import { EmployeeDirectoryPage } from './presentation/pages/EmployeeDirectoryPage';
import { EmployeeProfilePage } from './presentation/pages/EmployeeProfilePage';
import { OfficeListPage } from './presentation/pages/OfficeListPage';
import { OfficeDetailPage } from './presentation/pages/OfficeDetailPage';
import { LoginPage } from './presentation/pages/LoginPage';
import { UnauthorizedPage } from './presentation/pages/UnauthorizedPage';
import { RoleManagementPage } from './presentation/pages/RoleManagementPage';
import { UserManagementPage } from './presentation/pages/UserManagementPage';
import { AuthProvider } from './presentation/contexts/AuthContext';
import { ProtectedRoute } from './presentation/components/shared/ProtectedRoute';
import { ReportsPage } from './presentation/pages/ReportsPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Auth pages — wrapped in the SB Admin 2 split-panel layout */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
          </Route>

          {/* All authenticated routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/employees" element={<EmployeeDirectoryPage />} />
              <Route path="/employees/:id" element={<EmployeeProfilePage />} />
              <Route path="/offices" element={<OfficeListPage />} />
              <Route path="/offices/:id" element={<OfficeDetailPage />} />
              <Route path="/reports" element={<ReportsPage />} />

              {/* Settings section - permission protected */}
              <Route element={<ProtectedRoute requiredPermission="users.read" />}>
                <Route path="/settings/users" element={<UserManagementPage />} />
              </Route>
              <Route element={<ProtectedRoute requiredPermission="roles.write" />}>
                <Route path="/settings/roles" element={<RoleManagementPage />} />
              </Route>
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
