import React from 'react';
import { Box, Typography, Checkbox, Collapse, IconButton } from '@mui/material';
import CancelIcon from '@mui/icons-material/Cancel';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import FilterAltIcon from '@mui/icons-material/FilterAlt';

const HuntSanityFilter = ({
  selectedSanity,
  onSanityClick,
  onSanityExclude,
  searchQuery,
  ghosts,
  expanded,
  onToggleExpanded
}) => {
  const sanityTypes = [
    { id: 'high', label: '100%-80%' },
    { id: 'medium', label: '80%-60%' },
    { id: 'fifty', label: '50%' },
    { id: 'low', label: '< 40%' }
  ];

  const isSanityInSearchResults = (sanityType) => {
    if (!searchQuery) return false;
    return ghosts.some(ghost => {
      if (!ghost.ghost.toLowerCase().includes(searchQuery.toLowerCase().trim())) return false;
      
      const sanity = parseFloat(ghost.hunt_sanity) || 0;
      const sanityLow = parseFloat(ghost.hunt_sanity_low) || sanity;
      const sanityHigh = parseFloat(ghost.hunt_sanity_high) || sanity;
      
      switch (sanityType) {
        case 'high':
          return sanityHigh >= 80 && sanityHigh <= 100;
        case 'medium':
          return sanityHigh >= 60 && sanityHigh <= 80;
        case 'fifty':
          return sanity === 50;
        case 'low':
          return sanityLow > 0 && sanityLow <= 40;
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
          🧠 Hunt Sanity
        </Typography>
        <IconButton sx={{ color: '#8a2be2' }}>
          {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      </Box>
      <Collapse in={expanded}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
          {sanityTypes
            .slice()
            .sort((a, b) => {
              // Only sort by search match
              const aMatchesSearch = isSanityInSearchResults(a.id);
              const bMatchesSearch = isSanityInSearchResults(b.id);
              if (aMatchesSearch !== bMatchesSearch) {
                return aMatchesSearch ? -1 : 1;
              }

              // Maintain original order
              return 0;
            })
            .map((sanity) => {
              const isFiltered = !ghosts.some(ghost => {
                if (!ghost.ghost.toLowerCase().includes(searchQuery.toLowerCase().trim())) return false;
                
                const sanityValue = parseFloat(ghost.hunt_sanity) || 0;
                const sanityLow = parseFloat(ghost.hunt_sanity_low) || sanityValue;
                const sanityHigh = parseFloat(ghost.hunt_sanity_high) || sanityValue;
                
                switch (sanity.id) {
                  case 'high':
                    return sanityHigh >= 80 && sanityHigh <= 100;
                  case 'medium':
                    return sanityHigh >= 60 && sanityHigh <= 80;
                  case 'fifty':
                    return sanityValue === 50;
                  case 'low':
                    return sanityLow > 0 && sanityLow <= 40;
                }
                return false;
              });
              const isExcluded = selectedSanity[sanity.id] === false;
              const isIncluded = selectedSanity[sanity.id] === true;
              return (
                <Box
                  key={sanity.id}
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
                  onClick={() => onSanityClick(sanity.id)}
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
                    {sanity.label}
                    {isSanityInSearchResults(sanity.id) && (
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
                    onClick={(e) => onSanityExclude(sanity.id, e)}
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

export default HuntSanityFilter;