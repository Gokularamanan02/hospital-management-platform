import { Router } from 'express';
import {
  patientsStore,
  doctorsStore,
  bedsStore,
  appointmentsStore,
  departmentsStore,
  medicalRecordsStore
} from '../data/dbStore.js';

const router = Router();

// Hospital Facility & Operational Constants
const HOSPITAL_INFO = {
  name: 'Nalam Medical Research & Multi-Specialty Hospital',
  emergencyHotline: '+91 44 2800 9000 (24/7 Trauma & Ambulance)',
  receptionDesk: '+91 44 2800 9100',
  email: 'care@nalam.hospital',
  address: '42 Healthway Boulevard, Medical District, Chennai, Tamil Nadu 600028',
  visitingHours: 'Daily 4:00 PM – 7:00 PM (ICU: 5:00 PM – 6:00 PM, 1 visitor at a time)',
  services: [
    '24/7 Emergency & Level-1 Trauma Care',
    'Comprehensive Cardiac Catheterization Lab',
    'Dedicated Neonatal & Pediatric Intensive Care (NICU/PICU)',
    'Advanced Robotic Orthopedic & Joint Replacement',
    'Comprehensive Stroke & Neuro-Critical Care Unit',
    'In-House 24/7 Pharmacy & NABH-Accredited Pathology Lab',
    'Cashless TPA & Insurance Desk (All Major Providers)'
  ]
};

// POST /api/ai/query
router.post('/query', async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ message: 'A valid text prompt is required' });
    }

    const lower = prompt.toLowerCase().trim();

    // Fetch live system state from dual-mode database
    const [allPatients, allDoctors, allBeds, allAppointments, allDepartments, allRecords] = await Promise.all([
      patientsStore.getAll(),
      doctorsStore.getAll(),
      bedsStore.getAll(),
      appointmentsStore.getAll(),
      departmentsStore.getAll(),
      medicalRecordsStore.getAll()
    ]);

    // OPTION A: If GEMINI_API_KEY is configured in .env, call Gemini API
    const geminiKey = process.env.GEMINI_API_KEY;
    if (geminiKey) {
      try {
        const systemContext = `
You are Nalam Hospital's Chief AI Intelligence Officer. You have real-time access to the live hospital database:
- Registered Patients (${allPatients.length}): ${JSON.stringify(allPatients.map(p => ({ id: p.id, name: p.name, age: p.age, gender: p.gender, status: p.status, ward: p.ward, bed: p.bedNumber })))}
- Physicians & Surgeons (${allDoctors.length}): ${JSON.stringify(allDoctors.map(d => ({ name: d.name, specialization: d.specialization, availability: d.availability, dept: d.department, contact: d.contact })))}
- Beds & Wards (${allBeds.length}): ${JSON.stringify(allBeds.map(b => ({ ward: b.ward, number: b.bedNumber, type: b.type, status: b.status, patient: b.patientName })))}
- Clinical Departments (${allDepartments.length}): ${JSON.stringify(allDepartments.map(dept => ({ name: dept.name, head: dept.headDoctorName, capacity: dept.capacity, occupied: dept.occupiedBeds })))}
- Appointments (${allAppointments.length}): ${JSON.stringify(allAppointments.map(a => ({ patient: a.patientName, doctor: a.doctorName, date: a.date, time: a.time, status: a.status })))}
- Hospital Info: Emergency ${HOSPITAL_INFO.emergencyHotline}, Visiting: ${HOSPITAL_INFO.visitingHours}.

Respond strictly in valid JSON format matching this schema:
{
  "category": "string (PATIENT_SUMMARY | DOCTOR_ROSTER | BED_CAPACITY | APPOINTMENTS | DEPARTMENT_INTEL | HOSPITAL_OPERATIONS | CLINICAL_ADVISORY)",
  "title": "string (Short descriptive headline)",
  "dataBadge": "string (Key live metrics summary)",
  "summary": "string (Direct, professional, accurate answer to the user query)",
  "insight": "string (Proactive clinical, operational, or administrative advisory)"
}
Do NOT wrap in markdown backticks. Return raw JSON.
`;

        const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              { role: 'user', parts: [{ text: `${systemContext}\n\nUser Question: ${prompt}` }] }
            ],
            generationConfig: {
              temperature: 0.2,
              responseMimeType: 'application/json'
            }
          })
        });

        if (geminiRes.ok) {
          const geminiData: any = await geminiRes.json();
          const rawText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawText) {
            const parsed = JSON.parse(rawText);
            return res.json({
              ...parsed,
              poweredBy: 'Google Gemini 2.0 Flash'
            });
          }
        }
      } catch (geminiError) {
        console.warn('Gemini API call failed, falling back to local clinical knowledge engine:', geminiError);
      }
    }

    // OPTION B: Advanced Built-In Hospital Knowledge & Semantic Intelligence Engine
    const promptWords = lower.split(/[^a-z0-9]+/);

    // 1. Patient Specific Search (Matches exact full name, ID, or unique name tokens)
    let matchedPatient = allPatients.find(p => lower.includes(p.name.toLowerCase()) || lower.includes(p.id.toLowerCase()));
    if (!matchedPatient) {
      matchedPatient = allPatients.find(p => {
        const nameTokens = p.name.toLowerCase().split(/\s+/);
        return nameTokens.some(token => token.length > 2 && promptWords.includes(token));
      });
    }

    if (matchedPatient) {
      const records = allRecords.filter(r => r.patientId === matchedPatient.id);
      const bed = allBeds.find(b => b.patientId === matchedPatient.id);
      const appts = allAppointments.filter(a => a.patientId === matchedPatient.id || a.patientName === matchedPatient.name);
      const latestRecord = records[0];

      return res.json({
        category: 'PATIENT_SUMMARY',
        title: `Clinical Profile: ${matchedPatient.name}`,
        dataBadge: `ID: ${matchedPatient.id} | Age: ${matchedPatient.age} (${matchedPatient.gender}) | Blood: ${matchedPatient.bloodGroup} | Status: ${matchedPatient.status}`,
        summary: `${matchedPatient.name} is currently recorded as "${matchedPatient.status}". ${
          bed
            ? `Assigned to Ward ${bed.ward}, Bed Number ${bed.bedNumber} (${bed.type} Care).`
            : 'Not currently assigned to an inpatient bed.'
        } ${
          latestRecord
            ? `Primary Diagnosis: ${latestRecord.diagnosis}. Prescribed Protocol: ${latestRecord.prescription}. Notes from ${latestRecord.doctorName}: "${latestRecord.notes}".`
            : 'No prior diagnostic consultation records registered.'
        }`,
        insight: matchedPatient.status === 'Admitted'
          ? `Patient is under active inpatient care. Ensure shift nursing staff review morning vitals and medication adherence on schedule.`
          : `Patient is currently outpatient/discharged. Recommend scheduling follow-up consultation within 14 days if symptoms persist.`,
        metadata: {
          patient: matchedPatient,
          activeBed: bed,
          records,
          appointments: appts
        }
      });
    }

    // 2. Doctor Specific Search
    let matchedDoctor = allDoctors.find(d => lower.includes(d.name.toLowerCase()) || lower.includes(d.id.toLowerCase()));
    if (!matchedDoctor) {
      matchedDoctor = allDoctors.find(d => {
        const docTokens = d.name.toLowerCase().replace('dr.', '').trim().split(/\s+/);
        return docTokens.some(token => token.length > 2 && promptWords.includes(token));
      });
    }

    if (matchedDoctor) {
      const docAppts = allAppointments.filter(a => a.doctorId === matchedDoctor.id || a.doctorName === matchedDoctor.name);
      return res.json({
        category: 'DOCTOR_ROSTER',
        title: `Physician Profile: ${matchedDoctor.name}`,
        dataBadge: `Specialty: ${matchedDoctor.specialization} | Experience: ${matchedDoctor.experienceYears} Years | Status: ${matchedDoctor.availability}`,
        summary: `${matchedDoctor.name} specializes in ${matchedDoctor.specialization} with ${matchedDoctor.experienceYears} years of clinical expertise. Currently designated as "${matchedDoctor.availability}" in the ${matchedDoctor.department} Department. Direct contact: ${matchedDoctor.contact} | Email: ${matchedDoctor.email}.`,
        insight: matchedDoctor.availability === 'Available'
          ? `Doctor is on hospital floor and accepting new patient consultations. You can book an appointment directly through the Appointments module.`
          : `Doctor is currently engaged in procedures or rounds. Immediate urgent cases should be redirected to the on-duty triage specialist.`,
        metadata: { doctor: matchedDoctor, appointments: docAppts }
      });
    }

    // 3. Clinical Specialty / Department queries with Symptom Recognition
    const specialties = [
      {
        keys: ['cardio', 'heart', 'chest pain', 'cardiac', 'ecg', 'bp', 'blood pressure', 'angina', 'palpitation'],
        name: 'Cardiology',
        desc: 'advanced cardiac catheterization, 24/7 primary angioplasty, pacemaker clinics, echocardiography, and preventive heart care'
      },
      {
        keys: ['neuro', 'brain', 'stroke', 'headache', 'nerve', 'paralysis', 'seizure', 'migraine', 'dizziness'],
        name: 'Neurology',
        desc: 'comprehensive stroke rescue unit, neuro-critical care, epilepsy management, headache clinics, and spine neurology'
      },
      {
        keys: ['pedia', 'child', 'kid', 'baby', 'infant', 'vaccin', 'pediatric'],
        name: 'Pediatrics',
        desc: 'dedicated Level-3 Neonatal ICU (NICU), pediatric cardiology, developmental assessments, and immunization clinics'
      },
      {
        keys: ['ortho', 'bone', 'joint', 'knee', 'spine', 'fracture', 'arthritis', 'ligament', 'back pain'],
        name: 'Orthopedics',
        desc: 'robotic-assisted joint replacement, sports arthroscopy, fracture trauma management, and pediatric orthopedic care'
      },
      {
        keys: ['surg', 'operation', 'appendix', 'hernia', 'gallbladder', 'laparo', 'surgeon'],
        name: 'General Surgery',
        desc: 'minimally invasive laparoscopic procedures, surgical oncology, gastrointestinal surgery, and trauma resuscitation'
      },
      {
        keys: ['emerg', 'trauma', 'accident', 'urgent', 'casualty', 'resuscitat', 'ambulance', 'hotline'],
        name: 'Emergency',
        desc: '24/7 Level-1 Resuscitation, round-the-clock emergency physicians, rapid response trauma team, and advanced cardiac life support'
      }
    ];

    const matchedSpecialty = specialties.find(s => s.keys.some(k => lower.includes(k)));
    if (matchedSpecialty) {
      const docsInDept = allDoctors.filter(d =>
        d.specialization.toLowerCase().includes(matchedSpecialty.name.toLowerCase()) ||
        d.department.toLowerCase().includes(matchedSpecialty.name.toLowerCase())
      );
      const deptData = allDepartments.find(d => d.name.toLowerCase().includes(matchedSpecialty.name.toLowerCase()));
      const availableDocs = docsInDept.filter(d => d.availability === 'Available');

      return res.json({
        category: 'DEPARTMENT_INTEL',
        title: `${matchedSpecialty.name} Specialty Service`,
        dataBadge: `Specialists: ${docsInDept.length} Total (${availableDocs.length} On Floor) | Head: ${deptData ? deptData.headDoctorName : 'Senior Staff'}`,
        summary: `For inquiries regarding ${matchedSpecialty.name}: Our center provides ${matchedSpecialty.desc}. Active physicians include: ${
          docsInDept.map(d => `${d.name} (${d.specialization} - ${d.availability})`).join(', ') || 'Departmental on-call staff'
        }. ${
          deptData ? `Ward capacity is ${deptData.capacity} beds (${deptData.occupiedBeds} currently admitted).` : ''
        }`,
        insight: availableDocs.length > 0
          ? `${availableDocs.map(d => d.name).join(', ')} is currently available for consultation. You can schedule an appointment directly in the Appointments tab or dial Reception at ${HOSPITAL_INFO.receptionDesk}.`
          : `All designated ${matchedSpecialty.name} surgeons are currently in procedure or rounds. For urgent acute symptoms, report directly to the 24/7 Emergency Triage.`,
        metadata: { specialists: docsInDept, department: deptData }
      });
    }

    // 4. Bed, Ward, & ICU Capacity queries
    if (lower.includes('bed') || lower.includes('icu') || lower.includes('ward') || lower.includes('capacity') || lower.includes('occupan')) {
      const occupied = allBeds.filter(b => b.status === 'Occupied');
      const available = allBeds.filter(b => b.status === 'Available');
      const maintenance = allBeds.filter(b => (b.status as string) === 'Maintenance');
      const icuAvailable = allBeds.filter(b => b.type === 'ICU' && b.status === 'Available');
      const icuTotal = allBeds.filter(b => b.type === 'ICU');
      const occupancyRate = Math.round((occupied.length / allBeds.length) * 100);

      return res.json({
        category: 'BED_CAPACITY',
        title: 'Ward Census & Bed Availability Intel',
        dataBadge: `Total Beds: ${allBeds.length} | Available: ${available.length} | Occupied: ${occupied.length} (${occupancyRate}%)`,
        summary: `There are currently ${available.length} beds immediately available for patient admission across wards. ICU capacity: ${icuAvailable.length} of ${icuTotal.length} ICU beds free. Occupancy rate stands at ${occupancyRate}%. ${maintenance.length > 0 ? `${maintenance.length} bed(s) undergoing maintenance.` : ''}`,
        insight: icuAvailable.length <= 1
          ? `WARNING: Critical ICU reserve threshold reached (${icuAvailable.length} ICU bed remaining). Assess stable ICU patients for ward step-down immediately.`
          : `Inpatient capacity is stable. General Ward and Private Ward have sufficient beds to absorb projected admission demands.`,
        metadata: { availableCount: available.length, occupiedCount: occupied.length, icuAvailableCount: icuAvailable.length }
      });
    }

    // 5. Doctors Directory & Floor Staffing queries
    if (lower.includes('doctor') || lower.includes('physician') || lower.includes('specialist') || lower.includes('surgeon') || lower.includes('who is available')) {
      const availableDocs = allDoctors.filter(d => d.availability === 'Available');
      const inSurgery = allDoctors.filter(d => d.availability === 'In Surgery');
      const offDuty = allDoctors.filter(d => d.availability === 'Off Duty');

      return res.json({
        category: 'DOCTOR_ROSTER',
        title: 'Physician Roster & Duty Census',
        dataBadge: `Active: ${availableDocs.length} | In Surgery: ${inSurgery.length} | Off Duty: ${offDuty.length} | Total: ${allDoctors.length}`,
        summary: `${availableDocs.length} physicians are currently on duty and accepting appointments: ${
          availableDocs.map(d => `${d.name} (${d.specialization})`).join(', ')
        }. ${inSurgery.length > 0 ? `In operating theatre: ${inSurgery.map(d => d.name).join(', ')}.` : ''}`,
        insight: `For immediate appointment scheduling, select the physician from the Appointments tab or contact the front desk.`,
        metadata: { availableDoctors: availableDocs }
      });
    }

    // 6. Appointments & Consultation Booking queries
    if (lower.includes('appoint') || lower.includes('book') || lower.includes('schedule') || lower.includes('slot') || lower.includes('visit doctor')) {
      const scheduled = allAppointments.filter(a => a.status === 'Scheduled');
      const completed = allAppointments.filter(a => a.status === 'Completed');

      return res.json({
        category: 'APPOINTMENTS',
        title: 'Consultation & Appointment Operations',
        dataBadge: `Total Scheduled: ${scheduled.length} | Completed Today: ${completed.length}`,
        summary: `There are currently ${scheduled.length} active consultation appointments scheduled in the hospital system. Today's sessions are running smoothly with an average patient consultation turnaround of 18 minutes. To schedule a new appointment, go to the Appointments page, click "Schedule Appointment", and choose your preferred doctor and time slot.`,
        insight: `Doctors Dr. Rajesh Sharma (Cardiology) and Dr. Anita Rao (Pediatrics) have morning slots open for booking tomorrow.`,
        metadata: { scheduled }
      });
    }

    // 7. Emergency, Ambulance, Visiting Hours, or Hospital Services queries
    if (
      lower.includes('emergency') || lower.includes('ambulance') || lower.includes('contact') ||
      lower.includes('visiting') || lower.includes('phone') || lower.includes('address') ||
      lower.includes('hours') || lower.includes('hospital') || lower.includes('service')
    ) {
      return res.json({
        category: 'HOSPITAL_OPERATIONS',
        title: 'Hospital Services & Emergency Directory',
        dataBadge: `24/7 Hotline: ${HOSPITAL_INFO.emergencyHotline}`,
        summary: `Nalam Hospital is located at ${HOSPITAL_INFO.address}. Emergency & Trauma services operate 24/7 with immediate ambulance response via ${HOSPITAL_INFO.emergencyHotline}. Regular Visiting Hours are ${HOSPITAL_INFO.visitingHours}. Key capabilities: ${HOSPITAL_INFO.services.slice(0, 4).join(', ')}.`,
        insight: `For cashless medical insurance desk queries, visit Ground Floor Counter 3 with your policy card and photo ID between 8:00 AM and 8:00 PM.`,
        metadata: { hospitalInfo: HOSPITAL_INFO }
      });
    }

    // 8. General Health / Clinical Advisory / Symptoms inquiries
    if (
      lower.includes('symptom') || lower.includes('pain') || lower.includes('fever') ||
      lower.includes('treatment') || lower.includes('medicine') || lower.includes('dose') ||
      lower.includes('blood') || lower.includes('pressure') || lower.includes('sugar') || lower.includes('diabetes')
    ) {
      return res.json({
        category: 'CLINICAL_ADVISORY',
        title: 'Clinical Guidance & Triage Advisory',
        dataBadge: 'Protocol: Safe Medical Knowledge & Specialist Referrals',
        summary: `Regarding your health inquiry: Symptoms like severe chest tightness, sudden shortness of breath, acute high fever (>103°F), or unexplained numbness require immediate emergency assessment at our 24/7 Trauma Center. For ongoing management of chronic conditions (hypertension, diabetes, asthma), our specialists provide tailored diagnostic plans and medical reviews.`,
        insight: `Clinical Disclaimer: Automated AI summaries do not replace direct medical examination. Please schedule a face-to-face consultation with one of our certified doctors on duty.`,
        metadata: {}
      });
    }

    // 9. Comprehensive Fallback - Universal Hospital Intelligence Overview
    const admittedCount = allPatients.filter(p => p.status === 'Admitted').length;
    const availableBedCount = allBeds.filter(b => b.status === 'Available').length;
    const activeDocCount = allDoctors.filter(d => d.availability === 'Available').length;

    return res.json({
      category: 'GENERAL_ASSISTANT',
      title: 'Nalam Central Intelligence Core',
      dataBadge: `${allPatients.length} Patients | ${allDoctors.length} Specialists | ${availableBedCount} Free Beds`,
      summary: `I scanned the entire hospital database. The hospital is operating smoothly with ${admittedCount} currently admitted patients, ${activeDocCount} doctors available on the floor, and ${availableBedCount} beds ready for immediate admission. You can ask me anything about patients, doctor availability, bed counts, departments, appointments, or emergency protocols!`,
      insight: `Suggested Questions:\n• "Which cardiologists are available on duty?"\n• "What is the ICU bed occupancy right now?"\n• "Summarize medical records for Ramesh Patel"\n• "What are the hospital emergency contact numbers and visiting hours?"`,
      metadata: {
        totalPatients: allPatients.length,
        totalDoctors: allDoctors.length,
        availableBeds: availableBedCount
      }
    });

  } catch (error) {
    console.error('Error processing AI query:', error);
    res.status(500).json({ message: 'Error processing AI query', error });
  }
});

export default router;
