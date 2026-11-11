import { useState, useEffect } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, Chip, Button, TextField,
  Dialog, DialogTitle, DialogContent, DialogActions, MenuItem,
  CircularProgress, Avatar, InputAdornment, IconButton
} from '@mui/material';
import { Plus, Search, UserRound, Phone, Mail, Stethoscope, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Doctor } from '../types';
import { doctorService } from '../services/doctor.service';

export const DoctorsPage = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');
  const [openAddDialog, setOpenAddDialog] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    specialization: 'Cardiology',
    experienceYears: 5,
    availability: 'Available' as Doctor['availability'],
    contact: '',
    department: 'Cardiology',
    email: ''
  });

  const fetchDoctors = async () => {
    try {
      const data = await doctorService.getAll();
      setDoctors(data);
    } catch (err) {
      console.error('Failed to fetch doctors', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const handleAddDoctor = async () => {
    if (!formData.name || !formData.contact) return;
    try {
      const created = await doctorService.create({
        ...formData,
        email: formData.email || `${formData.name.toLowerCase().replace(/[^a-z]/g, '')}@nalam.care`
      });
      setDoctors([...doctors, created]);
      setOpenAddDialog(false);
      setFormData({
        name: '',
        specialization: 'Cardiology',
        experienceYears: 5,
        availability: 'Available',
        contact: '',
        department: 'Cardiology',
        email: ''
      });
    } catch (err) {
      console.error('Error adding doctor', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to remove this doctor from the roster?')) return;
    try {
      await doctorService.delete(id);
      setDoctors(doctors.filter(d => d.id !== id));
    } catch (err) {
      console.error('Error deleting doctor', err);
    }
  };

  const filteredDoctors = doctors.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(search.toLowerCase()) ||
      doc.specialization.toLowerCase().includes(search.toLowerCase());
    const matchesSpecialty = selectedSpecialty === 'All' || doc.specialization === selectedSpecialty;
    return matchesSearch && matchesSpecialty;
  });

  const specialties = ['All', ...Array.from(new Set(doctors.map(d => d.specialization)))];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Box sx={{ pb: 6 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { sm: 'center' }, gap: 2, mb: 4 }}>
          <Box>
            <Typography variant="h4" color="primary.main" sx={{ fontWeight: 800 }}>Doctors & Medical Staff</Typography>
            <Typography color="text.secondary">Active specialists, on-duty surgeons, and clinical roster.</Typography>
          </Box>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Plus size={18} />}
            onClick={() => setOpenAddDialog(true)}
            sx={{ px: 3, py: 1.2, borderRadius: 2 }}
          >
            Add Specialist
          </Button>
        </Box>

        {/* Filters */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, mb: 4 }}>
          <TextField
            placeholder="Search doctors by name or specialty..."
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
            {specialties.map(spec => (
              <Chip
                key={spec}
                label={spec}
                clickable
                color={selectedSpecialty === spec ? 'primary' : 'default'}
                variant={selectedSpecialty === spec ? 'filled' : 'outlined'}
                onClick={() => setSelectedSpecialty(spec)}
              />
            ))}
          </Box>
        </Box>

        {/* Doctors Grid */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
        ) : filteredDoctors.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8, bgcolor: 'background.paper', borderRadius: 3, border: '1px dashed', borderColor: 'divider' }}>
            <UserRound size={48} style={{ opacity: 0.3, marginBottom: 16 }} />
            <Typography variant="h6" color="text.secondary">No doctors found</Typography>
            <Typography variant="body2" color="text.secondary">Try adjusting your search criteria or add a new specialist.</Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {filteredDoctors.map((doc) => (
              <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={doc.id}>
                <Card
                  elevation={0}
                  sx={{
                    height: '100%',
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 3,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 10px 24px rgba(0,0,0,0.08)',
                      borderColor: 'primary.main'
                    }
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.dark', width: 48, height: 48, fontWeight: 700 }}>
                          {doc.name.replace('Dr. ', '').substring(0, 2).toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.05rem' }}>{doc.name}</Typography>
                          <Typography variant="body2" color="primary.main" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontWeight: 600 }}>
                            <Stethoscope size={14} /> {doc.specialization}
                          </Typography>
                        </Box>
                      </Box>
                      <IconButton size="small" onClick={() => handleDelete(doc.id)} color="error" sx={{ opacity: 0.6, '&:hover': { opacity: 1 } }}>
                        <Trash2 size={16} />
                      </IconButton>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1, mb: 2.5 }}>
                      <Chip
                        label={doc.availability}
                        size="small"
                        color={doc.availability === 'Available' ? 'success' : doc.availability === 'In Surgery' ? 'warning' : 'default'}
                        variant="outlined"
                        sx={{ fontWeight: 600 }}
                      />
                      <Chip
                        label={`${doc.experienceYears} Years Exp`}
                        size="small"
                        variant="outlined"
                        sx={{ borderColor: 'divider' }}
                      />
                    </Box>

                    <Box sx={{ borderTop: '1px solid', borderColor: 'divider', pt: 2, display: 'flex', flexDirection: 'column', gap: 1, fontSize: '0.85rem', color: 'text.secondary' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Phone size={14} />
                        <Typography variant="body2">{doc.contact}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Mail size={14} />
                        <Typography variant="body2">{doc.email || `${doc.name.toLowerCase().replace(/[^a-z]/g, '')}@nalam.care`}</Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Add Doctor Dialog */}
        <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ fontWeight: 700 }}>Add New Medical Specialist</DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 2 }}>
            <TextField
              label="Doctor Full Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              fullWidth
              placeholder="e.g. Dr. Rajesh Kanna"
              required
            />
            <TextField
              label="Specialization"
              value={formData.specialization}
              onChange={(e) => setFormData({ ...formData, specialization: e.target.value, department: e.target.value })}
              select
              fullWidth
            >
              <MenuItem value="Cardiology">Cardiology</MenuItem>
              <MenuItem value="Neurology">Neurology</MenuItem>
              <MenuItem value="Pediatrics">Pediatrics</MenuItem>
              <MenuItem value="Orthopedics">Orthopedics</MenuItem>
              <MenuItem value="Emergency Medicine">Emergency Medicine</MenuItem>
              <MenuItem value="General Surgery">General Surgery</MenuItem>
              <MenuItem value="Dermatology">Dermatology</MenuItem>
            </TextField>
            <TextField
              label="Experience (Years)"
              type="number"
              value={formData.experienceYears}
              onChange={(e) => setFormData({ ...formData, experienceYears: Number(e.target.value) })}
              fullWidth
            />
            <TextField
              label="Contact Number"
              value={formData.contact}
              onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
              fullWidth
              placeholder="+91 9876543210"
              required
            />
            <TextField
              label="Availability Status"
              value={formData.availability}
              onChange={(e) => setFormData({ ...formData, availability: e.target.value as any })}
              select
              fullWidth
            >
              <MenuItem value="Available">Available</MenuItem>
              <MenuItem value="In Surgery">In Surgery</MenuItem>
              <MenuItem value="Off Duty">Off Duty</MenuItem>
            </TextField>
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={() => setOpenAddDialog(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleAddDoctor} disabled={!formData.name || !formData.contact}>
              Add to Staff
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </motion.div>
  );
};
