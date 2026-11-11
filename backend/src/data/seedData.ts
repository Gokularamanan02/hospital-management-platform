export interface PatientData {
  id: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  bloodGroup: string;
  contact: string;
  status: 'Admitted' | 'Discharged' | 'Outpatient';
  admissionDate?: string | undefined;
  ward?: string | undefined;
  bedNumber?: string | undefined;
}

export interface DoctorData {
  id: string;
  name: string;
  specialization: string;
  experienceYears: number;
  availability: 'Available' | 'In Surgery' | 'Off Duty';
  contact: string;
  email: string;
  department: string;
}

export interface AppointmentData {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  date: string;
  time: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled' | 'No-show';
  reason: string;
}

export interface BedData {
  id: string;
  ward: string;
  bedNumber: string;
  type: 'ICU' | 'General' | 'Private' | 'Emergency';
  status: 'Available' | 'Occupied' | 'Maintenance';
  patientId?: string | undefined;
  patientName?: string | undefined;
}

export interface DepartmentData {
  id: string;
  name: string;
  headDoctorId: string;
  headDoctorName: string;
  capacity: number;
  occupiedBeds: number;
  description: string;
}

export interface MedicalRecordData {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  diagnosis: string;
  prescription: string;
  notes: string;
  doctorId: string;
  doctorName: string;
}

export const initialPatients: PatientData[] = [
  { id: 'p1', name: 'Ramesh Patel', age: 45, gender: 'Male', bloodGroup: 'O+', contact: '+91 9123456780', status: 'Admitted', admissionDate: '2026-10-01', ward: 'ICU-A', bedNumber: 'ICU-01' },
  { id: 'p2', name: 'Sita Ram', age: 32, gender: 'Female', bloodGroup: 'A+', contact: '+91 9123456781', status: 'Outpatient' },
  { id: 'p3', name: 'Kavitha Sundaram', age: 28, gender: 'Female', bloodGroup: 'B+', contact: '+91 9840123456', status: 'Admitted', admissionDate: '2026-10-28', ward: 'General-B', bedNumber: 'GEN-04' },
  { id: 'p4', name: 'Arun Kumar', age: 52, gender: 'Male', bloodGroup: 'AB+', contact: '+91 9444123890', status: 'Discharged' },
  { id: 'p5', name: 'Priya Narayanan', age: 39, gender: 'Female', bloodGroup: 'O-', contact: '+91 9790812345', status: 'Admitted', admissionDate: '2026-11-02', ward: 'Private-C', bedNumber: 'PVT-02' }
];

export const initialDoctors: DoctorData[] = [
  { id: 'd1', name: 'Dr. Meera Sharma', specialization: 'Cardiology', experienceYears: 15, availability: 'Available', contact: '+91 9876543210', email: 'meera.sharma@nalam.care', department: 'Cardiology' },
  { id: 'd2', name: 'Dr. Rahul Verma', specialization: 'Neurology', experienceYears: 10, availability: 'In Surgery', contact: '+91 9876543211', email: 'rahul.verma@nalam.care', department: 'Neurology' },
  { id: 'd3', name: 'Dr. Anjali Desai', specialization: 'Pediatrics', experienceYears: 8, availability: 'Available', contact: '+91 9876543212', email: 'anjali.desai@nalam.care', department: 'Pediatrics' },
  { id: 'd4', name: 'Dr. Rajesh Kanna', specialization: 'Orthopedics', experienceYears: 14, availability: 'Available', contact: '+91 9876543213', email: 'rajesh.kanna@nalam.care', department: 'Orthopedics' },
  { id: 'd5', name: 'Dr. Deepa Menon', specialization: 'Emergency Medicine', experienceYears: 12, availability: 'Available', contact: '+91 9876543214', email: 'deepa.menon@nalam.care', department: 'Emergency' }
];

export const initialAppointments: AppointmentData[] = [
  { id: 'a1', patientId: 'p2', patientName: 'Sita Ram', doctorId: 'd1', doctorName: 'Dr. Meera Sharma', date: '2026-11-11', time: '10:30 AM', status: 'Scheduled', reason: 'Cardiac Follow-up & ECG Review' },
  { id: 'a2', patientId: 'p1', patientName: 'Ramesh Patel', doctorId: 'd2', doctorName: 'Dr. Rahul Verma', date: '2026-11-11', time: '11:00 AM', status: 'Completed', reason: 'Post-op Neuro Assessment' },
  { id: 'a3', patientId: 'p3', patientName: 'Kavitha Sundaram', doctorId: 'd3', doctorName: 'Dr. Anjali Desai', date: '2026-11-11', time: '02:00 PM', status: 'Scheduled', reason: 'General Consultation' },
  { id: 'a4', patientId: 'p4', patientName: 'Arun Kumar', doctorId: 'd4', doctorName: 'Dr. Rajesh Kanna', date: '2026-11-12', time: '09:30 AM', status: 'Scheduled', reason: 'Knee Joint Therapy Review' },
  { id: 'a5', patientId: 'p5', patientName: 'Priya Narayanan', doctorId: 'd1', doctorName: 'Dr. Meera Sharma', date: '2026-11-10', time: '04:00 PM', status: 'Completed', reason: 'Hypertension Monitoring' }
];

export const initialBeds: BedData[] = [
  { id: 'b1', ward: 'ICU-A', bedNumber: 'ICU-01', type: 'ICU', status: 'Occupied', patientId: 'p1', patientName: 'Ramesh Patel' },
  { id: 'b2', ward: 'ICU-A', bedNumber: 'ICU-02', type: 'ICU', status: 'Available' },
  { id: 'b3', ward: 'ICU-A', bedNumber: 'ICU-03', type: 'ICU', status: 'Available' },
  { id: 'b4', ward: 'General-B', bedNumber: 'GEN-01', type: 'General', status: 'Occupied', patientId: 'p3', patientName: 'Kavitha Sundaram' },
  { id: 'b5', ward: 'General-B', bedNumber: 'GEN-02', type: 'General', status: 'Available' },
  { id: 'b6', ward: 'General-B', bedNumber: 'GEN-03', type: 'General', status: 'Maintenance' },
  { id: 'b7', ward: 'Private-C', bedNumber: 'PVT-01', type: 'Private', status: 'Available' },
  { id: 'b8', ward: 'Private-C', bedNumber: 'PVT-02', type: 'Private', status: 'Occupied', patientId: 'p5', patientName: 'Priya Narayanan' },
  { id: 'b9', ward: 'Emergency', bedNumber: 'EMR-01', type: 'Emergency', status: 'Available' },
  { id: 'b10', ward: 'Emergency', bedNumber: 'EMR-02', type: 'Emergency', status: 'Available' }
];

export const initialDepartments: DepartmentData[] = [
  { id: 'dep1', name: 'Cardiology', headDoctorId: 'd1', headDoctorName: 'Dr. Meera Sharma', capacity: 25, occupiedBeds: 18, description: 'Advanced cardiovascular diagnostics, angiography, and surgical care.' },
  { id: 'dep2', name: 'Neurology', headDoctorId: 'd2', headDoctorName: 'Dr. Rahul Verma', capacity: 20, occupiedBeds: 15, description: 'Neuro-critical care, stroke recovery, and cranial surgery unit.' },
  { id: 'dep3', name: 'Pediatrics', headDoctorId: 'd3', headDoctorName: 'Dr. Anjali Desai', capacity: 30, occupiedBeds: 12, description: 'Neonatal ICU and comprehensive child health services.' },
  { id: 'dep4', name: 'Orthopedics', headDoctorId: 'd4', headDoctorName: 'Dr. Rajesh Kanna', capacity: 20, occupiedBeds: 14, description: 'Joint replacement, trauma surgery, and spine rehabilitation.' },
  { id: 'dep5', name: 'Emergency & Trauma', headDoctorId: 'd5', headDoctorName: 'Dr. Deepa Menon', capacity: 15, occupiedBeds: 8, description: '24/7 Level 1 trauma care, triage, and rapid resuscitation.' }
];

export const initialMedicalRecords: MedicalRecordData[] = [
  {
    id: 'mr1',
    patientId: 'p1',
    patientName: 'Ramesh Patel',
    date: '2026-10-01',
    diagnosis: 'Acute Coronary Syndrome - Non-STEMI',
    prescription: 'Aspirin 75mg OD, Atorvastatin 40mg HS, Metoprolol 25mg BD',
    notes: 'Patient stabilized following coronary stenting. Vitals stable. Potassium and renal parameters within normal range.',
    doctorId: 'd1',
    doctorName: 'Dr. Meera Sharma'
  },
  {
    id: 'mr2',
    patientId: 'p3',
    patientName: 'Kavitha Sundaram',
    date: '2026-10-28',
    diagnosis: 'Severe Community-Acquired Pneumonia',
    prescription: 'Ceftriaxone 1g IV BD, Azithromycin 500mg OD, Paracetamol 650mg SOS',
    notes: 'Chest X-ray shows right lower lobe consolidation. SpO2 maintained at 98% on room air. Responding favorably to IV antibiotics.',
    doctorId: 'd5',
    doctorName: 'Dr. Deepa Menon'
  },
  {
    id: 'mr3',
    patientId: 'p5',
    patientName: 'Priya Narayanan',
    date: '2026-11-02',
    diagnosis: 'Stage 2 Essential Hypertension with Nephropathy Check',
    prescription: 'Telmisartan 40mg OD, Amlodipine 5mg OD',
    notes: '24-hour ambulatory BP monitoring initiated. Urine microalbumin ordered. Low sodium diet prescribed.',
    doctorId: 'd1',
    doctorName: 'Dr. Meera Sharma'
  }
];
