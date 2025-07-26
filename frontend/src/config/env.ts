// Environment configuration
export const config = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  APP_NAME: import.meta.env.VITE_APP_NAME || 'PetConnect',
  APP_VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
  NODE_ENV: import.meta.env.NODE_ENV || 'development',
};

// API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_EMAIL: '/auth/verify-email',
    CHANGE_PASSWORD: '/auth/change-password',
    REFRESH_TOKEN: '/auth/refresh',
    UPDATE_PROFILE: '/auth/me',
    DELETE_ACCOUNT: '/auth/me',
  },
  PETS: {
    GET_ALL: '/pets',
    GET_BY_ID: (id: string) => `/pets/${id}`,
    CREATE: '/pets',
    UPDATE: (id: string) => `/pets/${id}`,
    DELETE: (id: string) => `/pets/${id}`,
    SEARCH_NEARBY: '/pets/search/nearby',
    CONTACT_OWNER: (id: string) => `/pets/${id}/contact`,
    GET_MY_PETS: '/pets/my-pets',
    MARK_REUNITED: (id: string) => `/pets/${id}/reunite`,
    APPROVE: (id: string) => `/pets/${id}/approve`,
  },
  ADMIN: {
    DASHBOARD: '/admin/dashboard',
    USERS: '/admin/users',
    USER_BY_ID: (id: string) => `/admin/users/${id}`,
    UPDATE_USER: (id: string) => `/admin/users/${id}`,
    DELETE_USER: (id: string) => `/admin/users/${id}`,
    PETS: '/admin/pets',
    PET_BY_ID: (id: string) => `/admin/pets/${id}`,
    UPDATE_PET: (id: string) => `/admin/pets/${id}`,
    DELETE_PET: (id: string) => `/admin/pets/${id}`,
    REPORTS: '/admin/reports',
    REPORT_BY_ID: (id: string) => `/admin/reports/${id}`,
    UPDATE_REPORT: (id: string) => `/admin/reports/${id}`,
  },
  NOTIFICATIONS: {
    GET_ALL: '/notifications',
    GET_BY_ID: (id: string) => `/notifications/${id}`,
    UNREAD_COUNT: '/notifications/unread-count',
    MARK_AS_READ: (id: string) => `/notifications/${id}/read`,
    MARK_ALL_READ: '/notifications/mark-all-read',
    DELETE: (id: string) => `/notifications/${id}`,
  },
  REPORTS: {
    CREATE: '/reports',
    GET_ALL: '/reports',
    GET_BY_ID: (id: string) => `/reports/${id}`,
    UPDATE: (id: string) => `/reports/${id}`,
    DELETE: (id: string) => `/reports/${id}`,
    ABOUT_ME: '/reports/about-me',
    ABOUT_MY_PETS: '/reports/about-my-pets',
  },
};

// Validation rules
export const VALIDATION_RULES = {
  PASSWORD: {
    MIN_LENGTH: 6,
    PATTERN: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
  },
  EMAIL: {
    PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  PHONE: {
    PATTERN: /^[\+]?[1-9][\d]{0,15}$/,
  },
  NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 50,
  },
};

// File upload limits
export const UPLOAD_LIMITS = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_FILES: 10,
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
};

// Pagination defaults
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
};

// Status colors
export const STATUS_COLORS = {
  missing: 'bg-red-100 text-red-800',
  found: 'bg-green-100 text-green-800',
  reunited: 'bg-blue-100 text-blue-800',
  pending: 'bg-yellow-100 text-yellow-800',
  under_review: 'bg-blue-100 text-blue-800',
  resolved: 'bg-green-100 text-green-800',
  dismissed: 'bg-red-100 text-red-800',
};

// Priority colors
export const PRIORITY_COLORS = {
  low: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800',
}; 