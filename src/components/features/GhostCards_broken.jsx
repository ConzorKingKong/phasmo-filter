import React, { useState } from 'react';
import { Box, Grid, IconButton, TextField, InputAdornment, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import { useApp } from '../../context/AppContext';
import { sortGhosts } from '../../utils/ghostUtils';
import { checkGhostFilters } from '../../utils/filterUtils';
import { huntEvidenceList } from '../../constants/huntEvidence';
import GhostCard from '../shared/GhostCard';

const GhostCards = () => {
  const { 
    ghosts, 
    selectedEvidence, 
    selectedSpeed,
    selectedHuntEvidence,
    setSelectedHuntEvidence,
    selectedSanity,
    searchQuery,
    setSearchQuery,
    excludedGhosts,
    setExcludedGhosts,
    sortOrder,
    setSortOrder
  } = useApp();

  const [expandedCards, setExpandedCards] = useState({});

  const toggleCard = (ghostName) => {
    setExpandedCards(prev => ({
      ...prev,
      [ghostName]: !prev[ghostName]
    }));
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

  const handleRestoreClick = (ghost) => {
    // Remove ghost from excluded set
    setExcludedGhosts(prev => {
      const newExcluded = new Set(prev);
      newExcluded.delete(ghost.ghost);
      
      // Find all evidence associated with this ghost
      const ghostEvidence = Object.entries(huntEvidenceMap)
        .filter(([_, ghostNames]) => ghostNames.includes(ghost.ghost))
        .map(([evidenceId]) => evidenceId);

      // Reset evidence to neutral (undefined) if it was set to excluded because of this ghost
      setSelectedHuntEvidence(prevEvidence => {
        const newState = { ...prevEvidence };
        ghostEvidence.forEach(evidenceId => {
          const associatedGhosts = huntEvidenceMap[evidenceId];
          // If this evidence was excluded and this ghost was the only reason, reset it
          if (prevEvidence[evidenceId] === false) {
            const otherExcludedGhosts = associatedGhosts.filter(g => g !== ghost.ghost && newExcluded.has(g));
            if (otherExcludedGhosts.length === 0) {
              newState[evidenceId] = undefined;
            }
          }
        });
        return newState;
      });

      return newExcluded;
    });
  };


  const filteredGhosts = sortGhosts(ghosts.filter(ghost => {
    // If there's a search query, show matching ghosts regardless of filters or exclusion
    if (searchQuery && ghost.ghost.toLowerCase().includes(searchQuery.toLowerCase())) {
      return true;
    }

    // Don't show excluded ghosts for non-search results
    if (excludedGhosts.has(ghost.ghost)) {
      return false;
    }

    // Otherwise, only show ghosts that match all filters
    return checkGhostFilters(ghost, { selectedEvidence, selectedSpeed, selectedHuntEvidence, selectedSanity, huntEvidenceList });
  }), sortOrder).sort((a, b) => {
    // If there's a search query, prioritize matches
    if (searchQuery) {
      const aMatches = a.ghost.toLowerCase().includes(searchQuery.toLowerCase());
      const bMatches = b.ghost.toLowerCase().includes(searchQuery.toLowerCase());
      if (aMatches !== bMatches) {
        return aMatches ? -1 : 1;
      }
    }
    return 0;
  });

  if (filteredGhosts.length === 0) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          No ghosts match the selected filters. Was the ghost manually removed?
        </Typography>
        
        {excludedGhosts.size > 0 && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle1" color="text.primary" sx={{ mb: 2 }}>
              Manually Removed Ghosts:
            </Typography>
            <Grid 
              container 
              spacing={2} 
              sx={{ 
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'repeat(3, 1fr)'
                },
                gap: 2,
                justifyContent: 'center'
              }}
            >
              {Array.from(excludedGhosts).map((ghostName) => {
                const ghost = ghosts.find(g => g.ghost === ghostName);
                if (!ghost) return null;
                
                return (
                  <Grid item key={ghost.ghost}>
                    <Card 
                      sx={{ 
                        height: '100%',
                        position: 'relative'
                      }}
                    >
                      <IconButton
                        onClick={() => handleRestoreClick(ghost)}
                        sx={{ 
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          color: 'success.main',
                          '&:hover': {
                            color: 'success.dark'
                          }
                        }}
                      >
                        <RestoreIcon />
                      </IconButton>
                      <CloseIcon 
                        sx={{ 
                          position: 'absolute',
                          top: 14,
                          right: 62,
                          color: 'error.main',
                          opacity: 0.7
                        }} 
                      />
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
                                sx={{
                                  ...(ghost.nightmare_evidence?.includes(evidence) && {
                                    backgroundColor: 'primary.main',
                                    color: 'white',
                                    '&:hover': {
                                      backgroundColor: 'primary.dark'
                                    }
                                  })
                                }}
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
                            {ghost.alt_speed && ` (${ghost.alt_speed} m/s Max Speed)`}
                            {ghost.has_los && ' (Speeds up when line of sight)'}
                          </Typography>
                        </Box>
                        <Divider sx={{ my: 1 }} />
                        <Box sx={{ mb: 1 }}>
                          <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'space-between',
                            cursor: 'pointer'
                          }} onClick={() => toggleCard(ghost.ghost)}>
                            <Typography variant="subtitle2">Extra Info</Typography>
                            <IconButton size="small">
                              {expandedCards[ghost.ghost] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                            </IconButton>
                          </Box>
                          <Collapse in={expandedCards[ghost.ghost]}>
                            {ghost.extra_information?.map((info, i) => (
                              <Typography key={i} variant="body2" sx={{ mb: 0.5 }}>
                                • {info}
                              </Typography>
                            ))}
                          </Collapse>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          </Box>
        )}
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' },
        gap: 2, 
        mb: 2 
      }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search ghosts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
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
        <FormControl sx={{ 
          minWidth: { xs: '100%', sm: 200 },
          width: { xs: '100%', sm: 'auto' }
        }}>
          <InputLabel>Sort By</InputLabel>
          <Select
            value={sortOrder}
            label="Sort By"
            onChange={(e) => setSortOrder(e.target.value)}
          >
            <MenuItem value="default">Default</MenuItem>
            <MenuItem value="fastest">Fastest → Slowest</MenuItem>
            <MenuItem value="slowest">Slowest → Fastest</MenuItem>
            <MenuItem value="sanity_highest">Sanity Highest → Lowest</MenuItem>
            <MenuItem value="sanity_lowest">Sanity Lowest → Highest</MenuItem>
            <MenuItem value="alphabetical">Alphabetical</MenuItem>
            <MenuItem value="alphabetical_reversed">Alphabetical Reversed</MenuItem>
          </Select>
        </FormControl>
      </Box>
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
        const matchesFilters = checkGhostFilters(ghost, { selectedEvidence, selectedSpeed, selectedHuntEvidence, selectedSanity, huntEvidenceList });
        
        return (
          <Grid item key={ghost.ghost}>
            <GhostCard
              ghost={ghost}
              isSearchMatch={isSearchMatch}
              matchesFilters={matchesFilters}
              isExcluded={excludedGhosts.has(ghost.ghost)}
              onDelete={handleTrashClick}
              onRestore={handleRestoreClick}
              showBorder={true}
              expandedCards={expandedCards}
              onToggleCard={toggleCard}
            />
                {!excludedGhosts.has(ghost.ghost) && matchesFilters ? (
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
                ) : isSearchMatch && excludedGhosts.has(ghost.ghost) ? (
                  <>
                    <IconButton
                      onClick={() => handleRestoreClick(ghost)}
                      sx={{ 
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        color: 'success.main',
                        '&:hover': {
                          color: 'success.dark'
                        }
                      }}
                    >
                      <RestoreIcon />
                    </IconButton>
                    <CloseIcon 
                      sx={{ 
                        position: 'absolute',
                        top: 14,
                        right: 62,
                        color: 'error.main',
                        opacity: 0.7
                      }} 
                    />
                  </>
                ) : isSearchMatch && !matchesFilters && (
                  <CloseIcon 
                    sx={{ 
                      position: 'absolute',
                      top: 14,
                      right: 14,
                      color: 'error.main',
                      opacity: 0.7
                    }} 
                  />
                )}
                {isSearchMatch && (
                  <SearchIcon 
                    sx={{ 
                      position: 'absolute',
                      top: 14,
                      right: excludedGhosts.has(ghost.ghost) ? 110 : 62,
                      color: 'white',
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
                        sx={{
                          ...(ghost.nightmare_evidence?.includes(evidence) && {
                            backgroundColor: 'primary.main',
                            color: 'white',
                            '&:hover': {
                              backgroundColor: 'primary.dark'
                            }
                          })
                        }}
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
                    {ghost.alt_speed && ` (${ghost.alt_speed} m/s Max Speed)`}
                    {ghost.has_los && ' (Speeds up when line of sight)'}
                  </Typography>
                </Box>
                <Divider sx={{ my: 1 }} />
                <Box sx={{ mb: 1 }}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    cursor: 'pointer'
                  }} onClick={() => toggleCard(ghost.ghost)}>
                    <Typography variant="subtitle2">Extra Info</Typography>
                    <IconButton size="small">
                      {expandedCards[ghost.ghost] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </IconButton>
                  </Box>
                  <Collapse in={expandedCards[ghost.ghost]}>
                    {ghost.extra_information?.map((info, i) => (
                      <Typography key={i} variant="body2" sx={{ mb: 0.5 }}>
                        • {info}
                      </Typography>
                    ))}
                  </Collapse>
                </Box>
          </CardContent>
        </Card>
          </Grid>
        );
      })}
    </Grid>
    </Box>
  );
};

export default GhostCards; 