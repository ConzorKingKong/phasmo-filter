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
    { id: 'very_low', label: '< 30%' },
    { id: 'low', label: '30-49%' },
    { id: 'average', label: '50-59%' },
    { id: 'high', label: '60-80%' },
    { id: 'very_high', label: '> 80%' }
  ];

  const isSanityInSearchResults = (sanityType) => {
    if (!searchQuery) return false;
    return ghosts.some(ghost => {
      if (!ghost.ghost.toLowerCase().includes(searchQuery.toLowerCase().trim())) return false;
      
      const sanityThreshold = parseInt(ghost.hunt_sanity) || 50;
      
      switch (sanityType) {
        case 'very_low':
          return sanityThreshold < 30;
        case 'low':
          return sanityThreshold >= 30 && sanityThreshold < 50;
        case 'average':
          return sanityThreshold >= 50 && sanityThreshold < 60;
        case 'high':
          return sanityThreshold >= 60 && sanityThreshold <= 80;
        case 'very_high':
          return sanityThreshold > 80;
      }
      return false;
    });
  };

  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, cursor: 'pointer' }} onClick={onToggleExpanded}>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Hunt Sanity
        </Typography>
        <IconButton>
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
                
                const sanityThreshold = parseInt(ghost.hunt_sanity) || 50;
                
                switch (sanity.id) {
                  case 'very_low':
                    return sanityThreshold < 30;
                  case 'low':
                    return sanityThreshold >= 30 && sanityThreshold < 50;
                  case 'average':
                    return sanityThreshold >= 50 && sanityThreshold < 60;
                  case 'high':
                    return sanityThreshold >= 60 && sanityThreshold <= 80;
                  case 'very_high':
                    return sanityThreshold > 80;
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