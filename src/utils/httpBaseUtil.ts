import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { API_URL, AUTH_REFRESH_PATH } from '../constants';
import {
  getAccessToken,
  getRefreshToken,
  extractAuthPayload,
  setAuthSession,
  clearAuthSession,
} from './authUtil';
import { useAuthStore } from '../stores/authStore';

const AUTH_FREE_ROUTES = ['/auth/login', '/auth/login/ldap', '/auth/refresh'];

const isAuthFreeRoute = (url = ''): boolean =>
  AUTH_FREE_ROUTES.some((path) => url.includes(path));

const createHttpClient = (config: AxiosRequestConfig = {}): AxiosInstance =>
  axios.create({
    baseURL: API_URL,
    headers: { Accept: '*/*' },
    ...config,
  });

const normalizeBaseUrl = (url = ''): string => url.replace(/\/$/, '');

const apiClient = createHttpClient();
const fileClient = createHttpClient({ responseType: 'blob' });
const uploadClient = createHttpClient({
  headers: {
    Accept: '*/*',
    'Content-Type': 'multipart/form-data',
    Connection: 'keep-alive',
  },
});

const attachBearerToken = (config: any): any => {
  const token = getAccessToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

[apiClient, fileClient, uploadClient].forEach((client) => {
  client.interceptors.request.use((config: any) => {
    if (config?.skipAuth || isAuthFreeRoute(config?.url || '')) {
      return config;
    }
    return attachBearerToken(config);
  });
});

let isRefreshing = false;
let refreshSubscribers: Array<(error: any, token?: string) => void> = [];

const subscribeToRefresh = (callback: (error: any, token?: string) => void): void => {
  refreshSubscribers.push(callback);
};

const flushRefreshSubscribers = (error: any, token: string | null = null): void => {
  refreshSubscribers.forEach((callback) => callback(error, token || undefined));
  refreshSubscribers = [];
};

const waitForRefreshToken = (): Promise<string> =>
  new Promise((resolve, reject) => {
    subscribeToRefresh((error, token) => {
      if (error || !token) {
        reject(error || new Error('Unable to refresh session'));
        return;
      }
      resolve(token);
    });
  });

const refreshSession = async (): Promise<string> => {
  const currentRefreshToken = getRefreshToken();
  const currentAccessToken = getAccessToken();
  if (!currentRefreshToken) {
    throw new Error('Refresh token is missing');
  }

  const refreshHeaders: any = { Accept: '*/*' };
  if (currentAccessToken) {
    refreshHeaders.Authorization = `Bearer ${currentAccessToken}`;
  }

  const response = await axios.post(
    `${normalizeBaseUrl(API_URL)}${AUTH_REFRESH_PATH}`,
    { refreshToken: currentRefreshToken },
    { headers: refreshHeaders }
  );

  const { accessToken, refreshToken, user } = extractAuthPayload(response?.data);
  if (!accessToken) {
    throw new Error('Access token missing from refresh response');
  }

  setAuthSession({
    accessToken,
    refreshToken: refreshToken || currentRefreshToken,
    user,
  });

  return accessToken;
};

const redirectToLogin = (): void => {
  clearAuthSession();
  useAuthStore.getState().logout();
  window.location.href = '/login';
};

const bindRefreshInterceptor = (client: AxiosInstance): number =>
  client.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error?.config;

      if (
        !error?.response ||
        error.response.status !== 401 ||
        !originalRequest ||
        originalRequest._retry ||
        originalRequest?.skipAuth ||
        isAuthFreeRoute(originalRequest?.url || '')
      ) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      if (isRefreshing) {
        try {
          const token = await waitForRefreshToken();
          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return client(originalRequest);
        } catch (refreshError) {
          return Promise.reject(refreshError);
        }
      }

      isRefreshing = true;

      try {
        const newAccessToken = await refreshSession();
        flushRefreshSubscribers(null, newAccessToken);
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return client(originalRequest);
      } catch (refreshError) {
        flushRefreshSubscribers(refreshError, null);
        redirectToLogin();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
  );

[apiClient, fileClient, uploadClient].forEach(bindRefreshInterceptor);

export const httpBaseUtils = (isDownload = false): AxiosInstance => {
  return isDownload ? fileClient : apiClient;
};

export const httpBaseUploadUtils = (): AxiosInstance => uploadClient;
