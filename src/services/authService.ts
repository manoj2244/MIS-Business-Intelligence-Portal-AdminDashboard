import { store, fetch } from '../utils/httpUtil';
import { AUTH_LOGIN_PATH, AUTH_LOGOUT_PATH, AUTH_PROFILE_PATH } from '../constants';
import {
  extractAuthPayload,
  setAuthSession,
  clearAuthSession,
  isAuthenticatedSession,
  getUserProfile,
} from '../utils/authUtil';
import type { LoginCredentials, AuthResponse, User } from '../types';

export const authService = {
  // LDAP Login
  loginLdap: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await store(AUTH_LOGIN_PATH, credentials);
    const { accessToken, refreshToken, user } = extractAuthPayload(response?.data);

    // Store tokens and user info in localStorage
    setAuthSession({ accessToken, refreshToken, user });

    // Fallback: if backend omits user in login response, fetch profile and persist it
    let resolvedUser = user;
    if (!resolvedUser && accessToken) {
      const profileRes = await fetch(AUTH_PROFILE_PATH);
      resolvedUser = profileRes?.data?.data || profileRes?.data || null;
      if (resolvedUser) {
        setAuthSession({ user: resolvedUser });
      }
    }

    return { user: (resolvedUser || {}) as User, accessToken, refreshToken };
  },

  // Logout
  logout: async (): Promise<void> => {
    try {
      await store(AUTH_LOGOUT_PATH, {});
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      clearAuthSession();
    }
  },

  // Get user profile
  getProfile: async (): Promise<User> => {
    const response = await fetch(AUTH_PROFILE_PATH);
    const profile = response?.data?.data || response?.data || null;
    if (profile) {
      setAuthSession({ user: profile });
    }
    return profile;
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    return isAuthenticatedSession();
  },

  // Get current user
  getCurrentUser: (): User | null => {
    return getUserProfile();
  },
};
