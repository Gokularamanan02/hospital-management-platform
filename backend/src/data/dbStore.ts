import mongoose from 'mongoose';
import Patient from '../models/Patient.js';
import {
  initialPatients,
  initialDoctors,
  initialAppointments,
  initialBeds,
  initialDepartments,
  initialMedicalRecords,
  type PatientData,
  type DoctorData,
  type AppointmentData,
  type BedData,
  type DepartmentData,
  type MedicalRecordData
} from './seedData.js';

let isMongoReady = false;

export function setMongoReady(ready: boolean) {
  isMongoReady = ready;
}

export function getMongoReady(): boolean {
  return isMongoReady && mongoose.connection.readyState === 1;
}

// In-Memory mutable stores
const inMemoryStore: {
  patients: PatientData[];
  doctors: DoctorData[];
  appointments: AppointmentData[];
  beds: BedData[];
  departments: DepartmentData[];
  medicalRecords: MedicalRecordData[];
} = {
  patients: [...initialPatients],
  doctors: [...initialDoctors],
  appointments: [...initialAppointments],
  beds: [...initialBeds],
  departments: [...initialDepartments],
  medicalRecords: [...initialMedicalRecords]
};

// 1. Patients Store
export const patientsStore = {
  async getAll(): Promise<PatientData[]> {
    if (getMongoReady()) {
      try {
        const patients = await Patient.find().sort({ createdAt: -1 });
        return patients.map((p: any) => ({
          id: p._id.toString(),
          name: p.name,
          age: p.age,
          gender: p.gender,
          bloodGroup: p.bloodGroup,
          contact: p.contact,
          status: p.status,
          admissionDate: p.admissionDate ? p.admissionDate.toISOString().split('T')[0] : undefined
        }));
      } catch (err) {
        console.warn('MongoDB query failed, falling back to memory store:', err);
      }
    }
    return inMemoryStore.patients;
  },

  async getById(id: string): Promise<PatientData | null> {
    if (getMongoReady()) {
      try {
        const p: any = await Patient.findById(id);
        if (p) {
          return {
            id: p._id.toString(),
            name: p.name,
            age: p.age,
            gender: p.gender,
            bloodGroup: p.bloodGroup,
            contact: p.contact,
            status: p.status,
            admissionDate: p.admissionDate ? p.admissionDate.toISOString().split('T')[0] : undefined
          };
        }
      } catch (err) {
        console.warn('MongoDB query failed, falling back to memory store:', err);
      }
    }
    return inMemoryStore.patients.find(p => p.id === id) || null;
  },

  async create(data: Omit<PatientData, 'id'>): Promise<PatientData> {
    if (getMongoReady()) {
      try {
        const p = new Patient(data);
        const saved: any = await p.save();
        const record: PatientData = {
          id: saved._id.toString(),
          name: saved.name,
          age: saved.age,
          gender: saved.gender,
          bloodGroup: saved.bloodGroup,
          contact: saved.contact,
          status: saved.status,
          admissionDate: saved.admissionDate ? saved.admissionDate.toISOString().split('T')[0] : undefined
        };
        inMemoryStore.patients.unshift(record);
        return record;
      } catch (err) {
        console.warn('MongoDB save failed, persisting to in-memory store:', err);
      }
    }
    const newRecord: PatientData = {
      ...data,
      id: 'p_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5)
    };
    inMemoryStore.patients.unshift(newRecord);
    return newRecord;
  },

  async update(id: string, updates: Partial<PatientData>): Promise<PatientData | null> {
    if (getMongoReady()) {
      try {
        const updated: any = await Patient.findByIdAndUpdate(id, updates, { new: true });
        if (updated) {
          return {
            id: updated._id.toString(),
            name: updated.name,
            age: updated.age,
            gender: updated.gender,
            bloodGroup: updated.bloodGroup,
            contact: updated.contact,
            status: updated.status,
            admissionDate: updated.admissionDate ? updated.admissionDate.toISOString().split('T')[0] : undefined
          };
        }
      } catch (err) {
        console.warn('MongoDB update failed, falling back to memory store:', err);
      }
    }
    const target = inMemoryStore.patients.find(p => p.id === id);
    if (target) {
      Object.assign(target, updates, { id: target.id });
      return target;
    }
    return null;
  },

  async delete(id: string): Promise<boolean> {
    if (getMongoReady()) {
      try {
        await Patient.findByIdAndDelete(id);
      } catch (err) {
        console.warn('MongoDB delete failed, falling back to memory store:', err);
      }
    }
    const initialLen = inMemoryStore.patients.length;
    inMemoryStore.patients = inMemoryStore.patients.filter(p => p.id !== id);
    return inMemoryStore.patients.length < initialLen;
  }
};

// 2. Doctors Store
export const doctorsStore = {
  getAll(): DoctorData[] {
    return inMemoryStore.doctors;
  },
  getById(id: string): DoctorData | null {
    return inMemoryStore.doctors.find(d => d.id === id) || null;
  },
  create(data: Omit<DoctorData, 'id'>): DoctorData {
    const newDoc: DoctorData = {
      ...data,
      id: 'd_' + Date.now().toString(36)
    };
    inMemoryStore.doctors.push(newDoc);
    return newDoc;
  },
  update(id: string, updates: Partial<DoctorData>): DoctorData | null {
    const target = inMemoryStore.doctors.find(d => d.id === id);
    if (target) {
      Object.assign(target, updates, { id: target.id });
      return target;
    }
    return null;
  },
  delete(id: string): boolean {
    const len = inMemoryStore.doctors.length;
    inMemoryStore.doctors = inMemoryStore.doctors.filter(d => d.id !== id);
    return inMemoryStore.doctors.length < len;
  }
};

// 3. Appointments Store
export const appointmentsStore = {
  getAll(): AppointmentData[] {
    return inMemoryStore.appointments;
  },
  create(data: Omit<AppointmentData, 'id'>): AppointmentData {
    const newAppt: AppointmentData = {
      ...data,
      id: 'a_' + Date.now().toString(36)
    };
    inMemoryStore.appointments.unshift(newAppt);
    return newAppt;
  },
  update(id: string, updates: Partial<AppointmentData>): AppointmentData | null {
    const target = inMemoryStore.appointments.find(a => a.id === id);
    if (target) {
      Object.assign(target, updates, { id: target.id });
      return target;
    }
    return null;
  },
  delete(id: string): boolean {
    const len = inMemoryStore.appointments.length;
    inMemoryStore.appointments = inMemoryStore.appointments.filter(a => a.id !== id);
    return inMemoryStore.appointments.length < len;
  }
};

// 4. Beds Store
export const bedsStore = {
  getAll(): BedData[] {
    return inMemoryStore.beds;
  },
  updateStatus(id: string, status: BedData['status'], patientId?: string, patientName?: string): BedData | null {
    const target = inMemoryStore.beds.find(b => b.id === id);
    if (target) {
      target.status = status;
      target.patientId = status === 'Occupied' ? patientId : undefined;
      target.patientName = status === 'Occupied' ? patientName : undefined;
      return target;
    }
    return null;
  },
  create(data: Omit<BedData, 'id'>): BedData {
    const newBed: BedData = {
      ...data,
      id: 'b_' + Date.now().toString(36)
    };
    inMemoryStore.beds.push(newBed);
    return newBed;
  }
};

// 5. Departments Store
export const departmentsStore = {
  getAll(): DepartmentData[] {
    return inMemoryStore.departments;
  },
  create(data: Omit<DepartmentData, 'id'>): DepartmentData {
    const newDept: DepartmentData = {
      ...data,
      id: 'dep_' + Date.now().toString(36)
    };
    inMemoryStore.departments.push(newDept);
    return newDept;
  }
};

// 6. Medical Records Store
export const medicalRecordsStore = {
  getAll(): MedicalRecordData[] {
    return inMemoryStore.medicalRecords;
  },
  getByPatient(patientId: string): MedicalRecordData[] {
    return inMemoryStore.medicalRecords.filter(m => m.patientId === patientId);
  },
  create(data: Omit<MedicalRecordData, 'id'>): MedicalRecordData {
    const newRecord: MedicalRecordData = {
      ...data,
      id: 'mr_' + Date.now().toString(36)
    };
    inMemoryStore.medicalRecords.unshift(newRecord);
    return newRecord;
  }
};
