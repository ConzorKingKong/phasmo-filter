import React, { useState } from 'react'
import { ThemeProvider, createTheme, useMediaQuery, useTheme, IconButton, Drawer, AppBar, Toolbar, Typography } from '@mui/material'
import { BrowserRouter as Router } from 'react-router-dom'
import CssBaseline from '@mui/material/CssBaseline'
import Box from '@mui/material/Box'
import Layout from './components/layout/Layout'
import { AppProvider } from './context/AppContext'
import './App.css'
import MenuIcon from '@mui/icons-material/Menu'
import FilterListIcon from '@mui/icons-material/FilterList'
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
  }))
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const drawer = (
    <Box sx={{ width: 320, height: '100%' }}>
      <EvidenceFilters />
    </Box>
  )

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppProvider>
        <Router>
          <Box sx={{ display: 'flex', height: '100vh' }}>
            {isMobile ? (
              <>
                <AppBar 
                  position="fixed" 
                  sx={{ 
                    zIndex: (theme) => theme.zIndex.drawer + 1,
                    backgroundColor: 'background.paper',
                    borderBottom: 1,
                    borderColor: 'divider'
                  }}
                >
                  <Toolbar>
                    <IconButton
                      color="inherit"
                      aria-label="open drawer"
                      edge="start"
                      onClick={handleDrawerToggle}
                      sx={{ mr: 2 }}
                    >
                      <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" noWrap component="div">
                      Phasmo Filter
                    </Typography>
                  </Toolbar>
                </AppBar>
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
                p: { xs: 2, sm: 3 },
                width: { xs: '100%', sm: `calc(100% - 320px)` },
                height: '100%',
                overflow: 'auto'
              }}
            >
              {isMobile && <Toolbar />} {/* Spacer for fixed AppBar */}
              <GhostCards />
            </Box>
          </Box>
        </Router>
      </AppProvider>
    </ThemeProvider>
  )
}

export default App
