import mongoose, { Schema, Document } from 'mongoose';
const BedSchema = new Schema({
    ward: { type: String, required: true },
    bedNumber: { type: String, required: true },
    type: { type: String, enum: ['ICU', 'General', 'Private', 'Emergency'], required: true },
    status: { type: String, enum: ['Available', 'Occupied', 'Maintenance'], default: 'Available' },
    patientId: { type: String },
    patientName: { type: String }
}, {
    timestamps: true
});
export default mongoose.model('Bed', BedSchema);
//# sourceMappingURL=Bed.js.map