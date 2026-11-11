import mongoose, { Schema, Document } from 'mongoose';
const DepartmentSchema = new Schema({
    name: { type: String, required: true },
    headDoctorId: { type: String, required: true },
    headDoctorName: { type: String, required: true },
    capacity: { type: Number, default: 20 },
    occupiedBeds: { type: Number, default: 0 },
    description: { type: String }
}, {
    timestamps: true
});
export default mongoose.model('Department', DepartmentSchema);
//# sourceMappingURL=Department.js.map