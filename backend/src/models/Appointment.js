import mongoose, { Schema, Document } from 'mongoose';
const AppointmentSchema = new Schema({
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
export default mongoose.model('Appointment', AppointmentSchema);
//# sourceMappingURL=Appointment.js.map