import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { authService } from '../services/authService';
import { hasRoleAccess } from '../config/rbac';
import { useAuthStore } from '../stores/authStore';
import AdminLayout from '../layout/AdminLayout';

type ProtectedRouteProps = {
  allowedRoles?: string[];
  redirectTo?: string;
};

export default function ProtectedRoute({
  allowedRoles,
  redirectTo = '/login',
}: ProtectedRouteProps) {
  const location = useLocation();
  const isAuthenticated = authService.isAuthenticated();
  const userRole = useAuthStore((state) => state.userRole);
  const fallbackRole = authService.getCurrentUser()?.role;

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  if (allowedRoles && !hasRoleAccess(userRole || fallbackRole, allowedRoles)) {
    return <Navigate to="/403" replace />;
  }

  return <AdminLayout />;
}
