import { Router } from 'express';
import { patientsStore } from '../data/dbStore.js';
const router = Router();
// GET /api/patients - Get all patients
router.get('/', async (_req, res) => {
    try {
        const patients = await patientsStore.getAll();
        res.json(patients);
    }
    catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
});
// GET /api/patients/:id - Get single patient
router.get('/:id', async (req, res) => {
    try {
        const patient = await patientsStore.getById(req.params.id);
        if (!patient) {
            return res.status(404).json({ message: 'Patient not found' });
        }
        res.json(patient);
    }
    catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
});
// POST /api/patients - Create a new patient
router.post('/', async (req, res) => {
    try {
        const { name, age, gender, bloodGroup, contact, status, admissionDate, ward, bedNumber } = req.body;
        if (!name || age === undefined || !gender || !bloodGroup || !contact) {
            return res.status(400).json({ message: 'Missing required patient fields' });
        }
        const newPatient = await patientsStore.create({
            name,
            age: Number(age),
            gender,
            bloodGroup,
            contact,
            status: status || 'Outpatient',
            admissionDate: admissionDate || (status === 'Admitted' ? new Date().toISOString().split('T')[0] : undefined),
            ward,
            bedNumber
        });
        res.status(201).json(newPatient);
    }
    catch (error) {
        res.status(400).json({ message: 'Error saving patient', error });
    }
});
// PUT /api/patients/:id - Update patient
router.put('/:id', async (req, res) => {
    try {
        const updated = await patientsStore.update(req.params.id, req.body);
        if (!updated) {
            return res.status(404).json({ message: 'Patient not found' });
        }
        res.json(updated);
    }
    catch (error) {
        res.status(400).json({ message: 'Error updating patient', error });
    }
});
// DELETE /api/patients/:id - Delete patient
router.delete('/:id', async (req, res) => {
    try {
        const deleted = await patientsStore.delete(req.params.id);
        if (!deleted) {
            return res.status(404).json({ message: 'Patient not found' });
        }
        res.json({ message: 'Patient deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error deleting patient', error });
    }
});
export default router;
//# sourceMappingURL=patient.routes.js.map