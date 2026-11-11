import { Router } from 'express';
import { appointmentsStore, doctorsStore, patientsStore } from '../data/dbStore.js';

const router = Router();

router.get('/', (_req, res) => {
  res.json(appointmentsStore.getAll());
});

router.post('/', async (req, res) => {
  try {
    const { patientId, doctorId, date, time, status, reason } = req.body;
    if (!patientId || !doctorId || !date || !time) {
      return res.status(400).json({ message: 'Missing appointment details' });
    }
    const patient = await patientsStore.getById(patientId);
    const doctor = doctorsStore.getById(doctorId);

    const appt = appointmentsStore.create({
      patientId,
      patientName: patient ? patient.name : 'Unknown Patient',
      doctorId,
      doctorName: doctor ? doctor.name : 'Unknown Doctor',
      date,
      time,
      status: status || 'Scheduled',
      reason: reason || 'Consultation'
    });
    res.status(201).json(appt);
  } catch (error) {
    res.status(400).json({ message: 'Error scheduling appointment', error });
  }
});

router.put('/:id', (req, res) => {
  const updated = appointmentsStore.update(req.params.id, req.body);
  if (!updated) return res.status(404).json({ message: 'Appointment not found' });
  res.json(updated);
});

router.delete('/:id', (req, res) => {
  const deleted = appointmentsStore.delete(req.params.id);
  if (!deleted) return res.status(404).json({ message: 'Appointment not found' });
  res.json({ message: 'Appointment cancelled and removed' });
});

export default router;

