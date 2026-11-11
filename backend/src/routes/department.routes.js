import { Router } from 'express';
import { departmentsStore } from '../data/dbStore.js';
const router = Router();
router.get('/', (_req, res) => {
    res.json(departmentsStore.getAll());
});
router.post('/', (req, res) => {
    try {
        const { name, headDoctorId, headDoctorName, capacity, occupiedBeds, description } = req.body;
        if (!name || !headDoctorName) {
            return res.status(400).json({ message: 'Missing department details' });
        }
        const dept = departmentsStore.create({
            name,
            headDoctorId: headDoctorId || 'd1',
            headDoctorName,
            capacity: Number(capacity) || 20,
            occupiedBeds: Number(occupiedBeds) || 0,
            description: description || `${name} specialized care unit.`
        });
        res.status(201).json(dept);
    }
    catch (error) {
        res.status(400).json({ message: 'Error adding department', error });
    }
});
export default router;
//# sourceMappingURL=department.routes.js.map