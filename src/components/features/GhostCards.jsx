import React, { useRef, useState } from 'react';
import { Box, Card, CardContent, Typography, Chip, Grid, Divider, IconButton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import DeleteIcon from '@mui/icons-material/Delete';
import { useApp } from '../../context/AppContext';

const GhostCards = () => {
  const { 
    ghosts, 
    selectedEvidence, 
    selectedSpeed,
    selectedHuntEvidence,
    setSelectedHuntEvidence,
    searchQuery,
    showDescriptions,
    excludedGhosts,
    setExcludedGhosts
  } = useApp();

  const audioRef = useRef(new Audio('/sounds/banshee_scream.mp3'));

  // Create a map of ghost names to their original indices
  const originalOrder = React.useMemo(() => {
    return ghosts.reduce((acc, ghost, index) => {
      acc[ghost.ghost] = index;
      return acc;
    }, {});
  }, [ghosts]);

  const playBansheeScream = () => {
    audioRef.current.currentTime = 0;
    audioRef.current.play();
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

  const huntEvidenceMap = {
    'hunts_after_smudge_1': ['Demon'],
    'hunts_after_smudge_3': ['Spirit'],
    'no_salt': ['Wraith'],
    'throws_far': ['Poltergeist'],
    'throws_multiple': ['Poltergeist'],
    'disappears_photo': ['Phantom'],
    'less_visible_hunt': ['Phantom'],
    'more_visible_hunt': ['Oni'],
    'no_ghost_mist': ['Oni'],
    'breath_breaker_off': ['Hantu'],
    'never_turns_on_breaker': ['Hantu'],
    'faster_cold_rooms': ['Hantu'],
    'poor_detection': ['Yokai'],
    'fast_near_electronics': ['Raiju'],
    'larger_equipment_range': ['Raiju'],
    'silent_footsteps': ['Myling'],
    'alternating_speed': ['The Twins'],
    'changes_model': ['Obake'],
    'slows_on_meds': ['Moroi'],
    'fast_far_slow_close': ['Deogen'],
    'cant_turn_lights': ['Mare'],
    'turns_off_lights': ['Mare'],
    'prefers_light_events': ['Mare'],
    'wanders_to_dark': ['Mare'],
    'screams_parabolic': ['Banshee'],
    'hunt_speed_decreases': ['Thaye'],
    'double_slam': ['Yurei'],
    'interacts_main_door': ['Yurei'],
    'never_changes_rooms': ['Goryo', 'Banshee'],
    'hunts_after_candles': ['Onryo'],
    'cant_light_fire': ['Onryo'],
    'no_hunt_in_room': ['Shade'],
    'speed_with_breaker': ['Jinn'],
    'never_turns_off_breaker': ['Jinn'],
    'hunts_20s': ['Demon'],
    'speed_when_hiding': ['Revenant']
  };

  const checkFilters = (ghost) => {
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

    // Check hunt evidence filters
    const huntEvidenceMatch = Object.entries(selectedHuntEvidence).every(([evidence, state]) => {
      if (state === undefined) return true;
      const ghostNames = huntEvidenceMap[evidence];
      if (!ghostNames) return true;
      if (state === true) return ghostNames.includes(ghost.ghost);
      if (state === false) return !ghostNames.includes(ghost.ghost);
      return true;
    });

    return evidenceMatch && speedMatch && huntEvidenceMatch;
  };

  const handleTrashClick = (ghost) => {
    // Add ghost to excluded set
    setExcludedGhosts(prev => {
      const newExcluded = new Set([...prev, ghost.ghost]);
      
      // Find all evidence associated with this ghost
      const ghostEvidence = Object.entries(huntEvidenceMap)
        .filter(([_, ghostNames]) => ghostNames.includes(ghost.ghost))
        .map(([evidenceId]) => evidenceId);

      // Set evidence to excluded (false) if either:
      // 1. It's exclusively associated with this ghost, or
      // 2. All other ghosts associated with this evidence are in the excluded set
      setSelectedHuntEvidence(prevEvidence => {
        const newState = { ...prevEvidence };
        ghostEvidence.forEach(evidenceId => {
          const associatedGhosts = huntEvidenceMap[evidenceId];
          const isExclusive = associatedGhosts.length === 1;
          const allGhostsExcluded = associatedGhosts.every(g => newExcluded.has(g));

          if (isExclusive || allGhostsExcluded) {
            newState[evidenceId] = false;
          }
        });
        return newState;
      });

      return newExcluded;
    });
  };

  const filteredGhosts = ghosts.filter(ghost => {
    // Don't show excluded ghosts
    if (excludedGhosts.has(ghost.ghost)) {
      return false;
    }

    // If there's a search query, show matching ghosts regardless of filters
    if (searchQuery && ghost.ghost.toLowerCase().includes(searchQuery.toLowerCase())) {
      return true;
    }

    // Otherwise, only show ghosts that match all filters
    return checkFilters(ghost);
  }).sort((a, b) => {
    // If there's a search query, prioritize search matches
    if (searchQuery) {
      const aIsSearchMatch = a.ghost.toLowerCase().includes(searchQuery.toLowerCase());
      const bIsSearchMatch = b.ghost.toLowerCase().includes(searchQuery.toLowerCase());
      if (aIsSearchMatch && !bIsSearchMatch) return -1;
      if (!aIsSearchMatch && bIsSearchMatch) return 1;
    }
    return 0;
  });

  if (filteredGhosts.length === 0) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          No ghosts match the selected filters. Was the ghost manually removed? *MAY BE MIMIC UNTIL FILTER LOGIC IS IMPROVED TO SUPPORT IT*
        </Typography>
      </Box>
    );
  }

  return (
    <Grid 
      container 
      spacing={2} 
      sx={{ 
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(3, 1fr)'
        },
        gap: 2
      }}
    >
      {filteredGhosts.map((ghost) => {
        const isSearchMatch = searchQuery && ghost.ghost.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilters = checkFilters(ghost);
        
        return (
          <Grid item key={ghost.ghost}>
            <Card 
              sx={{ 
                height: '100%',
                position: 'relative',
                border: isSearchMatch ? '2px solid white' : 'none',
                boxShadow: isSearchMatch ? '0 0 10px rgba(255, 255, 255, 0.5)' : 'none'
              }}
            >
              <IconButton
                onClick={() => handleTrashClick(ghost)}
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  color: 'error.main',
                  '&:hover': {
                    color: 'error.dark'
                  }
                }}
              >
                <DeleteIcon />
              </IconButton>
              {isSearchMatch && (
                <SearchIcon 
                  sx={{ 
                    position: 'absolute',
                    top: 8,
                    right: 48,
                    color: 'white',
                    opacity: 0.7
                  }} 
                />
              )}
              {isSearchMatch && !matchesFilters && (
                <CloseIcon 
                  sx={{ 
                    position: 'absolute',
                    bottom: 8,
                    right: 8,
                    color: 'error.main',
                    opacity: 0.7
                  }} 
                />
              )}
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                    {ghost.ghost}
                    {ghost.ghost === 'Banshee' && (
                      <IconButton 
                        onClick={playBansheeScream}
                        size="small"
                        sx={{ 
                          color: 'white',
                          '&:hover': {
                            color: 'primary.main'
                          }
                        }}
                      >
                        <VolumeUpIcon />
                      </IconButton>
                    )}
                  </Typography>
                </Box>
                {showDescriptions && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {ghost.description}
                  </Typography>
                )}
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Evidence
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {ghost.evidence.map((evidence) => (
                      <Chip
                        key={evidence}
                        label={getEvidenceLabel(evidence)}
                        size="small"
                      />
                    ))}
                  </Box>
                </Box>
                <Divider sx={{ my: 1 }} />
                <Box sx={{ mb: 1 }}>
                  <Typography variant="subtitle2">Sanity Hunt Threshold</Typography>
                  <Typography variant="body2">
                    {ghost.hunt_sanity_low === ghost.hunt_sanity_high
                      ? ghost.hunt_sanity || '-'
                      : `${ghost.hunt_sanity_low || '-'} / ${ghost.hunt_sanity || '-'} / ${ghost.hunt_sanity_high || '-'}`}
                  </Typography>
                </Box>
                <Box sx={{ mb: 1 }}>
                  <Typography variant="subtitle2">Movement Speed</Typography>
                  <Typography variant="body2">
                    {ghost.min_speed && ghost.max_speed && ghost.min_speed !== ghost.max_speed
                      ? `${ghost.min_speed} m/s - ${ghost.max_speed} m/s`
                      : ghost.min_speed
                        ? `${ghost.min_speed} m/s`
                        : '-'}
                    {ghost.alt_speed && ` (Alt: ${ghost.alt_speed} m/s)`}
                    {ghost.has_los && ' (Speeds up when line of sight)'}
                  </Typography>
                </Box>
                <Divider sx={{ my: 1 }} />
                <Box sx={{ mb: 1 }}>
                  <Typography variant="subtitle2">Extra Info</Typography>
                  {ghost.wiki && (
                    <>
                      {ghost.wiki.tells?.filter(t => t.include_on_card).map((t, i) => (
                        <Typography key={i} variant="body2" sx={{ mb: 0.5 }}>
                          • {t.data}
                        </Typography>
                      ))}
                      {ghost.wiki.behaviors?.filter(t => t.include_on_card).map((t, i) => (
                        <Typography key={`b${i}`} variant="body2" sx={{ mb: 0.5 }}>
                          • {t.data}
                        </Typography>
                      ))}
                      {ghost.wiki.abilities?.filter(t => t.include_on_card).map((t, i) => (
                        <Typography key={`a${i}`} variant="body2" sx={{ mb: 0.5 }}>
                          • {t.data}
                        </Typography>
                      ))}
                    </>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        );
      })}
    </Grid>
  );
};

export default GhostCards;