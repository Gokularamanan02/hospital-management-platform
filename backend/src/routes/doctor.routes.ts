import { Router } from 'express';
import { doctorsStore } from '../data/dbStore.js';

const router = Router();

router.get('/', (_req, res) => {
  res.json(doctorsStore.getAll());
});

router.get('/:id', (req, res) => {
  const doc = doctorsStore.getById(req.params.id);
  if (!doc) return res.status(404).json({ message: 'Doctor not found' });
  res.json(doc);
});

router.post('/', (req, res) => {
  try {
    const { name, specialization, experienceYears, availability, contact, email, department } = req.body;
    if (!name || !specialization || !contact) {
      return res.status(400).json({ message: 'Missing required doctor fields' });
    }
    const doctor = doctorsStore.create({
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

router.put('/:id', (req, res) => {
  const updated = doctorsStore.update(req.params.id, req.body);
  if (!updated) return res.status(404).json({ message: 'Doctor not found' });
  res.json(updated);
});

router.delete('/:id', (req, res) => {
  const deleted = doctorsStore.delete(req.params.id);
  if (!deleted) return res.status(404).json({ message: 'Doctor not found' });
  res.json({ message: 'Doctor removed successfully' });
});

export default router;

