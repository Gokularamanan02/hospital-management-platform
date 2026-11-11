import { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Grid, Card, CardContent, Button, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField, MenuItem,
  CircularProgress, Chip, InputAdornment
} from '@mui/material';
import { FileText, Plus, Search, User, Stethoscope, Pill, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import type { MedicalRecord, Patient, Doctor } from '../types';
import { medicalRecordService } from '../services/medicalRecord.service';
import { patientService } from '../services/patient.service';
import { doctorService } from '../services/doctor.service';

export const MedicalRecordsPage = () => {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState('All');
  const [openDialog, setOpenDialog] = useState(false);

  const [formData, setFormData] = useState({
    patientId: '',
    doctorId: '',
    date: new Date().toISOString().split('T')[0],
    diagnosis: '',
    prescription: '',
    notes: ''
  });

  const fetchData = async () => {
    try {
      const [recordsData, ptsData, docsData] = await Promise.all([
        medicalRecordService.getAll(),
        patientService.getAll(),
        doctorService.getAll()
      ]);
      setRecords(recordsData);
      setPatients(ptsData);
      setDoctors(docsData);
      if (ptsData.length > 0 && !formData.patientId) {
        setFormData(prev => ({
          ...prev,
          patientId: ptsData[0]!.id,
          doctorId: docsData[0]?.id || ''
        }));
      }
    } catch (err) {
      console.error('Failed to load medical records', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddRecord = async () => {
    if (!formData.patientId || !formData.doctorId || !formData.diagnosis || !formData.prescription) return;
    try {
      const created = await medicalRecordService.create({
        patientId: formData.patientId,
        doctorId: formData.doctorId,
        date: formData.date,
        diagnosis: formData.diagnosis,
        prescription: formData.prescription,
        notes: formData.notes || 'Clinical follow-up in 7 days.'
      });
      setRecords([created, ...records]);
      setOpenDialog(false);
      setFormData(prev => ({ ...prev, diagnosis: '', prescription: '', notes: '' }));
    } catch (err) {
      console.error('Error adding medical record', err);
    }
  };

  const filteredRecords = records.filter(r => {
    const matchesPatient = selectedPatientId === 'All' || r.patientId === selectedPatientId;
    const matchesSearch =
      (r.patientName || '').toLowerCase().includes(search.toLowerCase()) ||
      r.diagnosis.toLowerCase().includes(search.toLowerCase()) ||
      r.prescription.toLowerCase().includes(search.toLowerCase());
    return matchesPatient && matchesSearch;
  });

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Box sx={{ pb: 6 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { sm: 'center' }, gap: 2, mb: 4 }}>
          <Box>
            <Typography variant="h4" color="primary.main" sx={{ fontWeight: 800 }}>Electronic Medical Records (EMR)</Typography>
            <Typography color="text.secondary">Diagnostic archives, prescriptions, physician notes, and laboratory findings.</Typography>
          </Box>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Plus size={18} />}
            onClick={() => setOpenDialog(true)}
            sx={{ px: 3, py: 1.2, borderRadius: 2 }}
          >
            Add Clinical Record
          </Button>
        </Box>

        {/* Search & Patient Filter */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, mb: 4 }}>
          <TextField
            placeholder="Search records by diagnosis, medication, or patient..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            size="small"
            sx={{ flex: 1, bgcolor: 'background.paper', borderRadius: 2 }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Search size={18} />
                  </InputAdornment>
                ),
              }
            }}
          />
          <TextField
            select
            size="small"
            value={selectedPatientId}
            onChange={(e) => setSelectedPatientId(e.target.value)}
            sx={{ minWidth: 220, bgcolor: 'background.paper', borderRadius: 2 }}
          >
            <MenuItem value="All">All Patients</MenuItem>
            {patients.map(p => (
              <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
            ))}
          </TextField>
        </Box>

        {/* Records List */}
        {loading ? (
          <Box sx={{ p: 6, display: 'flex', justifyContent: 'center' }}><CircularProgress /></Box>
        ) : filteredRecords.length === 0 ? (
          <Box sx={{ p: 6, textAlign: 'center', bgcolor: 'background.paper', borderRadius: 3, border: '1px dashed', borderColor: 'divider' }}>
            <FileText size={48} style={{ opacity: 0.3, marginBottom: 16 }} />
            <Typography variant="h6" color="text.secondary">No clinical records found</Typography>
            <Typography variant="body2" color="text.secondary">Create a new record to document patient consultation findings.</Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {filteredRecords.map(rec => (
              <Grid size={{ xs: 12, md: 6 }} key={rec.id}>
                <Card
                  elevation={0}
                  sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 3,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      transform: 'translateY(-3px)',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
                      borderColor: 'primary.main'
                    }
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 800, color: 'primary.main', mb: 0.5 }}>
                          {rec.diagnosis}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: 'text.secondary', fontSize: '0.85rem' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <User size={14} />
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{rec.patientName || rec.patientId}</Typography>
                          </Box>
                          <span>•</span>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Calendar size={14} />
                            <Typography variant="caption">{rec.date}</Typography>
                          </Box>
                        </Box>
                      </Box>
                      <Chip
                        label={rec.doctorName || 'Attending MD'}
                        size="small"
                        icon={<Stethoscope size={14} />}
                        color="secondary"
                        variant="outlined"
                        sx={{ fontWeight: 600 }}
                      />
                    </Box>

                    {/* Prescription Section */}
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2,
                        mb: 2,
                        borderRadius: 2,
                        bgcolor: 'background.default',
                        border: '1px solid',
                        borderColor: 'divider'
                      }}
                    >
                      <Typography variant="caption" sx={{ textTransform: 'uppercase', fontWeight: 800, letterSpacing: 0.5, color: 'primary.main', display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                        <Pill size={14} /> Rx / Prescribed Therapy
                      </Typography>
                      <Typography variant="body2" sx={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '0.85rem' }}>
                        {rec.prescription}
                      </Typography>
                    </Paper>

                    {/* Clinical Notes */}
                    <Box>
                      <Typography variant="caption" sx={{ textTransform: 'uppercase', fontWeight: 700, letterSpacing: 0.5, color: 'text.secondary', display: 'block', mb: 0.5 }}>
                        Clinical Observations & Care Plan
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                        {rec.notes}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Add Record Dialog */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ fontWeight: 700 }}>Log New Medical Consultation Record</DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 2 }}>
            <TextField
              label="Select Patient"
              select
              value={formData.patientId}
              onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
              fullWidth
              required
            >
              {patients.map(p => (
                <MenuItem key={p.id} value={p.id}>
                  {p.name} ({p.gender}, {p.age}y - {p.bloodGroup})
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Attending Physician"
              select
              value={formData.doctorId}
              onChange={(e) => setFormData({ ...formData, doctorId: e.target.value })}
              fullWidth
              required
            >
              {doctors.map(d => (
                <MenuItem key={d.id} value={d.id}>
                  {d.name} ({d.specialization})
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Clinical Diagnosis"
              value={formData.diagnosis}
              onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
              fullWidth
              placeholder="e.g. Type II Diabetes Mellitus with Peripheral Neuropathy"
              required
            />

            <TextField
              label="Prescription & Dosages"
              value={formData.prescription}
              onChange={(e) => setFormData({ ...formData, prescription: e.target.value })}
              fullWidth
              multiline
              rows={2}
              placeholder="e.g. Metformin 500mg BD, Pregabalin 75mg HS"
              required
            />

            <TextField
              label="Clinical Notes / Care Plan"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              fullWidth
              multiline
              rows={3}
              placeholder="Describe vitals, patient tolerance, dietary restrictions, and follow-up timeline."
            />
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button
              variant="contained"
              onClick={handleAddRecord}
              disabled={!formData.patientId || !formData.doctorId || !formData.diagnosis || !formData.prescription}
            >
              Save to EMR
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </motion.div>
  );
};
