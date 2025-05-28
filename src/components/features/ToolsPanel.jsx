import { useState, useEffect } from 'react'
import {
  Box,
  Paper,
  Typography,
  Button,
  Slider,
  Grid,
  IconButton,
  Tooltip,
} from '@mui/material'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import StopIcon from '@mui/icons-material/Stop'
import RestartAltIcon from '@mui/icons-material/RestartAlt'
import { useApp } from '../../context/AppContext'

const Timer = ({ label, duration, onStart, onStop, onReset, volume }) => {
  const [time, setTime] = useState(duration)
  const [isRunning, setIsRunning] = useState(false)

  useEffect(() => {
    setTime(duration)
  }, [duration])

  useEffect(() => {
    let interval
    if (isRunning && time > 0) {
      interval = setInterval(() => {
        setTime((prev) => prev - 1)
      }, 1000)
    } else if (time === 0) {
      setIsRunning(false)
      // Play sound if volume > 0
      if (volume > 0) {
        // You can add a sound effect here
      }
    }
    return () => clearInterval(interval)
  }, [isRunning, time, volume])

  const handleStart = () => {
    setIsRunning(true)
    onStart()
  }

  const handleStop = () => {
    setIsRunning(false)
    onStop()
  }

  const handleReset = () => {
    setTime(duration)
    setIsRunning(false)
    onReset()
  }

  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Typography variant="subtitle1" gutterBottom>
        {label}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          {Math.floor(time / 60)}:{(time % 60).toString().padStart(2, '0')}
        </Typography>
        <Box>
          <IconButton onClick={isRunning ? handleStop : handleStart}>
            {isRunning ? <StopIcon /> : <PlayArrowIcon />}
          </IconButton>
          <IconButton onClick={handleReset}>
            <RestartAltIcon />
          </IconButton>
        </Box>
      </Box>
    </Paper>
  )
}

const BPMFinder = () => {
  const [bpm, setBpm] = useState(0)
  const [taps, setTaps] = useState([])

  const handleTap = () => {
    const now = Date.now()
    setTaps((prev) => {
      const newTaps = [...prev, now]
      if (newTaps.length > 4) {
        newTaps.shift()
      }
      return newTaps
    })

    if (taps.length >= 3) {
      const intervals = []
      for (let i = 1; i < taps.length; i++) {
        intervals.push(taps[i] - taps[i - 1])
      }
      const averageInterval = intervals.reduce((a, b) => a + b) / intervals.length
      const newBpm = Math.round(60000 / averageInterval)
      setBpm(newBpm)
    }
  }

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="subtitle1" gutterBottom>
        BPM Finder
      </Typography>
      <Button
        variant="contained"
        fullWidth
        onClick={handleTap}
        sx={{ mb: 2 }}
      >
        Tap ({bpm} BPM)
      </Button>
    </Paper>
  )
}

export default function ToolsPanel() {
  const { settings } = useApp()
  return (
    <Box sx={{ mb: 4 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Timer
            label="Smudge Timer"
            duration={180}
            onStart={() => {}}
            onStop={() => {}}
            onReset={() => {}}
            volume={settings.volume}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <Timer
            label="Hunt Timer"
            duration={settings.ghostSpeed}
            onStart={() => {}}
            onStop={() => {}}
            onReset={() => {}}
            volume={settings.volume}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <BPMFinder />
        </Grid>
      </Grid>
    </Box>
  )
} 