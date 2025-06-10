import React, { useRef, useCallback } from 'react';
import { Box, Typography, Button } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import StopIcon from '@mui/icons-material/Stop';

const WorkerTimer = ({ 
  timerId,
  timerState,
  setTimerState,
  timerWorker,
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
  const startSoundRef = useRef(new Audio('/sounds/start.mp3'));
  const stopSoundRef = useRef(new Audio('/sounds/stop.mp3'));

  const { isPlaying, timeLeft, elapsedTime } = timerState;

  const handleStart = useCallback(() => {
    if (timeLeft > 0) {
      setTimerState(prev => ({ ...prev, isPlaying: true }));
      timerWorker.startTimer(timerId, initialTime, elapsedTime);
      startSoundRef.current.play().catch(() => {});
      if (onStart) onStart();
    }
  }, [timeLeft, elapsedTime, timerId, timerWorker, initialTime, onStart, setTimerState]);

  const handlePause = useCallback(() => {
    if (isPlaying) {
      timerWorker.pauseTimer(timerId);
    }
  }, [isPlaying, timerId, timerWorker]);

  const handleStop = useCallback(() => {
    timerWorker.resetTimer(timerId, initialTime);
    stopSoundRef.current.play().catch(() => {});
    if (onReset) onReset();
  }, [timerId, timerWorker, initialTime, onReset]);

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

export default WorkerTimer;