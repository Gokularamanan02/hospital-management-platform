import { Router } from 'express';
import { medicalRecordsStore, patientsStore, doctorsStore } from '../data/dbStore.js';

const router = Router();

router.get('/', async (_req, res) => {
  try {
    const recs = await medicalRecordsStore.getAll();
    res.json(recs);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving medical records', error });
  }
});

router.get('/patient/:patientId', (req, res) => {
  res.json(medicalRecordsStore.getByPatient(req.params.patientId));
});

router.post('/', async (req, res) => {
  try {
    const { patientId, doctorId, date, diagnosis, prescription, notes } = req.body;
    if (!patientId || !doctorId || !diagnosis || !prescription) {
      return res.status(400).json({ message: 'Missing record fields' });
    }
    const patient = await patientsStore.getById(patientId);
    const doctor = doctorsStore.getById(doctorId);

    const record = await medicalRecordsStore.create({
      patientId,
      patientName: patient ? patient.name : 'Unknown Patient',
      date: date || new Date().toISOString().split('T')[0],
      diagnosis,
      prescription,
      notes: notes || 'No additional notes.',
      doctorId,
      doctorName: doctor ? doctor.name : 'Unknown Doctor'
    });
    res.status(201).json(record);
  } catch (error) {
    res.status(400).json({ message: 'Error adding medical record', error });
  }
});

export default router;

