import mongoose, { Schema, Document } from 'mongoose';

export interface IMedicalRecord extends Document {
  patientId: string;
  patientName: string;
  date: string;
  diagnosis: string;
  prescription: string;
  notes: string;
  doctorId: string;
  doctorName: string;
}

const MedicalRecordSchema: Schema = new Schema({
  patientId: { type: String, required: true },
  patientName: { type: String },
  date: { type: String, required: true },
  diagnosis: { type: String, required: true },
  prescription: { type: String, required: true },
  notes: { type: String },
  doctorId: { type: String, required: true },
  doctorName: { type: String }
}, {
  timestamps: true
});

export default mongoose.model<IMedicalRecord>('MedicalRecord', MedicalRecordSchema);

