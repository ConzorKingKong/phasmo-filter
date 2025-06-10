import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Box, Typography, Button } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import StopIcon from '@mui/icons-material/Stop';

const Timer = ({ 
  initialTime, 
  title, 
  description, 
  onStart, 
  onStop, 
  onReset,
  formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(initialTime);
  
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);
  const elapsedTimeRef = useRef(0);
  const startSoundRef = useRef(new Audio('/sounds/start.mp3'));
  const stopSoundRef = useRef(new Audio('/sounds/stop.mp3'));

  // Handle visibility change for tab switching
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        if (isPlaying && startTimeRef.current) {
          const currentElapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
          const totalElapsed = elapsedTimeRef.current + currentElapsed;
          const newTimeLeft = Math.max(0, initialTime - totalElapsed);
          setTimeLeft(newTimeLeft);
          if (newTimeLeft === 0) {
            setIsPlaying(false);
            startTimeRef.current = null;
          }
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isPlaying, initialTime]);

  // Start/stop timer
  const toggleTimer = () => {
    if (isPlaying) {
      // Pausing: accumulate elapsed time
      clearInterval(timerRef.current);
      if (startTimeRef.current) {
        elapsedTimeRef.current += Math.floor((Date.now() - startTimeRef.current) / 1000);
      }
      stopSoundRef.current.currentTime = 0;
      stopSoundRef.current.play();
      startTimeRef.current = null;
      onStop?.();
    } else {
      // Starting/Resuming: set new start time
      startSoundRef.current.currentTime = 0;
      startSoundRef.current.play();
      startTimeRef.current = Date.now();
      timerRef.current = setInterval(() => {
        const currentElapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        const totalElapsed = elapsedTimeRef.current + currentElapsed;
        const newTimeLeft = Math.max(0, initialTime - totalElapsed);
        setTimeLeft(newTimeLeft);
        if (newTimeLeft === 0) {
          clearInterval(timerRef.current);
          setIsPlaying(false);
          startTimeRef.current = null;
        }
      }, 100);
      onStart?.();
    }
    setIsPlaying(!isPlaying);
  };

  // Reset timer
  const resetTimer = () => {
    clearInterval(timerRef.current);
    setIsPlaying(false);
    setTimeLeft(initialTime);
    startTimeRef.current = null;
    elapsedTimeRef.current = 0;
    stopSoundRef.current.currentTime = 0;
    stopSoundRef.current.play();
    onReset?.();
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearInterval(timerRef.current);
    };
  }, []);

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="subtitle1" gutterBottom>
        {title}
      </Typography>
      {description && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {description}
        </Typography>
      )}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
        <Typography variant="h4" component="div" sx={{ fontFamily: 'monospace' }}>
          {formatTime(timeLeft)}
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Button
          variant="contained"
          onClick={toggleTimer}
          startIcon={isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
        >
          {isPlaying ? 'Pause' : 'Start'}
        </Button>
        <Button
          variant="outlined"
          onClick={resetTimer}
          startIcon={<StopIcon />}
        >
          Reset
        </Button>
      </Box>
    </Box>
  );
};

export default Timer;