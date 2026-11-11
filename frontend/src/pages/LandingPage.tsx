import { Suspense, lazy } from 'react';
import { Box, Typography, Button, Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const LandingScene = lazy(() => import('../three/LandingScene').then(m => ({ default: m.LandingScene })));

const BackgroundBlooms = () => (
  <Box sx={{ position: 'fixed', inset: 0, overflow: 'hidden', zIndex: -2, pointerEvents: 'none', bgcolor: '#090A0F' }}>
    <Box sx={{
      position: 'absolute', top: '0%', left: '10%', width: '70vw', height: '70vw',
      background: 'radial-gradient(circle, rgba(147, 51, 234, 0.15) 0%, transparent 60%)',
      filter: 'blur(90px)', animation: 'float1 15s infinite alternate ease-in-out'
    }} />
    <Box sx={{
      position: 'absolute', top: '40%', right: '-10%', width: '60vw', height: '60vw',
      background: 'radial-gradient(circle, rgba(236, 72, 153, 0.12) 0%, transparent 60%)',
      filter: 'blur(90px)', animation: 'float2 20s infinite alternate-reverse ease-in-out'
    }} />
    <Box sx={{
      position: 'absolute', bottom: '-20%', left: '20%', width: '80vw', height: '80vw',
      background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 60%)',
      filter: 'blur(90px)', animation: 'float3 18s infinite alternate ease-in-out'
    }} />
    <style>{`
      @keyframes float1 { 0% { transform: translate(0, 0) scale(1); } 100% { transform: translate(10%, 10%) scale(1.1); } }
      @keyframes float2 { 0% { transform: translate(0, 0) scale(1); } 100% { transform: translate(-10%, -10%) scale(1.2); } }
      @keyframes float3 { 0% { transform: translate(0, 0) scale(1); } 100% { transform: translate(5%, -15%) scale(1.1); } }
    `}</style>
  </Box>
);

export const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ color: '#ffffff', minHeight: '100dvh', height: { xs: 'auto', md: '100dvh' }, overflowY: { xs: 'auto', md: 'hidden' }, overflowX: 'hidden', position: 'relative' }}>
      <BackgroundBlooms />
      <Box sx={{ position: 'fixed', inset: 0, zIndex: -1 }}>
        <Suspense fallback={<Box sx={{ position: 'absolute', inset: 0, bgcolor: '#090A0F' }} />}>
          <LandingScene />
        </Suspense>
      </Box>

      {/* Main Overlay - Responsive layout */}
      <Box sx={{ position: { xs: 'relative', md: 'absolute' }, inset: 0, zIndex: 1, display: 'flex', flexDirection: 'column', p: { xs: 2.5, sm: 4, md: 6 }, minHeight: '100dvh' }}>
        
        {/* Top Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: { xs: 4, md: 0 } }}>
          <Typography sx={{ fontWeight: 800, fontSize: { xs: '1.3rem', sm: '1.5rem' }, letterSpacing: '-0.04em' }}>
            Nalam.
          </Typography>
          <Button variant="outlined" onClick={() => navigate('/login')} sx={{ color: '#fff', borderColor: 'rgba(255,255,255,0.3)', borderRadius: '50px', px: { xs: 2, sm: 3 } }}>
            Staff Login
          </Button>
        </Box>

        {/* Center Hero */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', my: { xs: 4, md: 0 } }}>
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}>
            <Typography variant="h1" sx={{ fontSize: { xs: '2.5rem', sm: '3.8rem', md: '6.5rem' }, fontWeight: 800, letterSpacing: '-0.06em', color: '#ffffff', mb: 2, lineHeight: 1.05 }}>
              Humanity,<br/>powered by intelligence.
            </Typography>
            <Typography variant="h5" sx={{ color: 'rgba(255,255,255,0.6)', fontWeight: 500, mb: { xs: 4, md: 6 }, mx: 'auto', maxWidth: 600, fontSize: { xs: '1rem', sm: '1.25rem' }, lineHeight: 1.5 }}>
              The premium hospital management platform designed for the future of care.
            </Typography>
            <Button variant="contained" onClick={() => navigate('/login')} size="large" sx={{ 
              px: { xs: 4, sm: 6 }, py: { xs: 1.5, sm: 2 }, fontSize: { xs: '1rem', sm: '1.2rem' }, bgcolor: '#ffffff', color: '#000000', borderRadius: '50px',
              boxShadow: '0 0 40px rgba(255, 255, 255, 0.2)',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.9)', transform: 'translateY(-2px)', boxShadow: '0 0 60px rgba(255, 255, 255, 0.4)' } 
            }}>
              Access Dashboard
            </Button>
          </motion.div>
        </Box>

        {/* Bottom Bento Features */}
        <Box sx={{ width: '100%', maxWidth: 1200, mx: 'auto', mt: { xs: 2, md: 0 }, pb: { xs: 4, md: 0 } }}>
          <Grid container spacing={2}>
            {[
              { title: "Intelligent Workflows", desc: "Automate busywork. Focus entirely on patient care." },
              { title: "Cinematic Design", desc: "A calm interface reducing cognitive load on long shifts." },
              { title: "Real-time AI", desc: "Instant medical context and automated summaries." }
            ].map((feature, i) => (
              <Grid size={{ xs: 12, md: 4 }} key={i}>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.5 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}>
                  <Box sx={{ 
                    p: { xs: 2, md: 3 }, borderRadius: 4, 
                    background: 'rgba(255, 255, 255, 0.03)', 
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(20px)'
                  }}>
                    <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.5, letterSpacing: '-0.02em', color: '#ffffff', fontSize: { xs: '1rem', md: '1.25rem' } }}>
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', lineHeight: 1.5, fontSize: { xs: '0.85rem', md: '0.9rem' } }}>
                      {feature.desc}
                    </Typography>
                  </Box>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Box>

      </Box>
    </Box>
  );
};
