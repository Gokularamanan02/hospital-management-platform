import { type PatientData, type DoctorData, type AppointmentData, type BedData, type DepartmentData, type MedicalRecordData } from './seedData.js';
export declare function setMongoReady(ready: boolean): void;
export declare function getMongoReady(): boolean;
export declare function seedMongoIfEmpty(): Promise<void>;
export declare const patientsStore: {
    getAll(): Promise<PatientData[]>;
    getById(id: string): Promise<PatientData | null>;
    create(data: Omit<PatientData, 'id'>): Promise<PatientData>;
    update(id: string, updates: Partial<PatientData>): Promise<PatientData | null>;
    delete(id: string): Promise<boolean>;
};
export declare const doctorsStore: {
    getAll(): Promise<DoctorData[]>;
    getById(id: string): DoctorData | null;
    create(data: Omit<DoctorData, 'id'>): Promise<DoctorData>;
    update(id: string, updates: Partial<DoctorData>): Promise<DoctorData | null>;
    delete(id: string): Promise<boolean>;
};
export declare const appointmentsStore: {
    getAll(): Promise<AppointmentData[]>;
    create(data: Omit<AppointmentData, 'id'>): Promise<AppointmentData>;
    update(id: string, updates: Partial<AppointmentData>): Promise<AppointmentData | null>;
    delete(id: string): Promise<boolean>;
};
export declare const bedsStore: {
    getAll(): Promise<BedData[]>;
    updateStatus(id: string, status: BedData['status'], patientId?: string, patientName?: string): Promise<BedData | null>;
    create(data: Omit<BedData, 'id'>): BedData;
};
export declare const departmentsStore: {
    getAll(): Promise<DepartmentData[]>;
    create(data: Omit<DepartmentData, 'id'>): DepartmentData;
};
export declare const medicalRecordsStore: {
    getAll(): Promise<MedicalRecordData[]>;
    getByPatient(patientId: string): MedicalRecordData[];
    create(data: Omit<MedicalRecordData, 'id'>): Promise<MedicalRecordData>;
};
//# sourceMappingURL=dbStore.d.ts.map