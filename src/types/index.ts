// User and Authentication Types
export interface User {
  id?: string;
  employeeId?: string;
  userCode?: string;
  name?: string;
  email?: string;
  role?: string;
  branch?: string;
  department?: string;
  designation?: string;
  [key: string]: any;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

// Permission Types
export interface Permission {
  code?: string;
  permissionCode?: string;
  name?: string;
  description?: string;
  [key: string]: any;
}

// Role Types
export interface Role {
  roleCode: string;
  roleName: string;
  description?: string;
  isSystemRole?: boolean;
  isActive?: boolean;
  Role_Permission?: any[];
  [key: string]: any;
}

// User Access Types
export interface UserAccess {
  permissions: string[];
  userRole: string | null;
  role?: {
    code: string;
    [key: string]: any;
  };
  allowedBranches?: string[];
  dataAccess?: DataAccessEntry[];
}

export interface DataAccessEntry {
  regionCode?: string;
  clusterCode?: string;
  branchCode?: string;
  [key: string]: any;
}

// Hierarchy Types
export interface Region {
  regionCode: string;
  regionName: string;
  isActive?: boolean;
  [key: string]: any;
}

export interface Cluster {
  clusterCode: string;
  clusterName: string;
  regionCode: string;
  isActive?: boolean;
  [key: string]: any;
}

export interface Branch {
  branchCode: string;
  branchName: string;
  isActive?: boolean;
  [key: string]: any;
}

export interface HierarchyMapping {
  id?: number;
  branchCode: string;
  branchName?: string;
  mappingType: 'CLUSTER' | 'DIRECT_REGION';
  regionCode?: string;
  regionName?: string;
  clusterCode?: string;
  clusterName?: string;
  isActive?: boolean;
  [key: string]: any;
}

// API Response Types
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  statusCode?: number;
  status?: number;
}

// Menu Types
export interface MenuItem {
  key: string;
  path: string;
  menu: string;
  antIcon: string;
  right: string[];
  subMenus?: MenuItem[];
}
