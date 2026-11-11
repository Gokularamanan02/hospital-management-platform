import { Router } from 'express';
import { departmentsStore } from '../data/dbStore.js';

const router = Router();

router.get('/', async (_req, res) => {
  try {
    const depts = await departmentsStore.getAll();
    res.json(depts);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving departments', error });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, headDoctorId, headDoctorName, capacity, occupiedBeds, description } = req.body;
    if (!name || !headDoctorName) {
      return res.status(400).json({ message: 'Missing department details' });
    }
    const dept = await departmentsStore.create({
      name,
      headDoctorId: headDoctorId || 'd1',
      headDoctorName,
      capacity: Number(capacity) || 20,
      occupiedBeds: Number(occupiedBeds) || 0,
      description: description || `${name} specialized care unit.`
    });
    res.status(201).json(dept);
  } catch (error) {
    res.status(400).json({ message: 'Error adding department', error });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const updated = await departmentsStore.update(req.params.id, req.body);
    if (!updated) return res.status(404).json({ message: 'Department not found' });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: 'Error updating department', error });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const deleted = await departmentsStore.delete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Department not found' });
    res.json({ message: 'Department removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting department', error });
  }
});

export default router;

