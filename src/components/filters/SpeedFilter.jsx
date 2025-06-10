import React from 'react';
import { Box, Typography, Checkbox, Collapse, IconButton } from '@mui/material';
import CancelIcon from '@mui/icons-material/Cancel';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import FilterAltIcon from '@mui/icons-material/FilterAlt';

const SpeedFilter = ({
  selectedSpeed,
  onSpeedClick,
  onSpeedExclude,
  searchQuery,
  ghosts,
  expanded,
  onToggleExpanded
}) => {
  const speedTypes = [
    { id: 'slow', label: 'Slow (< 1.7 m/s)' },
    { id: 'normal', label: 'Normal (1.7 m/s)' },
    { id: 'fast', label: 'Fast (> 1.7 m/s)' },
    { id: 'los', label: 'LOS Speed Up' }
  ];

  const isSpeedInSearchResults = (speedType) => {
    if (!searchQuery) return false;
    return ghosts.some(ghost => {
      if (!ghost.ghost.toLowerCase().includes(searchQuery.toLowerCase().trim())) return false;
      
      // The Mimic can mimic any ghost's speed, so it matches all speed filters
      if (ghost.ghost === 'The Mimic') {
        return true;
      }
      
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

  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, cursor: 'pointer' }} onClick={onToggleExpanded}>
        <Typography 
          variant="h6" 
          className="ghost-text"
          sx={{ 
            flexGrow: 1,
            fontFamily: '"Butcherman", cursive',
            textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8), 0 0 10px rgba(138, 43, 226, 0.5)',
            color: '#ffffff',
            letterSpacing: '1px'
          }}
        >
          ⚡ Ghost Speed
        </Typography>
        <IconButton sx={{ color: '#8a2be2' }}>
          {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      </Box>
      <Collapse in={expanded}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
          {speedTypes
            .slice()
            .sort((a, b) => {
              // Only sort by search match
              const aMatchesSearch = isSpeedInSearchResults(a.id);
              const bMatchesSearch = isSpeedInSearchResults(b.id);
              if (aMatchesSearch !== bMatchesSearch) {
                return aMatchesSearch ? -1 : 1;
              }

              // Maintain original order
              return 0;
            })
            .map((speed) => {
              const isFiltered = !ghosts.some(ghost => {
                if (!ghost.ghost.toLowerCase().includes(searchQuery.toLowerCase().trim())) return false;
                
                // The Mimic can mimic any ghost's speed, so it matches all speed filters
                if (ghost.ghost === 'The Mimic') {
                  return true;
                }
                
                const minSpeed = parseFloat(ghost.min_speed);
                const maxSpeed = parseFloat(ghost.max_speed);
                const altSpeed = parseFloat(ghost.alt_speed);
                const normalSpeed = 1.7;
                
                const speeds = [];
                if (!isNaN(minSpeed)) speeds.push(minSpeed);
                if (!isNaN(maxSpeed)) speeds.push(maxSpeed);
                if (!isNaN(altSpeed)) speeds.push(altSpeed);
                
                if (speeds.length === 0) return false;
                
                switch (speed.id) {
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
              const isExcluded = selectedSpeed[speed.id] === false;
              const isIncluded = selectedSpeed[speed.id] === true;
              return (
                <Box
                  key={speed.id}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    p: 0.5,
                    borderRadius: 1,
                    bgcolor: isExcluded ? 'error.dark' : isIncluded ? 'success.dark' : 'transparent',
                    '&:hover': {
                      bgcolor: isExcluded ? 'error.dark' : isIncluded ? 'success.dark' : 'action.hover',
                    },
                    cursor: 'pointer',
                    opacity: isFiltered ? 0.5 : 1,
                  }}
                  onClick={() => onSpeedClick(speed.id)}
                >
                  <Checkbox
                    checked={isIncluded}
                    sx={{
                      color: isFiltered ? 'text.disabled' : 'text.secondary',
                      '&.Mui-checked': {
                        color: isFiltered ? 'text.disabled' : 'success.main',
                      },
                    }}
                  />
                  <Box sx={{ 
                    flexGrow: 1,
                    display: 'flex',
                    alignItems: 'center',
                    color: isFiltered ? 'text.disabled' :
                           isExcluded ? 'error.main' :
                           isIncluded ? 'success.main' :
                           'text.primary'
                  }}>
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
                  <IconButton
                    size="small"
                    onClick={(e) => onSpeedExclude(speed.id, e)}
                    sx={{
                      color: isExcluded ? 'error.main' : 'text.secondary',
                      '&:hover': {
                        color: 'error.main',
                      },
                      opacity: isFiltered ? 0.5 : 1,
                    }}
                  >
                    <CancelIcon fontSize="small" />
                  </IconButton>
                </Box>
              );
            })}
        </Box>
      </Collapse>
    </>
  );
};

export default SpeedFilter;