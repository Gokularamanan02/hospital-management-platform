import { createTheme } from '@mui/material/styles';

const headingStyles = {
  fontFamily: '"Manrope", sans-serif',
  fontWeight: 800,
  letterSpacing: '-0.04em',
};

const baseTheme = {
  typography: {
    fontFamily: '"Manrope", sans-serif',
    h1: headingStyles,
    h2: headingStyles,
    h3: headingStyles,
    h4: headingStyles,
    h5: headingStyles,
    h6: headingStyles,
    button: { textTransform: 'none' as const, fontWeight: 700, letterSpacing: '-0.01em' },
  },
  shape: {
    borderRadius: 12,
  },
};

export const lightTheme = createTheme({
  ...baseTheme,
  palette: {
    mode: 'light',
    primary: {
      main: '#0F6B63',
      dark: '#0A4A45',
      light: '#DCEFEA',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#E2725B', // Accent warm coral
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#F7F3EC',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#14201E', // Ink
      secondary: '#5B6B67', // Muted
    },
    success: { main: '#4CAF50' }, // Soft Green
    warning: { main: '#FF9800' }, // Amber
    info: { main: '#2196F3' }, // Soft Blue
    error: { main: '#F44336' }, // Muted Red
    divider: '#E4DED2',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          padding: '10px 24px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(15, 107, 99, 0.15)',
            transform: 'translateY(-1px)',
          },
          transition: 'all 0.2s ease-in-out',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(20, 32, 30, 0.05)',
          border: '1px solid #E4DED2',
        },
      },
    },
  },
});

export const darkTheme = createTheme({
  ...baseTheme,
  palette: {
    mode: 'dark',
    primary: {
      main: '#3b82f6', // Bright Blue
      dark: '#2563eb',
      light: '#60a5fa',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#ec4899', // Pink
      contrastText: '#ffffff',
    },
    background: {
      default: '#090A0F', // Deep black
      paper: '#13151E', // Slightly lighter for cards/sidebar
    },
    text: {
      primary: '#ffffff',
      secondary: 'rgba(255, 255, 255, 0.7)',
    },
    success: { main: '#10b981' },
    warning: { main: '#f59e0b' },
    info: { main: '#3b82f6' },
    error: { main: '#ef4444' },
    divider: 'rgba(255, 255, 255, 0.05)',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '50px',
          padding: '10px 24px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 0 20px rgba(59, 130, 246, 0.3)',
            transform: 'translateY(-1px)',
          },
          transition: 'all 0.2s ease-in-out',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          background: 'linear-gradient(145deg, #13151E 0%, #0c0d14 100%)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: '#13151E',
          border: '1px solid rgba(255, 255, 255, 0.05)',
        }
      }
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        }
      }
    }
  },
});
