import { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, Button, CircularProgress, TextField,
  Dialog, DialogTitle, DialogContent, DialogActions, MenuItem,
  IconButton, InputAdornment, Card, CardContent, Grid, useTheme, useMediaQuery
} from '@mui/material';
import { Plus, Search, Edit2, Trash2, User, Phone, Droplet } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Patient } from '../types';
import { patientService } from '../services/patient.service';

export const PatientsPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Dialog state
  const [openDialog, setOpenDialog] = useState(false);
  const [editingPatientId, setEditingPatientId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    age: 30,
    gender: 'Male' as Patient['gender'],
    bloodGroup: 'B+',
    contact: '',
    status: 'Outpatient' as Patient['status'],
    ward: '',
    bedNumber: ''
  });

  const fetchPatients = async () => {
    try {
      const data = await patientService.getAll();
      setPatients(data);
    } catch (error) {
      console.error('Failed to fetch patients', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleOpenAdd = () => {
    setEditingPatientId(null);
    setFormData({
      name: '',
      age: 30,
      gender: 'Male',
      bloodGroup: 'B+',
      contact: '',
      status: 'Outpatient',
      ward: '',
      bedNumber: ''
    });
    setOpenDialog(true);
  };

  const handleOpenEdit = (p: Patient) => {
    setEditingPatientId(p.id);
    setFormData({
      name: p.name,
      age: p.age,
      gender: p.gender,
      bloodGroup: p.bloodGroup,
      contact: p.contact,
      status: p.status,
      ward: p.ward || '',
      bedNumber: p.bedNumber || ''
    });
    setOpenDialog(true);
  };

  const handleSavePatient = async () => {
    if (!formData.name || !formData.contact) return;
    try {
      if (editingPatientId) {
        const updated = await patientService.update(editingPatientId, formData);
        setPatients(patients.map(p => p.id === editingPatientId ? updated : p));
      } else {
        const created = await patientService.create({
          name: formData.name,
          age: Number(formData.age),
          gender: formData.gender,
          bloodGroup: formData.bloodGroup,
          contact: formData.contact,
          status: formData.status,
          admissionDate: formData.status === 'Admitted' ? new Date().toISOString().split('T')[0] : undefined,
          ward: formData.status === 'Admitted' ? formData.ward : undefined,
          bedNumber: formData.status === 'Admitted' ? formData.bedNumber : undefined
        });
        setPatients([created, ...patients]);
      }
      setOpenDialog(false);
    } catch (err) {
      console.error('Failed to save patient', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this patient record?')) return;
    try {
      await patientService.delete(id);
      setPatients(patients.filter(p => p.id !== id));
    } catch (err) {
      console.error('Failed to delete patient', err);
    }
  };

  const filteredPatients = patients.filter(p => {
    const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.contact.includes(search) ||
      p.bloodGroup.toLowerCase().includes(search.toLowerCase()) ||
      p.id.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const totalPatients = patients.length;
  const admittedCount = patients.filter(p => p.status === 'Admitted').length;
  const outpatientCount = patients.filter(p => p.status === 'Outpatient').length;
  const dischargedCount = patients.filter(p => p.status === 'Discharged').length;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Box sx={{ pb: 6 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { sm: 'center' }, gap: 2, mb: 4 }}>
          <Box>
            <Typography variant="h4" color="primary.main" sx={{ fontWeight: 800 }}>Patients Directory</Typography>
            <Typography color="text.secondary">Admitted in-patients, outpatient records, and clinical admissions.</Typography>
          </Box>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Plus size={18} />}
            onClick={handleOpenAdd}
            sx={{ px: 3, py: 1.2, borderRadius: 2 }}
          >
            Register Patient
          </Button>
        </Box>

        {/* Stats Row */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid size={{ xs: 6, md: 3 }}>
            <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
              <CardContent sx={{ p: 2 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>Total Registered</Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5, color: 'text.primary' }}>{totalPatients}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
              <CardContent sx={{ p: 2 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>Currently Admitted</Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5, color: 'error.main' }}>{admittedCount}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
              <CardContent sx={{ p: 2 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>Outpatients</Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5, color: 'info.main' }}>{outpatientCount}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
              <CardContent sx={{ p: 2 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>Discharged</Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5, color: 'success.main' }}>{dischargedCount}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Search & Status Filters */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 3 }}>
          <TextField
            placeholder="Search by patient name, contact, blood group..."
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
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {['All', 'Admitted', 'Outpatient', 'Discharged'].map(st => (
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

        {/* Patients Content */}
        {loading ? (
          <Box sx={{ p: 6, display: 'flex', justifyContent: 'center' }}><CircularProgress /></Box>
        ) : filteredPatients.length === 0 ? (
          <Box sx={{ p: 6, textAlign: 'center', bgcolor: 'background.paper', borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <User size={48} style={{ opacity: 0.3, marginBottom: 16 }} />
            <Typography variant="h6" color="text.secondary">No patients found</Typography>
            <Typography variant="body2" color="text.secondary">Register a patient to begin record keeping.</Typography>
          </Box>
        ) : (
          <>
            {/* Mobile Cards (xs to md) */}
            <Box sx={{ display: { xs: 'flex', md: 'none' }, flexDirection: 'column', gap: 2 }}>
              {filteredPatients.map(row => (
                <Card key={row.id} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
                  <CardContent sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>{row.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {row.age} yrs • {row.gender} • ID: {row.id.substring(0, 6)}...
                        </Typography>
                      </Box>
                      <Chip
                        label={row.status}
                        size="small"
                        color={row.status === 'Admitted' ? 'error' : row.status === 'Outpatient' ? 'info' : 'success'}
                        sx={{ fontWeight: 700 }}
                      />
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, my: 1.5, flexWrap: 'wrap' }}>
                      <Chip
                        label={`Blood: ${row.bloodGroup}`}
                        size="small"
                        icon={<Droplet size={12} />}
                        variant="outlined"
                        sx={{ fontWeight: 600 }}
                      />
                      {row.ward && (
                        <Chip
                          label={`${row.ward} (${row.bedNumber})`}
                          size="small"
                          color="primary"
                          variant="outlined"
                          sx={{ fontWeight: 600 }}
                        />
                      )}
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 1.5 }}>
                      <Phone size={13} /> {row.contact}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, pt: 1.5, borderTop: '1px solid', borderColor: 'divider' }}>
                      <Button size="small" variant="outlined" startIcon={<Edit2 size={14} />} onClick={() => handleOpenEdit(row)}>
                        Edit
                      </Button>
                      <Button size="small" color="error" variant="outlined" startIcon={<Trash2 size={14} />} onClick={() => handleDelete(row.id)}>
                        Delete
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>

            {/* Desktop & Tablet Table (md and up) */}
            <TableContainer component={Paper} elevation={0} sx={{ display: { xs: 'none', md: 'block' }, border: '1px solid', borderColor: 'divider', borderRadius: 3, overflowX: 'auto' }}>
              <Table>
                <TableHead sx={{ bgcolor: 'background.default' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Record ID</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Patient Name</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Demographics</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Blood Group</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Contact Info</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 700, textAlign: 'right' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredPatients.map(row => (
                    <TableRow key={row.id} hover>
                      <TableCell sx={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '0.85rem' }}>
                        {row.id.substring(0, 8)}...
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{row.name}</TableCell>
                      <TableCell>{row.age} yrs / {row.gender}</TableCell>
                      <TableCell>
                        <Chip
                          label={row.bloodGroup}
                          size="small"
                          icon={<Droplet size={12} />}
                          variant="outlined"
                          sx={{ fontWeight: 700 }}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, color: 'text.secondary' }}>
                          <Phone size={13} />
                          <Typography variant="body2">{row.contact}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={row.status}
                          size="small"
                          color={row.status === 'Admitted' ? 'error' : row.status === 'Outpatient' ? 'info' : 'success'}
                          variant="outlined"
                          sx={{ fontWeight: 600 }}
                        />
                        {row.ward && (
                          <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: 'text.secondary' }}>
                            {row.ward} ({row.bedNumber})
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell sx={{ textAlign: 'right' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                          <IconButton size="small" onClick={() => handleOpenEdit(row)} color="primary">
                            <Edit2 size={16} />
                          </IconButton>
                          <IconButton size="small" onClick={() => handleDelete(row.id)} color="error">
                            <Trash2 size={16} />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}

        {/* Register / Edit Patient Dialog */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth fullScreen={isMobile}>
          <DialogTitle sx={{ fontWeight: 700 }}>
            {editingPatientId ? 'Update Patient Record' : 'Register New Patient'}
          </DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 2 }}>
            <TextField
              label="Patient Full Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              fullWidth
              placeholder="e.g. Ramesh Patel"
              required
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Age"
                type="number"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
                sx={{ flex: 1 }}
                required
              />
              <TextField
                label="Gender"
                select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                sx={{ flex: 1 }}
              >
                <MenuItem value="Male">Male</MenuItem>
                <MenuItem value="Female">Female</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </TextField>
              <TextField
                label="Blood Group"
                select
                value={formData.bloodGroup}
                onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                sx={{ flex: 1 }}
              >
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                  <MenuItem key={bg} value={bg}>{bg}</MenuItem>
                ))}
              </TextField>
            </Box>

            <TextField
              label="Contact Number"
              value={formData.contact}
              onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
              fullWidth
              placeholder="+91 9123456780"
              required
            />

            <TextField
              label="Patient Admission Status"
              select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              fullWidth
            >
              <MenuItem value="Outpatient">Outpatient (General Consultation)</MenuItem>
              <MenuItem value="Admitted">Admitted (Hospital Ward / Inpatient)</MenuItem>
              <MenuItem value="Discharged">Discharged (Treatment Complete)</MenuItem>
            </TextField>

            {formData.status === 'Admitted' && (
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  label="Ward Assignment"
                  select
                  value={formData.ward}
                  onChange={(e) => setFormData({ ...formData, ward: e.target.value })}
                  sx={{ flex: 1 }}
                >
                  <MenuItem value="ICU-A">ICU-A</MenuItem>
                  <MenuItem value="General-B">General-B</MenuItem>
                  <MenuItem value="Private-C">Private-C</MenuItem>
                  <MenuItem value="Emergency">Emergency</MenuItem>
                </TextField>
                <TextField
                  label="Bed Number"
                  value={formData.bedNumber}
                  onChange={(e) => setFormData({ ...formData, bedNumber: e.target.value })}
                  sx={{ flex: 1 }}
                  placeholder="e.g. ICU-02"
                />
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleSavePatient} disabled={!formData.name || !formData.contact}>
              {editingPatientId ? 'Update Record' : 'Register Patient'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </motion.div>
  );
};
