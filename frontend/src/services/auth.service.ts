import { api } from './api';
import type { User } from '../types';

export const authService = {
  login: async (email?: string, role?: User['role']): Promise<{ token: string; user: User }> => {
    const response = await api.post('/auth/login', { email, role });
    if (response.data.token) {
      localStorage.setItem('nalam_auth_token', response.data.token);
      localStorage.setItem('nalam_user', JSON.stringify(response.data.user));
    }
    return response.data;
  },
  getCurrentUser: (): User => {
    const saved = localStorage.getItem('nalam_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // Fallback
      }
    }
    return {
      id: 'u_admin',
      email: 'admin@nalam.care',
      name: 'Dr. Anand Kumar',
      role: 'ADMIN',
      department: 'Hospital Administration',
      initials: 'AK'
    };
  },
  logout: () => {
    localStorage.removeItem('nalam_auth_token');
    localStorage.removeItem('nalam_user');
  }
};

