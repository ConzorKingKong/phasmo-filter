import React, { useRef, useEffect, useCallback } from 'react';
import { Box, Typography, Button } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import StopIcon from '@mui/icons-material/Stop';

const PersistentTimer = ({ 
  timerState,
  setTimerState,
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
  const timerRef = useRef(null);
  const startSoundRef = useRef(new Audio('/sounds/start.mp3'));
  const stopSoundRef = useRef(new Audio('/sounds/stop.mp3'));

  const { isPlaying, timeLeft, startTime, elapsedTime } = timerState;

  // Update timer every second when playing
  useEffect(() => {
    if (isPlaying && startTime) {
      timerRef.current = setInterval(() => {
        const currentElapsed = Math.floor((Date.now() - startTime) / 1000);
        const totalElapsed = elapsedTime + currentElapsed;
        const newTimeLeft = Math.max(0, initialTime - totalElapsed);
        
        setTimerState(prev => ({
          ...prev,
          timeLeft: newTimeLeft
        }));
        
        if (newTimeLeft === 0) {
          setTimerState(prev => ({
            ...prev,
            isPlaying: false,
            startTime: null
          }));
          stopSoundRef.current.play().catch(() => {});
          if (onStop) onStop();
        }
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isPlaying, startTime, elapsedTime, initialTime, setTimerState, onStop]);

  // Handle visibility change for tab switching
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isPlaying && startTime) {
        const currentElapsed = Math.floor((Date.now() - startTime) / 1000);
        const totalElapsed = elapsedTime + currentElapsed;
        const newTimeLeft = Math.max(0, initialTime - totalElapsed);
        
        setTimerState(prev => ({
          ...prev,
          timeLeft: newTimeLeft
        }));
        
        if (newTimeLeft === 0) {
          setTimerState(prev => ({
            ...prev,
            isPlaying: false,
            startTime: null
          }));
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isPlaying, startTime, elapsedTime, initialTime, setTimerState]);

  const handleStart = useCallback(() => {
    if (timeLeft > 0) {
      const now = Date.now();
      setTimerState(prev => ({
        ...prev,
        isPlaying: true,
        startTime: now
      }));
      startSoundRef.current.play().catch(() => {});
      if (onStart) onStart();
    }
  }, [timeLeft, setTimerState, onStart]);

  const handlePause = useCallback(() => {
    if (isPlaying && startTime) {
      const currentElapsed = Math.floor((Date.now() - startTime) / 1000);
      setTimerState(prev => ({
        ...prev,
        isPlaying: false,
        startTime: null,
        elapsedTime: prev.elapsedTime + currentElapsed
      }));
    }
  }, [isPlaying, startTime, setTimerState]);

  const handleStop = useCallback(() => {
    setTimerState({
      isPlaying: false,
      timeLeft: initialTime,
      startTime: null,
      elapsedTime: 0
    });
    stopSoundRef.current.play().catch(() => {});
    if (onReset) onReset();
  }, [initialTime, setTimerState, onReset]);

  const isFinished = timeLeft === 0;

  return (
    <Box sx={{ 
      p: 2, 
      border: 1, 
      borderColor: isFinished ? 'success.main' : 'divider',
      borderRadius: 1,
      bgcolor: isFinished ? 'success.dark' : 'background.paper',
      mb: 2
    }}>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      
      <Typography 
        variant="h4" 
        sx={{ 
          fontFamily: 'monospace',
          color: isFinished ? 'success.main' : isPlaying ? 'primary.main' : 'text.primary',
          mb: 2
        }}
      >
        {formatTime(timeLeft)}
      </Typography>

      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        {!isPlaying ? (
          <Button
            variant="contained"
            color="primary"
            onClick={handleStart}
            startIcon={<PlayArrowIcon />}
            disabled={isFinished}
          >
            Start
          </Button>
        ) : (
          <Button
            variant="contained"
            color="warning"
            onClick={handlePause}
            startIcon={<PauseIcon />}
          >
            Pause
          </Button>
        )}
        
        <Button
          variant="outlined"
          color="secondary"
          onClick={handleStop}
          startIcon={<StopIcon />}
        >
          Reset
        </Button>
      </Box>

      {description && (
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      )}
    </Box>
  );
};

export default PersistentTimer;