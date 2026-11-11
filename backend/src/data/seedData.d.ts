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
export declare const initialPatients: PatientData[];
export declare const initialDoctors: DoctorData[];
export declare const initialAppointments: AppointmentData[];
export declare const initialBeds: BedData[];
export declare const initialDepartments: DepartmentData[];
export declare const initialMedicalRecords: MedicalRecordData[];
//# sourceMappingURL=seedData.d.ts.map