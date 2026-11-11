export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  bloodGroup: string;
  contact: string;
  admissionDate?: string;
  status: 'Admitted' | 'Discharged' | 'Outpatient';
  ward?: string;
  bedNumber?: string;
}

export interface Doctor {
  id: string;
  name: string;
  specialization: string;
  experienceYears: number;
  availability: 'Available' | 'In Surgery' | 'Off Duty';
  contact: string;
  email?: string;
  department?: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName?: string;
  doctorId: string;
  doctorName?: string;
  date: string;
  time: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled' | 'No-show';
  reason: string;
}

export interface Bed {
  id: string;
  ward: string;
  bedNumber: string;
  type: 'ICU' | 'General' | 'Private' | 'Emergency';
  status: 'Available' | 'Occupied' | 'Maintenance';
  patientId?: string;
  patientName?: string;
}

export interface Department {
  id: string;
  name: string;
  headDoctorId: string;
  headDoctorName?: string;
  capacity: number;
  occupiedBeds?: number;
  description?: string;
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  patientName?: string;
  date: string;
  diagnosis: string;
  prescription: string;
  notes: string;
  doctorId: string;
  doctorName?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'DOCTOR' | 'RECEPTIONIST';
  department: string;
  initials: string;
}

export interface AIResponse {
  category: string;
  title: string;
  dataBadge: string;
  summary: string;
  insight: string;
  metadata?: any;
}

export interface DashboardAnalytics {
  totalPatients: number;
  admittedPatients: number;
  availableBeds: number;
  occupiedBeds: number;
  todayAppointments: number;
  criticalCases: number;
  activeDoctors: number;
  weeklyAppointments: Array<{ name: string; appointments: number }>;
}
