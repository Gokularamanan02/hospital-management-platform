import mongoose, { Schema, Document } from 'mongoose';

export interface IAppointment extends Document {
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  date: string;
  time: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled' | 'No-show';
  reason: string;
}

const AppointmentSchema: Schema = new Schema({
  patientId: { type: String, required: true },
  patientName: { type: String },
  doctorId: { type: String, required: true },
  doctorName: { type: String },
  date: { type: String, required: true },
  time: { type: String, required: true },
  status: { type: String, enum: ['Scheduled', 'Completed', 'Cancelled', 'No-show'], default: 'Scheduled' },
  reason: { type: String, required: true }
}, {
  timestamps: true
});

export default mongoose.model<IAppointment>('Appointment', AppointmentSchema);

