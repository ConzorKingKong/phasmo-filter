import React from 'react'
import { Box, AppBar, Toolbar, Typography, Paper } from '@mui/material'
import { useApp } from '../../context/AppContext'
import EvidenceFilters from '../features/EvidenceFilters'
import GhostCards from '../features/GhostCards'

const Layout = () => {
  const { language } = useApp()

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%' }}>
      <AppBar position="static">
        <Toolbar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" component="div">
              Phasmo Filter - valid for version 1.0
          </Typography>
          </Box>
        </Toolbar>
      </AppBar>

      <Box sx={{ display: 'flex', flexGrow: 1, width: '100%' }}>
          <Paper sx={{ width: 300, flexShrink: 0 }}>
            <EvidenceFilters />
          </Paper>
        <Box sx={{ flexGrow: 1, p: 2, width: 'calc(100% - 300px)' }}>
            <GhostCards />
          </Box>
        </Box>
    </Box>
  )
}

export default Layout 