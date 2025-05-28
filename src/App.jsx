import { useState } from 'react'
import { ThemeProvider, createTheme } from '@mui/material'
import { BrowserRouter as Router } from 'react-router-dom'
import CssBaseline from '@mui/material/CssBaseline'
import Box from '@mui/material/Box'
import Layout from './components/layout/Layout'
import { AppProvider } from './context/AppContext'
import './App.css'

function App() {
  const [theme, setTheme] = useState(createTheme({
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

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppProvider>
        <Router>
          <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Layout />
          </Box>
        </Router>
      </AppProvider>
    </ThemeProvider>
  )
}

export default App
