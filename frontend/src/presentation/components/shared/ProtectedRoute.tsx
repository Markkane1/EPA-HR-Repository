import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthContext } from '../../contexts/AuthContext';

export const ProtectedRoute = ({ requireAdmin = false }: { requireAdmin?: boolean }) => {
  const { isAuthenticated, isAdmin } = useAuthContext();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};
