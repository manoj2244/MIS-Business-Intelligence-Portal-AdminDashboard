import { Navigate, Outlet } from 'react-router-dom'
import { authService } from '../services/authService'

type PublicRouteProps = {
  redirectTo?: string
}

export default function PublicRoute({ redirectTo = '/dashboard' }: PublicRouteProps) {
  const isAuthenticated = authService.isAuthenticated()

  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />
  }

  return <Outlet />
}
