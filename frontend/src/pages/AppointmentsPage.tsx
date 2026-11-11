import { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, Button, TextField, Dialog, DialogTitle,
  DialogContent, DialogActions, MenuItem, CircularProgress, IconButton,
  InputAdornment, Card, CardContent, Grid
} from '@mui/material';
import { Plus, Search, Calendar, Clock, User, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Appointment, Doctor, Patient } from '../types';
import { appointmentService } from '../services/appointment.service';
import { doctorService } from '../services/doctor.service';
import { patientService } from '../services/patient.service';

export const AppointmentsPage = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [openDialog, setOpenDialog] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    patientId: '',
    doctorId: '',
    date: new Date().toISOString().split('T')[0],
    time: '10:00 AM',
    reason: ''
  });

  const fetchData = async () => {
    try {
      const [apptsData, docsData, ptsData] = await Promise.all([
        appointmentService.getAll(),
        doctorService.getAll(),
        patientService.getAll()
      ]);
      setAppointments(apptsData);
      setDoctors(docsData);
      setPatients(ptsData);
      if (ptsData.length > 0 && !formData.patientId) {
        setFormData(prev => ({
          ...prev,
          patientId: ptsData[0]!.id,
          doctorId: docsData[0]?.id || ''
        }));
      }
    } catch (err) {
      console.error('Failed to load appointments', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateAppointment = async () => {
    if (!formData.patientId || !formData.doctorId || !formData.date) return;
    try {
      const created = await appointmentService.create({
        patientId: formData.patientId,
        doctorId: formData.doctorId,
        date: formData.date,
        time: formData.time,
        status: 'Scheduled',
        reason: formData.reason || 'Routine Health Consultation'
      });
      setAppointments([created, ...appointments]);
      setOpenDialog(false);
      setFormData(prev => ({ ...prev, reason: '' }));
    } catch (err) {
      console.error('Error creating appointment', err);
    }
  };

  const handleStatusUpdate = async (id: string, newStatus: Appointment['status']) => {
    try {
      const updated = await appointmentService.update(id, { status: newStatus });
      setAppointments(appointments.map(a => a.id === id ? updated : a));
    } catch (err) {
      console.error('Error updating appointment', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Cancel and remove this appointment?')) return;
    try {
      await appointmentService.delete(id);
      setAppointments(appointments.filter(a => a.id !== id));
    } catch (err) {
      console.error('Error deleting appointment', err);
    }
  };

  const filteredAppointments = appointments.filter(a => {
    const matchesStatus = statusFilter === 'All' || a.status === statusFilter;
    const matchesSearch =
      (a.patientName || '').toLowerCase().includes(search.toLowerCase()) ||
      (a.doctorName || '').toLowerCase().includes(search.toLowerCase()) ||
      a.reason.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const scheduledCount = appointments.filter(a => a.status === 'Scheduled').length;
  const completedCount = appointments.filter(a => a.status === 'Completed').length;
  const cancelledCount = appointments.filter(a => a.status === 'Cancelled' || a.status === 'No-show').length;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Box sx={{ pb: 6 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { sm: 'center' }, gap: 2, mb: 4 }}>
          <Box>
            <Typography variant="h4" color="primary.main" sx={{ fontWeight: 800 }}>Appointments & Schedules</Typography>
            <Typography color="text.secondary">Book, monitor, and reschedule patient appointments with specialists.</Typography>
          </Box>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Plus size={18} />}
            onClick={() => setOpenDialog(true)}
            sx={{ px: 3, py: 1.2, borderRadius: 2 }}
          >
            Book Appointment
          </Button>
        </Box>

        {/* Stats Row */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
              <CardContent sx={{ p: 2.5 }}>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>Scheduled Appointments</Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, mt: 1, color: 'primary.main' }}>{scheduledCount}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
              <CardContent sx={{ p: 2.5 }}>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>Completed Visits</Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, mt: 1, color: 'success.main' }}>{completedCount}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
              <CardContent sx={{ p: 2.5 }}>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>Cancelled / No-shows</Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, mt: 1, color: 'error.main' }}>{cancelledCount}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Filter Bar */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 3 }}>
          <TextField
            placeholder="Search by patient, doctor, or reason..."
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
          <Box sx={{ display: 'flex', gap: 1 }}>
            {['All', 'Scheduled', 'Completed', 'Cancelled'].map(st => (
              <Chip
                key={st}
                label={st}
                clickable
                color={statusFilter === st ? 'primary' : 'default'}
                variant={statusFilter === st ? 'filled' : 'outlined'}
                onClick={() => setStatusFilter(st)}
              />
            ))}
          </Box>
        </Box>

        {/* Appointments Table */}
        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
          {loading ? (
            <Box sx={{ p: 6, display: 'flex', justifyContent: 'center' }}><CircularProgress /></Box>
          ) : filteredAppointments.length === 0 ? (
            <Box sx={{ p: 6, textAlign: 'center' }}>
              <Calendar size={48} style={{ opacity: 0.3, marginBottom: 16 }} />
              <Typography variant="h6" color="text.secondary">No appointments found</Typography>
              <Typography variant="body2" color="text.secondary">Schedule a visit to begin tracking consultations.</Typography>
            </Box>
          ) : (
            <Table>
              <TableHead sx={{ bgcolor: 'background.default' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Patient</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Consulting Doctor</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Date & Time</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Purpose</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700, textAlign: 'right' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredAppointments.map(appt => (
                  <TableRow key={appt.id} hover>
                    <TableCell sx={{ fontWeight: 600 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <User size={16} />
                        {appt.patientName || appt.patientId}
                      </Box>
                    </TableCell>
                    <TableCell>{appt.doctorName || appt.doctorId}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.3 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Calendar size={13} /> {appt.date}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Clock size={12} /> {appt.time}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ maxWidth: 220 }}>
                      <Typography variant="body2" noWrap>{appt.reason}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={appt.status}
                        size="small"
                        color={
                          appt.status === 'Completed' ? 'success' :
                          appt.status === 'Scheduled' ? 'primary' :
                          'error'
                        }
                        variant="outlined"
                        sx={{ fontWeight: 600 }}
                      />
                    </TableCell>
                    <TableCell sx={{ textAlign: 'right' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                        {appt.status === 'Scheduled' && (
                          <IconButton
                            size="small"
                            color="success"
                            title="Mark as Completed"
                            onClick={() => handleStatusUpdate(appt.id, 'Completed')}
                          >
                            <CheckCircle size={18} />
                          </IconButton>
                        )}
                        {appt.status === 'Scheduled' && (
                          <IconButton
                            size="small"
                            color="warning"
                            title="Cancel Appointment"
                            onClick={() => handleStatusUpdate(appt.id, 'Cancelled')}
                          >
                            <XCircle size={18} />
                          </IconButton>
                        )}
                        <IconButton
                          size="small"
                          color="error"
                          title="Delete"
                          onClick={() => handleDelete(appt.id)}
                        >
                          <Trash2 size={18} />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TableContainer>

        {/* Schedule Dialog */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ fontWeight: 700 }}>Book Specialist Consultation</DialogTitle>
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
                  {p.name} ({p.gender}, {p.age}y - {p.contact})
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Select Doctor / Specialist"
              select
              value={formData.doctorId}
              onChange={(e) => setFormData({ ...formData, doctorId: e.target.value })}
              fullWidth
              required
            >
              {doctors.map(d => (
                <MenuItem key={d.id} value={d.id}>
                  {d.name} ({d.specialization} - {d.availability})
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Appointment Date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
              required
            />

            <TextField
              label="Appointment Time"
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              select
              fullWidth
            >
              <MenuItem value="09:00 AM">09:00 AM</MenuItem>
              <MenuItem value="10:00 AM">10:00 AM</MenuItem>
              <MenuItem value="11:30 AM">11:30 AM</MenuItem>
              <MenuItem value="02:00 PM">02:00 PM</MenuItem>
              <MenuItem value="03:30 PM">03:30 PM</MenuItem>
              <MenuItem value="05:00 PM">05:00 PM</MenuItem>
            </TextField>

            <TextField
              label="Reason for Visit / Symptoms"
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              fullWidth
              placeholder="e.g. Follow-up ECG review, fever and joint pain"
            />
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleCreateAppointment} disabled={!formData.patientId || !formData.doctorId}>
              Confirm Booking
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </motion.div>
  );
};
