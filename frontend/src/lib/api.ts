import axios, { AxiosResponse } from 'axios';
import { ApiResponse } from '../types';
import { config } from '../config/env';

const API_BASE_URL = config.API_BASE_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

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

api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

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
    
    throw error;
  }
};