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
        main: '#1976d2',
      },
      secondary: {
        main: '#dc004e',
      },
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
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            '& .MuiTypography-h6': {
              fontSize: '1.5rem',
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
              '@media (max-width:600px)': {
                fontSize: '0.9rem',
              },
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
                <Typography variant="subtitle1" noWrap component="div">
                  Phasmo Filter — Supports v1.000.015
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
