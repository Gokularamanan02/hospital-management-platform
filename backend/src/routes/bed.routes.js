import { Router } from 'express';
import { bedsStore, patientsStore } from '../data/dbStore.js';
const router = Router();
router.get('/', (_req, res) => {
    res.json(bedsStore.getAll());
});
router.post('/', (req, res) => {
    try {
        const { ward, bedNumber, type, status } = req.body;
        if (!ward || !bedNumber || !type) {
            return res.status(400).json({ message: 'Missing bed information' });
        }
        const newBed = bedsStore.create({
            ward,
            bedNumber,
            type,
            status: status || 'Available'
        });
        res.status(201).json(newBed);
    }
    catch (error) {
        res.status(400).json({ message: 'Error adding bed', error });
    }
});
router.patch('/:id/status', async (req, res) => {
    try {
        const { status, patientId } = req.body;
        let patientName;
        if (patientId) {
            const patient = await patientsStore.getById(patientId);
            if (patient)
                patientName = patient.name;
        }
        const updated = bedsStore.updateStatus(req.params.id, status, patientId, patientName);
        if (!updated)
            return res.status(404).json({ message: 'Bed not found' });
        res.json(updated);
    }
    catch (error) {
        res.status(400).json({ message: 'Error updating bed status', error });
    }
});
export default router;
//# sourceMappingURL=bed.routes.js.map