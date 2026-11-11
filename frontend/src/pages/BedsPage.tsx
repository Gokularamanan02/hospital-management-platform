import { useState, useEffect } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, Chip, Button, Dialog,
  DialogTitle, DialogContent, DialogActions, MenuItem, TextField,
  CircularProgress, Tabs, Tab, useTheme, useMediaQuery
} from '@mui/material';
import { CheckCircle2, AlertTriangle, User, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Bed, Patient } from '../types';
import { bedService } from '../services/bed.service';
import { patientService } from '../services/patient.service';

export const BedsPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [beds, setBeds] = useState<Bed[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWard, setSelectedWard] = useState('All');
  const [selectedBed, setSelectedBed] = useState<Bed | null>(null);
  const [openStatusDialog, setOpenStatusDialog] = useState(false);
  const [targetStatus, setTargetStatus] = useState<Bed['status']>('Available');
  const [targetPatientId, setTargetPatientId] = useState('');

  const fetchData = async () => {
    try {
      const [bedsData, ptsData] = await Promise.all([
        bedService.getAll(),
        patientService.getAll()
      ]);
      setBeds(bedsData);
      setPatients(ptsData);
    } catch (err) {
      console.error('Failed to load bed inventory', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAction = (bed: Bed) => {
    setSelectedBed(bed);
    setTargetStatus(bed.status);
    setTargetPatientId(bed.patientId || '');
    setOpenStatusDialog(true);
  };

  const handleUpdateBed = async () => {
    if (!selectedBed) return;
    try {
      const updated = await bedService.updateStatus(
        selectedBed.id,
        targetStatus,
        targetStatus === 'Occupied' ? targetPatientId : undefined
      );
      setBeds(beds.map(b => b.id === selectedBed.id ? updated : b));
      setOpenStatusDialog(false);
    } catch (err) {
      console.error('Failed to update bed status', err);
    }
  };

  const wards = ['All', 'ICU-A', 'General-B', 'Private-C', 'Emergency'];
  const filteredBeds = selectedWard === 'All' ? beds : beds.filter(b => b.ward === selectedWard);

  const totalBeds = beds.length;
  const occupiedCount = beds.filter(b => b.status === 'Occupied').length;
  const availableCount = beds.filter(b => b.status === 'Available').length;
  const icuAvailable = beds.filter(b => b.type === 'ICU' && b.status === 'Available').length;
  const occupancyRate = totalBeds > 0 ? Math.round((occupiedCount / totalBeds) * 100) : 0;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Box sx={{ pb: 6 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { sm: 'center' }, gap: 2, mb: 4 }}>
          <Box>
            <Typography variant="h4" color="primary.main" sx={{ fontWeight: 800 }}>Beds & Ward Management</Typography>
            <Typography color="text.secondary">Real-time ward occupancy, ICU status, and patient allocation tracker.</Typography>
          </Box>
          <Button variant="outlined" startIcon={<RefreshCw size={16} />} onClick={fetchData}>
            Sync Ward Matrix
          </Button>
        </Box>

        {/* Ward Overview Stats */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
              <CardContent sx={{ p: 2.5 }}>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>Total Beds</Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, mt: 1, color: 'text.primary' }}>{totalBeds}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
              <CardContent sx={{ p: 2.5 }}>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>Available Immediately</Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, mt: 1, color: 'success.main' }}>{availableCount}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
              <CardContent sx={{ p: 2.5 }}>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>ICU Units Ready</Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, mt: 1, color: icuAvailable <= 1 ? 'error.main' : 'primary.main' }}>
                  {icuAvailable}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
              <CardContent sx={{ p: 2.5 }}>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>Hospital Occupancy</Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, mt: 1, color: 'info.main' }}>{occupancyRate}%</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Ward Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs
            value={selectedWard}
            onChange={(_, val) => setSelectedWard(val)}
            variant="scrollable"
            scrollButtons="auto"
          >
            {wards.map(w => (
              <Tab key={w} label={w === 'All' ? 'All Hospital Wards' : `Ward ${w}`} value={w} sx={{ fontWeight: 600 }} />
            ))}
          </Tabs>
        </Box>

        {/* Beds Grid */}
        {loading ? (
          <Box sx={{ p: 6, display: 'flex', justifyContent: 'center' }}><CircularProgress /></Box>
        ) : (
          <Grid container spacing={2.5}>
            {filteredBeds.map(bed => {
              const isOccupied = bed.status === 'Occupied';
              const isAvailable = bed.status === 'Available';

              return (
                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={bed.id}>
                  <Card
                    elevation={0}
                    onClick={() => handleOpenAction(bed)}
                    sx={{
                      cursor: 'pointer',
                      border: '1.5px solid',
                      borderColor: isOccupied ? 'rgba(239, 68, 68, 0.4)' : isAvailable ? 'rgba(34, 197, 94, 0.4)' : 'rgba(245, 158, 11, 0.4)',
                      bgcolor: isOccupied ? 'rgba(239, 68, 68, 0.03)' : isAvailable ? 'rgba(34, 197, 94, 0.03)' : 'rgba(245, 158, 11, 0.03)',
                      borderRadius: 3,
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        transform: 'translateY(-3px)',
                        boxShadow: '0 8px 20px rgba(0,0,0,0.06)'
                      }
                    }}
                  >
                    <CardContent sx={{ p: 2.5 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                        <Typography variant="h6" sx={{ fontWeight: 800, fontFamily: '"JetBrains Mono", monospace' }}>
                          {bed.bedNumber}
                        </Typography>
                        <Chip
                          label={bed.status}
                          size="small"
                          color={isAvailable ? 'success' : isOccupied ? 'error' : 'warning'}
                          sx={{ fontWeight: 700, fontSize: '0.75rem' }}
                        />
                      </Box>

                      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                        <Chip label={bed.ward} size="small" variant="outlined" />
                        <Chip label={bed.type} size="small" variant="outlined" color="primary" />
                      </Box>

                      <Box sx={{ minHeight: 48, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        {isOccupied ? (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.primary' }}>
                            <User size={16} color="#EF4444" />
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {bed.patientName || 'Admitted Patient'}
                            </Typography>
                          </Box>
                        ) : isAvailable ? (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'success.main' }}>
                            <CheckCircle2 size={16} />
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              Ready for Admission
                            </Typography>
                          </Box>
                        ) : (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'warning.main' }}>
                            <AlertTriangle size={16} />
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              Sanitization / Service
                            </Typography>
                          </Box>
                        )}
                      </Box>

                      <Button
                        variant="text"
                        size="small"
                        fullWidth
                        sx={{ mt: 1, textTransform: 'none', fontWeight: 700 }}
                      >
                        Manage Bed & Status →
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}

        {/* Bed Status & Patient Assignment Dialog */}
        <Dialog open={openStatusDialog} onClose={() => setOpenStatusDialog(false)} maxWidth="xs" fullWidth fullScreen={isMobile}>
          <DialogTitle sx={{ fontWeight: 700 }}>
            Manage Bed: {selectedBed?.bedNumber} ({selectedBed?.ward})
          </DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 2 }}>
            <TextField
              label="Bed Status"
              select
              value={targetStatus}
              onChange={(e) => setTargetStatus(e.target.value as any)}
              fullWidth
            >
              <MenuItem value="Available">Available (Vacant & Clean)</MenuItem>
              <MenuItem value="Occupied">Occupied (Admitted Patient)</MenuItem>
              <MenuItem value="Maintenance">Maintenance / Sanitization</MenuItem>
            </TextField>

            {targetStatus === 'Occupied' && (
              <TextField
                label="Assign Patient"
                select
                value={targetPatientId}
                onChange={(e) => setTargetPatientId(e.target.value)}
                fullWidth
                required
                helperText="Select the admitted patient to link with this bed"
              >
                {patients.map(p => (
                  <MenuItem key={p.id} value={p.id}>
                    {p.name} ({p.gender}, {p.bloodGroup})
                  </MenuItem>
                ))}
              </TextField>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={() => setOpenStatusDialog(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleUpdateBed}>
              Save Bed State
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </motion.div>
  );
};
