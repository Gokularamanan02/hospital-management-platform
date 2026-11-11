import { 
  Drawer, List, ListItem, ListItemIcon, ListItemText, ListItemButton, 
  Box, Typography, useTheme, useMediaQuery, IconButton, Chip
} from '@mui/material';
import { 
  LayoutDashboard, Users, UserRound, Building2, Calendar, 
  Bed, FileText, Bot, X, Shield 
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { APP_NAME } from '../../config/constants';
import { useAuth } from '../../context/AuthContext';

const DRAWER_WIDTH = 260;

const NAV_ITEMS = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'DOCTOR', 'RECEPTIONIST'] },
  { label: 'Patients', path: '/patients', icon: Users, roles: ['ADMIN', 'DOCTOR', 'RECEPTIONIST'] },
  { label: 'Doctors', path: '/doctors', icon: UserRound, roles: ['ADMIN', 'RECEPTIONIST'] },
  { label: 'Departments', path: '/departments', icon: Building2, roles: ['ADMIN'] },
  { label: 'Appointments', path: '/appointments', icon: Calendar, roles: ['ADMIN', 'DOCTOR', 'RECEPTIONIST'] },
  { label: 'Beds & Wards', path: '/beds', icon: Bed, roles: ['ADMIN', 'RECEPTIONIST', 'DOCTOR'] },
  { label: 'Medical Records', path: '/medical-records', icon: FileText, roles: ['ADMIN', 'DOCTOR'] },
  { label: 'AI Assistant', path: '/ai-assistant', icon: Bot, roles: ['ADMIN', 'DOCTOR', 'RECEPTIONIST'] },
];

export const Sidebar = ({ mobileOpen, onMobileClose }: { mobileOpen: boolean, onMobileClose: () => void }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { role, user } = useAuth();

  const filteredNav = NAV_ITEMS.filter(item => item.roles.includes(role));

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'background.paper' }}>
      {/* Brand Header */}
      <Box sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="h4" color="primary.main" sx={{ fontWeight: 800 }}>
            {APP_NAME}
          </Typography>
          <Chip
            label={role}
            size="small"
            color="primary"
            variant="outlined"
            sx={{ fontWeight: 800, fontSize: '0.65rem', height: 20 }}
          />
        </Box>
        {isMobile && (
          <IconButton onClick={onMobileClose} size="small">
            <X size={20} />
          </IconButton>
        )}
      </Box>

      {/* Navigation List */}
      <List sx={{ px: 2, flexGrow: 1 }}>
        {filteredNav.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          return (
            <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => {
                  navigate(item.path);
                  if (isMobile) onMobileClose();
                }}
                sx={{
                  borderRadius: 2,
                  bgcolor: isActive ? 'primary.light' : 'transparent',
                  color: isActive ? 'primary.dark' : 'text.secondary',
                  '&:hover': {
                    bgcolor: isActive ? 'primary.light' : 'action.hover',
                  }
                }}
              >
                <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>
                  <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                </ListItemIcon>
                <ListItemText 
                  primary={item.label} 
                  sx={{ '& .MuiListItemText-primary': { fontWeight: isActive ? 700 : 500, fontSize: '0.95rem' } }} 
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      {/* Footer User Info */}
      <Box sx={{ p: 2, m: 2, borderRadius: 2, bgcolor: 'background.default', border: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Shield size={16} color={theme.palette.primary.main} />
          <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
            {user.department}
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ fontWeight: 700, mt: 0.5 }} noWrap>
          {user.name}
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box component="nav" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}>
      {isMobile ? (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={onMobileClose}
          ModalProps={{ keepMounted: true }}
          sx={{ '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH, borderRight: 'none' } }}
        >
          {drawerContent}
        </Drawer>
      ) : (
        <Drawer
          variant="permanent"
          sx={{ '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH, borderRight: `1px solid ${theme.palette.divider}` } }}
          open
        >
          {drawerContent}
        </Drawer>
      )}
    </Box>
  );
};
