import mongoose, { Schema, Document } from 'mongoose';
const DoctorSchema = new Schema({
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
export default mongoose.model('Doctor', DoctorSchema);
//# sourceMappingURL=Doctor.js.map