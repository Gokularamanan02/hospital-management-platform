import mongoose, { Document } from 'mongoose';
export interface IAppointment extends Document {
    patientId: string;
    patientName: string;
    doctorId: string;
    doctorName: string;
    date: string;
    time: string;
    status: 'Scheduled' | 'Completed' | 'Cancelled' | 'No-show';
    reason: string;
}
declare const _default: mongoose.Model<IAppointment, {}, {}, {}, Document<unknown, {}, IAppointment, {}, mongoose.DefaultSchemaOptions> & IAppointment & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IAppointment & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}>;
export default _default;
//# sourceMappingURL=Appointment.d.ts.map