import api, { apiCall } from './api';
import { User, Pet, Report } from '../types';

export interface AdminDashboardResponse {
  stats: {
    totalUsers: number;
    activeUsers: number;
    totalPets: number;
    approvedPets: number;
    pendingPets: number;
    totalReports: number;
    pendingReports: number;
    highPriorityReports: number;
  };
  recent: {
    users: Array<{ _id: string; name: string; email: string; createdAt: string }>;
    pets: Array<{ _id: string; name: string; type: string; owner: { name: string }; createdAt: string }>;
    reports: Array<{ _id: string; type: string; reporter: { name: string }; createdAt: string }>;
  };
}

export const adminAPI = {
  // Get dashboard statistics
  getDashboardStats: async (): Promise<AdminDashboardResponse> => {
    const response = await apiCall(api.get('/admin/dashboard'));
    return response;
  },

  // Get all users
  getAllUsers: async (params?: { page?: number; limit?: number; role?: string }): Promise<{ users: User[]; pagination: any }> => {
    const response = await apiCall(api.get('/admin/users', { params }));
    return response;
  },

  // Get user by ID
  getUserById: async (userId: string): Promise<{ user: User }> => {
    const response = await apiCall(api.get(`/admin/users/${userId}`));
    return response;
  },

  // Update user
  updateUser: async (userId: string, userData: Partial<User>): Promise<{ user: User }> => {
    const response = await apiCall(api.put(`/admin/users/${userId}`, userData));
    return response;
  },

  // Delete user
  deleteUser: async (userId: string): Promise<void> => {
    await apiCall(api.delete(`/admin/users/${userId}`));
  },

  // Get all pets
  getAllPets: async (params?: { page?: number; limit?: number; status?: string; isApproved?: boolean; search?: string }): Promise<{ pets: Pet[]; pagination: any }> => {
    const response = await apiCall(api.get('/admin/pets', { params }));
    return response;
  },

  // Get pet by ID
  getPetById: async (petId: string): Promise<{ pet: Pet }> => {
    const response = await apiCall(api.get(`/admin/pets/${petId}`));
    return response;
  },

  // Update pet
  updatePet: async (petId: string, petData: FormData): Promise<{ pet: Pet }> => {
    const response = await apiCall(api.put(`/admin/pets/${petId}`, petData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }));
    return response;
  },

  // Approve pet
  approvePet: async (petId: string): Promise<{ pet: Pet }> => {
    const response = await apiCall(api.patch(`/admin/pets/${petId}/approve`));
    return response;
  },

  // Delete pet
  deletePet: async (petId: string): Promise<void> => {
    await apiCall(api.delete(`/admin/pets/${petId}`));
  },

  // Get all reports
  getAllReports: async (params?: { page?: number; limit?: number; status?: string; type?: string }): Promise<{ reports: Report[]; pagination: any }> => {
    const response = await apiCall(api.get('/admin/reports', { params }));
    return response;
  },

  // Get report by ID
  getReportById: async (reportId: string): Promise<{ report: Report }> => {
    const response = await apiCall(api.get(`/admin/reports/${reportId}`));
    return response;
  },

  // Update report
  updateReport: async (reportId: string, reportData: { status?: string; adminNotes?: string; action?: string }): Promise<{ report: Report }> => {
    const response = await apiCall(api.put(`/admin/reports/${reportId}`, reportData));
    return response;
  }
}; 