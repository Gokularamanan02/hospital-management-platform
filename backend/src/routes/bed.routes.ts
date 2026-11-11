import { Router } from 'express';
import { bedsStore, patientsStore } from '../data/dbStore.js';

const router = Router();

router.get('/', async (_req, res) => {
  try {
    const beds = await bedsStore.getAll();
    res.json(beds);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving beds', error });
  }
});

router.post('/', async (req, res) => {
  try {
    const { ward, bedNumber, type, status } = req.body;
    if (!ward || !bedNumber || !type) {
      return res.status(400).json({ message: 'Missing bed information' });
    }
    const newBed = await bedsStore.create({
      ward,
      bedNumber,
      type,
      status: status || 'Available'
    });
    res.status(201).json(newBed);
  } catch (error) {
    res.status(400).json({ message: 'Error adding bed', error });
  }
});

router.patch('/:id/status', async (req, res) => {
  try {
    const { status, patientId } = req.body;
    let patientName: string | undefined;

    // Find the target bed first
    const allBeds = await bedsStore.getAll();
    const targetBed = allBeds.find(b => b.id === req.params.id || b.bedNumber === req.params.id);

    if (status === 'Occupied' && patientId) {
      const patient = await patientsStore.getById(patientId);
      if (patient) {
        patientName = patient.name;
        // Auto sync patient record: set to Admitted and link bed
        if (targetBed) {
          await patientsStore.update(patient.id, {
            status: 'Admitted',
            ward: targetBed.ward,
            bedNumber: targetBed.bedNumber
          });
        }
      }
    } else if (status === 'Available' || status === 'Maintenance') {
      // If the bed was previously occupied, free that patient's assigned bed
      if (targetBed && targetBed.patientId) {
        const formerPatient = await patientsStore.getById(targetBed.patientId);
        if (formerPatient) {
          await patientsStore.update(formerPatient.id, {
            bedNumber: undefined,
            status: 'Discharged'
          });
        }
      }
    }

    const updated = await bedsStore.updateStatus(req.params.id, status, patientId, patientName);
    if (!updated) return res.status(404).json({ message: 'Bed not found' });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: 'Error updating bed status', error });
  }
});

export default router;
