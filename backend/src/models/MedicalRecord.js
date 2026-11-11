import mongoose, { Schema, Document } from 'mongoose';
const MedicalRecordSchema = new Schema({
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
export default mongoose.model('MedicalRecord', MedicalRecordSchema);
//# sourceMappingURL=MedicalRecord.js.map