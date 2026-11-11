import { api } from './api';
import type { Appointment } from '../types';

export const appointmentService = {
  getAll: async (): Promise<Appointment[]> => {
    const response = await api.get('/appointments');
    return response.data;
  },
  create: async (data: Omit<Appointment, 'id'>): Promise<Appointment> => {
    const response = await api.post('/appointments', data);
    return response.data;
  },
  update: async (id: string, data: Partial<Appointment>): Promise<Appointment> => {
    const response = await api.put(`/appointments/${id}`, data);
    return response.data;
  },
  delete: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete(`/appointments/${id}`);
    return response.data;
  }
};

