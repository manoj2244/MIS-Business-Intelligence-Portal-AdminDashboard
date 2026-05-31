// API Configuration (.env driven)
export const API_URL =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  'http://localhost:8000/api/v1';

// Storage Keys (.env override supported)
export const ACCESS_TOKEN_KEY =
  import.meta.env.VITE_ACCESS_TOKEN_KEY || 'mis-business-jwt-token';
export const REFRESH_TOKEN_KEY =
  import.meta.env.VITE_REFRESH_TOKEN_KEY || 'mis-business-refresh-token';
export const USER_PROFILE_KEY =
  import.meta.env.VITE_USER_PROFILE_KEY || 'mis-business-user-profile';

// Auth Paths (backend endpoints)
export const AUTH_LOGIN_PATH =
  import.meta.env.VITE_AUTH_LOGIN_PATH || '/auth/login/ldap';
export const AUTH_REFRESH_PATH =
  import.meta.env.VITE_AUTH_REFRESH_PATH || '/auth/refresh';
export const AUTH_LOGOUT_PATH =
  import.meta.env.VITE_AUTH_LOGOUT_PATH || '/auth/logout';
export const AUTH_PROFILE_PATH =
  import.meta.env.VITE_AUTH_PROFILE_PATH || '/auth/profile';

export const SETTINGS_PATH =
  import.meta.env.VITE_SETTINGS_PATH || '/settings';

// Backward-compatible aliases
export const JWT_TOKEN = ACCESS_TOKEN_KEY;
export const REFRESH_TOKEN = REFRESH_TOKEN_KEY;
export const USER_PROFILE = USER_PROFILE_KEY;
export const LOCAL_LOGIN_URL = AUTH_LOGIN_PATH;
export const LOCAL_REFRESH_URL = AUTH_REFRESH_PATH;
export const LOCAL_LOGOUT_URL = AUTH_LOGOUT_PATH;
export const LOCAL_PROFILE_URL = AUTH_PROFILE_PATH;

// Form Layout
export const formItemLayout = {
  labelCol: { xs: 24, sm: 24, md: 10, lg: 8, xl: 8 },
  wrapperCol: { xs: 24, sm: 24, md: 14, lg: 16, xl: 16 },
  labelAlign: 'left' as const,
};

export const formItemProps = {
  wrapperCol: { xs: 24 },
  labelCol: { xs: 24 },
  labelAlign: 'left' as const,
  className: 'mb-md-3 mb-1',
};

// Validation Rules
export const requiredRules = [{ required: true, message: 'Required' }];
