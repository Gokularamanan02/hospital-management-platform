import mongoose, { Document } from 'mongoose';
export interface IPatient extends Document {
    name: string;
    age: number;
    gender: 'Male' | 'Female' | 'Other';
    bloodGroup: string;
    contact: string;
    status: 'Admitted' | 'Discharged' | 'Outpatient';
    admissionDate?: Date;
}
declare const _default: mongoose.Model<IPatient, {}, {}, {}, Document<unknown, {}, IPatient, {}, mongoose.DefaultSchemaOptions> & IPatient & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IPatient & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}>;
export default _default;
//# sourceMappingURL=Patient.d.ts.map