import mongoose from 'mongoose';
import Patient from '../models/Patient.js';
import { initialPatients, initialDoctors, initialAppointments, initialBeds, initialDepartments, initialMedicalRecords } from './seedData.js';
let isMongoReady = false;
export function setMongoReady(ready) {
    isMongoReady = ready;
}
export function getMongoReady() {
    return isMongoReady && mongoose.connection.readyState === 1;
}
// In-Memory mutable stores
const inMemoryStore = {
    patients: [...initialPatients],
    doctors: [...initialDoctors],
    appointments: [...initialAppointments],
    beds: [...initialBeds],
    departments: [...initialDepartments],
    medicalRecords: [...initialMedicalRecords]
};
// 1. Patients Store
export const patientsStore = {
    async getAll() {
        if (getMongoReady()) {
            try {
                const patients = await Patient.find().sort({ createdAt: -1 });
                return patients.map((p) => ({
                    id: p._id.toString(),
                    name: p.name,
                    age: p.age,
                    gender: p.gender,
                    bloodGroup: p.bloodGroup,
                    contact: p.contact,
                    status: p.status,
                    admissionDate: p.admissionDate ? p.admissionDate.toISOString().split('T')[0] : undefined
                }));
            }
            catch (err) {
                console.warn('MongoDB query failed, falling back to memory store:', err);
            }
        }
        return inMemoryStore.patients;
    },
    async getById(id) {
        if (getMongoReady()) {
            try {
                const p = await Patient.findById(id);
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
            }
            catch (err) {
                console.warn('MongoDB query failed, falling back to memory store:', err);
            }
        }
        return inMemoryStore.patients.find(p => p.id === id) || null;
    },
    async create(data) {
        if (getMongoReady()) {
            try {
                const p = new Patient(data);
                const saved = await p.save();
                const record = {
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
            }
            catch (err) {
                console.warn('MongoDB save failed, persisting to in-memory store:', err);
            }
        }
        const newRecord = {
            ...data,
            id: 'p_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5)
        };
        inMemoryStore.patients.unshift(newRecord);
        return newRecord;
    },
    async update(id, updates) {
        if (getMongoReady()) {
            try {
                const updated = await Patient.findByIdAndUpdate(id, updates, { new: true });
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
            }
            catch (err) {
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
    async delete(id) {
        if (getMongoReady()) {
            try {
                await Patient.findByIdAndDelete(id);
            }
            catch (err) {
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
    getAll() {
        return inMemoryStore.doctors;
    },
    getById(id) {
        return inMemoryStore.doctors.find(d => d.id === id) || null;
    },
    create(data) {
        const newDoc = {
            ...data,
            id: 'd_' + Date.now().toString(36)
        };
        inMemoryStore.doctors.push(newDoc);
        return newDoc;
    },
    update(id, updates) {
        const target = inMemoryStore.doctors.find(d => d.id === id);
        if (target) {
            Object.assign(target, updates, { id: target.id });
            return target;
        }
        return null;
    },
    delete(id) {
        const len = inMemoryStore.doctors.length;
        inMemoryStore.doctors = inMemoryStore.doctors.filter(d => d.id !== id);
        return inMemoryStore.doctors.length < len;
    }
};
// 3. Appointments Store
export const appointmentsStore = {
    getAll() {
        return inMemoryStore.appointments;
    },
    create(data) {
        const newAppt = {
            ...data,
            id: 'a_' + Date.now().toString(36)
        };
        inMemoryStore.appointments.unshift(newAppt);
        return newAppt;
    },
    update(id, updates) {
        const target = inMemoryStore.appointments.find(a => a.id === id);
        if (target) {
            Object.assign(target, updates, { id: target.id });
            return target;
        }
        return null;
    },
    delete(id) {
        const len = inMemoryStore.appointments.length;
        inMemoryStore.appointments = inMemoryStore.appointments.filter(a => a.id !== id);
        return inMemoryStore.appointments.length < len;
    }
};
// 4. Beds Store
export const bedsStore = {
    getAll() {
        return inMemoryStore.beds;
    },
    updateStatus(id, status, patientId, patientName) {
        const target = inMemoryStore.beds.find(b => b.id === id);
        if (target) {
            target.status = status;
            target.patientId = status === 'Occupied' ? patientId : undefined;
            target.patientName = status === 'Occupied' ? patientName : undefined;
            return target;
        }
        return null;
    },
    create(data) {
        const newBed = {
            ...data,
            id: 'b_' + Date.now().toString(36)
        };
        inMemoryStore.beds.push(newBed);
        return newBed;
    }
};
// 5. Departments Store
export const departmentsStore = {
    getAll() {
        return inMemoryStore.departments;
    },
    create(data) {
        const newDept = {
            ...data,
            id: 'dep_' + Date.now().toString(36)
        };
        inMemoryStore.departments.push(newDept);
        return newDept;
    }
};
// 6. Medical Records Store
export const medicalRecordsStore = {
    getAll() {
        return inMemoryStore.medicalRecords;
    },
    getByPatient(patientId) {
        return inMemoryStore.medicalRecords.filter(m => m.patientId === patientId);
    },
    create(data) {
        const newRecord = {
            ...data,
            id: 'mr_' + Date.now().toString(36)
        };
        inMemoryStore.medicalRecords.unshift(newRecord);
        return newRecord;
    }
};
//# sourceMappingURL=dbStore.js.map