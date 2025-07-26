import axios, { AxiosResponse } from 'axios';
import { ApiResponse } from '../types';
import { config } from '../config/env';

const API_BASE_URL = config.API_BASE_URL;

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired, logout user
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// API helper functions
export const apiCall = async <T>(
  request: Promise<AxiosResponse<ApiResponse<T>>>
): Promise<T> => {
  try {
    const response = await request;
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.error?.message || 'API request failed');
  } catch (error: any) {
    console.log('apiCall error:', error);
    console.log('error.response?.data:', error.response?.data);
    
    // For now, let's just pass through the original error
    // This will allow the calling function to handle the error properly
    throw error;
  }
};