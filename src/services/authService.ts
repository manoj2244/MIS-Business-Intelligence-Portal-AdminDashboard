// src/services/authService.ts

import axiosInstance from '../lib/axios';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    employeeId: string;
    name: string;
    email: string;
    role: string;
    branch: string;
    department: string;
    designation: string;
  };
  accessToken: string;
  refreshToken: string;
}

export const authService = {
  // LDAP Login
  loginLdap: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await axiosInstance.post('/auth/login/ldap', credentials);
    const data = response.data.data;
    
    // Store tokens and user info in localStorage
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    localStorage.setItem('user', JSON.stringify(data.user));
    
    return data;
  },

  // Logout
  logout: async (): Promise<void> => {
    try {
      await axiosInstance.post('/auth/logout');
    } finally {
      // Clear tokens and user info from localStorage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  },

  // Get user profile
  getProfile: async () => {
    const response = await axiosInstance.get('/auth/profile');
    return response.data.data;
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    const accessToken = localStorage.getItem('accessToken');
    return !!accessToken;
  },

  // Get current user from localStorage
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },
};
