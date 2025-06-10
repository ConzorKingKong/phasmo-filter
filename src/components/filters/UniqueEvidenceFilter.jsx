import React, { useState } from 'react';
import { Box, Typography, Checkbox, Collapse, IconButton, TextField, InputAdornment } from '@mui/material';
import CancelIcon from '@mui/icons-material/Cancel';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import { sortGhosts } from '../../utils/ghostUtils';
import { isGhostFilteredOut } from '../../utils/filterUtils';

const UniqueEvidenceFilter = ({
  selectedHuntEvidence,
  onHuntEvidenceClick,
  onHuntEvidenceExclude,
  searchQuery,
  ghosts,
  huntEvidenceList,
  expanded,
  onToggleExpanded,
  sortOrder
}) => {
  const [huntEvidenceSearch, setHuntEvidenceSearch] = useState('');
  const isEvidenceInSearchResults = (evidence) => {
    if (!searchQuery) return false;
    return evidence.ghost.split(', ').some(ghostName => 
      ghosts.some(ghost => 
        ghost.ghost.toLowerCase().includes(searchQuery.toLowerCase().trim()) && 
        ghost.ghost === ghostName
      )
    );
  };

  const playBansheeScream = (e) => {
    e.stopPropagation();
    const audio = new Audio('/sounds/banshee_scream.mp3');
    audio.currentTime = 0;
    audio.play();
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
          ✨ Unique Evidence
        </Typography>
        <IconButton sx={{ color: '#dc143c' }}>
          {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      </Box>
      <Collapse in={expanded}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search unique evidence..."
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
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
          {huntEvidenceList
            .slice()
            .sort((a, b) => {
              // First sort by filtered status
              const aFiltered = a.ghost.split(', ').every(ghostName => isGhostFilteredOut(ghostName, { selectedEvidence: {}, selectedSpeed: {}, selectedHuntEvidence, selectedSanity: {}, huntEvidenceList }, ghosts));
              const bFiltered = b.ghost.split(', ').every(ghostName => isGhostFilteredOut(ghostName, { selectedEvidence: {}, selectedSpeed: {}, selectedHuntEvidence, selectedSanity: {}, huntEvidenceList }, ghosts));
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

              // Then sort by ghost match if there's a search query
              if (searchQuery) {
                const aGhostMatches = a.ghost.split(', ').some(ghostName => 
                  ghostName.toLowerCase().includes(searchQuery.toLowerCase().trim())
                );
                const bGhostMatches = b.ghost.split(', ').some(ghostName => 
                  ghostName.toLowerCase().includes(searchQuery.toLowerCase().trim())
                );
                if (aGhostMatches !== bGhostMatches) {
                  return aGhostMatches ? -1 : 1;
                }
              }

              // Finally sort by the current ghost order
              const aGhosts = a.ghost.split(', ');
              const bGhosts = b.ghost.split(', ');
              
              // Get the sorted ghosts
              const sortedGhosts = sortGhosts(ghosts, sortOrder || 'default');
              const ghostOrder = sortedGhosts.reduce((acc, ghost, index) => {
                acc[ghost.ghost] = index;
                return acc;
              }, {});

              // Find the minimum index for each evidence's ghosts
              const aMinIndex = Math.min(...aGhosts.map(g => ghostOrder[g] ?? Infinity));
              const bMinIndex = Math.min(...bGhosts.map(g => ghostOrder[g] ?? Infinity));
              return aMinIndex - bMinIndex;
            })
            .map((evidence) => {
              const isFiltered = evidence.ghost.split(', ').every(ghostName => isGhostFilteredOut(ghostName, { selectedEvidence: {}, selectedSpeed: {}, selectedHuntEvidence, selectedSanity: {}, huntEvidenceList }, ghosts));
              const matchesSearch = huntEvidenceSearch && 
                evidence.label.toLowerCase().includes(huntEvidenceSearch.toLowerCase());
              const isExcluded = selectedHuntEvidence[evidence.id] === false;
              const isIncluded = selectedHuntEvidence[evidence.id] === true;
              return (
                <Box
                  key={evidence.id}
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
                  onClick={() => onHuntEvidenceClick(evidence.id)}
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
                    {evidence.label} ({evidence.ghost})
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
                  <IconButton
                    size="small"
                    onClick={(e) => onHuntEvidenceExclude(evidence.id, e)}
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

export default UniqueEvidenceFilter;