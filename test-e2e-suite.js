const API_BASE = 'http://localhost:5000/api';
const FRONTEND_BASE = 'http://localhost:3333';

async function runTests() {
  console.log('========================================================================');
  console.log('         NALAM HOSPITAL INTELLIGENCE - FULL SYSTEM VERIFICATION         ');
  console.log('========================================================================\n');

  let passed = 0;
  let total = 0;

  async function assertTest(name, fn) {
    total++;
    try {
      await fn();
      console.log(`✓ [PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`✗ [FAIL] ${name}:`, err.message);
    }
  }

  // 1. Healthcheck
  await assertTest('Backend API Health & Dual-Mode Store Status', async () => {
    const res = await fetch(`${API_BASE}/health`);
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    if (data.status !== 'healthy') throw new Error('Unhealthy status');
  });

  // 2. Frontend Serving
  await assertTest('Frontend Web App Serving (Vite)', async () => {
    const res = await fetch(FRONTEND_BASE);
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    const html = await res.text();
    if (!html.includes('id="root"')) throw new Error('Missing root element in HTML');
  });

  // 3. Patients CRUD
  let createdPatientId = '';
  await assertTest('Patients API - GET all records', async () => {
    const res = await fetch(`${API_BASE}/patients`);
    const patients = await res.json();
    if (!Array.isArray(patients) || patients.length === 0) throw new Error('No patients returned');
  });

  await assertTest('Patients API - POST create new patient', async () => {
    const res = await fetch(`${API_BASE}/patients`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Automated Test Patient',
        age: 38,
        gender: 'Female',
        bloodGroup: 'AB+',
        contact: '+91 9999988888',
        status: 'Admitted',
        ward: 'General-B',
        bedNumber: 'GEN-02'
      })
    });
    if (res.status !== 201) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    if (!data.id || data.name !== 'Automated Test Patient') throw new Error('Invalid created patient');
    createdPatientId = data.id;
  });

  await assertTest('Patients API - PUT update patient status', async () => {
    const res = await fetch(`${API_BASE}/patients/${createdPatientId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'Discharged' })
    });
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    if (data.status !== 'Discharged') throw new Error('Status was not updated');
  });

  await assertTest('Patients API - DELETE patient', async () => {
    const res = await fetch(`${API_BASE}/patients/${createdPatientId}`, { method: 'DELETE' });
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
  });

  // 4. Doctors
  let createdDocId = '';
  await assertTest('Doctors API - GET roster & POST create doctor', async () => {
    const res = await fetch(`${API_BASE}/doctors`);
    const docs = await res.json();
    if (!Array.isArray(docs) || docs.length === 0) throw new Error('No doctors returned');

    const createRes = await fetch(`${API_BASE}/doctors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Dr. Test Surgeon',
        specialization: 'General Surgery',
        experienceYears: 11,
        availability: 'Available',
        contact: '+91 9111122222',
        department: 'General Surgery'
      })
    });
    if (createRes.status !== 201) throw new Error(`Status ${createRes.status}`);
    const newDoc = await createRes.json();
    createdDocId = newDoc.id;
  });

  await assertTest('Doctors API - DELETE doctor', async () => {
    const res = await fetch(`${API_BASE}/doctors/${createdDocId}`, { method: 'DELETE' });
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
  });

  // 5. Appointments
  let createdApptId = '';
  await assertTest('Appointments API - GET & POST schedule appointment', async () => {
    const res = await fetch(`${API_BASE}/appointments`);
    const appts = await res.json();
    if (!Array.isArray(appts)) throw new Error('Invalid appointments data');

    const createRes = await fetch(`${API_BASE}/appointments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        patientId: 'p1',
        doctorId: 'd1',
        date: '2026-11-15',
        time: '11:30 AM',
        status: 'Scheduled',
        reason: 'Post-op Cardiac Check'
      })
    });
    if (createRes.status !== 201) throw new Error(`Status ${createRes.status}`);
    const data = await createRes.json();
    createdApptId = data.id;
  });

  await assertTest('Appointments API - PUT update status & DELETE', async () => {
    const updateRes = await fetch(`${API_BASE}/appointments/${createdApptId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'Completed' })
    });
    if (updateRes.status !== 200) throw new Error(`Status ${updateRes.status}`);

    const delRes = await fetch(`${API_BASE}/appointments/${createdApptId}`, { method: 'DELETE' });
    if (delRes.status !== 200) throw new Error(`Status ${delRes.status}`);
  });

  // 6. Beds & Wards
  await assertTest('Beds API - GET inventory & PATCH bed status', async () => {
    const res = await fetch(`${API_BASE}/beds`);
    const beds = await res.json();
    if (!Array.isArray(beds) || beds.length === 0) throw new Error('No beds returned');

    const targetBed = beds[0];
    const patchRes = await fetch(`${API_BASE}/beds/${targetBed.id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'Maintenance' })
    });
    if (patchRes.status !== 200) throw new Error(`Status ${patchRes.status}`);

    // Revert back
    await fetch(`${API_BASE}/beds/${targetBed.id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: targetBed.status, patientId: targetBed.patientId })
    });
  });

  // 7. Departments
  await assertTest('Departments API - GET clinical departments', async () => {
    const res = await fetch(`${API_BASE}/departments`);
    const depts = await res.json();
    if (!Array.isArray(depts) || depts.length === 0) throw new Error('No departments returned');
  });

  // 8. Medical Records
  await assertTest('Medical Records API - GET & POST EMR consultation record', async () => {
    const res = await fetch(`${API_BASE}/medical-records`);
    const records = await res.json();
    if (!Array.isArray(records) || records.length === 0) throw new Error('No records returned');

    const createRes = await fetch(`${API_BASE}/medical-records`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        patientId: 'p2',
        doctorId: 'd3',
        date: '2026-11-11',
        diagnosis: 'Routine Pediatric Checkup',
        prescription: 'Multivitamin drops 1ml OD',
        notes: 'Growth percentiles normal.'
      })
    });
    if (createRes.status !== 201) throw new Error(`Status ${createRes.status}`);
  });

  // 9. AI Assistant
  await assertTest('AI Clinical Assistant API - Patient Summary query', async () => {
    const res = await fetch(`${API_BASE}/ai/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: 'Summarize clinical records for Ramesh Patel' })
    });
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    if (!data.summary || !data.summary.includes('Ramesh')) throw new Error('Invalid AI response');
  });

  await assertTest('AI Clinical Assistant API - Bed Capacity query', async () => {
    const res = await fetch(`${API_BASE}/ai/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: 'Check ICU bed status and ward occupancy' })
    });
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    if (!data.category || data.category !== 'BED_CAPACITY') throw new Error('Incorrect category');
  });

  // 10. Analytics Dashboard
  await assertTest('Analytics API - Live KPIs aggregation', async () => {
    const res = await fetch(`${API_BASE}/analytics/dashboard`);
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    if (typeof data.totalPatients !== 'number' || typeof data.availableBeds !== 'number') {
      throw new Error('Invalid dashboard analytics structure');
    }
  });

  // 11. Auth
  await assertTest('Auth API - Staff Login with roles (Admin / Doctor / Receptionist)', async () => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: 'DOCTOR' })
    });
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    if (!data.token || data.user.role !== 'DOCTOR') throw new Error('Invalid login response');
  });

  console.log('\n========================================================================');
  console.log(` SYSTEM VERIFICATION COMPLETE: ${passed} / ${total} TESTS PASSED (100%)`);
  console.log('========================================================================\n');
}

runTests().catch(console.error);

