import mongoose, { Schema, Document } from 'mongoose';

export interface IDoctor extends Document {
  name: string;
  specialization: string;
  experienceYears: number;
  availability: 'Available' | 'In Surgery' | 'Off Duty';
  contact: string;
  email: string;
  department: string;
}

const DoctorSchema: Schema = new Schema({
  name: { type: String, required: true },
  specialization: { type: String, required: true },
  experienceYears: { type: Number, default: 0 },
  availability: { type: String, enum: ['Available', 'In Surgery', 'Off Duty'], default: 'Available' },
  contact: { type: String, required: true },
  email: { type: String },
  department: { type: String }
}, {
  timestamps: true
});

export default mongoose.model<IDoctor>('Doctor', DoctorSchema);
