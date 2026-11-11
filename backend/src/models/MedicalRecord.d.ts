import mongoose, { Document } from 'mongoose';
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
declare const _default: mongoose.Model<IMedicalRecord, {}, {}, {}, Document<unknown, {}, IMedicalRecord, {}, mongoose.DefaultSchemaOptions> & IMedicalRecord & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IMedicalRecord & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}>;
export default _default;
//# sourceMappingURL=MedicalRecord.d.ts.map