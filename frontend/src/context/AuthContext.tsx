import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '../types';
import { authService } from '../services/auth.service';

interface AuthContextType {
  user: User;
  role: User['role'];
  setRole: (role: User['role']) => void;
  login: (email?: string, role?: User['role']) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>(() => authService.getCurrentUser());

  useEffect(() => {
    localStorage.setItem('nalam_user', JSON.stringify(user));
  }, [user]);

  const setRole = (newRole: User['role']) => {
    let name = 'Dr. Anand Kumar';
    let email = 'admin@nalam.care';
    let dept = 'Hospital Administration';
    let initials = 'AK';

    if (newRole === 'DOCTOR') {
      name = 'Dr. Meera Sharma';
      email = 'doctor@nalam.care';
      dept = 'Cardiology';
      initials = 'MS';
    } else if (newRole === 'RECEPTIONIST') {
      name = 'Suresh Raina';
      email = 'frontdesk@nalam.care';
      dept = 'Patient Admission & Front Desk';
      initials = 'SR';
    }

    setUser({
      id: `u_${newRole.toLowerCase()}`,
      role: newRole,
      name,
      email,
      department: dept,
      initials
    });
  };

  const login = async (email?: string, role?: User['role']) => {
    try {
      const res = await authService.login(email, role);
      setUser(res.user);
    } catch {
      // Fallback local login
      if (role) setRole(role);
    }
  };

  const logout = () => {
    authService.logout();
    setRole('ADMIN');
  };

  return (
    <AuthContext.Provider value={{ user, role: user.role, setRole, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

