import { Router } from 'express';
import { patientsStore, bedsStore } from '../data/dbStore.js';

const router = Router();

// GET /api/patients - Get all patients
router.get('/', async (_req, res) => {
  try {
    const patients = await patientsStore.getAll();
    res.json(patients);
  } catch (error) {
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
  } catch (error) {
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

    // Auto-sync Bed status if admitted
    if (status === 'Admitted' && bedNumber) {
      try {
        const allBeds = await bedsStore.getAll();
        const targetBed = allBeds.find(b => b.bedNumber === bedNumber);
        if (targetBed) {
          await bedsStore.updateStatus(targetBed.id, 'Occupied', newPatient.id, newPatient.name);
        }
      } catch (e) {
        console.warn('Bed auto-sync failed on admission:', e);
      }
    }

    res.status(201).json(newPatient);
  } catch (error) {
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

    // Auto-sync Bed status on discharge or bed reallocation
    try {
      if (req.body.status === 'Discharged') {
        const allBeds = await bedsStore.getAll();
        const patientBed = allBeds.find(b => b.patientId === req.params.id || b.patientName === updated.name);
        if (patientBed) {
          await bedsStore.updateStatus(patientBed.id, 'Available');
        }
      } else if (req.body.status === 'Admitted' && req.body.bedNumber) {
        const allBeds = await bedsStore.getAll();
        const targetBed = allBeds.find(b => b.bedNumber === req.body.bedNumber);
        if (targetBed) {
          await bedsStore.updateStatus(targetBed.id, 'Occupied', updated.id, updated.name);
        }
      }
    } catch (e) {
      console.warn('Bed auto-sync failed on update:', e);
    }

    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: 'Error updating patient', error });
  }
});

// DELETE /api/patients/:id - Delete patient
router.delete('/:id', async (req, res) => {
  try {
    // Release assigned bed if any
    try {
      const allBeds = await bedsStore.getAll();
      const patientBed = allBeds.find(b => b.patientId === req.params.id);
      if (patientBed) {
        await bedsStore.updateStatus(patientBed.id, 'Available');
      }
    } catch (e) {
      console.warn('Bed auto-sync failed on delete:', e);
    }

    const deleted = await patientsStore.delete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    res.json({ message: 'Patient deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting patient', error });
  }
});

export default router;
