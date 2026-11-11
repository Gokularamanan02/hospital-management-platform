import mongoose, { Schema, Document } from 'mongoose';

export interface IPatient extends Document {
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  bloodGroup: string;
  contact: string;
  status: 'Admitted' | 'Discharged' | 'Outpatient';
  admissionDate?: Date;
}

const PatientSchema: Schema = new Schema({
  name: { type: String, required: true },
  age: { type: Number, required: true },
  gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
  bloodGroup: { type: String, required: true },
  contact: { type: String, required: true },
  status: { type: String, enum: ['Admitted', 'Discharged', 'Outpatient'], default: 'Outpatient' },
  admissionDate: { type: Date }
}, {
  timestamps: true
});

export default mongoose.model<IPatient>('Patient', PatientSchema);
