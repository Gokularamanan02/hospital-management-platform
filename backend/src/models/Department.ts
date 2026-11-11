import mongoose, { Schema, Document } from 'mongoose';

export interface IDepartment extends Document {
  name: string;
  headDoctorId: string;
  headDoctorName: string;
  capacity: number;
  occupiedBeds: number;
  description: string;
}

const DepartmentSchema: Schema = new Schema({
  name: { type: String, required: true },
  headDoctorId: { type: String, required: true },
  headDoctorName: { type: String, required: true },
  capacity: { type: Number, default: 20 },
  occupiedBeds: { type: Number, default: 0 },
  description: { type: String }
}, {
  timestamps: true
});

export default mongoose.model<IDepartment>('Department', DepartmentSchema);

