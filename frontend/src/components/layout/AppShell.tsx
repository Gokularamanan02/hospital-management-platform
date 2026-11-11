import { useState } from 'react';
import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export const AppShell = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100dvh', bgcolor: 'background.default' }}>
      <Sidebar mobileOpen={mobileOpen} onMobileClose={handleDrawerToggle} />
      
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', width: { xs: '100%', md: `calc(100% - 260px)` }, minWidth: 0, maxWidth: '100vw', overflowX: 'hidden' }}>
        <Topbar onMenuClick={handleDrawerToggle} />
        
        {/* Main Content Area */}
        <Box component="main" sx={{ flexGrow: 1, p: { xs: 1.5, sm: 2.5, md: 4 }, minWidth: 0, maxWidth: '100%' }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};
