import React, { useState } from 'react'
import { ThemeProvider, createTheme, useMediaQuery, useTheme, IconButton, Drawer, AppBar, Toolbar, Typography } from '@mui/material'
import { BrowserRouter as Router } from 'react-router-dom'
import CssBaseline from '@mui/material/CssBaseline'
import Box from '@mui/material/Box'
import { AppProvider } from './context/AppContext'
import './App.css'
import MenuIcon from '@mui/icons-material/Menu'
import EvidenceFilters from './components/features/EvidenceFilters'
import GhostCards from './components/features/GhostCards'

function App() {
  const [theme] = useState(createTheme({
    palette: {
      mode: 'dark',
      primary: {
        main: '#dc143c', // Crimson red
      },
      secondary: {
        main: '#8b0000', // Dark red
      },
      success: {
        main: '#32cd32', // Lime green
      },
      warning: {
        main: '#b22222', // Fire brick
      },
      error: {
        main: '#8b0000', // Dark red
      },
      background: {
        default: 'rgba(10, 10, 10, 0.98)',
        paper: 'rgba(26, 10, 10, 0.95)',
      },
      text: {
        primary: '#f5f5f5',
        secondary: 'rgba(245, 245, 245, 0.7)',
      },
      divider: 'rgba(139, 0, 0, 0.4)',
    },
    typography: {
      h6: {
        fontSize: '1.5rem',
        fontWeight: 500,
        '@media (max-width:600px)': {
          fontSize: '1.25rem',
        },
      },
      subtitle1: {
        fontSize: '1.3rem',
        fontWeight: 500,
        '@media (max-width:600px)': {
          fontSize: '1.1rem',
        },
      },
      subtitle2: {
        fontSize: '1.2rem',
        fontWeight: 500,
        '@media (max-width:600px)': {
          fontSize: '1rem',
        },
      },
      body1: {
        fontSize: '1.2rem',
        '@media (max-width:600px)': {
          fontSize: '1rem',
        },
      },
      body2: {
        fontSize: '1.1rem',
        '@media (max-width:600px)': {
          fontSize: '0.9rem',
        },
      },
    },
    components: {
      MuiToolbar: {
        styleOverrides: {
          root: {
            minHeight: '48px !important',
            background: 'linear-gradient(45deg, rgba(10, 10, 10, 0.98) 0%, rgba(26, 10, 10, 0.95) 100%)',
            backdropFilter: 'blur(15px)',
            borderBottom: '2px solid rgba(139, 0, 0, 0.5)',
            boxShadow: '0 4px 25px rgba(139, 0, 0, 0.4)',
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            background: 'transparent',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 4px 35px rgba(139, 0, 0, 0.5)',
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            background: 'linear-gradient(180deg, rgba(10, 10, 10, 0.98) 0%, rgba(26, 10, 10, 0.98) 100%)',
            backdropFilter: 'blur(20px)',
            borderRight: '2px solid rgba(139, 0, 0, 0.5)',
            boxShadow: '4px 0 25px rgba(139, 0, 0, 0.4)',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            background: 'linear-gradient(135deg, rgba(26, 10, 10, 0.95) 0%, rgba(45, 27, 45, 0.9) 100%)',
            backdropFilter: 'blur(15px)',
            border: '1px solid rgba(139, 0, 0, 0.3)',
            boxShadow: '0 8px 35px rgba(139, 0, 0, 0.25), inset 0 1px 0 rgba(245, 245, 245, 0.05)',
            transition: 'all 0.4s ease',
            '&:hover': {
              transform: 'translateY(-3px)',
              boxShadow: '0 15px 50px rgba(139, 0, 0, 0.4), inset 0 1px 0 rgba(245, 245, 245, 0.1)',
              border: '1px solid rgba(220, 20, 60, 0.6)',
            },
            '& .MuiTypography-h6': {
              fontSize: '1.5rem',
              textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)',
              '@media (max-width:600px)': {
                fontSize: '1.25rem',
              },
            },
            '& .MuiTypography-subtitle2': {
              fontSize: '1.2rem',
              '@media (max-width:600px)': {
                fontSize: '1rem',
              },
            },
            '& .MuiTypography-body2': {
              fontSize: '1.1rem',
              '@media (max-width:600px)': {
                fontSize: '0.9rem',
              },
            },
            '& .MuiChip-root': {
              fontSize: '1.1rem',
              background: 'linear-gradient(45deg, rgba(139, 0, 0, 0.9), rgba(220, 20, 60, 0.8))',
              boxShadow: '0 2px 10px rgba(139, 0, 0, 0.5)',
              '@media (max-width:600px)': {
                fontSize: '0.9rem',
              },
            },
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            borderRadius: '8px',
            boxShadow: '0 4px 20px rgba(139, 0, 0, 0.3)',
            transition: 'all 0.4s ease',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 30px rgba(139, 0, 0, 0.6)',
            },
          },
          contained: {
            background: 'linear-gradient(45deg, #8b0000 30%, #dc143c 90%)',
            '&:hover': {
              background: 'linear-gradient(45deg, #b22222 30%, #ff6347 90%)',
            },
          },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontSize: '1.1rem',
            fontWeight: 500,
            textShadow: '2px 2px 4px rgba(0, 0, 0, 0.9)',
            '&.Mui-selected': {
              color: '#dc143c',
              textShadow: '0 0 15px rgba(220, 20, 60, 0.9)',
            },
          },
        },
      },
      MuiTabs: {
        styleOverrides: {
          root: {
            '& .MuiTabs-indicator': {
              background: 'linear-gradient(45deg, #8b0000, #dc143c)',
              height: '3px',
              boxShadow: '0 0 15px rgba(139, 0, 0, 0.9)',
            },
          },
        },
      },
    },
  }))
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const drawer = (
    <Box sx={{ width: 320, height: '100%', display: 'flex', flexDirection: 'column' }}>
      {isMobile && <Toolbar />} {/* Spacer for fixed AppBar */}
          <EvidenceFilters />
    </Box>
  )

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppProvider>
        <Router>
          <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
                <AppBar 
              position={isMobile ? "fixed" : "static"}
                  sx={{ 
                    zIndex: (theme) => theme.zIndex.drawer + 1,
                    backgroundColor: 'background.paper',
                    borderBottom: 1,
                borderColor: 'divider',
                minHeight: '48px'
                  }}
                >
              <Toolbar sx={{ minHeight: '48px !important' }}>
                {isMobile && (
                    <IconButton
                      color="inherit"
                      aria-label="open drawer"
                      edge="start"
                      onClick={handleDrawerToggle}
                      sx={{ mr: 2 }}
                    >
                      <MenuIcon />
                    </IconButton>
                )}
                <Typography 
                  variant="subtitle1" 
                  noWrap 
                  component="div"
                  className="spooky-title"
                  sx={{ 
                    fontFamily: '"Creepster", cursive',
                    textShadow: '3px 3px 6px rgba(0, 0, 0, 0.9), 0 0 25px rgba(220, 20, 60, 0.8)',
                    color: '#dc143c',
                    letterSpacing: '2px',
                    fontSize: { xs: '1.2rem', sm: '1.5rem' }
                  }}
                >
                  👻 Phasmo Filter — v1.000.015 🔮
                </Typography>
                  </Toolbar>
                </AppBar>
            <Box sx={{ display: 'flex', flexGrow: 1, overflow: 'hidden' }}>
              {isMobile ? (
                <>
                <Drawer
                  variant="temporary"
                  anchor="left"
                  open={mobileOpen}
                  onClose={handleDrawerToggle}
                  ModalProps={{
                    keepMounted: true, // Better open performance on mobile
                  }}
                  sx={{
                    display: { xs: 'block', sm: 'none' },
                    '& .MuiDrawer-paper': { 
                      boxSizing: 'border-box', 
                      width: 'auto',
                      minWidth: 280,
                      maxWidth: '85%',
                      backgroundColor: 'background.paper'
                    },
                  }}
                >
                  {drawer}
                </Drawer>
              </>
            ) : (
              <Box
                component="nav"
                sx={{ 
                  width: 320, 
                  flexShrink: 0,
                  borderRight: 1,
                  borderColor: 'divider'
                }}
              >
                {drawer}
              </Box>
            )}

            <Box
              component="main"
              sx={{
                flexGrow: 1,
                  p: { xs: 1, sm: 2 },
                width: { xs: '100%', sm: `calc(100% - 320px)` },
                height: '100%',
                overflow: 'auto'
              }}
            >
                {isMobile && <Toolbar sx={{ minHeight: '48px !important' }} />} {/* Spacer for fixed AppBar */}
              <GhostCards />
              </Box>
            </Box>
          </Box>
        </Router>
      </AppProvider>
    </ThemeProvider>
  )
}

export default App
