import api, { apiCall } from './api';
import { Pet, SearchFilters, ContactRequest } from '../types';

export const petsAPI = {
  // Get all pets with filters
  getPets: async (filters?: SearchFilters): Promise<{ pets: Pet[]; pagination: any }> => {
    const response = await apiCall(api.get('/pets', { params: filters }));
    return response;
  },

  // Get pet by ID
  getPet: async (id: string): Promise<{ pet: Pet }> => {
    const response = await apiCall(api.get(`/pets/${id}`));
    return response;
  },

  // Create new pet post
  createPet: async (data: FormData): Promise<{ pet: Pet }> => {
    const response = await apiCall(api.post('/pets', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }));
    return response;
  },

  // Update pet post
  updatePet: async (id: string, data: FormData): Promise<{ pet: Pet }> => {
    const response = await apiCall(api.put(`/pets/${id}`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }));
    return response;
  },

  // Delete pet post
  deletePet: async (id: string): Promise<void> => {
    await apiCall(api.delete(`/pets/${id}`));
  },

  // Search pets by location
  searchNearby: async (params: { latitude: number; longitude: number; radius?: number; page?: number; limit?: number }): Promise<{ pets: Pet[]; pagination: any }> => {
    const response = await apiCall(api.get('/pets/search/nearby', { params }));
    return response;
  },

  // Contact pet owner
  contactOwner: async (id: string, data: ContactRequest): Promise<void> => {
    await apiCall(api.post(`/pets/${id}/contact`, data));
  },

  // Get user's pets
  getMyPets: async (params?: { page?: number; limit?: number }): Promise<{ pets: Pet[]; pagination: any }> => {
    const response = await apiCall(api.get('/pets/my-pets', { params }));
    return response;
  },

  // Mark pet as reunited
  markAsReunited: async (id: string): Promise<{ pet: Pet }> => {
    const response = await apiCall(api.patch(`/pets/${id}/reunite`));
    return response;
  },

  // Approve pet (admin only)
  approvePet: async (id: string): Promise<{ pet: Pet }> => {
    const response = await apiCall(api.patch(`/pets/${id}/approve`));
    return response;
  },
}; 