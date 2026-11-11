import { Router } from 'express';
import { patientsStore, doctorsStore, bedsStore, medicalRecordsStore } from '../data/dbStore.js';
const router = Router();
// POST /api/ai/query
router.post('/query', async (req, res) => {
    try {
        const { prompt } = req.body;
        if (!prompt) {
            return res.status(400).json({ message: 'Prompt query is required' });
        }
        const lower = prompt.toLowerCase();
        const [allPatients, allBeds, allDoctors, allRecords] = await Promise.all([
            patientsStore.getAll(),
            bedsStore.getAll(),
            doctorsStore.getAll(),
            medicalRecordsStore.getAll()
        ]);
        // Check if query is about a specific patient
        const matchedPatient = allPatients.find(p => lower.includes(p.name.toLowerCase()) || lower.includes(p.id.toLowerCase()));
        if (matchedPatient) {
            const records = allRecords.filter(r => r.patientId === matchedPatient.id);
            const bed = allBeds.find(b => b.patientId === matchedPatient.id);
            const firstRecord = records[0];
            return res.json({
                category: 'PATIENT_SUMMARY',
                title: `Clinical Summary: ${matchedPatient.name}`,
                dataBadge: `ID: ${matchedPatient.id} | Status: ${matchedPatient.status} | Ward: ${bed ? `${bed.ward} (${bed.bedNumber})` : 'None'}`,
                summary: `${matchedPatient.name} is a ${matchedPatient.age}-year-old ${matchedPatient.gender} (Blood Group: ${matchedPatient.bloodGroup}). Status is currently marked as ${matchedPatient.status}. ${firstRecord ? `Latest diagnosis: ${firstRecord.diagnosis}. Active prescription: ${firstRecord.prescription}.` : 'No recent diagnostic records found.'}`,
                insight: firstRecord
                    ? `Patient vitals are under regular clinical review. Ensure scheduled post-procedure vitals and metabolic panel checks are logged per protocol.`
                    : `Recommend scheduling a baseline consultation and vitals review upon next follow-up.`,
                metadata: {
                    patient: matchedPatient,
                    activeBed: bed,
                    records
                }
            });
        }
        // Check if query is about beds / ICU / capacity
        if (lower.includes('bed') || lower.includes('icu') || lower.includes('ward') || lower.includes('capacity')) {
            const occupiedBeds = allBeds.filter(b => b.status === 'Occupied').length;
            const availableBeds = allBeds.filter(b => b.status === 'Available').length;
            const icuAvailable = allBeds.filter(b => b.type === 'ICU' && b.status === 'Available').length;
            return res.json({
                category: 'BED_CAPACITY',
                title: 'Hospital Ward & Bed Occupancy Intel',
                dataBadge: `Total Beds: ${allBeds.length} | Available: ${availableBeds} | Occupied: ${occupiedBeds}`,
                summary: `Currently ${occupiedBeds} out of ${allBeds.length} hospital beds are occupied (${Math.round((occupiedBeds / allBeds.length) * 100)}% occupancy). There are ${availableBeds} beds ready for immediate admission, with ${icuAvailable} ICU bed(s) available.`,
                insight: icuAvailable <= 1
                    ? `ICU buffer is at critical threshold (${icuAvailable} remaining). Prioritize step-down evaluations for stable patients in ICU-A.`
                    : `Bed distribution across General and Private wards is operating within optimal capacity parameters.`,
                metadata: { allBeds }
            });
        }
        // Check if query is about doctors / shifts
        if (lower.includes('doctor') || lower.includes('surge') || lower.includes('shift') || lower.includes('specialist')) {
            const availableDocs = allDoctors.filter(d => d.availability === 'Available');
            const inSurgery = allDoctors.filter(d => d.availability === 'In Surgery');
            return res.json({
                category: 'DOCTOR_DUTY',
                title: 'Physician On-Duty & Surgical Status',
                dataBadge: `Available: ${availableDocs.length} | In Surgery: ${inSurgery.length} | Total Staff: ${allDoctors.length}`,
                summary: `${availableDocs.length} physicians are actively on floor duty and available for consultations. ${inSurgery.map(d => `${d.name} (${d.specialization})`).join(', ') || 'No doctors currently in surgery.'}`,
                insight: `Emergency triage coverage is actively staffed by Dr. Deepa Menon. Outpatient department appointment wait times are currently running under 15 minutes.`,
                metadata: { allDoctors }
            });
        }
        // Default general intelligence response
        return res.json({
            category: 'GENERAL_ASSISTANT',
            title: 'Nalam Clinical Intelligence Overview',
            dataBadge: `Active Records: ${allPatients.length} Patients | ${allBeds.length} Beds Monitored`,
            summary: `I scanned the hospital data matrix. There are currently ${allPatients.length} registered patients, ${allDoctors.length} staff specialists on roster, and ${allBeds.filter(b => b.status === 'Available').length} beds available.`,
            insight: `To get targeted intelligence, you can query specific patient names (e.g., "Ramesh Patel"), inquire about "ICU bed occupancy", or check "available cardiologists on duty".`,
            metadata: {}
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Error processing AI query', error });
    }
});
export default router;
//# sourceMappingURL=ai.routes.js.map