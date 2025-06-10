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
    <Box 
      className={isPlaying ? 'ghost-pulse' : isFinished ? 'active-glow' : ''}
      sx={{ 
        p: 3, 
        border: 2, 
        borderColor: isFinished ? '#00ff41' : isPlaying ? '#dc143c' : 'rgba(220, 20, 60, 0.3)',
        borderRadius: 2,
        background: isFinished ? 
          'linear-gradient(135deg, rgba(0, 255, 65, 0.1) 0%, rgba(26, 10, 10, 0.9) 100%)' :
          isPlaying ?
          'linear-gradient(135deg, rgba(220, 20, 60, 0.1) 0%, rgba(26, 10, 10, 0.9) 100%)' :
          'linear-gradient(135deg, rgba(26, 10, 10, 0.9) 0%, rgba(45, 20, 20, 0.8) 100%)',
        backdropFilter: 'blur(10px)',
        boxShadow: isFinished ? 
          '0 0 30px rgba(0, 255, 65, 0.5), inset 0 0 20px rgba(0, 255, 65, 0.1)' :
          isPlaying ?
          '0 0 25px rgba(220, 20, 60, 0.4), inset 0 0 15px rgba(220, 20, 60, 0.1)' :
          '0 8px 32px rgba(220, 20, 60, 0.15)',
        mb: 2,
        transition: 'all 0.5s ease'
      }}>
      <Typography 
        variant="h5" 
        gutterBottom
        className="ghost-text"
        sx={{
          fontFamily: '"Butcherman", cursive',
          textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8), 0 0 10px rgba(220, 20, 60, 0.5)',
          color: isFinished ? '#00ff41' : '#ffffff',
          textAlign: 'center',
          letterSpacing: '2px'
        }}
      >
        {title}
      </Typography>
      
      <Typography 
        variant="h3" 
        sx={{ 
          fontFamily: '"Courier New", monospace',
          fontWeight: 'bold',
          color: isFinished ? '#00ff41' : isPlaying ? '#dc143c' : '#ffffff',
          textAlign: 'center',
          textShadow: isFinished ? 
            '0 0 20px rgba(0, 255, 65, 0.8)' :
            isPlaying ?
            '0 0 15px rgba(220, 20, 60, 0.8)' :
            '2px 2px 4px rgba(0, 0, 0, 0.8)',
          mb: 3,
          transition: 'all 0.3s ease'
        }}
      >
        {formatTime(timeLeft)}
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, mb: 2, justifyContent: 'center' }}>
        {!isPlaying ? (
          <Button
            variant="contained"
            color="primary"
            onClick={handleStart}
            startIcon={<PlayArrowIcon />}
            disabled={isFinished}
            className="spooky-button"
            sx={{
              fontSize: '1.1rem',
              px: 3,
              py: 1.5,
              background: 'linear-gradient(45deg, #8b0000 30%, #dc143c 90%)',
              '&:hover': {
                background: 'linear-gradient(45deg, #b22222 30%, #ff6347 90%)',
                transform: 'translateY(-2px) scale(1.05)',
              },
              '&:disabled': {
                background: 'rgba(139, 0, 0, 0.3)',
                color: 'rgba(255, 255, 255, 0.5)'
              }
            }}
          >
            Start
          </Button>
        ) : (
          <Button
            variant="contained"
            color="warning"
            onClick={handlePause}
            startIcon={<PauseIcon />}
            className="spooky-button"
            sx={{
              fontSize: '1.1rem',
              px: 3,
              py: 1.5,
              background: 'linear-gradient(45deg, #b22222 30%, #dc143c 90%)',
              '&:hover': {
                background: 'linear-gradient(45deg, #ff4500 30%, #ff6347 90%)',
                transform: 'translateY(-2px) scale(1.05)',
              }
            }}
          >
            Pause
          </Button>
        )}
        
        <Button
          variant="outlined"
          color="secondary"
          onClick={handleStop}
          startIcon={<StopIcon />}
          className="spooky-button"
          sx={{
            fontSize: '1.1rem',
            px: 3,
            py: 1.5,
            border: '2px solid #dc143c',
            color: '#dc143c',
            '&:hover': {
              border: '2px solid #ff6347',
              color: '#ff6347',
              background: 'rgba(220, 20, 60, 0.1)',
              transform: 'translateY(-2px) scale(1.05)',
            }
          }}
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