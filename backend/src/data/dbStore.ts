import mongoose from 'mongoose';
import Patient from '../models/Patient.js';
import Doctor from '../models/Doctor.js';
import Appointment from '../models/Appointment.js';
import Bed from '../models/Bed.js';
import Department from '../models/Department.js';
import MedicalRecord from '../models/MedicalRecord.js';
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
  if (ready) {
    seedMongoIfEmpty().catch(err => console.error('Error auto-seeding MongoDB Atlas:', err));
  }
}

export function getMongoReady(): boolean {
  return isMongoReady && mongoose.connection.readyState === 1;
}

// Auto-seed MongoDB Atlas if fresh
export async function seedMongoIfEmpty() {
  if (!getMongoReady()) return;
  try {
    const patientCount = await Patient.countDocuments();
    if (patientCount === 0) {
      console.log('🌱 Fresh MongoDB Atlas detected! Seeding initial hospital database collections...');
      await Patient.insertMany(initialPatients.map(p => ({
        _id: new mongoose.Types.ObjectId(),
        name: p.name,
        age: p.age,
        gender: p.gender,
        bloodGroup: p.bloodGroup,
        contact: p.contact,
        status: p.status,
        admissionDate: p.admissionDate ? new Date(p.admissionDate) : undefined,
        ward: p.ward,
        bedNumber: p.bedNumber
      })));
      await Doctor.insertMany(initialDoctors.map(d => ({
        name: d.name,
        specialization: d.specialization,
        experienceYears: d.experienceYears,
        availability: d.availability,
        contact: d.contact,
        email: d.email,
        department: d.department
      })));
      await Appointment.insertMany(initialAppointments);
      await Bed.insertMany(initialBeds);
      await Department.insertMany(initialDepartments);
      await MedicalRecord.insertMany(initialMedicalRecords);
      console.log('✓ Successfully seeded Patients, Doctors, Appointments, Beds, Departments & Records into MongoDB Atlas!');
    } else {
      console.log(`ℹ MongoDB Atlas already populated (${patientCount} patient records found).`);
    }
  } catch (err) {
    console.error('Failed to seed MongoDB Atlas:', err);
  }
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
          admissionDate: p.admissionDate ? p.admissionDate.toISOString().split('T')[0] : undefined,
          ward: p.ward,
          bedNumber: p.bedNumber
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
            admissionDate: p.admissionDate ? p.admissionDate.toISOString().split('T')[0] : undefined,
            ward: p.ward,
            bedNumber: p.bedNumber
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
        const p = new Patient({
          ...data,
          admissionDate: data.admissionDate ? new Date(data.admissionDate) : undefined
        });
        const saved: any = await p.save();
        const record: PatientData = {
          id: saved._id.toString(),
          name: saved.name,
          age: saved.age,
          gender: saved.gender,
          bloodGroup: saved.bloodGroup,
          contact: saved.contact,
          status: saved.status,
          admissionDate: saved.admissionDate ? saved.admissionDate.toISOString().split('T')[0] : undefined,
          ward: saved.ward,
          bedNumber: saved.bedNumber
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
            admissionDate: updated.admissionDate ? updated.admissionDate.toISOString().split('T')[0] : undefined,
            ward: updated.ward,
            bedNumber: updated.bedNumber
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
  async getAll(): Promise<DoctorData[]> {
    if (getMongoReady()) {
      try {
        const docs = await Doctor.find();
        if (docs.length > 0) {
          return docs.map((d: any) => ({
            id: d._id.toString(),
            name: d.name,
            specialization: d.specialization,
            experienceYears: d.experienceYears,
            availability: d.availability,
            contact: d.contact,
            email: d.email,
            department: d.department
          }));
        }
      } catch (err) {
        console.warn('MongoDB doctors query failed:', err);
      }
    }
    return inMemoryStore.doctors;
  },
  getById(id: string): DoctorData | null {
    return inMemoryStore.doctors.find(d => d.id === id) || null;
  },
  async create(data: Omit<DoctorData, 'id'>): Promise<DoctorData> {
    if (getMongoReady()) {
      try {
        const d = new Doctor(data);
        const saved: any = await d.save();
        const doc: DoctorData = {
          id: saved._id.toString(),
          name: saved.name,
          specialization: saved.specialization,
          experienceYears: saved.experienceYears,
          availability: saved.availability,
          contact: saved.contact,
          email: saved.email,
          department: saved.department
        };
        inMemoryStore.doctors.push(doc);
        return doc;
      } catch (err) {
        console.warn('MongoDB doctor save failed:', err);
      }
    }
    const newDoc: DoctorData = {
      ...data,
      id: 'd_' + Date.now().toString(36)
    };
    inMemoryStore.doctors.push(newDoc);
    return newDoc;
  },
  async update(id: string, updates: Partial<DoctorData>): Promise<DoctorData | null> {
    if (getMongoReady()) {
      try {
        await Doctor.findByIdAndUpdate(id, updates);
      } catch (err) {
        console.warn('MongoDB doctor update failed:', err);
      }
    }
    const target = inMemoryStore.doctors.find(d => d.id === id);
    if (target) {
      Object.assign(target, updates, { id: target.id });
      return target;
    }
    return null;
  },
  async delete(id: string): Promise<boolean> {
    if (getMongoReady()) {
      try {
        await Doctor.findByIdAndDelete(id);
      } catch (err) {
        console.warn('MongoDB doctor delete failed:', err);
      }
    }
    const len = inMemoryStore.doctors.length;
    inMemoryStore.doctors = inMemoryStore.doctors.filter(d => d.id !== id);
    return inMemoryStore.doctors.length < len;
  }
};

// 3. Appointments Store
export const appointmentsStore = {
  async getAll(): Promise<AppointmentData[]> {
    if (getMongoReady()) {
      try {
        const appts = await Appointment.find().sort({ createdAt: -1 });
        if (appts.length > 0) {
          return appts.map((a: any) => ({
            id: a._id.toString(),
            patientId: a.patientId,
            patientName: a.patientName,
            doctorId: a.doctorId,
            doctorName: a.doctorName,
            date: a.date,
            time: a.time,
            status: a.status,
            reason: a.reason
          }));
        }
      } catch (err) {
        console.warn('MongoDB appointments query failed:', err);
      }
    }
    return inMemoryStore.appointments;
  },
  async create(data: Omit<AppointmentData, 'id'>): Promise<AppointmentData> {
    if (getMongoReady()) {
      try {
        const appt = new Appointment(data);
        const saved: any = await appt.save();
        const record: AppointmentData = {
          id: saved._id.toString(),
          patientId: saved.patientId,
          patientName: saved.patientName,
          doctorId: saved.doctorId,
          doctorName: saved.doctorName,
          date: saved.date,
          time: saved.time,
          status: saved.status,
          reason: saved.reason
        };
        inMemoryStore.appointments.unshift(record);
        return record;
      } catch (err) {
        console.warn('MongoDB appointment save failed:', err);
      }
    }
    const newAppt: AppointmentData = {
      ...data,
      id: 'a_' + Date.now().toString(36)
    };
    inMemoryStore.appointments.unshift(newAppt);
    return newAppt;
  },
  async update(id: string, updates: Partial<AppointmentData>): Promise<AppointmentData | null> {
    if (getMongoReady()) {
      try {
        await Appointment.findByIdAndUpdate(id, updates);
      } catch (err) {
        console.warn('MongoDB appointment update failed:', err);
      }
    }
    const target = inMemoryStore.appointments.find(a => a.id === id);
    if (target) {
      Object.assign(target, updates, { id: target.id });
      return target;
    }
    return null;
  },
  async delete(id: string): Promise<boolean> {
    if (getMongoReady()) {
      try {
        await Appointment.findByIdAndDelete(id);
      } catch (err) {
        console.warn('MongoDB appointment delete failed:', err);
      }
    }
    const len = inMemoryStore.appointments.length;
    inMemoryStore.appointments = inMemoryStore.appointments.filter(a => a.id !== id);
    return inMemoryStore.appointments.length < len;
  }
};

// 4. Beds Store
export const bedsStore = {
  async getAll(): Promise<BedData[]> {
    if (getMongoReady()) {
      try {
        const beds = await Bed.find();
        if (beds.length > 0) {
          return beds.map((b: any) => ({
            id: b._id.toString(),
            ward: b.ward,
            bedNumber: b.bedNumber,
            type: b.type,
            status: b.status,
            patientId: b.patientId,
            patientName: b.patientName
          }));
        }
      } catch (err) {
        console.warn('MongoDB beds query failed:', err);
      }
    }
    return inMemoryStore.beds;
  },
  async updateStatus(id: string, status: BedData['status'], patientId?: string, patientName?: string): Promise<BedData | null> {
    if (getMongoReady()) {
      try {
        await Bed.findByIdAndUpdate(id, {
          status,
          patientId: status === 'Occupied' ? patientId : undefined,
          patientName: status === 'Occupied' ? patientName : undefined
        });
      } catch (err) {
        console.warn('MongoDB bed update failed:', err);
      }
    }
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
  async getAll(): Promise<DepartmentData[]> {
    if (getMongoReady()) {
      try {
        const depts = await Department.find();
        if (depts.length > 0) {
          return depts.map((d: any) => ({
            id: d._id.toString(),
            name: d.name,
            headDoctorId: d.headDoctorId,
            headDoctorName: d.headDoctorName,
            capacity: d.capacity,
            occupiedBeds: d.occupiedBeds,
            description: d.description
          }));
        }
      } catch (err) {
        console.warn('MongoDB departments query failed:', err);
      }
    }
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
  async getAll(): Promise<MedicalRecordData[]> {
    if (getMongoReady()) {
      try {
        const recs = await MedicalRecord.find().sort({ createdAt: -1 });
        if (recs.length > 0) {
          return recs.map((m: any) => ({
            id: m._id.toString(),
            patientId: m.patientId,
            patientName: m.patientName,
            date: m.date,
            diagnosis: m.diagnosis,
            prescription: m.prescription,
            notes: m.notes,
            doctorId: m.doctorId,
            doctorName: m.doctorName
          }));
        }
      } catch (err) {
        console.warn('MongoDB medical records query failed:', err);
      }
    }
    return inMemoryStore.medicalRecords;
  },
  getByPatient(patientId: string): MedicalRecordData[] {
    return inMemoryStore.medicalRecords.filter(m => m.patientId === patientId);
  },
  async create(data: Omit<MedicalRecordData, 'id'>): Promise<MedicalRecordData> {
    if (getMongoReady()) {
      try {
        const rec = new MedicalRecord(data);
        const saved: any = await rec.save();
        const record: MedicalRecordData = {
          id: saved._id.toString(),
          patientId: saved.patientId,
          patientName: saved.patientName,
          date: saved.date,
          diagnosis: saved.diagnosis,
          prescription: saved.prescription,
          notes: saved.notes,
          doctorId: saved.doctorId,
          doctorName: saved.doctorName
        };
        inMemoryStore.medicalRecords.unshift(record);
        return record;
      } catch (err) {
        console.warn('MongoDB record save failed:', err);
      }
    }
    const newRecord: MedicalRecordData = {
      ...data,
      id: 'mr_' + Date.now().toString(36)
    };
    inMemoryStore.medicalRecords.unshift(newRecord);
    return newRecord;
  }
};
