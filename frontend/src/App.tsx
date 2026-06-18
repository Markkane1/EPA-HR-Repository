import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MainLayout } from './presentation/layouts/MainLayout';
import { DashboardPage } from './presentation/pages/DashboardPage';
import { EmployeeDirectoryPage } from './presentation/pages/EmployeeDirectoryPage';
import { EmployeeProfilePage } from './presentation/pages/EmployeeProfilePage';
import { OfficeListPage } from './presentation/pages/OfficeListPage';
import { OfficeDetailPage } from './presentation/pages/OfficeDetailPage';
import { RecordTransferPage } from './presentation/pages/RecordTransferPage';
import { RecordAttachmentPage } from './presentation/pages/RecordAttachmentPage';
import { LoginPage } from './presentation/pages/LoginPage';
import { UnauthorizedPage } from './presentation/pages/UnauthorizedPage';
import { AuthProvider } from './presentation/contexts/AuthContext';
import { ProtectedRoute } from './presentation/components/shared/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/employees" element={<EmployeeDirectoryPage />} />
              <Route path="/employees/:id" element={<EmployeeProfilePage />} />
              <Route path="/offices" element={<OfficeListPage />} />
              <Route path="/offices/:id" element={<OfficeDetailPage />} />
              
              <Route element={<ProtectedRoute requireAdmin={true} />}>
                <Route path="/transfers/new" element={<RecordTransferPage />} />
                <Route path="/attachments/new" element={<RecordAttachmentPage />} />
              </Route>
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
