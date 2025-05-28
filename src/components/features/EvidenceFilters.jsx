import React, { useRef, useState } from 'react';
import { Box, Typography, Checkbox, FormControlLabel, Divider, TextField, InputAdornment, IconButton, Tabs, Tab, Button } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import StopIcon from '@mui/icons-material/Stop';
import CloseIcon from '@mui/icons-material/Close';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import { useApp } from '../../context/AppContext';

const EvidenceFilters = () => {
  const { 
    selectedEvidence, 
    setSelectedEvidence,
    selectedSpeed,
    setSelectedSpeed,
    selectedHuntEvidence,
    setSelectedHuntEvidence,
    searchQuery,
    setSearchQuery,
    ghosts
  } = useApp();

  const [activeTab, setActiveTab] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(180); // 3 minutes in seconds
  const [isHuntCooldownPlaying, setIsHuntCooldownPlaying] = useState(false);
  const [huntCooldownTimeLeft, setHuntCooldownTimeLeft] = useState(25); // 25 seconds
  const [huntEvidenceSearch, setHuntEvidenceSearch] = useState('');
  const timerRef = useRef(null);
  const huntCooldownTimerRef = useRef(null);
  const startSoundRef = useRef(new Audio('/sounds/start.mp3'));
  const stopSoundRef = useRef(new Audio('/sounds/stop.mp3'));

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleTimer = () => {
    if (isPlaying) {
      clearInterval(timerRef.current);
      stopSoundRef.current.currentTime = 0;
      stopSoundRef.current.play();
    } else {
      startSoundRef.current.currentTime = 0;
      startSoundRef.current.play();
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setIsPlaying(false);
            return 180;
          }
          return prev - 1;
        });
      }, 1000);
    }
    setIsPlaying(!isPlaying);
  };

  const resetTimer = () => {
    clearInterval(timerRef.current);
    setIsPlaying(false);
    setTimeLeft(180);
    stopSoundRef.current.currentTime = 0;
    stopSoundRef.current.play();
  };

  const toggleHuntCooldownTimer = () => {
    if (isHuntCooldownPlaying) {
      clearInterval(huntCooldownTimerRef.current);
      stopSoundRef.current.currentTime = 0;
      stopSoundRef.current.play();
    } else {
      startSoundRef.current.currentTime = 0;
      startSoundRef.current.play();
      huntCooldownTimerRef.current = setInterval(() => {
        setHuntCooldownTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(huntCooldownTimerRef.current);
            setIsHuntCooldownPlaying(false);
            return 25;
          }
          return prev - 1;
        });
      }, 1000);
    }
    setIsHuntCooldownPlaying(!isHuntCooldownPlaying);
  };

  const resetHuntCooldownTimer = () => {
    clearInterval(huntCooldownTimerRef.current);
    setIsHuntCooldownPlaying(false);
    setHuntCooldownTimeLeft(25);
    stopSoundRef.current.currentTime = 0;
    stopSoundRef.current.play();
  };

  const audioRef = useRef(new Audio('/sounds/banshee_scream.mp3'));

  const handleEvidenceClick = (evidence) => {
    setSelectedEvidence(prev => {
      const currentState = prev[evidence];
      // Cycle through states: undefined (neutral) -> true (included) -> false (excluded) -> undefined (neutral)
      const newState = currentState === undefined ? true : 
                      currentState === true ? false : 
                      undefined;
      return { ...prev, [evidence]: newState };
    });
  };

  const handleSpeedClick = (speedType) => {
    setSelectedSpeed(prev => {
      const currentState = prev[speedType];
      // Cycle through states: undefined (neutral) -> true (included) -> false (excluded) -> undefined (neutral)
      const newState = currentState === undefined ? true : 
                      currentState === true ? false : 
                      undefined;
      return { ...prev, [speedType]: newState };
    });
  };

  const handleHuntEvidenceClick = (evidence) => {
    setSelectedHuntEvidence(prev => {
      const currentState = prev[evidence];
      // Cycle through states: undefined (neutral) -> true (included) -> false (excluded) -> undefined (neutral)
      const newState = currentState === undefined ? true : 
                      currentState === true ? false : 
                      undefined;
      return { ...prev, [evidence]: newState };
    });
  };

  const getEvidenceLabel = (evidence) => {
    const labels = {
      'EMF 5': 'EMF Level 5',
      'Spirit Box': 'Spirit Box',
      'Ultraviolet': 'Ultraviolet',
      'Ghost Orbs': 'Ghost Orb',
      'Writing': 'Ghost Writing',
      'Freezing': 'Freezing Temperatures',
      'DOTs': 'D.O.T.S Projector'
    };
    return labels[evidence] || evidence;
  };

  const getEvidenceState = (evidence) => {
    const state = selectedEvidence[evidence];
    if (state === undefined) return 'neutral';
    if (state === false) return 'excluded';
    return 'included';
  };

  const getSpeedState = (speedType) => {
    const state = selectedSpeed[speedType];
    if (state === undefined) return 'neutral';
    if (state === false) return 'excluded';
    return 'included';
  };

  const getHuntEvidenceState = (evidence) => {
    const state = selectedHuntEvidence[evidence];
    if (state === undefined) return 'neutral';
    if (state === false) return 'excluded';
    return 'included';
  };

  const isGhostFilteredOut = (ghostName) => {
    return !ghosts.some(ghost => {
      if (ghost.ghost !== ghostName) return false;

      // Check evidence filters
      const evidenceMatch = Object.entries(selectedEvidence).every(([evidence, state]) => {
        if (state === undefined) return true;
        if (state === true) return ghost.evidence.includes(evidence);
        if (state === false) return !ghost.evidence.includes(evidence);
        return true;
      });

      // Check speed filters
      const speedMatch = Object.entries(selectedSpeed).every(([speedType, state]) => {
        if (state === undefined) return true;
        
        const minSpeed = parseFloat(ghost.min_speed);
        const maxSpeed = parseFloat(ghost.max_speed);
        const altSpeed = parseFloat(ghost.alt_speed);
        const normalSpeed = 1.7;
        
        const speeds = [];
        if (!isNaN(minSpeed)) speeds.push(minSpeed);
        if (!isNaN(maxSpeed)) speeds.push(maxSpeed);
        if (!isNaN(altSpeed)) speeds.push(altSpeed);
        
        if (speeds.length === 0) return true;
        
        switch (speedType) {
          case 'slow':
            if (state === true) return speeds.some(speed => speed < normalSpeed);
            if (state === false) return speeds.every(speed => speed >= normalSpeed);
            break;
          case 'normal':
            if (state === true) return speeds.every(speed => speed === normalSpeed);
            if (state === false) return speeds.some(speed => speed !== normalSpeed);
            break;
          case 'fast':
            if (state === true) return speeds.some(speed => speed > normalSpeed);
            if (state === false) return speeds.every(speed => speed <= normalSpeed);
            break;
          case 'los':
            if (state === true) return ghost.has_los === true;
            if (state === false) return ghost.has_los === false;
            break;
        }
        return true;
      });

      return evidenceMatch && speedMatch;
    });
  };

  const playBansheeScream = (e) => {
    e.stopPropagation(); // Prevent the checkbox from being clicked
    audioRef.current.currentTime = 0;
    audioRef.current.play();
  };

  const huntEvidenceList = [
    { id: 'hunts_after_smudge_1', label: 'Hunts 1 minute after smudge', ghost: 'Demon' },
    { id: 'hunts_after_smudge_3', label: 'Hunts 3 minutes after smudge', ghost: 'Spirit' },
    { id: 'no_salt', label: 'Doesn\'t walk through salt', ghost: 'Wraith' },
    { id: 'throws_far', label: 'Objects thrown far and often', ghost: 'Poltergeist' },
    { id: 'disappears_photo', label: 'Disappears when photographed', ghost: 'Phantom' },
    { id: 'less_visible_hunt', label: 'Less visible during hunts', ghost: 'Phantom' },
    { id: 'more_visible_hunt', label: 'More visible during hunts', ghost: 'Oni' },
    { id: 'breath_breaker_off', label: 'Can see ghosts breath when breaker is off', ghost: 'Hantu' },
    { id: 'poor_detection', label: 'Doesn\'t detect players easily', ghost: 'Yokai' },
    { id: 'fast_near_electronics', label: 'Fast near electronic equipment', ghost: 'Raiju' },
    { id: 'silent_footsteps', label: 'Footsteps silent until close', ghost: 'Myling' },
    { id: 'alternating_speed', label: 'Alternates between slightly slower and slightly faster', ghost: 'The Twins' },
    { id: 'changes_model', label: 'Changes model mid hunt', ghost: 'Obake' },
    { id: 'slows_on_meds', label: 'Slows down taking sanity meds mid haunt', ghost: 'Moroi' },
    { id: 'fast_far_slow_close', label: 'Fast from far, slow when close', ghost: 'Deogen' },
    { id: 'cant_turn_lights', label: 'Can\'t turn lights on', ghost: 'Mare' },
    { id: 'screams_parabolic', label: 'Screams in parabolic mic', ghost: 'Banshee' },
    { id: 'hunt_speed_decreases', label: 'Hunts faster than normal, slows down with time', ghost: 'Thaye' },
    { id: 'double_slam', label: 'Double slam doors', ghost: 'Yurei' },
    { id: 'never_changes_rooms', label: 'Never changes rooms', ghost: 'Goryo' },
    { id: 'hunts_after_candles', label: 'Hunts after blowing out 3 candles', ghost: 'Onryo' },
    { id: 'no_hunt_in_room', label: 'Won\'t hunt while you\'re in the room', ghost: 'Shade' },
    { id: 'speed_with_breaker', label: 'Fast w fuse box off/slow w on', ghost: 'Jinn' },
    { id: 'speed_when_hiding', label: 'Slow when hiding, fast when it sees you', ghost: 'Revenant' }
  ];

  const isEvidenceInSearchResults = (evidence) => {
    if (!searchQuery) return false;
    return ghosts.some(ghost => 
      ghost.ghost.toLowerCase().includes(searchQuery.toLowerCase()) && 
      ghost.evidence.includes(evidence)
    );
  };

  const isSpeedInSearchResults = (speedType) => {
    if (!searchQuery) return false;
    return ghosts.some(ghost => {
      if (!ghost.ghost.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      
      const minSpeed = parseFloat(ghost.min_speed);
      const maxSpeed = parseFloat(ghost.max_speed);
      const altSpeed = parseFloat(ghost.alt_speed);
      const normalSpeed = 1.7;
      
      const speeds = [];
      if (!isNaN(minSpeed)) speeds.push(minSpeed);
      if (!isNaN(maxSpeed)) speeds.push(maxSpeed);
      if (!isNaN(altSpeed)) speeds.push(altSpeed);
      
      if (speeds.length === 0) return false;
      
      switch (speedType) {
        case 'slow':
          return speeds.some(speed => speed < normalSpeed);
        case 'normal':
          return speeds.every(speed => speed === normalSpeed);
        case 'fast':
          return speeds.some(speed => speed > normalSpeed);
        case 'los':
          return ghost.has_los === true;
      }
      return false;
    });
  };

  const isHuntEvidenceInSearchResults = (evidence) => {
    if (!searchQuery) return false;
    const ghostName = huntEvidenceList.find(e => e.id === evidence)?.ghost;
    return ghosts.some(ghost => 
      ghost.ghost.toLowerCase().includes(searchQuery.toLowerCase()) && 
      ghost.ghost === ghostName
    );
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Tabs 
        value={activeTab} 
        onChange={handleTabChange}
        sx={{ borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab label="Filters" />
        <Tab label="Tools" />
      </Tabs>

      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        {activeTab === 0 ? (
          <Box sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                Evidence Filters
              </Typography>
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => {
                  // Reset all evidence states
                  const resetEvidence = Object.keys(selectedEvidence).reduce((acc, key) => {
                    acc[key] = undefined;
                    return acc;
                  }, {});
                  setSelectedEvidence(resetEvidence);

                  // Reset all speed states
                  const resetSpeed = Object.keys(selectedSpeed).reduce((acc, key) => {
                    acc[key] = undefined;
                    return acc;
                  }, {});
                  setSelectedSpeed(resetSpeed);

                  // Reset all hunt evidence states
                  const resetHuntEvidence = Object.keys(selectedHuntEvidence).reduce((acc, key) => {
                    acc[key] = undefined;
                    return acc;
                  }, {});
                  setSelectedHuntEvidence(resetHuntEvidence);

                  // Clear search
                  setSearchQuery('');
                }}
                startIcon={<RestartAltIcon />}
              >
                Reset All
              </Button>
            </Box>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search ghosts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: searchQuery && (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setSearchQuery('')}
                      edge="end"
                      size="small"
                    >
                      <CloseIcon />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />

            <Typography variant="h6" gutterBottom>
              Evidence
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
              {[
                'EMF 5',
                'Spirit Box',
                'Ultraviolet',
                'Ghost Orbs',
                'Writing',
                'Freezing',
                'DOTs'
              ].map((evidence) => (
                <FormControlLabel
                  key={evidence}
                  control={
                    <Checkbox
                      checked={selectedEvidence[evidence] === true}
                      indeterminate={selectedEvidence[evidence] === false}
                      onChange={() => handleEvidenceClick(evidence)}
                      sx={{
                        '&.MuiCheckbox-root': {
                          color: 'text.secondary',
                        },
                        '&.Mui-checked': {
                          color: 'success.main',
                        },
                        '&.MuiCheckbox-indeterminate': {
                          color: 'error.main',
                        }
                      }}
                    />
                  }
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {getEvidenceLabel(evidence)}
                      {isEvidenceInSearchResults(evidence) && (
                        <FilterAltIcon 
                          sx={{ 
                            ml: 1, 
                            fontSize: '1rem',
                            color: 'primary.main',
                            opacity: 0.7
                          }} 
                        />
                      )}
                    </Box>
                  }
                  sx={{
                    '& .MuiFormControlLabel-label': {
                      color: getEvidenceState(evidence) === 'excluded' ? 'error.main' :
                             getEvidenceState(evidence) === 'included' ? 'success.main' :
                             'text.primary'
                    }
                  }}
                />
              ))}
            </Box>

            <Divider sx={{ my: 2 }} />

            <Typography variant="h6" gutterBottom>
              Speed
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
              {[
                { id: 'slow', label: 'Slow (< 1.7 m/s)' },
                { id: 'normal', label: 'Normal (1.7 m/s)' },
                { id: 'fast', label: 'Fast (> 1.7 m/s)' },
                { id: 'los', label: 'LOS Speed Up' }
              ].map((speed) => (
                <FormControlLabel
                  key={speed.id}
                  control={
                    <Checkbox
                      checked={selectedSpeed[speed.id] === true}
                      indeterminate={selectedSpeed[speed.id] === false}
                      onChange={() => handleSpeedClick(speed.id)}
                      sx={{
                        '&.MuiCheckbox-root': {
                          color: 'text.secondary',
                        },
                        '&.Mui-checked': {
                          color: 'success.main',
                        },
                        '&.MuiCheckbox-indeterminate': {
                          color: 'error.main',
                        }
                      }}
                    />
                  }
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {speed.label}
                      {isSpeedInSearchResults(speed.id) && (
                        <FilterAltIcon 
                          sx={{ 
                            ml: 1, 
                            fontSize: '1rem',
                            color: 'primary.main',
                            opacity: 0.7
                          }} 
                        />
                      )}
                    </Box>
                  }
                  sx={{
                    '& .MuiFormControlLabel-label': {
                      color: getSpeedState(speed.id) === 'excluded' ? 'error.main' :
                             getSpeedState(speed.id) === 'included' ? 'success.main' :
                             'text.primary'
                    }
                  }}
                />
              ))}
            </Box>

            <Divider sx={{ my: 2 }} />

            <Typography variant="h6" gutterBottom>
              Hunt Evidence
            </Typography>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search hunt evidence..."
              value={huntEvidenceSearch}
              onChange={(e) => setHuntEvidenceSearch(e.target.value)}
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: huntEvidenceSearch && (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setHuntEvidenceSearch('')}
                      edge="end"
                      size="small"
                    >
                      <CloseIcon />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {huntEvidenceList
                .slice()
                .sort((a, b) => {
                  // First sort by filtered status
                  const aFiltered = isGhostFilteredOut(a.ghost);
                  const bFiltered = isGhostFilteredOut(b.ghost);
                  if (aFiltered !== bFiltered) {
                    return aFiltered ? 1 : -1;
                  }

                  // Then sort by search match
                  const aMatchesSearch = huntEvidenceSearch && 
                    a.label.toLowerCase().includes(huntEvidenceSearch.toLowerCase());
                  const bMatchesSearch = huntEvidenceSearch && 
                    b.label.toLowerCase().includes(huntEvidenceSearch.toLowerCase());
                  if (aMatchesSearch !== bMatchesSearch) {
                    return aMatchesSearch ? -1 : 1;
                  }

                  // Finally sort by original order
                  return 0;
                })
                .map((evidence) => {
                  const isFiltered = isGhostFilteredOut(evidence.ghost);
                  const matchesSearch = huntEvidenceSearch && 
                    evidence.label.toLowerCase().includes(huntEvidenceSearch.toLowerCase());
                  return (
                    <FormControlLabel
                      key={evidence.id}
                      control={
                        <Checkbox
                          checked={selectedHuntEvidence[evidence.id] === true}
                          indeterminate={selectedHuntEvidence[evidence.id] === false}
                          onChange={() => handleHuntEvidenceClick(evidence.id)}
                          sx={{
                            '&.MuiCheckbox-root': {
                              color: isFiltered ? 'text.disabled' : 'text.secondary',
                            },
                            '&.Mui-checked': {
                              color: isFiltered ? 'text.disabled' : 'success.main',
                            },
                            '&.MuiCheckbox-indeterminate': {
                              color: isFiltered ? 'text.disabled' : 'error.main',
                            }
                          }}
                        />
                      }
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {evidence.label}
                          {isHuntEvidenceInSearchResults(evidence.id) && (
                            <FilterAltIcon 
                              sx={{ 
                                ml: 1, 
                                fontSize: '1rem',
                                color: 'primary.main',
                                opacity: 0.7
                              }} 
                            />
                          )}
                          {matchesSearch && (
                            <SearchIcon 
                              sx={{ 
                                ml: 1, 
                                fontSize: '1rem',
                                color: 'primary.main',
                                opacity: 0.7
                              }} 
                            />
                          )}
                          {evidence.id === 'screams_parabolic' && (
                            <IconButton
                              onClick={playBansheeScream}
                              size="small"
                              sx={{
                                ml: 1,
                                color: isFiltered ? 'text.disabled' : 'white',
                                '&:hover': {
                                  color: isFiltered ? 'text.disabled' : 'primary.main'
                                }
                              }}
                            >
                              <VolumeUpIcon fontSize="small" />
                            </IconButton>
                          )}
                        </Box>
                      }
                      sx={{
                        '& .MuiFormControlLabel-label': {
                          color: isFiltered ? 'text.disabled' :
                                 getHuntEvidenceState(evidence.id) === 'excluded' ? 'error.main' :
                                 getHuntEvidenceState(evidence.id) === 'included' ? 'success.main' :
                                 'text.primary'
                        }
                      }}
                    />
                  );
                })}
            </Box>
          </Box>
        ) : (
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Timers
            </Typography>
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Smudge Timer
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Demon - 1 minute<br />
                Spirit - 3 minutes<br />
                All other ghosts - 1 minute 30 seconds
              </Typography>
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

            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Hunt Cooldown
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Demon - 20 seconds<br />
                All other ghosts - 25 seconds
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                <Typography variant="h4" component="div" sx={{ fontFamily: 'monospace' }}>
                  {formatTime(huntCooldownTimeLeft)}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="contained"
                  onClick={toggleHuntCooldownTimer}
                  startIcon={isHuntCooldownPlaying ? <PauseIcon /> : <PlayArrowIcon />}
                >
                  {isHuntCooldownPlaying ? 'Pause' : 'Start'}
                </Button>
                <Button
                  variant="outlined"
                  onClick={resetHuntCooldownTimer}
                  startIcon={<StopIcon />}
                >
                  Reset
                </Button>
              </Box>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default EvidenceFilters; 