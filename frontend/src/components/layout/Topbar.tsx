import { useState } from 'react';
import {
  AppBar, Toolbar, IconButton, Box, InputBase, Badge, Avatar, useTheme,
  alpha, Menu, MenuItem, Typography, Divider, Drawer, List, ListItem,
  Button, Chip
} from '@mui/material';
import {
  Menu as MenuIcon, Search, Bell, LogOut, X, Sparkles
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import type { User } from '../../types';

export const Topbar = ({ onMenuClick }: { onMenuClick: () => void }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user, role, setRole, logout } = useAuth();

  // Profile Menu State
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const openMenu = Boolean(anchorEl);

  // Notifications Drawer State
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: 'n1',
      title: 'ICU Bed Allocation Alert',
      desc: 'Patient Ramesh Patel assigned to ICU-01 following ACS intervention.',
      time: '12 mins ago'
    },
    {
      id: 'n2',
      title: 'Appointment Confirmed',
      desc: 'Dr. Meera Sharma scheduled with Sita Ram for 10:30 AM.',
      time: '45 mins ago'
    },
    {
      id: 'n3',
      title: 'Medical Record Logged',
      desc: 'EMR record created for Priya Narayanan (Hypertension review).',
      time: '2 hours ago'
    }
  ]);

  // Global Search State
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const lower = searchQuery.toLowerCase();
    if (
      lower.startsWith('who') || lower.startsWith('what') || lower.startsWith('how') ||
      lower.startsWith('why') || lower.startsWith('is') || lower.startsWith('can') ||
      lower.includes('?') || lower.includes('summarize') || lower.includes('symptom')
    ) {
      navigate('/ai-assistant', { state: { initialQuery: searchQuery } });
    } else if (lower.includes('doc') || lower.includes('dr')) {
      navigate('/doctors');
    } else if (lower.includes('bed') || lower.includes('icu') || lower.includes('ward')) {
      navigate('/beds');
    } else if (lower.includes('appt') || lower.includes('sched')) {
      navigate('/appointments');
    } else if (lower.includes('record') || lower.includes('diag') || lower.includes('med')) {
      navigate('/medical-records');
    } else {
      navigate('/patients');
    }
    setSearchQuery('');
  };

  const handleRoleSwitch = (newRole: User['role']) => {
    setRole(newRole);
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    setAnchorEl(null);
    navigate('/login');
  };

  return (
    <>
      <AppBar 
        position="sticky" 
        elevation={0}
        sx={{ 
          bgcolor: 'background.default',
          borderBottom: `1px solid ${theme.palette.divider}`,
          color: 'text.primary',
          zIndex: theme.zIndex.drawer - 1
        }}
      >
        <Toolbar sx={{ px: { xs: 2, md: 4 }, py: 1 }}>
          <IconButton
            color="inherit"
            edge="start"
            onClick={onMenuClick}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon size={24} />
          </IconButton>

          {/* Global Search Bar */}
          <Box 
            component="form"
            onSubmit={handleSearchSubmit}
            sx={{ 
              display: 'flex', 
              alignItems: 'center',
              bgcolor: 'background.paper',
              borderRadius: 2,
              px: { xs: 1.2, sm: 2 },
              py: 0.6,
              width: { xs: 'auto', sm: 260, md: 360 },
              flex: { xs: 1, sm: 'none' },
              maxWidth: 360,
              border: `1px solid ${theme.palette.divider}`,
              '&:focus-within': {
                borderColor: 'primary.main',
                boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`
              }
            }}
          >
            <Search size={18} color={theme.palette.text.secondary} />
            <InputBase 
              placeholder="Search or ask AI..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ ml: { xs: 0.8, sm: 1.5 }, flex: 1, fontSize: { xs: '0.8rem', sm: '0.88rem' } }}
            />
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          {/* Action Icons */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.8, sm: 1.5 } }}>
            {/* Ask AI Quick Button (Mobile Icon) */}
            <IconButton
              color="primary"
              onClick={() => navigate('/ai-assistant')}
              sx={{ display: { xs: 'inline-flex', sm: 'none' } }}
              title="Ask AI Assistant"
            >
              <Sparkles size={20} />
            </IconButton>

            {/* Ask AI Quick Button (Desktop / Tablet) */}
            <Button
              variant="outlined"
              color="primary"
              size="small"
              startIcon={<Sparkles size={15} />}
              onClick={() => navigate('/ai-assistant')}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 700,
                fontSize: '0.82rem',
                display: { xs: 'none', sm: 'inline-flex' }
              }}
            >
              Ask AI
            </Button>

            {/* Notification Bell */}
            <IconButton sx={{ color: 'text.secondary' }} onClick={() => setNotificationsOpen(true)}>
              <Badge badgeContent={notifications.length} color="secondary" sx={{ '& .MuiBadge-badge': { fontSize: '0.7rem', height: 16, minWidth: 16 } }}>
                <Bell size={20} />
              </Badge>
            </IconButton>

            {/* Profile Avatar & Menu */}
            <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ p: 0 }}>
              <Avatar sx={{ width: 38, height: 38, bgcolor: 'primary.main', fontSize: '0.9rem', fontWeight: 700 }}>
                {user.initials}
              </Avatar>
            </IconButton>

            {/* Profile Menu */}
            <Menu
              anchorEl={anchorEl}
              open={openMenu}
              onClose={() => setAnchorEl(null)}
              slotProps={{
                paper: {
                  elevation: 0,
                  sx: {
                    width: 260,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 3,
                    mt: 1.5,
                    boxShadow: '0 12px 28px rgba(0,0,0,0.1)'
                  }
                }
              }}
            >
              <Box sx={{ p: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>{user.name}</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>{user.email}</Typography>
                <Chip
                  label={role}
                  size="small"
                  color="primary"
                  variant="filled"
                  sx={{ mt: 1, fontWeight: 700, fontSize: '0.65rem', height: 20 }}
                />
              </Box>
              <Divider />

              <Box sx={{ px: 2, py: 1 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>
                  Switch Active Role:
                </Typography>
                <Box sx={{ display: 'flex', gap: 0.5, mt: 1, flexWrap: 'wrap' }}>
                  {(['ADMIN', 'DOCTOR', 'RECEPTIONIST'] as const).map((r) => (
                    <Chip
                      key={r}
                      label={r}
                      clickable
                      size="small"
                      color={role === r ? 'primary' : 'default'}
                      variant={role === r ? 'filled' : 'outlined'}
                      onClick={() => handleRoleSwitch(r)}
                      sx={{ fontSize: '0.7rem', fontWeight: 600 }}
                    />
                  ))}
                </Box>
              </Box>
              <Divider />

              <MenuItem onClick={handleLogout} sx={{ color: 'error.main', py: 1.5, gap: 1.5 }}>
                <LogOut size={16} />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>Sign Out</Typography>
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Notifications Drawer */}
      <Drawer
        anchor="right"
        open={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        slotProps={{
          paper: { sx: { width: { xs: 320, sm: 380 }, p: 3 } }
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>Hospital Alerts</Typography>
            <Badge badgeContent={notifications.length} color="primary" />
          </Box>
          <IconButton onClick={() => setNotificationsOpen(false)} size="small">
            <X size={18} />
          </IconButton>
        </Box>

        <List sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, p: 0 }}>
          {notifications.map((item) => (
            <ListItem
              key={item.id}
              sx={{
                p: 2,
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.default',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: 0.5
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{item.title}</Typography>
                <Typography variant="caption" color="text.secondary">{item.time}</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                {item.desc}
              </Typography>
            </ListItem>
          ))}
        </List>

        <Button
          fullWidth
          variant="outlined"
          size="small"
          onClick={() => setNotifications([])}
          sx={{ mt: 3, borderRadius: 2 }}
        >
          Clear All Alerts
        </Button>
      </Drawer>
    </>
  );
};
