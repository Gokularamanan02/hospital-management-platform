import type { Patient, Doctor, Appointment, Bed } from '../types';

export const mockDoctors: Doctor[] = [
  { id: 'd1', name: 'Dr. Meera Sharma', specialization: 'Cardiology', experienceYears: 15, availability: 'Available', contact: '+91 9876543210' },
  { id: 'd2', name: 'Dr. Rahul Verma', specialization: 'Neurology', experienceYears: 10, availability: 'In Surgery', contact: '+91 9876543211' },
  { id: 'd3', name: 'Dr. Anjali Desai', specialization: 'Pediatrics', experienceYears: 8, availability: 'Available', contact: '+91 9876543212' },
];

export const mockPatients: Patient[] = [
  { id: 'p1', name: 'Ramesh Patel', age: 45, gender: 'Male', bloodGroup: 'O+', contact: '+91 9123456780', status: 'Admitted', admissionDate: '2024-10-01' },
  { id: 'p2', name: 'Sita Ram', age: 32, gender: 'Female', bloodGroup: 'A+', contact: '+91 9123456781', status: 'Outpatient' },
];

export const mockAppointments: Appointment[] = [
  { id: 'a1', patientId: 'p2', doctorId: 'd1', date: '2024-10-14', time: '10:30 AM', status: 'Scheduled', reason: 'Routine checkup' },
  { id: 'a2', patientId: 'p1', doctorId: 'd2', date: '2024-10-14', time: '11:00 AM', status: 'No-show', reason: 'Follow-up' },
];

export const mockBeds: Bed[] = [
  { id: 'b1', ward: 'ICU-A', bedNumber: 'ICU-01', type: 'ICU', status: 'Occupied', patientId: 'p1' },
  { id: 'b2', ward: 'ICU-A', bedNumber: 'ICU-02', type: 'ICU', status: 'Available' },
  { id: 'b3', ward: 'General-B', bedNumber: 'GEN-01', type: 'General', status: 'Maintenance' },
  { id: 'b4', ward: 'Private-C', bedNumber: 'PVT-01', type: 'Private', status: 'Available' },
];
