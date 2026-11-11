import { Router } from 'express';
import { doctorsStore } from '../data/dbStore.js';

const router = Router();

router.get('/', async (_req, res) => {
  try {
    const docs = await doctorsStore.getAll();
    res.json(docs);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving doctors', error });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const doc = await doctorsStore.getById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Doctor not found' });
    res.json(doc);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving doctor', error });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, specialization, experienceYears, availability, contact, email, department } = req.body;
    if (!name || !specialization || !contact) {
      return res.status(400).json({ message: 'Missing required doctor fields' });
    }
    const doctor = await doctorsStore.create({
      name,
      specialization,
      experienceYears: Number(experienceYears) || 0,
      availability: availability || 'Available',
      contact,
      email: email || `${name.toLowerCase().replace(/[^a-z]/g, '')}@nalam.care`,
      department: department || specialization
    });
    res.status(201).json(doctor);
  } catch (error) {
    res.status(400).json({ message: 'Error creating doctor', error });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const updated = await doctorsStore.update(req.params.id, req.body);
    if (!updated) return res.status(404).json({ message: 'Doctor not found' });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: 'Error updating doctor', error });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const deleted = await doctorsStore.delete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Doctor not found' });
    res.json({ message: 'Doctor removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting doctor', error });
  }
});

export default router;
