import { useState } from 'react';
import { Box, Typography, Button, Paper, TextField, Chip, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { APP_NAME } from '../config/constants';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, UserCheck, Stethoscope } from 'lucide-react';
import type { User } from '../types';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('admin@nalam.care');
  const [password, setPassword] = useState('password');
  const [selectedRole, setSelectedRole] = useState<User['role']>('ADMIN');
  const [loading, setLoading] = useState(false);

  const handleRoleSelect = (role: User['role'], defaultEmail: string) => {
    setSelectedRole(role);
    setEmail(defaultEmail);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, selectedRole);
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      minHeight: '100dvh', 
      bgcolor: 'background.default',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative background shape */}
      <Box sx={{
        position: 'absolute',
        top: '-20%',
        right: '-10%',
        width: '60vw',
        height: '60vw',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(220,239,234,0.8) 0%, rgba(247,243,236,0) 70%)',
        zIndex: 0
      }} />

      <Box sx={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        zIndex: 1,
        px: 2
      }}>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
          <Paper elevation={0} sx={{ 
            p: { xs: 4, md: 5 }, 
            borderRadius: 4, 
            maxWidth: 440, 
            width: '100%', 
            border: '1px solid',
            borderColor: 'divider',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.06)'
          }}>
            <Typography variant="h3" color="primary.main" sx={{ fontWeight: 800 }} gutterBottom>
              {APP_NAME}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Enterprise Hospital Intelligence Platform. Sign in with clinical credentials.
            </Typography>

            {/* Quick Demo Role Selector */}
            <Typography variant="caption" sx={{ textTransform: 'uppercase', fontWeight: 700, color: 'text.secondary', display: 'block', mb: 1 }}>
              Select Active Clinical Role:
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mb: 3, flexWrap: 'wrap', gap: 1 }}>
              <Chip
                icon={<ShieldCheck size={14} />}
                label="Admin"
                clickable
                color={selectedRole === 'ADMIN' ? 'primary' : 'default'}
                variant={selectedRole === 'ADMIN' ? 'filled' : 'outlined'}
                onClick={() => handleRoleSelect('ADMIN', 'admin@nalam.care')}
                sx={{ fontWeight: 700 }}
              />
              <Chip
                icon={<Stethoscope size={14} />}
                label="Doctor"
                clickable
                color={selectedRole === 'DOCTOR' ? 'primary' : 'default'}
                variant={selectedRole === 'DOCTOR' ? 'filled' : 'outlined'}
                onClick={() => handleRoleSelect('DOCTOR', 'doctor@nalam.care')}
                sx={{ fontWeight: 700 }}
              />
              <Chip
                icon={<UserCheck size={14} />}
                label="Receptionist"
                clickable
                color={selectedRole === 'RECEPTIONIST' ? 'primary' : 'default'}
                variant={selectedRole === 'RECEPTIONIST' ? 'filled' : 'outlined'}
                onClick={() => handleRoleSelect('RECEPTIONIST', 'frontdesk@nalam.care')}
                sx={{ fontWeight: 700 }}
              />
            </Stack>

            <Box component="form" onSubmit={handleLogin} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <TextField 
                label="Staff Email or ID" 
                variant="outlined" 
                fullWidth 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                size="small"
              />
              <TextField 
                label="Password" 
                type="password" 
                variant="outlined" 
                fullWidth 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                size="small"
              />
              
              <Button 
                type="submit"
                variant="contained" 
                color="primary" 
                fullWidth 
                size="large"
                disabled={loading}
                sx={{ mt: 1, py: 1.2, borderRadius: 2, fontWeight: 700 }}
              >
                {loading ? 'Authenticating...' : `Enter as ${selectedRole}`}
              </Button>
            </Box>
          </Paper>
        </motion.div>
      </Box>
    </Box>
  );
};
