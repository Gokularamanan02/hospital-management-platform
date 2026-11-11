import { Router } from 'express';
import { patientsStore, bedsStore, appointmentsStore, doctorsStore } from '../data/dbStore.js';
const router = Router();
// GET /api/analytics/dashboard
router.get('/dashboard', async (_req, res) => {
    try {
        const patients = await patientsStore.getAll();
        const beds = bedsStore.getAll();
        const appointments = appointmentsStore.getAll();
        const doctors = doctorsStore.getAll();
        const admittedPatients = patients.filter(p => p.status === 'Admitted').length;
        const availableBeds = beds.filter(b => b.status === 'Available').length;
        const occupiedBeds = beds.filter(b => b.status === 'Occupied').length;
        const todayAppointments = appointments.length;
        const criticalCases = beds.filter(b => b.ward === 'ICU-A' && b.status === 'Occupied').length;
        const activeDoctors = doctors.filter(d => d.availability === 'Available').length;
        res.json({
            totalPatients: patients.length,
            admittedPatients,
            availableBeds,
            occupiedBeds,
            todayAppointments,
            criticalCases,
            activeDoctors,
            weeklyAppointments: [
                { name: 'Mon', appointments: 12 },
                { name: 'Tue', appointments: 19 },
                { name: 'Wed', appointments: 15 },
                { name: 'Thu', appointments: 22 },
                { name: 'Fri', appointments: 28 },
                { name: 'Sat', appointments: 10 },
                { name: 'Sun', appointments: 5 },
            ]
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Error retrieving analytics', error });
    }
});
export default router;
//# sourceMappingURL=analytics.routes.js.map