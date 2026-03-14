import type { User } from '../types';
import {
  getAccessToken,
  getRefreshToken,
  getUserProfile,
  setAccessToken,
  setRefreshToken,
  setUserProfile,
  clearAuthSession as clearStorage,
} from './storageUtil';

export const isAuthenticatedSession = (): boolean => {
  const token = getAccessToken();
  return !!token;
};

export const getAuthUser = (): User | null => {
  return getUserProfile();
};

export const getAuthRole = (): string | null => {
  const user = getUserProfile();
  return user?.role || null;
};

export const extractAuthPayload = (
  response: any
): { accessToken: string; refreshToken: string; user: User } => {
  const data = response?.data || response;
  
  return {
    accessToken: data?.accessToken || data?.access_token || '',
    refreshToken: data?.refreshToken || data?.refresh_token || '',
    user: data?.user || null,
  };
};

export const setAuthSession = ({
  accessToken,
  refreshToken,
  user,
}: {
  accessToken?: string;
  refreshToken?: string;
  user?: User;
}): void => {
  if (accessToken) {
    setAccessToken(accessToken);
  }
  if (refreshToken) {
    setRefreshToken(refreshToken);
  }
  if (user) {
    setUserProfile(user);
  }
};

export const clearAuthSession = (): void => {
  clearStorage();
};

export const getLoginRedirectPath = (): string => {
  const urlParams = new URLSearchParams(window.location.search);
  const redirect = urlParams.get('redirect');
  return redirect || '/dashboard';
};

export { getAccessToken, getRefreshToken, getUserProfile };
