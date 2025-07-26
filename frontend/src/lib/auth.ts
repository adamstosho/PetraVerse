import api, { apiCall } from './api';
import { User, AuthResponse } from '../types';

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export const authAPI = {
  login: async (data: LoginData): Promise<{ user: User; token: string }> => {
    const response = await apiCall(api.post('/auth/login', data));
    return response;
  },

  register: async (data: RegisterData): Promise<{ user: User; token: string }> => {
    const response = await apiCall(api.post('/auth/register', data));
    return response;
  },

  getCurrentUser: async (): Promise<{ user: User }> => {
    const response = await apiCall(api.get('/auth/me'));
    return response;
  },

  logout: async (): Promise<void> => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      // Ignore logout errors
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },

  forgotPassword: async (email: string): Promise<void> => {
    return apiCall(api.post('/auth/forgot-password', { email }));
  },

  resetPassword: async (token: string, password: string, confirmPassword: string): Promise<void> => {
    return apiCall(api.post(`/auth/reset-password/${token}`, { password, confirmPassword }));
  },

  verifyEmail: async (token: string): Promise<void> => {
    return apiCall(api.get(`/auth/verify-email/${token}`));
  },

  resendVerification: async (email: string): Promise<void> => {
    return apiCall(api.post('/auth/resend-verification', { email }));
  },

  changePassword: async (data: ChangePasswordData): Promise<void> => {
    return apiCall(api.put('/auth/change-password', data));
  },

  refreshToken: async (): Promise<{ token: string }> => {
    const response = await apiCall(api.post('/auth/refresh'));
    return response;
  },

  updateProfile: async (data: Partial<User>): Promise<{ user: User }> => {
    const response = await apiCall(api.put('/auth/me', data));
    return response;
  },

  deleteAccount: async (): Promise<void> => {
    return apiCall(api.delete('/auth/me'));
  },
};