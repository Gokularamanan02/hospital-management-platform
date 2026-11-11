import { Router } from 'express';
import { appointmentsStore, doctorsStore, patientsStore } from '../data/dbStore.js';

const router = Router();

router.get('/', async (_req, res) => {
  try {
    const appts = await appointmentsStore.getAll();
    res.json(appts);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving appointments', error });
  }
});

router.post('/', async (req, res) => {
  try {
    const { patientId, doctorId, date, time, status, reason } = req.body;
    if (!patientId || !doctorId || !date || !time) {
      return res.status(400).json({ message: 'Missing appointment details' });
    }
    const patient = await patientsStore.getById(patientId);
    const doctor = await doctorsStore.getById(doctorId);

    const appt = await appointmentsStore.create({
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

router.put('/:id', async (req, res) => {
  try {
    const updated = await appointmentsStore.update(req.params.id, req.body);
    if (!updated) return res.status(404).json({ message: 'Appointment not found' });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: 'Error updating appointment', error });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const deleted = await appointmentsStore.delete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Appointment not found' });
    res.json({ message: 'Appointment cancelled and removed' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting appointment', error });
  }
});

export default router;
