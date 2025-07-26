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

  // Get unread notifications count
  getUnreadCount: async (): Promise<{ count: number }> => {
    const response = await apiCall(api.get('/notifications/unread-count'));
    return response;
  },

  // Get notification by ID
  getNotification: async (notificationId: string): Promise<{ notification: Notification }> => {
    const response = await apiCall(api.get(`/notifications/${notificationId}`));
    return response;
  },

  // Mark notification as read
  markAsRead: async (notificationId: string): Promise<void> => {
    await apiCall(api.patch(`/notifications/${notificationId}/read`));
  },

  // Mark all notifications as read
  markAllAsRead: async (): Promise<void> => {
    await apiCall(api.patch('/notifications/mark-all-read'));
  },

  // Delete notification
  deleteNotification: async (notificationId: string): Promise<void> => {
    await apiCall(api.delete(`/notifications/${notificationId}`));
  }
}; 