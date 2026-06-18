import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import { AdminLayout } from './layouts/AdminLayout';
import { AuthLayout } from './layouts/AuthLayout';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { DashboardHome } from './pages/admin/DashboardHome';
import { OfficeList } from './pages/admin/offices/OfficeList';
import { OfficeDetail } from './pages/admin/offices/OfficeDetail';

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Default Redirect for now */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* Auth Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<DashboardHome />} />
          <Route path="offices" element={<OfficeList />} />
          <Route path="offices/:id" element={<OfficeDetail />} />
        </Route>
      </Routes>
    </Router>
  );
}
