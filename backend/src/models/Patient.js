import mongoose, { Schema, Document } from 'mongoose';
const PatientSchema = new Schema({
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
export default mongoose.model('Patient', PatientSchema);
//# sourceMappingURL=Patient.js.map