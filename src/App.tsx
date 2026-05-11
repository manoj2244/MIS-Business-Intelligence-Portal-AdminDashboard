import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './routes/ProtectedRoute';
import PublicRoute from './routes/PublicRoute';
import { rbac } from './config/rbac';
import NotFound from './pages/NotFound';
import NavigationHandler from './routes/NavigationHandler';
import Unauthorized from './pages/Unauthorized';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import RoleManagement from './pages/rbac/RoleManagement';
import RolePermissions from './pages/rbac/RolePermissions';
import UserAccessManagement from './pages/rbac/UserAccessManagement';
import UserDebugInfo from './pages/rbac/UserDebugInfo';
import Users from './pages/users/Users';
import HierarchyManager from './pages/organization/HierarchyManager';
import FinancialAccountMapping from './pages/organization/FinancialAccountMapping';
import Settings from './pages/settings/Settings';
import LoanManagement from './pages/loan/LoanManagement';

export default function App() {
  return (
<BrowserRouter basename="/admin">
      <NavigationHandler />
      <Routes>
        <Route element={<PublicRoute />}>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={rbac.dashboard} />}>
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={rbac.users} />}>
          <Route path="/user-management/users" element={<Users />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={rbac.roleManagement} />}>
          <Route path="/rbac/role-management" element={<RoleManagement />} />
          <Route
            path="/rbac/role-management/:roleCode/permissions"
            element={<RolePermissions />}
          />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={rbac.userAccess} />}>
          <Route path="/rbac/user-access" element={<UserAccessManagement />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={rbac.debug} />}>
          <Route path="/rbac/debug" element={<UserDebugInfo />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={rbac.hierarchyManager} />}>
          <Route
            path="/organization-setup/hierarchy-manager"
            element={<HierarchyManager />}
          />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={rbac.financialAccountMapping} />}>
          <Route
            path="/organization-setup/financial-account-mapping"
            element={<FinancialAccountMapping />}
          />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={rbac.loanManagement} />}>
          <Route path="/loan-management" element={<LoanManagement />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={rbac.settings} />}>
          <Route path="/settings" element={<Settings />} />
        </Route>

        <Route path="/403" element={<Unauthorized />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
