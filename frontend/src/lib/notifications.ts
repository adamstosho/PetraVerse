import api, { apiCall } from './api';
import { Notification } from '../types';

export interface NotificationCount {
  count: number;
}

export interface NotificationsResponse {
  notifications: Notification[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export const notificationsAPI = {
  // Get all notifications for current user
  getNotifications: async (params?: { page?: number; limit?: number; isRead?: boolean }): Promise<NotificationsResponse> => {
    const response = await apiCall(api.get('/notifications', { params }));
    return response;
  },

  getUnreadCount: async (): Promise<{ count: number }> => {
    const response = await apiCall(api.get('/notifications/unread-count'));
    return response;
  },

  getNotification: async (notificationId: string): Promise<{ notification: Notification }> => {
    const response = await apiCall(api.get(`/notifications/${notificationId}`));
    return response;
  },

  markAsRead: async (notificationId: string): Promise<void> => {
    await apiCall(api.patch(`/notifications/${notificationId}/read`));
  },

  markAllAsRead: async (): Promise<void> => {
    await apiCall(api.patch('/notifications/mark-all-read'));
  },

  deleteNotification: async (notificationId: string): Promise<void> => {
    await apiCall(api.delete(`/notifications/${notificationId}`));
  }
}; 