import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, USER_PROFILE_KEY } from '../constants';
import type { User } from '../types';

export const setLocalStorage = (key: string, value: any): void => {
  try {
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
    localStorage.setItem(key, stringValue);
  } catch (error) {
    console.error('Error setting localStorage:', error);
  }
};

export const getLocalStorage = (key: string): string | null => {
  try {
    return localStorage.getItem(key);
  } catch (error) {
    console.error('Error getting localStorage:', error);
    return null;
  }
};

export const removeLocalStorage = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Error removing localStorage:', error);
  }
};

export const clearLocalStorage = (): void => {
  try {
    localStorage.clear();
  } catch (error) {
    console.error('Error clearing localStorage:', error);
  }
};

// Auth-specific storage utilities
export const getAccessToken = (): string | null => {
  return getLocalStorage(ACCESS_TOKEN_KEY);
};

export const setAccessToken = (token: string): void => {
  setLocalStorage(ACCESS_TOKEN_KEY, token);
};

export const getRefreshToken = (): string | null => {
  return getLocalStorage(REFRESH_TOKEN_KEY);
};

export const setRefreshToken = (token: string): void => {
  setLocalStorage(REFRESH_TOKEN_KEY, token);
};

export const getUserProfile = (): User | null => {
  const profile = getLocalStorage(USER_PROFILE_KEY);
  if (!profile) return null;
  try {
    return JSON.parse(profile);
  } catch {
    return null;
  }
};

export const setUserProfile = (user: User): void => {
  setLocalStorage(USER_PROFILE_KEY, user);
};

export const clearAuthSession = (): void => {
  removeLocalStorage(ACCESS_TOKEN_KEY);
  removeLocalStorage(REFRESH_TOKEN_KEY);
  removeLocalStorage(USER_PROFILE_KEY);
};
