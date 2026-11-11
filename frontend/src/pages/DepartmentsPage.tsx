import { useState, useEffect } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, Button, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField, MenuItem,
  CircularProgress, LinearProgress, Avatar
} from '@mui/material';
import { Building2, Plus, UserRound, BedDouble } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Department, Doctor } from '../types';
import { departmentService } from '../services/department.service';
import { doctorService } from '../services/doctor.service';

export const DepartmentsPage = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    headDoctorId: '',
    headDoctorName: '',
    capacity: 25,
    occupiedBeds: 10,
    description: ''
  });

  const fetchData = async () => {
    try {
      const [deptData, docData] = await Promise.all([
        departmentService.getAll(),
        doctorService.getAll()
      ]);
      setDepartments(deptData);
      setDoctors(docData);
      if (docData.length > 0 && !formData.headDoctorId) {
        setFormData(prev => ({
          ...prev,
          headDoctorId: docData[0]!.id,
          headDoctorName: docData[0]!.name
        }));
      }
    } catch (err) {
      console.error('Failed to load departments', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddDepartment = async () => {
    if (!formData.name || !formData.headDoctorName) return;
    try {
      const created = await departmentService.create({
        name: formData.name,
        headDoctorId: formData.headDoctorId,
        headDoctorName: formData.headDoctorName,
        capacity: formData.capacity,
        occupiedBeds: formData.occupiedBeds,
        description: formData.description || `${formData.name} specialized hospital division.`
      });
      setDepartments([...departments, created]);
      setOpenDialog(false);
      setFormData(prev => ({ ...prev, name: '', description: '' }));
    } catch (err) {
      console.error('Error adding department', err);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Box sx={{ pb: 6 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { sm: 'center' }, gap: 2, mb: 4 }}>
          <Box>
            <Typography variant="h4" color="primary.main" sx={{ fontWeight: 800 }}>Clinical Departments</Typography>
            <Typography color="text.secondary">Specialized hospital divisions, department heads, and bed capacities.</Typography>
          </Box>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Plus size={18} />}
            onClick={() => setOpenDialog(true)}
            sx={{ px: 3, py: 1.2, borderRadius: 2 }}
          >
            Add Department
          </Button>
        </Box>

        {/* Departments Grid */}
        {loading ? (
          <Box sx={{ p: 6, display: 'flex', justifyContent: 'center' }}><CircularProgress /></Box>
        ) : (
          <Grid container spacing={3}>
            {departments.map(dept => {
              const capacity = dept.capacity || 20;
              const occupied = dept.occupiedBeds || 0;
              const percent = Math.min(100, Math.round((occupied / capacity) * 100));

              return (
                <Grid size={{ xs: 12, md: 6, lg: 4 }} key={dept.id}>
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
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                        <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.dark', width: 44, height: 44 }}>
                          <Building2 size={22} />
                        </Avatar>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 800 }}>{dept.name}</Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <UserRound size={14} /> Head: {dept.headDoctorName || 'Chief Specialist'}
                          </Typography>
                        </Box>
                      </Box>

                      <Typography variant="body2" color="text.secondary" sx={{ mb: 3, minHeight: 40, lineHeight: 1.5 }}>
                        {dept.description || `${dept.name} provides premier diagnosis and compassionate therapeutic care.`}
                      </Typography>

                      <Box sx={{ borderTop: '1px solid', borderColor: 'divider', pt: 2.5 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <BedDouble size={16} /> Ward Bed Utilization
                          </Typography>
                          <Typography variant="caption" sx={{ fontWeight: 700, fontFamily: '"JetBrains Mono", monospace' }}>
                            {occupied} / {capacity} ({percent}%)
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={percent}
                          color={percent > 85 ? 'error' : percent > 60 ? 'warning' : 'primary'}
                          sx={{ height: 8, borderRadius: 4 }}
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}

        {/* Add Department Dialog */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ fontWeight: 700 }}>Register New Clinical Department</DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 2 }}>
            <TextField
              label="Department Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              fullWidth
              placeholder="e.g. Oncology & Chemotherapy Unit"
              required
            />
            <TextField
              label="Head Doctor / Chief Specialist"
              select
              value={formData.headDoctorId}
              onChange={(e) => {
                const doc = doctors.find(d => d.id === e.target.value);
                setFormData({
                  ...formData,
                  headDoctorId: e.target.value,
                  headDoctorName: doc ? doc.name : ''
                });
              }}
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
              label="Allocated Bed Capacity"
              type="number"
              value={formData.capacity}
              onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
              fullWidth
            />
            <TextField
              label="Department Description & Scope"
              multiline
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              fullWidth
              placeholder="Detail services, triage protocols, and intensive care provisions."
            />
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleAddDepartment} disabled={!formData.name || !formData.headDoctorName}>
              Register Department
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </motion.div>
  );
};

