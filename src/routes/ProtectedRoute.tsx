import { Navigate, Outlet } from 'react-router-dom'
import { authService } from '../services/authService'
import { hasRoleAccess } from '../config/rbac'

type ProtectedRouteProps = {
  allowedRoles?: string[]
  redirectTo?: string
}

export default function ProtectedRoute({
  allowedRoles,
  redirectTo = '/login',
}: ProtectedRouteProps) {
  const isAuthenticated = authService.isAuthenticated()
  const user = authService.getCurrentUser()

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />
  }

  if (allowedRoles && !hasRoleAccess(user?.role, allowedRoles)) {
    return <Navigate to={redirectTo} replace />
  }

  return <Outlet />
}
