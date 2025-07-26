import api, { apiCall } from './api';
import { Report } from '../types';

export interface CreateReportData {
  type: 'user' | 'pet_post' | 'spam' | 'inappropriate' | 'fake' | 'duplicate' | 'other';
  reason: string;
  description?: string;
  reportedUserId?: string;
  reportedPetId?: string;
  evidence?: string[];
}

export const reportsAPI = {
  // Create a report
  createReport: async (data: CreateReportData): Promise<{ report: Report }> => {
    const response = await apiCall(api.post('/reports', data));
    return response;
  },

  // Get user's reports
  getUserReports: async (params?: { page?: number; limit?: number; status?: string }): Promise<{ reports: Report[]; pagination: any }> => {
    const response = await apiCall(api.get('/reports', { params }));
    return response;
  },

  // Get report by ID
  getReport: async (id: string): Promise<{ report: Report }> => {
    const response = await apiCall(api.get(`/reports/${id}`));
    return response;
  },

  // Update report (reporter only)
  updateReport: async (id: string, data: Partial<Report>): Promise<{ report: Report }> => {
    const response = await apiCall(api.put(`/reports/${id}`, data));
    return response;
  },

  // Delete report (reporter only)
  deleteReport: async (id: string): Promise<void> => {
    await apiCall(api.delete(`/reports/${id}`));
  },

  // Get reports about current user
  getReportsAboutMe: async (params?: { page?: number; limit?: number }): Promise<{ reports: Report[]; pagination: any }> => {
    const response = await apiCall(api.get('/reports/about-me', { params }));
    return response;
  },

  // Get reports about user's pets
  getReportsAboutMyPets: async (params?: { page?: number; limit?: number }): Promise<{ reports: Report[]; pagination: any }> => {
    const response = await apiCall(api.get('/reports/about-my-pets', { params }));
    return response;
  },
}; 