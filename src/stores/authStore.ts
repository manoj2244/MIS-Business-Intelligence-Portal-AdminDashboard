import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, UserAccess } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  permissions: string[];
  userRole: string | null;
  allowedBranches: string[];
  
  // Actions
  setAuth: (data: { user: User; accessToken: string; refreshToken: string }) => void;
  setUserAccess: (data: Partial<UserAccess> & { role?: { code: string } }) => void;
  updateUser: (user: User) => void;
  logout: () => void;
  
  // Getters
  getToken: () => string | null;
  getUser: () => User | null;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
}

const normalizePermissionCodes = (permissions: any): string[] => {
  if (!Array.isArray(permissions)) return [];
  return permissions
    .map((permission) => {
      if (typeof permission === 'string') return permission;
      if (permission && typeof permission.code === 'string') return permission.code;
      if (permission && typeof permission.permissionCode === 'string') {
        return permission.permissionCode;
      }
      return null;
    })
    .filter(Boolean) as string[];
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      permissions: [],
      userRole: null,
      allowedBranches: [],

      setAuth: ({ user, accessToken, refreshToken }) =>
        set({
          user,
          token: accessToken,
          refreshToken,
          isAuthenticated: true,
        }),

      setUserAccess: ({ permissions, userRole, role, allowedBranches }) =>
        set({
          permissions: normalizePermissionCodes(permissions),
          userRole: userRole || role?.code || null,
          allowedBranches: allowedBranches || [],
        }),

      updateUser: (user) =>
        set({
          user,
        }),

      logout: () =>
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
          permissions: [],
          userRole: null,
          allowedBranches: [],
        }),

      getToken: () => get().token,
      getUser: () => get().user,
      hasPermission: (permission) => get().permissions.includes(permission),
      hasAnyPermission: (permissions) =>
        permissions.some((p) => get().permissions.includes(p)),
      hasAllPermissions: (permissions) =>
        permissions.every((p) => get().permissions.includes(p)),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
        permissions: state.permissions,
        userRole: state.userRole,
        allowedBranches: state.allowedBranches,
      }),
    }
  )
);
