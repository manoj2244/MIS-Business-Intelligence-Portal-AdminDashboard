import { fetch, store, destroy, update } from '../utils/httpUtil';
import type { Role, UserAccess, Permission, DataAccessEntry } from '../types';

const baseUrl = '/rbac';

// Helper to extract data from various response structures
const extractPayload = (response: any): any =>
  response?.data?.data?.data ?? response?.data?.data ?? response?.data;

const normalizeDataAccessPayload = (payload: any): {
  regionCodes: string[];
  clusterCodes: string[];
  branchCodes: string[];
} => {
  if (Array.isArray(payload)) {
    const regionCodes = new Set<string>();
    const clusterCodes = new Set<string>();
    const branchCodes = new Set<string>();

    payload.forEach((entry: DataAccessEntry) => {
      if (entry?.regionCode) regionCodes.add(entry.regionCode);
      if (entry?.clusterCode) clusterCodes.add(entry.clusterCode);
      if (entry?.branchCode) branchCodes.add(entry.branchCode);
    });

    return {
      regionCodes: [...regionCodes],
      clusterCodes: [...clusterCodes],
      branchCodes: [...branchCodes],
    };
  }

  if (payload?.dataAccess && Array.isArray(payload.dataAccess)) {
    return normalizeDataAccessPayload(payload.dataAccess);
  }

  return {
    regionCodes: payload?.regionCodes || [],
    clusterCodes: payload?.clusterCodes || [],
    branchCodes: payload?.branchCodes || [],
  };
};

export const rbacApi = {
  // Role Management
  getRoles: async (): Promise<Role[]> => {
    const response = await fetch(`${baseUrl}/roles`);
    return extractPayload(response);
  },

  getRole: async (roleCode: string): Promise<Role> => {
    const response = await fetch(`${baseUrl}/roles/${roleCode}`);
    return extractPayload(response);
  },

  getRolePermissionConfig: async (roleCode: string): Promise<any> => {
    const response = await fetch(`${baseUrl}/roles/${roleCode}/permissions`);
    return extractPayload(response);
  },

  createRole: async (payload: Partial<Role>): Promise<Role> => {
    const response = await store(`${baseUrl}/roles`, payload);
    return extractPayload(response);
  },

  assignPermissionsToRole: async (
    roleCode: string,
    permissionCodes: string[]
  ): Promise<any> => {
    const response = await update(`${baseUrl}/roles/${roleCode}/permissions`, {
      permissionCodes,
    });
    return extractPayload(response);
  },

  getPermissionCatalog: async (): Promise<any> => {
    const response = await fetch(`${baseUrl}/permissions/catalog`);
    return extractPayload(response);
  },

  // Permission Management
  getPermissions: async (): Promise<Permission[]> => {
    const response = await fetch(`${baseUrl}/permissions`);
    return extractPayload(response);
  },

  // User Access Management
  assignRoleToUser: async (userCode: string, roleCode: string): Promise<any> => {
    const response = await store(`${baseUrl}/users/${userCode}/role`, {
      roleCode,
    });
    return extractPayload(response);
  },

  assignDataAccessToUser: async (userCode: string, dataAccess: any): Promise<any> => {
    const payload = normalizeDataAccessPayload(dataAccess);
    const response = await store(`${baseUrl}/users/${userCode}/access`, payload);
    return extractPayload(response);
  },

  getUserAccess: async (userCode: string): Promise<UserAccess> => {
    const response = await fetch(`${baseUrl}/users/${userCode}/access`);
    return extractPayload(response);
  },

  getMyAccess: async (userCode?: string): Promise<UserAccess> => {
    try {
      const response = await fetch(`${baseUrl}/users/me/access`);
      return extractPayload(response);
    } catch (error) {
      console.warn('Failed to fetch /me/access, falling back to userCode-based fetch:', error);
      if (userCode) {
        return await rbacApi.getUserAccess(userCode);
      }
      throw error;
    }
  },

  removeUserRole: async (userCode: string): Promise<any> => {
    const response = await destroy(`${baseUrl}/users/${userCode}/role`);
    return extractPayload(response);
  },

  removeUserDataAccess: async (userCode: string): Promise<any> => {
    const response = await destroy(`${baseUrl}/users/${userCode}/access`);
    return extractPayload(response);
  },

  // Get all users from hrms_users table
  getAllUsers: async (): Promise<any[]> => {
    const response = await fetch('/auth/users');
    const data = extractPayload(response);
    return Array.isArray(data) ? data : [];
  },

  // Cache Management
  clearUserCache: async (userCode: string): Promise<any> => {
    const response = await destroy(`${baseUrl}/cache/${userCode}`);
    return extractPayload(response);
  },

  clearAllCaches: async (): Promise<any> => {
    const response = await destroy(`${baseUrl}/cache/all`);
    return extractPayload(response);
  },
};
