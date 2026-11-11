import mongoose, { Document } from 'mongoose';
export interface IDepartment extends Document {
    name: string;
    headDoctorId: string;
    headDoctorName: string;
    capacity: number;
    occupiedBeds: number;
    description: string;
}
declare const _default: mongoose.Model<IDepartment, {}, {}, {}, Document<unknown, {}, IDepartment, {}, mongoose.DefaultSchemaOptions> & IDepartment & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IDepartment & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}>;
export default _default;
//# sourceMappingURL=Department.d.ts.map