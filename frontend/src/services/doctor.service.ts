import { api } from './api';
import type { Doctor } from '../types';

export const doctorService = {
  getAll: async (): Promise<Doctor[]> => {
    const response = await api.get('/doctors');
    return response.data;
  },
  getById: async (id: string): Promise<Doctor> => {
    const response = await api.get(`/doctors/${id}`);
    return response.data;
  },
  create: async (data: Omit<Doctor, 'id'>): Promise<Doctor> => {
    const response = await api.post('/doctors', data);
    return response.data;
  },
  update: async (id: string, data: Partial<Doctor>): Promise<Doctor> => {
    const response = await api.put(`/doctors/${id}`, data);
    return response.data;
  },
  delete: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete(`/doctors/${id}`);
    return response.data;
  }
};

