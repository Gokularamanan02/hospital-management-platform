import mongoose, { Document } from 'mongoose';
export interface IBed extends Document {
    ward: string;
    bedNumber: string;
    type: 'ICU' | 'General' | 'Private' | 'Emergency';
    status: 'Available' | 'Occupied' | 'Maintenance';
    patientId?: string;
    patientName?: string;
}
declare const _default: mongoose.Model<IBed, {}, {}, {}, Document<unknown, {}, IBed, {}, mongoose.DefaultSchemaOptions> & IBed & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IBed & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}>;
export default _default;
//# sourceMappingURL=Bed.d.ts.map