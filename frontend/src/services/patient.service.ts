import { api } from './api';
import type { Patient } from '../types';

export const patientService = {
  getAll: async (): Promise<Patient[]> => {
    const response = await api.get('/patients');
    return response.data;
  },
  getById: async (id: string): Promise<Patient> => {
    const response = await api.get(`/patients/${id}`);
    return response.data;
  },
  create: async (data: Omit<Patient, 'id'>): Promise<Patient> => {
    const response = await api.post('/patients', data);
    return response.data;
  },
  update: async (id: string, data: Partial<Patient>): Promise<Patient> => {
    const response = await api.put(`/patients/${id}`, data);
    return response.data;
  },
  delete: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete(`/patients/${id}`);
    return response.data;
  }
};
