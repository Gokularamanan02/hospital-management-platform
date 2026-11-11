import mongoose, { Document } from 'mongoose';
export interface IDoctor extends Document {
    name: string;
    specialization: string;
    experienceYears: number;
    availability: 'Available' | 'In Surgery' | 'Off Duty';
    contact: string;
    email: string;
    department: string;
}
declare const _default: mongoose.Model<IDoctor, {}, {}, {}, Document<unknown, {}, IDoctor, {}, mongoose.DefaultSchemaOptions> & IDoctor & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IDoctor & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}>;
export default _default;
//# sourceMappingURL=Doctor.d.ts.map