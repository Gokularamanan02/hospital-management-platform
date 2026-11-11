import mongoose, { Schema, Document } from 'mongoose';

export interface IBed extends Document {
  ward: string;
  bedNumber: string;
  type: 'ICU' | 'General' | 'Private' | 'Emergency';
  status: 'Available' | 'Occupied' | 'Maintenance';
  patientId?: string;
  patientName?: string;
}

const BedSchema: Schema = new Schema({
  ward: { type: String, required: true },
  bedNumber: { type: String, required: true },
  type: { type: String, enum: ['ICU', 'General', 'Private', 'Emergency'], required: true },
  status: { type: String, enum: ['Available', 'Occupied', 'Maintenance'], default: 'Available' },
  patientId: { type: String },
  patientName: { type: String }
}, {
  timestamps: true
});

export default mongoose.model<IBed>('Bed', BedSchema);
